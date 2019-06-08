const puppeteer = require('puppeteer');

(async () => {
    const pathToExtension = require('path').join(__dirname, 'test-extension');
    const extensionId = 'libngjiannjidnjpjnkiakidagcnbfcc';

    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/google-chrome',
        ignoreDefaultArgs: [
            // '--mute-audio'
            // '--user-data-dir'
        ],
        args: [
            '--remote-debugging-port=9222',
            // '--remote-debugging-address=192.168.68.139',
            `--whitelisted-extension-id=${extensionId}`,
            '--enable-usermedia-screen-capturing',
            '--allow-http-screen-capture',
            // '--auto-select-desktop-capture-source=puppetcam',
            // '--use-fake-ui-for-media-stream',
            '--no-sandbox',
            // '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            // '--enable--native-messaging',
            // '--native-messaging-hosts="com.google.chrome.example.echo=/home/jack/.config/google-chrome/NativeMessagingHosts/com.google.chrome.example.echo.json"',
            `--disable-extensions-except=${pathToExtension}`,
            `--load-extension=${pathToExtension}`,
            `--user-data-dir=/home/jack/.config/google-chrome`,
        ],
        headless: false,
        defaultViewport: null,
    });
    const page = await browser.newPage();

    // await page.goto('https://baidu.com', { waitUntil: 'networkidle2' });
    // await page.goto('http://192.168.68.1/got.mp4');
    await page.goto('http://tw.gcp.cicadabear.cc/russia_cruise.mp4');


    const targets = await browser.targets();
    targets.forEach(function(target){
        console.log(target.url());
    });
    const backgroundPageTarget = targets.find(target => target.type() === 'background_page' && target.url().startsWith(`chrome-extension://${extensionId}/`));
    const backgroundPage = await backgroundPageTarget.page();

    backgroundPage.on('console', msg => {
        for (let i = 0; i < msg.args().length; i++) {
            console.log(`${i}: ${msg.args()[i]}`);
        }
    });

    page.on('console', msg => {
        for (let i = 0; i < msg.args().length; i++) {
            console.log(`${i}: ${msg.args()[i]}`);
        }
    });

    await backgroundPage.evaluate(() => {
        startRecording();
        return Promise.resolve(42);
    });

    // await page.waitFor(30 * 1000);
    // await backgroundPage.evaluate(() => {
    //     stopRecording();
    //     // chrome.runtime.sendMessage.postMessage('STOP_RECORDING');
    // });
    // // await backgroundPage.waitForSelector('html.downloadComplete', {timeout: 0});
    // await page.waitFor(2 * 1000);
    // await browser.close();
})();