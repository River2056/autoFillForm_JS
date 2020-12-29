const puppeteer = require('puppeteer');
const config = require('./src/config');
const selectTenderWay = require('./src/selectTenderWay');
const h = require('./src/helper');

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [
            '--start-fullscreen'
        ]
    });
    const page = await browser.newPage();
    page.setViewport({ width: 0, height: 0 });
    page.on('dialog', async dialog => {
        await dialog.dismiss();
    });
    await page.goto(config.url);

    // 登入
    await page.type('#idForLogin01', config.username, { delay: 100 });
    await page.type('#uidExtForLogin01', config.ext, { delay: 100 });
    await page.type('#password01', config.password, { delay: 100 });
    await page.click('#imageLogin01');

    // 取消alert, 公告板
    await page.waitForSelector('#confirmMsg').then(() => {
        page.evaluate(() => {
            BlockUiQueue.next();
        })
    });

    // 到新增招標公告
    await page.goto(config.createTender);
    const fileName = h.generateFileName();
    const allElements = await page.$$('input[type="text"], input[type="radio"], select');
    let first = false;
    for(let el of allElements) {
        let elementValue = await (await el.getProperty('id')).jsonValue();
        if(elementValue == null || elementValue == '') {
            elementValue = await (await el.getProperty('name')).jsonValue();
        }
        if(elementValue.startsWith('commonUtil_castnumber') && elementValue.endsWith('inputid') && !first) {
            first = true;
            await el.click({ clickCount: 3 });
            await el.type(fileName, { delay: 100 });
            await page.keyboard.press('Tab');
            await page.select('#fkPmsTenderWay', '12');
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await page.click('#submit_button');
            break;
        }
    }

    // 填表單
    // 機關頁籤填地址
    // addrContainer_addrDetail
    await page.waitForNavigation();
    const addressElementHandles = await page.$$('select');
    for(let addrElement of addressElementHandles) {
        const options = await addrElement.$$('option');
        const optionValue = (await options[2].getProperty('value')).jsonValue();
        const addr = await (await addrElement.getProperty('id')).jsonValue();
        if(addr.startsWith('addrContainer_city')) {
            await addrElement.select(optionValue);
        }
        if(addr.startsWith('addrContainer_cityArea')) {
            await addrElement.select(optionValue);
        }
    }
    // await page.type('#addrContainer_addrDetail', '建國路三段80巷21號', { delay: 100 });
    await page.click('input[value="下一頁"]');
})();