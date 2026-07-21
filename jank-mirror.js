const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
async function run(label, disableFn) {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars', '--no-sandbox'] });
  const page = await b.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto('http://localhost:8902/', { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForFunction('window.__ready === true', { timeout: 45000 });
  if (disableFn) await page.evaluate(disableFn);
  const stats = await page.evaluate(() => new Promise(res => {
    const filmH = document.getElementById('film').offsetHeight;
    const end = Math.min(filmH + 200, (document.scrollingElement||document.documentElement).scrollHeight - innerHeight);
    const deltas = []; let last = performance.now(), y = 0;
    const tick = () => {
      const now = performance.now(); deltas.push(now-last); last = now;
      y += 13; window.scrollTo(0, Math.min(y, end));
      if (y < end) requestAnimationFrame(tick);
      else { deltas.sort((a,b)=>a-b); res({max:+deltas[deltas.length-1].toFixed(1), p95:+deltas[Math.floor(deltas.length*0.95)].toFixed(1), over50: deltas.filter(d=>d>50).length}); }
    };
    requestAnimationFrame(tick);
  }));
  console.log(label.padEnd(30), JSON.stringify(stats));
  await b.close();
}
(async () => {
  await run('baseline', null);
  await run('sin box-shadow en linea', () => { const s=document.createElement('style'); s.textContent='.mirror__line{box-shadow:none!important}'; document.head.appendChild(s); });
  await run('sin blend-mode screen shimmer', () => { const s=document.createElement('style'); s.textContent='.mirror__shimmer{mix-blend-mode:normal!important}'; document.head.appendChild(s); });
  await run('sin box-shadow + sin blend', () => { const s=document.createElement('style'); s.textContent='.mirror__line{box-shadow:none!important} .mirror__shimmer{mix-blend-mode:normal!important}'; document.head.appendChild(s); });
})();
