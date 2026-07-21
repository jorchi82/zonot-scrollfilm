const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'http://localhost:8902/';
const OUT = __dirname + '\\verify-shots\\';

(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars', '--no-sandbox'] });
  const page = await b.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  const shots = [
    [936,  '02b-cruce-espejo-fix.png'],
    [1404, '03b-crossfade-mid-fix.png'],
    [1966, '04b-haz-cenital-fix.png'],
    [2574, '05b-beat-ruido-fix.png'],
  ];
  for (const [jump, name] of shots) {
    await page.goto(`${BASE}?jump=${jump}&nocache=${Date.now()}`, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.waitForFunction('window.__ready === true', { timeout: 45000 });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: OUT + name });
    console.log('captured', name, 'jump=' + jump);
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
