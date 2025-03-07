import { Context, h } from "koishi";
import "koishi-plugin-puppeteer";
import { Config } from "..";
import { Browser, Page } from "puppeteer-core";
import Puppeteer from "koishi-plugin-puppeteer";

const MAIN_URL = "https:///scp-wiki.wikidot.com";
const CN_URL = "https:///scp-wiki-cn.wikidot.com";
let baseUrl: string;
let puppeteer: Puppeteer;
let browser: Browser;
let page: Page;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function init(ctx: Context, config: Config) {
  browser = ctx.puppeteer.browser;
  puppeteer = ctx.puppeteer;
  baseUrl = config.CNURL ? CN_URL : MAIN_URL;
}

export async function getSCPInfo(
  options: { name?: string; number?: string } = {}
) {
  if (!browser) {
    await puppeteer.start();
  }
  page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
  );
  const { name, number } = options;
  let param = "";
  if (name) {
    param = name;
  } else if (number) {
    param = `scp-${number.padStart(3, "0")}`;
  }

  await page.goto(`${baseUrl}/${param}`, {
    waitUntil: "networkidle2", // 等待加载完毕
  });
  const mainElement = await page.waitForSelector("#main-content");

  let links = await page.$$("#main-content .collapsible-block-link");
  try {
    let c = true; //防止元素冒泡
    for (const link of links) {
      if (c) {
        await link.click();
        console.log(link);
        await sleep(1000);
      }
      c = !c;
    }
  } catch (error) {}

  const screenshotData = await mainElement.screenshot();

  await page.close();
  return h.image(screenshotData, "image/png");
}

