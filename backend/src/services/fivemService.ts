import puppeteer from 'puppeteer';

interface FiveMServerData {
  clients: number;
  sv_maxclients: number;
  hostname: string;
}

class FiveMService {
  private browser: any = null;

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  async getServerData(serverId: string): Promise<FiveMServerData | null> {
    let page = null;
    const timeout = 20000; // 20 second timeout
    
    try {
      const browser = await this.initBrowser();
      page = await browser.newPage();
      
      // Set timeout for the page
      page.setDefaultTimeout(timeout);
      
      // Set user agent and headers
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setExtraHTTPHeaders({
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      });

      // Navigate to the API endpoint
      const url = `https://servers-frontend.fivem.net/api/servers/single/${serverId}`;
      console.log('Fetching FiveM data with Puppeteer (20s timeout):', url);
      
      const response = await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: timeout 
      });

      if (response && response.status() === 200) {
        // Wait for Cloudflare to finish if present
        try {
          await page.waitForSelector('body', { timeout: 5000 });
          
          // Check if we got Cloudflare challenge page
          const title = await page.title();
          if (title.includes('Just a moment') || title.includes('Cloudflare')) {
            console.log('Cloudflare challenge detected, waiting...');
            await page.waitForTimeout(3000);
            await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
          }
        } catch (waitError) {
          console.log('No additional waiting needed');
        }

        // Get the page content
        const content = await page.content();
        
        // Try to extract JSON from the page
        const jsonMatch = content.match(/<pre[^>]*>(.*?)<\/pre>/s);
        if (jsonMatch) {
          const jsonData = JSON.parse(jsonMatch[1]);
          if (jsonData && (jsonData.Data || jsonData.data)) {
            const data = jsonData.Data || jsonData.data;
            return {
              clients: data.clients || 0,
              sv_maxclients: data.sv_maxclients || 32,
              hostname: data.hostname || 'Unknown Server'
            };
          }
        }

        // If no pre tag, try to get JSON directly from body
        const bodyText = await page.evaluate(() => document.body.textContent);
        if (bodyText && bodyText.trim().startsWith('{')) {
          try {
            const jsonData = JSON.parse(bodyText.trim());
            if (jsonData && (jsonData.Data || jsonData.data)) {
              const data = jsonData.Data || jsonData.data;
              return {
                clients: data.clients || 0,
                sv_maxclients: data.sv_maxclients || 32,
                hostname: data.hostname || 'Unknown Server'
              };
            }
          } catch (parseError) {
            console.log('Failed to parse body as JSON');
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Puppeteer FiveM fetch error:', error);
      return null;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const fiveMService = new FiveMService();

// Cleanup on process exit
process.on('exit', () => {
  fiveMService.closeBrowser();
});

process.on('SIGINT', () => {
  fiveMService.closeBrowser();
  process.exit();
});