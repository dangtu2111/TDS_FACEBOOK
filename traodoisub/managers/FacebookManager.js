import Facebook from "../facebook/facebook.js"; // Assuming Facebook is a custom class you have defined
import TDS from "../TDS/TDS.js"; // Assuming TDS is a custom class you have defined
import {
  copyHelper,
  getElementBySelector,
  getElementByXPath,
  selectAllHelper,
  sleep,
} from "../../utils/utils.js";
class FacebookManager {
  constructor(browserManager) {
    this.browserManager = browserManager;
  }

  async standardizedData(resultsfb) {
    return Array.isArray(resultsfb) ? resultsfb : [];
  }

  async divideResults(resultsfb, num) {
    const dividedResults = [];
    for (let i = 0; i < num; i++) {
      dividedResults.push({
        follow: Array.isArray(resultsfb.follow)
          ? resultsfb.follow.slice(
              i * Math.ceil(resultsfb.follow.length / num),
              (i + 1) * Math.ceil(resultsfb.follow.length / num)
            )
          : [],
        like: Array.isArray(resultsfb.like)
          ? resultsfb.like.slice(
              i * Math.ceil(resultsfb.like.length / num),
              (i + 1) * Math.ceil(resultsfb.like.length / num)
            )
          : [],
      });
    }
    return dividedResults;
  }

  async createPage(browser) {
    try {
      const context = browser.defaultBrowserContext();
      await context.overridePermissions("https://www.facebook.com/", [
        "geolocation",
      ]);
      const page = await browser.newPage();
      await page.setExtraHTTPHeaders({
        "Accept-Language": "en-US",
      });
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
      );
      await page.setJavaScriptEnabled(true);
      return page;
    } catch (error) {
      console.error("An error occurred while creating page:", error);
      return undefined;
    }
  }

  async test(nameJobs, tdsAccounts, proxies) {
    try {
      // Validate input
      if (!tdsAccounts || tdsAccounts.length === 0) {
        console.warn("TDS account list is empty");
        return;
      }

      const fbInfo = tdsAccounts[0].facebook[0];
      if (!fbInfo) {
        console.warn("No Facebook info found in TDS account");
        return;
      }

      // Initialize TDS and Facebook instances
      const tds = new TDS(
        tdsAccounts[0].token,
        tdsAccounts[0].username,
        tdsAccounts[0].password
      );
      const fb = new Facebook(
        fbInfo.id,
        fbInfo.email,
        fbInfo.password,
        fbInfo.cookie,
        tds
      );

      // Create browser instance
      await this.browserManager.createBrowsers(tdsAccounts);
      const browser = this.browserManager.getBrowser(tds.getUsername());
      if (!browser) {
        console.warn(`No browser found for TDS account: ${tds.getUsername()}`);
        return;
      }

      // Create page instance
      const page = await this.browserManager.createPage(tds.getUsername());
      if (!page) {
        console.warn("Failed to create page for browser");
        return;
      }

      // Perform login and navigation
      await fb.login(page);
      await page.goto(
        "https://www.facebook.com/100030090021566_1386397955706525",
        { waitUntil: "networkidle2" }
      );
      const err_selector =
        '.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x1ypdohk.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x87ps6o.x1lku1pv.x1a2a7pz.x9f619.x3nfvp2.xdt5ytf.xl56j7k.x1n2onr6.xh8yej3[aria-label="Đi tới Bảng tin"]';
      const err_button = await page.$$(err_selector);
      console.log(err_button.length);
      if (err_button && err_button.length > 0) {
        console.log("Link die");
      } else {
        const success = await fb.clickButton2(page, 0, "CARE");
      }
      // Perform click on the first button in the filtered list
    } catch (error) {
      console.error("Error in test method:", error);
      throw error; // Re-throw for upstream handling
    }
  }

  async main(nameJobs, tdsAccounts, proxies) {
    if (!tdsAccounts.length) {
      console.error("No TDS account provided");
      return;
    }

    // Convert tdsAccounts into TDS objects
    const tdsInstances = tdsAccounts.map(
      (tdsAccount) =>
        new TDS(tdsAccount.token, tdsAccount.username, tdsAccount.password)
    );

    try {
      let iteration = 0;
      while (true) {
        try {
          await this.browserManager.createBrowsers(tdsAccounts, proxies);
          let tryInt = 0;
          const maxTry = 5;
          while (tryInt < maxTry) {
            const tdsTasks = tdsInstances.map(async (tds, tdsIndex) => {
              const fbInfo =
                tdsAccounts[tdsIndex].facebook[
                  iteration % tdsAccounts[tdsIndex].facebook.length
                ]; // Get Facebook account by loop

              // Check if fbInfo is valid
              if (!fbInfo) {
                console.warn(
                  `No Facebook account found for TDS ${tds.getUsername()}`
                );
                return;
              }

              const fb = new Facebook(
                fbInfo.id,
                fbInfo.email,
                fbInfo.password,
                fbInfo.cookie,
                tds
              );
              const browser = this.browserManager.getBrowser(
                tdsInstances[tdsIndex].getUsername()
              );

              if (!browser) {
                console.warn(
                  `No browser found for TDS account: ${tdsInstances[
                    tdsIndex
                  ].getUsername()}`
                );
                return;
              }

              const page = await this.browserManager.createPage(
                tds.getUsername()
              );
              if (!page) {
                console.warn(
                  `Failed to create page for Facebook account: ${fbInfo.id}`
                );
                return;
              }

              try {
                if (tryInt == 0) {
                  await fb.login(page);
                  await tds.api_config_account(fb.getId()); // Configure TDS account
                }

                await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

                // Loop through all tasks
                for (const job of nameJobs) {
                  const resultsfbArray = await fb.getOneJob(job);
                  if (resultsfbArray !== 0 && resultsfbArray !== 1) {
                    const resultsfb = await this.standardizedData(
                      resultsfbArray.data
                    );
                    console.log("resultsfb", resultsfb);
                    await this.typeWork(page, fb, resultsfb, job); // Perform task
                    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 10 seconds
                  }
                }
                if (page && !page.isClosed()) {
                  await page.close(); // Đóng page cuối mỗi vòng lặp
                }

              } catch (error) {
                console.error("Error processing task:", error);
                // If frame is detached or page is closed, skip and continue the loop
              }
            });

            // Run all tasks in parallel for all TDS
            await Promise.all(tdsTasks);

            // Wait before repeating
            console.log("Waiting 10 seconds before repeating...");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            
            tryInt++;
          }
          await this.browserManager.closeAllBrowsers();
          iteration++; // Increment iteration count
        } catch (error) {
          console.error("Error in main loop:", error);
          break; // Stop the main loop if any undefined error occurs
        }
      }

      console.log("Waiting 10 seconds before repeating...");
      await new Promise((resolve) => setTimeout(resolve, 10000));
    } catch (error) {
      console.error("Error in main loop:", error);
    } finally {
      await this.browserManager.closeAllBrowsers();
      console.log("Completed all loops.");
    }
  }

  async typeWork(page, facebook, job, name) {
    switch (name) {
      case "facebook_follow":
        await facebook.follow(page, job);
        break;
      case "facebook_reaction":
        await facebook.like(page, job);
        break;
    }
  }
}

export default FacebookManager;
