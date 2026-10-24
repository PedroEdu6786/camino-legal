/** UI acceptance only; never submits mail or contacts external providers. */
import assert from 'node:assert/strict';
import { Browser } from '../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const base=process.env.CONSULTATION_TEST_URL || 'http://localhost:3002';
if (!['localhost','127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only');
const browser=await Browser.launch({extraArgs:['--disable-gpu']});
let focusTimer;
const pause=ms=>new Promise(r=>setTimeout(r,ms));
try {
  for (const width of [1440,390]) {
    const page=await browser.newPage({width,height:900});
    await page.goto(base+'/cotizaciones');
    focusTimer=setInterval(()=>{void page.send('Page.bringToFront').catch(()=>{});},100);
    const wait=async fn=>{for(let i=0;i<80;i++){if(await fn())return;await pause(100);}throw new Error('UI did not settle');};
    const change=async(selector,value)=>page.eval(({selector,value})=>{const el=document.querySelector(selector);const type=el.tagName==='SELECT'?HTMLSelectElement:el.tagName==='TEXTAREA'?HTMLTextAreaElement:HTMLInputElement;Object.getOwnPropertyDescriptor(type.prototype,'value').set.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));},{selector,value});
    const open=async()=>{await page.eval(()=>document.querySelector('.quote-contact-actions button').click());await wait(()=>page.eval(()=>!!document.querySelector('dialog[open] [data-analytics-form="quotation_consultation"]')));};
    const close=async()=>{await page.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await page.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await wait(()=>page.eval(()=>!document.querySelector('dialog')));};
    await change('#quote-classes','2');
    await page.eval(()=>document.querySelector('.checkbox-label input').click());
    assert.equal(await page.eval(()=>getComputedStyle(document.querySelector('.quote-contact-actions button')).cursor),'pointer');
    await open();
    assert.equal(await page.eval(()=>document.querySelector('#consultation-phone-country').value),'MX');
    const initial=await page.eval(()=>({message:document.querySelector('#consultation-message').value,valid:document.querySelector('dialog form').checkValidity(),required:document.querySelector('#consultation-phone').required,overflow:document.querySelector('dialog').scrollWidth>document.querySelector('dialog').clientWidth}));
    assert.match(initial.message,/registro de marca/i);assert.match(initial.message,/2 clases/);assert.match(initial.message,/incluí las Reglas de Uso/);assert.match(initial.message,/cotización de.*MXN/);assert.match(initial.message,/3 partes/);assert.equal(initial.valid,false);assert.equal(initial.required,true);assert.equal(initial.overflow,false);
    await change('#consultation-name','Synthetic visitor');await change('#consultation-email','visitor@example.test');await change('#consultation-phone','999123456');
    assert.equal(await page.eval(()=>document.querySelector('dialog form').checkValidity()),false);
    await change('#consultation-phone','abc999-123-4567');
    assert.equal(await page.eval(()=>document.querySelector('#consultation-phone').value),'9991234567');await change('#consultation-message',initial.message+'\nDetalle adicional del proyecto.');
    assert.equal(await page.eval(()=>document.querySelector('dialog form').checkValidity()),true);
    const submitted=await page.eval(()=>Object.fromEntries(new FormData(document.querySelector('dialog form'))));
    assert.equal(submitted.phone,'9991234567');assert.match(submitted.message,/Detalle adicional/);
    await change('#consultation-phone-country','ES');await change('#consultation-phone','612 345 678');
    assert.equal(await page.eval(()=>document.querySelector('dialog form').checkValidity()),true,'Spanish nine-digit number must be accepted');
    await change('#consultation-phone','+44 20 7946 0958');
    assert.equal(await page.eval(()=>document.querySelector('#consultation-phone-country').value),'GB','explicit international prefix selects its country');
    assert.equal(await page.eval(()=>document.querySelector('#consultation-phone').value),'02079460958','pasted international numbers become national digits');
    assert.equal(await page.eval(()=>document.querySelector('dialog form').checkValidity()),true);
    assert.equal(await page.eval(()=>getComputedStyle(document.querySelector('dialog button[type="submit"]')).cursor),'pointer');
    await pause(350);
    await page.screenshot({path:`/private/tmp/camino-consultation-${width}.png`,format:'png'});
    await close();
    assert.equal(await page.eval(()=>getComputedStyle(document.querySelector('.quote-evaluation button')).cursor),'pointer');
    await page.eval(()=>document.querySelector('.quote-evaluation button').click());
    await wait(()=>page.eval(()=>!!document.querySelector('dialog[open] [data-analytics-form="trademark_evaluation"]')));
    assert.equal(await page.eval(()=>document.querySelector('#evaluation-phone-country').value),'MX');
    assert.equal(await page.eval(()=>document.querySelector('#evaluation-phone-country').previousElementSibling.textContent),'🇲🇽+52');
    const evaluation=await page.eval(()=>({message:document.querySelector('#evaluation-message').value,phone:document.querySelector('#evaluation-phone').required}));
    assert.match(evaluation.message,/solo con la evaluación/);assert.match(evaluation.message,/799 MXN/);assert.doesNotMatch(evaluation.message,/cotización de|3 partes/);assert.equal(evaluation.phone,true);
    await change('#evaluation-name','Synthetic visitor');await change('#evaluation-email','visitor@example.test');
    assert.equal(await page.eval(()=>document.querySelector('dialog form').checkValidity()),false);
    await change('#evaluation-phone-country','US');await change('#evaluation-phone','(202) 555-0123');
    assert.equal(await page.eval(()=>document.querySelector('dialog form').checkValidity()),true);
    await close();
    for(const slug of ['contratos-y-convenios','derechos-de-autor','consultoria-legal','paquete-web-legal']){
      await change('#quote-service',slug);await open();
      const custom=await page.eval(()=>({title:document.querySelector('#quote-service').selectedOptions[0].text,message:document.querySelector('#consultation-message').value}));
      assert.ok(custom.message.includes(custom.title.toLocaleLowerCase("es-MX")));assert.match(custom.message,/costos y los tiempos/);assert.doesNotMatch(custom.message,/Estimado:|2 clases|Reglas de Uso/);await close();
    }
    await page.goto(base+'/contacto');
    const contactLayout = await page.eval(() => {
      const form = document.querySelector('#contact form');
      const name = form.querySelector('#name'), email = form.querySelector('#email'), phone = form.querySelector('#phone');
      return { nameWidth: name.getBoundingClientRect().width, emailWidth: email.getBoundingClientRect().width,
        phoneBesideName: Math.abs(phone.getBoundingClientRect().top - name.getBoundingClientRect().top) < 1,
        phoneBeforeEmail: phone.getBoundingClientRect().top < email.getBoundingClientRect().top,
        labelCase: getComputedStyle(form.querySelector('label')).textTransform,
        translucentPanel: getComputedStyle(form.parentElement).backgroundColor.includes('0.55'),
        overflow: document.documentElement.scrollWidth > innerWidth };
    });
    assert.equal(contactLayout.nameWidth < contactLayout.emailWidth, width >= 640);
    assert.equal(contactLayout.phoneBesideName, width >= 640);
    assert.equal(contactLayout.phoneBeforeEmail, true);
    assert.equal(contactLayout.labelCase, 'none');
    assert.equal(contactLayout.translucentPanel, true);
    assert.equal(contactLayout.overflow, false);
    await page.eval(() => document.querySelector('#contact form').scrollIntoView({ block: 'center', behavior: 'instant' }));
    await pause(700);
    await page.screenshot({path:`/private/tmp/camino-contact-style-${width}.png`,format:'png'});
    assert.equal(await page.eval(()=>document.querySelector('#phone-country').value),'MX');
    await change('#name','Synthetic visitor');await change('#email','visitor@example.test');await change('#message','Me gustaría conocer sus servicios.');
    await change('#phone-country','ES');await change('#phone','612 345 678');
    assert.equal(await page.eval(()=>document.querySelector('#contact form').checkValidity()),true);
    assert.equal(await page.eval(()=>getComputedStyle(document.querySelector('#contact button[type="submit"]')).cursor),'pointer');
    await change('#phone','+1 (202) 555-0123');
    assert.equal(await page.eval(()=>document.querySelector('#phone-country').value),'US');
    assert.equal(await page.eval(()=>document.querySelector('#contact form').checkValidity()),true);
    console.log(`PASS ${width}px: quotation/evaluation phone validation, editable prefills, all five services, Escape, and modal layout`);
    clearInterval(focusTimer);await page.close();
  }
}finally{clearInterval(focusTimer);await browser.close();}
