import { chromium } from "playwright";
const nav = await chromium.launch();
for (const puerto of [3100, 3101]) {
  const ctx = await nav.newContext({ viewport:{width:1024,height:768} });
  const p = await ctx.newPage();
  await p.goto(`http://localhost:${puerto}/`, { waitUntil:"networkidle" });
  const cab = await p.locator("header").first().innerText();
  await p.getByLabel("Mensaje").fill("Un alumno me empujo y me grito delante del salon.");
  await p.getByRole("button",{name:"Enviar mensaje"}).click();
  await p.waitForSelector("[data-clave]",{timeout:60000});
  await p.locator('[aria-label*="escribiendo"]').waitFor({state:"detached",timeout:30000}).catch(()=>{});
  await p.waitForTimeout(1300);
  const m = await p.evaluate(() => {
    const area = document.querySelector("ol").parentElement.getBoundingClientRect();
    const li = [...document.querySelectorAll("ol > li")].find(x => x.querySelector("[data-clave]"));
    const r = li.getBoundingClientRect();
    return { total: Math.round(r.height), area: Math.round(area.height), entra: r.height <= area.height };
  });
  console.log(` ${puerto} ${puerto===3100?"REAL":"mock"}: cabecera "${cab.split("\n")[0]}" | ${m.total}px / ${m.area}px | ENTRA: ${m.entra}`);
  await ctx.close();
}
await nav.close();
