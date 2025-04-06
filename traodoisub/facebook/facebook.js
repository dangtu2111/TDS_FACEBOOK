import {
  Button_add,
  Button_follow,
  Button_like,
  targetSelectors,
  regexGroupPost,
  regexUsernamePost,
  regexPermalink,
} from "../utils/constant.js";
import {
  copyHelper,
  getElementBySelector,
  getElementByXPath,
  selectAllHelper,
  sleep,
} from "../../utils/utils.js";
import Logger from "../../utils/Logger.js";

class Facebook {
  constructor(id, email, password, cookie, tds) {
    this.url = "https://www.facebook.com";
    this.id = id;
    this.email = email;
    this.password = password;
    this.cookie = cookie;
    this.tds = tds;
  }

  parseCookieString(cookieString) {
    return cookieString.split("; ").map((pair) => {
      const [name, value] = pair.split("=");
      return { name: name.trim(), value: value.trim() };
    });
  }

  async login(page) {
    try {
      const cookies = this.parseCookieString(this.cookie);
      await page.goto(this.url, { waitUntil: "networkidle2" });
      await page.deleteCookie(...(await page.cookies()));
      await Promise.all(cookies.map((cookie) => page.setCookie(cookie)));
      // await page.reload({ waitUntil: "networkidle2" });
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  async getAllJobs(jobs) {
    const results = {};
    for (const [index, job] of jobs.entries()) {
      try {
        results[job] = await this.getOneJob(job);
        console.log(`Completed job: ${job}`);
        if (index < jobs.length - 1) {
          console.log("Waiting 60 seconds before next job...");
          await new Promise((resolve) => setTimeout(resolve, 60000));
        }
      } catch (error) {
        console.error(`Error processing job: ${job}`, error);
        results[job] = {
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
    console.log("Final results:", results);
    return results;
  }

  async getOneJob(type) {
    const result = await this.tds.api_get_job_fb(type);
    if (result.error) {
      console.log("Error detected:", result.error);
      return result.error === "Thao tác quá nhanh vui lòng chậm lại" ? 1 : 0;
    }
    return result;
  }
  async translateEmotion(emotion) {
    switch (emotion) {
      case "LIKE":
        return "Thích";
      case "LOVE":
        return "Yêu thích";
      case "WOW":
        return "Wow";
      case "HAHA":
        return "Haha";
      case "ANGRY":
        return "Phẫn nộ";
      case "SAD":
        return "Buồn";
      case "CARE":
        return "Thương thương";
      default:
        return "Trạng thái không xác định";
    }
  }
  async clickButton2(page, buttonDefault, type) {
    try {
      // Kiểm tra xem trang đã bị đóng chưa
      if (await page.isClosed()) {
        console.log("Trang đã bị đóng trước khi thao tác");
        return false;
      }

      // Lấy các nút từ XPath
      const buttons = await getElementByXPath(
        page,
        Button_like[buttonDefault],
        1,
        0
      );
      if (buttons.length === 0) {
        console.log("Không tìm thấy nút nào");
        return false;
      }

      // // Xử lý logic liên quan đến URL
      // const currentUrl = await page.url();
      // if (currentUrl.match(regexGroupPost) || currentUrl.match(regexPermalink) || currentUrl.match(regexUsernamePost)) {
      //   if (buttons.length >= 2) {
      //     buttons.shift(); // Loại bỏ nút đầu tiên
      //     console.log(`Đã bỏ nút đầu tiên, còn lại ${buttons.length} nút để xử lý`);
      //   }
      // }

      const typeResult = await this.translateEmotion(type);

      let success = false;
      // Lặp qua tất cả các nút
      for (const buttonElement of buttons) {
        try {
          // Cuộn đến phần tử
          await page.evaluate(
            (el) =>
              el.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "center",
              }),
            buttonElement
          );

          // Kích hoạt hover
          await this.triggerHover(page, buttonElement);

          // Chờ các nút cảm xúc xuất hiện
          const targets = await this.findTargets(page, typeResult);

          if (targets.length === 0) {
            Logger.error(
              "Không tìm thấy nút cảm xúc nào trong danh sách targetSelectors id : "
            );

            continue;
          }

          // Click vào nút cảm xúc đầu tiên hợp lệ
          success = await this.clickTarget(
            page,
            targets,
            buttonElement,
            typeResult
          );
          if (success) {
            break;
          }
        } catch (innerError) {
          // console.error(`Lỗi khi xử lý nút:`, innerError);
          continue;
        }
      }

      return success;
    } catch (error) {
      // console.error('Lỗi khi xử lý nút:', error);
      if (buttonDefault < 3) {
        return await this.clickButton2(page, buttonDefault + 1, type);
      }
      return false;
    }
  }

  // Hàm trợ giúp kích hoạt hover
  async triggerHover(page, buttonElement) {
    await page.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      const fireEvent = (type, EventClass) => {
        const event = new EventClass(type, {
          bubbles: true,
          composed: true,
          cancelable: true,
          clientX: x,
          clientY: y,
          screenX: x,
          screenY: y,
        });
        el.dispatchEvent(event);
      };

      fireEvent("pointerover", PointerEvent);
      fireEvent("mouseover", MouseEvent);
      fireEvent("mouseenter", MouseEvent);
    }, buttonElement);

    await page.waitForTimeout(500);
  }

  // Hàm trợ giúp tìm các nút cảm xúc
  async findTargets(page, typeResult) {
    let targets = [];

    // Lặp qua tất cả các targetSelectors
    for (const targetSelector of targetSelectors) {
      try {
        // Chờ selector xuất hiện và kiểm tra tính khả dụng
        const fullSelector = targetSelector + `[aria-label="${typeResult}"]`;
        await page.waitForSelector(fullSelector, {
          timeout: 1000,
          visible: true,
        }); // tăng timeout lên 1000ms
        targets = await page.$$(fullSelector);

        // Nếu tìm thấy nút cảm xúc, ghi log và thoát khỏi vòng lặp
        if (targets.length > 0) {
          // console.log(`Tìm thấy ${targets.length} nút cảm xúc với selector ${fullSelector}`);
          break;
        }
      } catch (error) {
        // Nếu không tìm thấy selector, log thông báo nhưng tiếp tục vòng lặp
        // console.log(`Không tìm thấy nút cảm xúc với selector ${targetSelector + typeResult}`);
      }
    }

    return targets;
  }

  // Hàm trợ giúp click vào nút cảm xúc
  async clickTarget(page, targets, buttonElement, typeResult) {
    for (const target of targets) {
      try {
        // Kích hoạt sự kiện mouseout
        await page.evaluate((el) => {
          const rect = el.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;

          const fireEvent = (type, EventClass) => {
            const event = new EventClass(type, {
              bubbles: true,
              composed: true,
              cancelable: true,
              clientX: x,
              clientY: y,
              screenX: x,
              screenY: y,
            });
            el.dispatchEvent(event);
          };

          fireEvent("pointerout", PointerEvent);
          fireEvent("mouseout", MouseEvent);
          fireEvent("mouseleave", MouseEvent);
        }, buttonElement);

        await page.waitForTimeout(500);

        // Click vào target
        await target.click();
       
        return true;
      } catch (targetError) {
        console.error(`Lỗi khi click phần tử cảm xúc:`, targetError);
        continue;
      }
    }
    return false;
  }

  async clickButton(page, selectors) {
    for (const selector of selectors) {
      try {
        const buttons = await page.$$(selector);
        if (buttons.length === 0) continue;

        for (const button of buttons) {
          await page.evaluate(
            (el) => el.scrollIntoView({ behavior: "smooth", block: "center" }),
            button
          );
          await new Promise((resolve) => setTimeout(resolve, 500));

          const isVisible = await page.evaluate((el) => {
            const rect = el.getBoundingClientRect();
            return (
              rect.top >= 0 &&
              rect.bottom <= window.innerHeight &&
              rect.left >= 0 &&
              rect.right <= window.innerWidth
            );
          }, button);

          if (isVisible) {
            await button.click();
            return true;
          }
        }
      } catch (error) {
        console.error(`Lỗi khi click nút với selector ${selector}:`, error);
      }
    }
    return false;
  }

  async follow(page, tasks) {
    for (const task of tasks) {
      try {
        await page.goto(`https://www.facebook.com/${task.id}`, {
          waitUntil: "networkidle2",
        });
        const followSelectors = [
          '.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x1ypdohk.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x87ps6o.x1lku1pv.x1a2a7pz.x9f619.x3nfvp2.xdt5ytf.xl56j7k.x1n2onr6.xh8yej3[aria-label="Theo dõi"]',
          '.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x1ypdohk.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x87ps6o.x1lku1pv.x1a2a7pz.x9f619.x3nfvp2.xdt5ytf.xl56j7k.x1n2onr6.xh8yej3[aria-label="Thêm bạn bè"]',
          '.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x1ypdohk.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x87ps6o.x1lku1pv.x1a2a7pz.x9f619.x3nfvp2.xdt5ytf.xl56j7k.x1n2onr6.xh8yej3[aria-label="Thích"]',
        ];
        const success = await this.clickButton(page, followSelectors);
        if (success) {
          const money = await this.tds.api_get_money(
            "facebook_follow_cache",
            task.code
          );
          Logger.success("Reward received:", JSON.stringify(money));
        }
      } catch (error) {
        console.error("Error during follow:", error);
        const money = await this.tds.api_get_money(
          "facebook_follow",
          "facebook_api"
        );
        console.log("Fallback reward:", JSON.stringify(money));
      }
    }
  }

  async clickXPath(page, xpath) {
    try {
      return await page.evaluate((xpathExpr) => {
        const element = document.evaluate(
          xpathExpr,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;
        if (element) {
          element.click();
          return true;
        }
        return false;
      }, xpath);
    } catch (error) {
      Logger.error("Lỗi khi click XPath:", error);
      return false;
    }
  }

  async like(page, tasks) {
    for (const task of tasks) {
      try {
        await page.goto(`https://www.facebook.com/${task.id}`, {
          waitUntil: "networkidle2",
          timeout: 10000, // Thiết lập timeout là 5000ms (5 giây)
        });
        const err_selector =
          '.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x1ypdohk.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x87ps6o.x1lku1pv.x1a2a7pz.x9f619.x3nfvp2.xdt5ytf.xl56j7k.x1n2onr6.xh8yej3[aria-label="Đi tới Bảng tin"]';
        const err_button = await page.$$(err_selector);
        if (err_button.length > 0) {
          Logger.error(`Link die : ${task.id}`);
          continue;
        }
        const success = await this.clickButton2(page, 0, task.type);
        if (success) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const money = await this.tds.api_get_money(
            "facebook_reaction",
            task.code
          );
          Logger.success(`Thực hiện thành công cho id : ${task.id} `);
          if (money.success) {
            Logger.success(`Lấy xu : ${money.success} , Tong xu : ${money.data.xu}`);
          } else if (money.error) {
            Logger.success(`Lỗi khi lấy xu : ${money.error}`);
          } else {
            Logger.success(`Phản hồi không xác định: ${JSON.stringify(money)}`);
          }
        } else {
          Logger.error("Không thể nhấn Thích id : ", task.id);
        }
      } catch (error) {
        // console.error('Lỗi trong quá trình like:', error);
        continue;
      }
    }
  }

  async runJobs(page, jobs) {
    for (const [type, tasks] of Object.entries(jobs)) {
      switch (type) {
        case "follow":
          await this.follow(page, tasks);
          break;
        case "like":
          await this.like(page, tasks);
          break;
        default:
          console.log(`No action defined for job type: ${type}`);
      }
    }
  }

  getId() {
    return this.id;
  }
}

export default Facebook;
