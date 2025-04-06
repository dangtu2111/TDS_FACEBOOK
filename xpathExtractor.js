import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Kích hoạt chế độ ẩn danh
puppeteer.use(StealthPlugin());

(async () => {
    try {
        // Khởi tạo trình duyệt với cấu hình chống bot
        const browser = await puppeteer.launch({
            headless: false,  // Mở trình duyệt thật để tránh bị phát hiện
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled' // Tắt tính năng nhận diện bot
            ],
            defaultViewport: null
        });

        const page = await browser.newPage();

        // Giả lập User-Agent giống trình duyệt thật
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36');

        // Bật JavaScript và cookies
        await page.setJavaScriptEnabled(true);
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        });

        console.log("🔥 Đang truy cập trang web...");

        // Truy cập trang web
        await page.goto('https://www.whitepages.com/name/Michael11?fs=1&searchedName=Michael11', {
            waitUntil: 'networkidle2'  // Chờ cho tất cả request tải xong
        });

        console.log("✅ Truy cập thành công!");

        // Kiểm tra nếu trang yêu cầu bật JavaScript & Cookies
        const blockMessage = await page.evaluate(() => {
            return document.body.innerText.includes("Enable JavaScript and cookies to continue");
        });

        if (blockMessage) {
            console.log("🚨 Trang web yêu cầu bật JavaScript và cookie!");
        } else {
            console.log("🚀 Không bị chặn, tiếp tục xử lý...");
        }

        // Tìm phần tử input (nếu có)
        try {
            await page.waitForSelector('#name-input', { timeout: 5000 });
            console.log("✅ Phần tử #name-input đã xuất hiện!");
        } catch (error) {
            console.log("❌ Không tìm thấy phần tử #name-input.");
        }

        console.log("🔥 Đang theo dõi API requests...");

        // Bật chế độ theo dõi request API
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const url = request.url();
            if (url.includes('/header-search/name')) {
                console.log(`🔍 API Request: ${url}`);
            }
            request.continue();
        });

    } catch (error) {
        console.error("❌ Lỗi:", error);
    }
})();
