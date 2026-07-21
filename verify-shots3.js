const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'http://localhost:8902/';
const OUT = __dirname + '\\verify-shots\\';

(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars', '--no-sandbox'] });
  const page = await b.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  // cargar en reposo (jump=0) primero para dar tiempo a que los 151 frames se descarguen y decodifiquen
  await page.goto(`${BASE}?jump=0&nocache=${Date.now()}`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForFunction('window.__ready === true', { timeout: 45000 });
  await new Promise(r => setTimeout(r, 4000));
  const diag = await page.evaluate(() => {
    // fuerza que el navegador visite la posición real vía scroll (no otra navegación) para no resetear el estado ya cargado
    return { loaded: true };
  });

  const targets = [936, 1404, 1966, 2574];
  for (const jump of targets) {
    await page.evaluate((y) => { window.scrollTo(0, y); }, jump);
    await new Promise(r => setTimeout(r, 700));
    const info = await page.evaluate(() => {
      const c = document.getElementById('cenoteCanvas');
      return { opacity: c.style.opacity, mixBlend: getComputedStyle(c).mixBlendMode };
    });
    await page.screenshot({ path: OUT + `jump${jump}-warm.png` });
    console.log('captured jump' + jump + '-warm.png', JSON.stringify(info));
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
