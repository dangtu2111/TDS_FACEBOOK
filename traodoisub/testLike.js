import puppeteer from 'puppeteer';
import BrowserManager from './managers/BrowserManager.js';
import FacebookManager from './managers/FacebookManager.js';
import InstagramManager from './managers/InstagramManager.js';
import { tdsAccounts, proxies } from './config.js';

// Main execution
(async () => {
   
    if (tdsAccounts.length === 0) {
        console.log('Không có tài khoản TDS nào.');
        return;
    }

    // Khởi tạo các quản lý trình duyệt và tài khoản
    const browserManager = new BrowserManager();
    const facebookManager = new FacebookManager(browserManager);
    const instagramManager = new InstagramManager(browserManager);

    // Các công việc Facebook cần thực hiện
    const facebookJobs = ['facebook_reaction'];

    try {
        // Thực hiện công việc cho Facebook
        await facebookManager.test(facebookJobs, tdsAccounts, proxies);
        
        // Nếu có tài khoản Instagram, có thể gọi hàm InstagramManager (bây giờ đang được comment)
        // await instagramManager.main(instagramAccounts, ['instagram_like']);
    } catch (error) {
        console.error('Lỗi trong khi thực thi công việc:', error);
    } finally {
        // Đảm bảo các trình duyệt được đóng khi công việc hoàn thành
        console.log('Hoàn thành công việc.');
    }
    // https://www.facebook.com/1125101646083724
    // https://www.facebook.com/61556787756257_122224744322226258
    // https://www.facebook.com/1116494126903395_1116494910236650
})();
