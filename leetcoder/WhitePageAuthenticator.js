import {getElementBySelector} from "../utils/utils.js";
import {getElementByXPath} from "../utils/utils.js";
import Logger from "../utils/Logger.js";
import {WHITEPAGE_CLOUDFLARE_CODE_NAME_XPATH} from "../utils/constants.js";
import {getBrowserDetails} from "../managers/BrowserManager.js";

class WhitePageAuthenticator {
  static #loginUserHandler = async () => {
    const {page} = await getBrowserDetails();
    await page.goto(`https://www.whitepages.com/`, {
      waitUntil: "networkidle2",
    });

    try {
      await getElementByXPath(page, WHITEPAGE_CLOUDFLARE_CODE_NAME_XPATH, 3, 0);
      Logger.success('Authenticator Cloudflare was already logged in.')
      return;
    } catch (_) {
    }
    Logger.success('Login WhitePage using your credentials!')
    await page.evaluate(() => {
        document.addEventListener("click", (event) => {
            let element = event.target;
    
            let getXPath = (el) => {
                if (el.id !== "") return `//*[@id="${el.id}"]`;
                if (el === document.body) return "/html/body";
                let index = 1;
                let siblings = el.parentNode.childNodes;
                for (let i = 0; i < siblings.length; i++) {
                    let sibling = siblings[i];
                    if (sibling === el) return getXPath(el.parentNode) + "/" + el.tagName.toLowerCase() + `[${index}]`;
                    if (sibling.nodeType === 1 && sibling.tagName === el.tagName) index++;
                }
                return "";
            };
    
            let xpath = getXPath(element);
            Logger.success(`export const CLICKED_ELEMENT_XPATH = "${xpath}";`);
        });
    });
  

  };

  static loginUser = async () => {
    Logger.error('<<<< Starting WhitePage Authenticator >>>>');
    await this.#loginUserHandler();
    Logger.error('<<<< Exiting WhitePage Authenticator >>>>');
  };
}

export default WhitePageAuthenticator;
