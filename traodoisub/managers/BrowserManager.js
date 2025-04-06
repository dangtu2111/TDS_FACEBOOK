import puppeteer from 'puppeteer';


class BrowserManager {
  constructor() {
    this.browsers = new Map();
    this.proxyAuthMap = new Map();
  }

  // Tạo trình duyệt cho từng tài khoản và lưu vào Map
  async createBrowsers(accounts, proxies = []) {
    let x = 0;
    let y = 0;
    const width = 700;
    const height = 700;
    const windowSize = { width, height };

    for (const account of accounts) {
      const browserArgs = [
        `--window-size=${width},${height}`,
        `--window-position=${x},${y}`,
      ];

      let proxyAuth = null;

      if (proxies.length > 0) {
        // Randomly chọn proxy từ mảng proxies
        const randomProxy = proxies[Math.floor(Math.random() * proxies.length)];

        // Tách proxy thành các phần
        const [ip, port, user, pass] = randomProxy.split(':');

        // Thêm proxy server vào args
        browserArgs.push(`--proxy-server=${ip}:${port}`);

        // Lưu thông tin xác thực proxy
        proxyAuth = { username: user, password: pass };
        this.proxyAuthMap.set(account.username, proxyAuth);
      }

      const browser = await puppeteer.launch({
        headless: true,
        args: browserArgs,
      });

      const page = await browser.newPage();

      // Đăng nhập proxy nếu cần
      if (proxyAuth) {
        await page.authenticate(proxyAuth);
      }

      this.browsers.set(account.username, browser);

      // Cập nhật vị trí cửa sổ
      x += width;
      if (x > 1024) {
        x = 0;
        y += height;
      }
    }
  }

  // Lấy trình duyệt theo tên
  getBrowser(name) {
    return this.browsers.get(name);
  }

  // Đóng tất cả trình duyệt
  async closeAllBrowsers() {
    await Promise.all(Array.from(this.browsers.values()).map((browser) => browser.close()));
    this.browsers.clear();
    this.proxyAuthMap.clear();
  }

  // Tạo trang mới trên trình duyệt đã chọn
  async createPage(browserName) {
    const browser = this.getBrowser(browserName);
    if (!browser) {
      console.error(`Browser with name ${browserName} not found`);
      return undefined;
    }

    try {
      const page = await browser.newPage();
      
      // Lấy thông tin proxy auth nếu có
      const proxyAuth = this.proxyAuthMap.get(browserName);
      if (proxyAuth) {
        await page.authenticate(proxyAuth);
      }

      // Cấu hình page
      await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US' });
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
      );
      await page.setJavaScriptEnabled(true);

      return page;
    } catch (error) {
      console.error('Error creating page:', error);
      return undefined;
    }
  }
}

export default BrowserManager;
