import { Browser } from '../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import assert from 'node:assert/strict';
const base = process.env.ROUTE_TEST_URL || 'http://localhost:3013';
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Use a local preview');
const b=await Browser.launch();try {const p=await b.newPage();await p.goto(`${base}/servicios/registro-de-marca`);
for(const width of [1440,390]) {await p.setViewport({width,height:900});await new Promise(r=>setTimeout(r,300));
const jump=async progress=>{await p.send('Page.bringToFront');await p.eval(progress=>{const r=document.querySelector('.trademark-route-track').getBoundingClientRect();window.scrollTo({top:scrollY+r.top+r.height*progress-innerHeight*.55,behavior:'instant'});},progress);};
await jump(0);await new Promise(r=>setTimeout(r,2200));await jump(.8);await new Promise(r=>setTimeout(r,1800));
const state=await p.eval(()=>{const root=document.querySelector('.trademark-route-track'),box=root.getBoundingClientRect();return {target:Math.min(1,Math.max(0,(innerHeight*.55-box.top)/box.height)),position:1-Number(document.querySelector('.trademark-route-ink').style.strokeDashoffset),motion:root.dataset.motion};});console.log(width,'fast forward',state);assert.ok(Math.abs(state.target-state.position)<.02,'arrow must catch up after a fast scroll');
await jump(.2);await new Promise(r=>setTimeout(r,1800));const reverse=await p.eval(()=>1-Number(document.querySelector('.trademark-route-ink').style.strokeDashoffset));assert.ok(Math.abs(reverse-.2)<.02,'arrow must follow fast reverse scroll');
await jump(1.4);await new Promise(r=>setTimeout(r,200));assert.equal(await p.eval(()=>document.querySelector('.trademark-route-track').dataset.motion),'idle');
await jump(.5);await new Promise(r=>setTimeout(r,1800));assert.ok(Math.abs(await p.eval(()=>1-Number(document.querySelector('.trademark-route-ink').style.strokeDashoffset))-.5)<.02,'route resumes after re-entry');console.log('PASS forward/reverse/exit/re-entry',width);}
await p.send('Emulation.setEmulatedMedia', {features:[{name:'prefers-reduced-motion',value:'reduce'}]});
await new Promise(r=>setTimeout(r,200));
assert.equal(await p.eval(()=>document.querySelector('.trademark-route-ink').style.strokeDashoffset),'0');
assert.equal(await p.eval(()=>document.querySelector('.trademark-route-marker').style.opacity),'0');
console.log('PASS reduced motion');
} finally {await b.close();}
