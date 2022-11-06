const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const {upload} = require('./s3');
const {hideElements} = require('./hide-elements');

module.exports.screenshot = async function (url, bucketName) {
    let browser = null;

    try {
        await chromium.font('https://rawcdn.githack.com/googlefonts/noto-cjk/fcf3fdab7d4f10dde80f56526bd4376d21dacf0c/Sans/OTF/Japanese/NotoSansCJKjp-Regular.otf');
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        });

        const page = await browser.newPage();

        // redash customize
        await page.setViewport({width: 900, height: 50});
        await page.goto(url, {waitUntil: 'networkidle0'});
        await page.evaluate(hideElements);

        const data = await page.screenshot({fullPage: true});
        return upload(data, bucketName);
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }
}
