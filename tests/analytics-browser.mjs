/** Isolated browser acceptance harness. Synthetic provider SDKs and local SMTP only. */
import assert from 'node:assert/strict';
import net from 'node:net';
import { Browser } from '../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const base = process.env.ANALYTICS_TEST_URL || 'http://localhost:3001';
const origin = new URL(base).origin;
if (!['localhost','127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Browser harness accepts localhost only');
if (process.env.ANALYTICS_TEST_SMTP_LOCAL_ONLY !== '1') throw new Error('Set ANALYTICS_TEST_SMTP_LOCAL_ONLY=1 only for the dedicated build with local SMTP4525');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const services = ['registro-de-marca','contratos-y-convenios','derechos-de-autor','consultoria-legal','paquete-web-legal'];
let mode = 'accept', transactions = 0, connections = 0, held = [], ambiguous = 0;
const sockets = new Set();
const smtp = net.createServer(socket => {
  sockets.add(socket); connections++; socket.on('close', () => sockets.delete(socket));
  socket.write('220 localhost synthetic SMTP\r\n'); let buffer = '', data = false, auth = 0;
  socket.on('data', chunk => {
    buffer += chunk.toString();
    while (buffer.includes('\r\n')) {
      const index = buffer.indexOf('\r\n'), line = buffer.slice(0,index); buffer = buffer.slice(index+2);
      if (data) {
        if (line !== '.') continue;
        data = false; transactions++;
        if (mode === 'hold') held.push(() => socket.write('250 accepted\r\n'));
        else if (mode === 'unknown_once' && ambiguous++ === 0) socket.destroy();
        else socket.write('250 accepted\r\n');
      } else if (auth) { if (++auth === 3) { auth = 0; socket.write('235 authenticated\r\n'); } else socket.write('334 UGFzc3dvcmQ6\r\n'); }
      else if (/^(EHLO|HELO)/i.test(line)) socket.write('250-localhost\r\n250 AUTH PLAIN LOGIN\r\n');
      else if (/^AUTH PLAIN/i.test(line)) socket.write('235 authenticated\r\n');
      else if (/^AUTH LOGIN/i.test(line)) {auth=1;socket.write('334 VXNlcm5hbWU6\r\n');}
      else if (/^RCPT TO/i.test(line)) socket.write(mode === 'reject' ? '550 synthetic rejection\r\n' : '250 recipient\r\n');
      else if (/^DATA/i.test(line)) {data=true;socket.write('354 end with dot\r\n');}
      else if (/^QUIT/i.test(line)) socket.end('221 bye\r\n');
      else socket.write('250 OK\r\n');
    }
  });
});
await new Promise((resolve,reject) => { smtp.once('error',reject);smtp.listen(4525,'127.0.0.1',resolve); });
const browser = await Browser.launch({extraArgs:['--disable-gpu']});
let page;
let hiddenTarget;
const archive = [];
const wait = async (fn, message, timeout=12000) => {
  const start = Date.now();
  while (Date.now()-start < timeout) { if (await page.eval(()=>document.visibilityState === 'hidden')) await page.send('Page.bringToFront'); if (await fn()) return; await pause(80); }
  let diagnostic;try{diagnostic=await page.eval(()=>({path:location.pathname,visibility:document.visibilityState,focus:document.hasFocus(),viewport:innerHeight,scroll:scrollY,forms:[...document.querySelectorAll('form')].map(form=>({rect:form.getBoundingClientRect().toJSON(),form:form.getAttribute('data-analytics-form')})),meta:window.__meta, scripts:[...document.scripts].map(script=>script.src).filter(Boolean),events:window.__ga.filter(call=>call[0]==='event').map(call=>call[1])}));}catch{}
  throw new Error(`Timeout: ${message}; ${JSON.stringify(diagnostic)}`);
};
const events = name => page.eval(name => window.__ga.filter(call => call[0]==='event' && (!name || call[1]===name)), name);
const click = selector => page.eval(selector => { const element=document.querySelector(selector);if(!element)throw new Error(`Missing ${selector}`);element.click(); },selector);
const textClick = text => page.eval(text => {const element=[...document.querySelectorAll('button')].find(node=>node.textContent.trim()===text);if(!element)throw new Error(`Missingbutton${text}`);element.click();},text);
const goto = async path => { if (page) { try { archive.push(...await events()); } catch {} } console.log('VISIT '+path); await page.goto(base+path,{settleMs:300});await page.send('Page.bringToFront');assert.equal(await page.eval(()=>document.visibilityState),'visible','test page must be foreground'); await wait(()=>page.eval(()=>!!document.querySelector('footer') && document.readyState==='complete'),'hydration'); await pause(400); };
const grant = async () => {await textClick('Aceptar');await wait(async()=> (await events('page_view')).length===1,'consent pageview'); await pause(250);};
const change = async (selector,value) => page.eval(({selector,value}) => {const el=document.querySelector(selector);const setter=Object.getOwnPropertyDescriptor(el instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:el instanceof HTMLSelectElement?HTMLSelectElement.prototype:HTMLInputElement.prototype,'value').set;setter.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}, {selector,value});
const fillContact = async () => {for(const [selector,value]of [['#name','Synthetic Canary Person'],['#phone','5512345678'],['#email','analytics-canary@example.test'],['#message','Synthetic private message canary']])await change(selector,value);};
const fillEvaluation = async () => {await change('#evaluation-name','Synthetic Canary Person');await change('#evaluation-email','analytics-canary@example.test');};
try {
  page = await browser.newPage({width:1440,height:900,reducedMotion:process.env.ANALYTICS_TEST_MOTION !== 'normal'});
  const hydrationWarnings = [];
  browser.on(page.sessionId,'Runtime.consoleAPICalled',event => {const message=(event.args||[]).map(arg=>arg.value||arg.description||'').join(' ');if(/hydrat|did not match|server rendered/i.test(message))hydrationWarnings.push(message);});
  await page.send('Page.addScriptToEvaluateOnNewDocument',{source:'window.__ga=[];window.__meta=[];window.__external=[];'});
  await page.send('Fetch.enable',{patterns:[{urlPattern:'*'}]});
  browser.on(page.sessionId,'Fetch.requestPaused',async event => {
    const url=event.request.url;
    try {
      if(url.startsWith(origin+'/')) return await page.send('Fetch.continueRequest',{requestId:event.requestId});
      let body;
      if(url.startsWith('https://www.googletagmanager.com/gtag/js')) body='window.gtag=function(){window.__ga.push(Array.from(arguments));};';
      else if(url.startsWith('https://connect.facebook.net/')) body='var q=window.fbq;var f=function(){window.__meta.push(Array.from(arguments));};if(q){q.callMethod=f;(q.queue||[]).forEach(function(a){f.apply(null,a);});}';
      if(body)return await page.send('Fetch.fulfillRequest',{requestId:event.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'application/javascript'}],body:Buffer.from(body).toString('base64')});
      await page.send('Fetch.failRequest',{requestId:event.requestId,errorReason:'BlockedByClient'});
    } catch { /* Target may close during cleanup. */ }
  });
  await goto('/');
  assert.equal((await events()).length,0,'unknown consent sends no analytics');
  await textClick('Rechazar');await pause(150);assert.equal((await events()).length,0,'denial sends no analytics');
  await textClick('Preferencias de cookies');await grant();
  assert.ok(await page.eval(()=>window.__ga.some(call=>call[0]==='config' && call[1]==='G-TEST123')),'dedicated synthetic build required before SMTP forms');
  console.log('PASS unknown/denied then grant');
  {
    await wait(()=>page.eval(()=>window.__meta.filter(call=>call[0]==='track'&&call[1]==='PageView').length===1),'initial synthetic Pixel pageview');
    const beforeHash=await page.eval(()=>({tracks:window.__meta.filter(call=>call[0]==='track').length,views:window.__meta.filter(call=>call[0]==='track'&&call[1]==='PageView').length,revokes:window.__meta.filter(call=>call[0]==='consent'&&call[1]==='revoke').length,grants:window.__meta.filter(call=>call[0]==='consent'&&call[1]==='grant').length}));
    await page.eval(()=>{location.hash='private-canary';});
    await wait(()=>page.eval(before=>window.__meta.filter(call=>call[0]==='consent'&&call[1]==='revoke').length>before,beforeHash.revokes),'Pixel revoked on unsafe hash');
    await page.eval(()=>document.querySelector('footer a[href^="mailto:"]').addEventListener('click',event=>event.preventDefault()));await click('footer a[href^="mailto:"]');await pause(150);
    assert.equal(await page.eval(()=>window.__meta.filter(call=>call[0]==='track').length),beforeHash.tracks,'unsafe hash suppresses Pixel tracking');
    await page.eval(()=>{location.hash='';});await wait(()=>page.eval(before=>window.__meta.filter(call=>call[0]==='consent'&&call[1]==='grant').length>before,beforeHash.grants),'Pixel restored on safe hash');
    assert.equal(await page.eval(()=>window.__meta.filter(call=>call[0]==='track'&&call[1]==='PageView').length),beforeHash.views,'hash changes do not duplicate pageviews');
    assert.ok(!JSON.stringify(await events()).includes('private-canary'),'private hash excluded from GA payloads');console.log('PASS unsafe hash revocation, dispatch suppression, safe restore, no duplicate pageview');
    const beforeQuery=(await events('page_view')).length;await page.eval(()=>history.pushState(null,'','/?service=unknown'));await pause(120);await page.eval(()=>history.back());await pause(200);assert.equal((await events('page_view')).length,beforeQuery,'query-only history does not add pageview');
    await click('.camino-nav-track a[href="/servicios"]');await wait(async()=>await page.eval(()=>location.pathname==='/servicios')&&(await events('page_view')).length===beforeQuery+1,'pathname navigation one pageview');await page.eval(()=>history.back());await wait(async()=>await page.eval(()=>location.pathname==='/')&&(await events('page_view')).length===beforeQuery+2,'pathname back one pageview');console.log('PASS query-only history and canonical pathname/back pageview ownership');
  }
  if (process.env.ANALYTICS_TEST_FOCUS !== 'privacy') {
  if (process.env.ANALYTICS_TEST_FOCUS !== 'forms') {
  for(const route of ['/','/servicios',...services.map(s=>'/servicios/'+s),'/cotizaciones','/nosotros','/preguntas','/contacto']) {
    await goto(route);await wait(async()=>(await events('page_view')).length===1,route+' pageview');
    assert.equal(new URL((await events('page_view'))[0][2].page_location).pathname,route);await wait(()=>page.eval(()=>window.__meta.filter(call=>call[0]==='track'&&call[1]==='PageView').length===1),route+' one Pixel pageview');
  }
  console.log('PASS eleven canonical routes exactly one initial page view');
  await click('.camino-nav-track a[href="/servicios"]');await wait(()=>page.eval(()=>location.pathname==='/servicios'),'SPA navigation');await pause(300);
  assert.equal((await events('navigation_click')).at(-1)[2].action_id,'nav.services');
  const beforeBack=(await events('page_view')).length;await page.eval(()=>history.back());await pause(400);assert.equal((await events('page_view')).length,beforeBack+1,'history owns one page view');
  await goto('/cotizaciones');
  await page.eval(()=>history.pushState(null,'','/cotizaciones?servicio=contratos-y-convenios'));await pause(300);
  assert.equal((await events('page_view')).length,1,'query-only does not create pageview');
  await goto('/cotizaciones');await change('#quote-classes','2');await click('.checkbox-label input');await click('.payment-options input[value="2"]');
  await wait(async()=>(await events('quote_view')).length===1,'quote view identity');const viewedQuote=(await events('quote_view'))[0][2].quote_id;
  const changes=await events('quote_change');assert.ok(changes.every(event=>event[2].quote_id===viewedQuote),'view/change use same mounted quote identity');assert.equal(changes.length,3);assert.equal(changes.at(-1)[2].estimated_total_minor,1161654);
  await click('.quote-disclosure summary');await click('.quote-disclosure:nth-of-type(2) summary');await pause(120);assert.equal((await events('quote_disclosure_toggle')).length,2);
  for(const service of services.slice(1)){await change('#quote-service',service);const event=(await events('quote_change')).at(-1);assert.equal(event[2].service_id,service);assert.ok(!('estimated_total_minor' in event[2]),'unknown amounts omitted in provider projection');}
  await page.eval(()=>document.querySelector('.quote-sheet > a').addEventListener('click',event=>event.preventDefault()));await click('.quote-sheet > a');assert.equal((await events('quote_request_intent')).length,1);assert.equal((await events('lead_submitted')).length,0,'mailto intent never lead');
  console.log('PASS quote controls, both disclosures, custom unknown prices, mail intent');
  await goto('/servicios');console.log('DIRECTORY');for(const index of [1,2,3,4,0])await click(`.explorer-choices button:nth-child(${index+1})`);assert.equal((await events('service_select')).length,5,'all five deliberate choices, initial default excluded');
  await goto('/preguntas');console.log('FAQ');await click('details summary');await pause(120);assert.equal((await events('faq_toggle')).length,1);
  await goto('/nosotros');console.log('MANUALPROCESS');if(process.env.ANALYTICS_TEST_MOTION === 'normal'){await page.eval(()=>document.querySelector('.process-stage').scrollIntoView({block:'center',behavior:'instant'}));await pause(700);}await click('.process-next');console.log('PROCESS CLICKED');await click('[aria-label="Siguiente"]');console.log('REVIEW CLICKED');await pause(150);assert.equal((await events('process_step_select')).length,1);assert.equal((await events('review_interaction')).length,1);
  await page.eval(()=>window.scrollTo(0,document.body.scrollHeight));await pause(100);assert.equal((await events('process_step_select')).length,1,'automatic progress excluded');
  console.log('MOBILENAV');await page.setViewport({width:390,height:844});await click('[aria-label="Toggle navigation menu"]');await click('header .lg\\:hidden a[href="/contacto"]');await wait(()=>page.eval(()=>location.pathname==='/contacto'),'mobile navigation');assert.equal((await events('cta_click')).at(-1)[2].source_surface,'navbar_mobile_pill');await page.setViewport({width:1440,height:900});
  console.log('PASS directory, FAQ, manual engagement, mobile/desktop navigation');
  }
  await goto('/contacto');await page.eval(()=>document.querySelector('form').scrollIntoView({block:'center'}));await wait(async()=>(await events('form_view')).length===1,'qualified contact form visibility',5000);
  await page.eval(()=>document.querySelector('form').requestSubmit());await pause(100);assert.equal((await events('form_submit_attempt')).length,1);assert.ok((await events('form_validation_failed')).length>0);assert.equal(transactions,0);
  await fillContact();const formInstance=(await events('form_view'))[0][2].form_instance_id;assert.equal((await events('form_start'))[0][2].form_instance_id,formInstance,'view/start same form instance');mode='reject';await page.eval(()=>document.querySelector('form').requestSubmit());await wait(async()=>(await events('form_submit_failed')).length===1,'rejected form result');assert.equal(await page.eval(()=>document.querySelector('#name').value),'Synthetic Canary Person','failed form preserved');
  mode='unknown_once';ambiguous=0;const previousTransactions=transactions;await page.eval(()=>document.querySelector('form').requestSubmit());await wait(async()=>(await events('lead_submitted')).length===1,'contact accepted after unknown retry',20000);assert.equal(transactions-previousTransactions,2,'one automatic retry');assert.equal((await events('lead_submitted')).length,1);assert.equal(await page.eval(()=>window.__meta.filter(call=>call[0]==='track'&&call[1]==='Lead').length),1,'one Pixel Lead after automatic transport retry');
  console.log('PASS contact visibility, validation, rejection, retained fields, unknown retry, one lead');
  await goto('/cotizaciones');await click('.quote-evaluation button');
  // A real second target backgrounds the measured page; never spoof visibility APIs.
  const {windowId}=await browser.send('Browser.getWindowForTarget',{targetId:page.targetId});hiddenTarget=await browser.send('Target.createTarget',{url:'about:blank',newWindow:false,windowId});await browser.send('Target.activateTarget',{targetId:hiddenTarget.targetId});
  for(let attempt=0;attempt<10 && await page.eval(()=>document.visibilityState !== 'hidden');attempt++)await pause(50);
  assert.equal(await page.eval(()=>document.visibilityState),'hidden','real second tab backgrounds the form');
  await pause(1400);assert.equal((await events('form_view')).filter(event=>event[2].form_id==='trademark_evaluation').length,0,'hidden form cannot qualify');
  await page.send('Page.bringToFront');await browser.send('Target.closeTarget',{targetId:hiddenTarget.targetId});hiddenTarget=null;
  await wait(async()=>(await events('form_view')).some(event=>event[2].form_id==='trademark_evaluation'),'evaluation form qualifies after foreground');
  await pause(1200);assert.equal((await events('form_view')).filter(event=>event[2].form_id==='trademark_evaluation').length,1,'foreground form qualifies once');console.log('PASS real hidden-tab qualification suppression and foreground once');await fillEvaluation();mode='accept';await page.eval(()=>document.querySelector('dialog form').requestSubmit());await wait(async()=>(await events('lead_submitted')).length===1,'email-only evaluation success');assert.equal((await events('lead_submitted'))[0][2].form_id,'trademark_evaluation');assert.equal(await page.eval(()=>window.__meta.filter(call=>call[0]==='track'&&call[1]==='Lead').length),1,'email-only evaluation Pixel Lead');
  await textClick('Listo');assert.equal((await events('evaluation_close')).at(-1)[2].close_reason,'success_done');await click('.quote-evaluation button');await wait(async()=>(await events('form_view')).filter(event=>event[2].form_id==='trademark_evaluation').length===2,'fresh reopened form instance');await click('button[aria-label="Cerrar evaluación"]');
  await goto('/contacto');await fillContact();mode='hold';const beforeDouble=connections;await page.eval(()=>{document.querySelector('form').requestSubmit();document.querySelector('form').requestSubmit();});await wait(()=>held.length>0,'held SMTP DATA');await pause(200);assert.equal(connections-beforeDouble,1,'pending double submit has one transport');assert.equal((await events('form_submit_attempt')).length,1,'pending double submit one attempt');await textClick('Preferencias de cookies');await textClick('Rechazar');held.splice(0).forEach(release=>release());await pause(600);assert.equal((await events('lead_submitted')).length,0,'revoked during SMTP suppresses conversion');const before=(await events()).length;await click('.camino-nav-track a[href="/servicios"]');await pause(300);assert.equal((await events()).length,before,'loaded SDK denied stops all events');
  console.log('PASS evaluation and consent revoked while SMTP pending');
  await goto('/servicios/registro-de-marca');await textClick('Preferencias de cookies');await grant();await page.eval(()=>document.querySelector('[data-analytics-step="01"]').scrollIntoView({block:'center'}));await wait(async()=>(await events('trademark_step_view')).some(event=>event[2].step_id==='01'),'qualified trademark step visibility',6000);
  await page.eval(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));await pause(200);
  for(const threshold of [25,50,75,90])assert.equal((await events('scroll_depth')).filter(event=>event[2].threshold===threshold).length,1,`scroll ${threshold} qualifies once`);
  await page.eval(()=>window.scrollTo({top:0,behavior:'instant'}));await pause(150);await page.eval(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));await pause(200);
  assert.equal((await events('scroll_depth')).length,4,'repeated scroll creates no duplicate milestones');console.log('PASS 25/50/75/90 scroll milestones once');
  await goto('/cotizaciones?email=analytics-canary%40example.test');assert.ok((await events('page_view')).every(event=>!event[2].page_location.includes('?')),'query is excluded');assert.equal(await page.eval(()=>window.__meta.filter(call=>call[0]==='track').length),0,'Pixel suppressed on unsafe query');
  const all=JSON.stringify([...archive,...await events()]);for(const canary of ['Synthetic Canary Person','analytics-canary@example.test','5512345678','Synthetic private message'])assert.ok(!all.includes(canary),'PII excluded');
  assert.equal(page.consoleErrors.length,0,JSON.stringify(page.consoleErrors));assert.deepEqual(hydrationWarnings,[],'no hydration warnings');
  console.log('PASS real step visibility and PII canaries');
  if (process.env.ANALYTICS_TEST_FOCUS !== 'forms') {
    await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});await goto('/nosotros');await page.eval(()=>document.querySelector('.process-stage').scrollIntoView({block:'center',behavior:'instant'}));await pause(700);const point=await page.eval(()=>{const rect=document.querySelector('.process-next').getBoundingClientRect();return{x:rect.x+rect.width/2,y:rect.y+rect.height/2};});await page.send('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1});await page.send('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1});await wait(async()=>(await events('process_step_select')).length===1,'normal motion visible manual process');console.log('PASS normal-motion visible process click');
  }
  }
  console.log(JSON.stringify({result:'passed',smtpTransactions:transactions,smtpConnections:connections}));
} finally {if(hiddenTarget)await browser.send('Target.closeTarget',{targetId:hiddenTarget.targetId}).catch(()=>{});held.splice(0).forEach(release=>release());for(const socket of sockets)socket.destroy();await browser.close();await new Promise(resolve=>smtp.close(resolve));}
