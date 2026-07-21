const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'http://localhost:8902/';
const OUT = __dirname + '\\verify-shots\\';

async function shotAt(page, jump, name) {
  await page.goto(`${BASE}?jump=${jump}&nocache=${Date.now()}`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForFunction('window.__ready === true', { timeout: 45000 });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: OUT + name });
  console.log('captured', name, 'jump=' + jump);
}

(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars', '--no-sandbox'] });
  const page = await b.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  // capítulos y costuras del film (viewport 900px → filmH = 620vh = 5580px, denom=4680)
  const filmShots = [
    [0,     '01-hero-superficie.png'],
    [936,   '02-cruce-espejo.png'],
    [1404,  '03-crossfade-mid.png'],
    [1966,  '04-haz-cenital-inicio.png'],
    [2574,  '05-beat-ruido-arriba.png'],
    [3042,  '06-beat-destilamos.png'],
    [3510,  '07-beat-mas-hondo.png'],
    [4212,  '08-claridad-abriendo.png'],
    [4586,  '09-fin-film-costura.png'],
  ];
  for (const [jump, name] of filmShots) await shotAt(page, jump, name);

  // after-film: usamos scrollIntoView por id en vez de jump numérico
  const sections = [
    ['manifiesto', '10-manifiesto.png'],
    ['sonar', '11-sonar.png'],
    ['escalera', '12-escalera.png'],
    ['casos', '13-casos.png'],
    ['contacto', '14-cta-final.png'],
  ];
  for (const [id, name] of sections) {
    await page.goto(`${BASE}?jump=0&nocache=${Date.now()}`, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.waitForFunction('window.__ready === true', { timeout: 45000 });
    await page.evaluate((elId) => {
      document.getElementById(elId).scrollIntoView({ block: 'start' });
      document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('in'));
    }, id);
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: OUT + name });
    console.log('captured', name, 'section=' + id);
  }

  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
