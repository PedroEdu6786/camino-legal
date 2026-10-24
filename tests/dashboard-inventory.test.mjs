import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENT_NAMES, providerEventName, publicAnalyticsPath } from '../app/lib/measurement/contracts.ts';
import { measurementCatalog } from '../app/lib/dashboard/catalog.ts';
import { inventoryFromEnvironment } from '../app/lib/server/dashboard/inventoryManifest.ts';
import { buildInventory, evidenceView } from '../app/lib/server/dashboard/inventory.ts';

const now = new Date('2026-10-24T12:00:00Z');
const asset = { key:'ga4:property:123',provider:'ga4',idType:'property',id:'123',name:'Reviewed property',classification:'active',environment:'production',owner:null,reason:'Owner selected',consoleUrl:'https://analytics.google.com/' };
const selection = { assetKey:asset.key,configurationRevision:'1',measurementRevision:'1' };
const evidence = { id:'review',assetKey:asset.key,environment:'production',kind:'configuration',configurationRevision:'1',measurementRevision:'1',method:'manual',source:'Owner review',verifiedAt:'2026-10-20T12:00:00Z',period:null,result:'verified' };
const manifest = { assets:[asset],selections:[selection],evidence:[evidence],discovery:{checkedAt:null,scope:'Selected property only',complete:false} };

test('catalog covers every canonical event exactly once without inventing Meta destinations', () => {
  assert.equal(measurementCatalog.length,27);
  assert.deepEqual(measurementCatalog.map(row=>row.name), [...EVENT_NAMES]);
  assert.deepEqual(measurementCatalog.filter(row=>row.meta).map(row=>[row.name,row.meta]), [
    ['page_view','PageView'],['quote_request_intent','Contact'],['lead_submitted','Lead'],['whatsapp_click','Contact'],['email_click','Contact'],
  ]);
  for (const event of EVENT_NAMES) assert.equal(providerEventName(event,'ga4'),event);
  assert.equal(measurementCatalog.find(row=>row.name==='lead_submitted').registrationRequired,true);
  assert.equal(measurementCatalog.find(row=>row.name==='quote_change').meta,null);
});
test('environment inventory uses allowlisted non-secret IDs and never claims discovery or production selection', () => {
  const data = inventoryFromEnvironment({ NEXT_PUBLIC_GA4_ID:'G-ABC123',NEXT_PUBLIC_META_PIXEL_ID:'12345',GOOGLE_ANALYTICS_PROPERTY_ID:'6789',META_ACCESS_TOKEN:'private-canary',GOOGLE_PRIVATE_KEY:'another-canary' });
  assert.equal(data.assets.length,3); assert.equal(data.selections.length,0); assert.equal(data.discovery.complete,false);
  assert.ok(data.assets.every(a=>a.classification==='unclassified'&&a.environment==='unknown'));
  assert.ok(!JSON.stringify(data).includes('canary'));
  assert.equal(inventoryFromEnvironment({NEXT_PUBLIC_GA4_ID:'bad@example.com',NEXT_PUBLIC_META_PIXEL_ID:'<bad>'}).assets.length,0);
  const view=buildInventory(data,now);
  assert.equal(view.events[0].destinations.ga4.configured,true);
  assert.equal(view.events[0].destinations.ga4.configuration.status,'unknown');
});
test('legacy/excluded assets and property-only metadata do not imply a configured browser destination', () => {
  for(const classification of ['active','legacy','excluded','unclassified']) {
    const view=buildInventory({...manifest,assets:[{...asset,classification,configuredDestination:true}]},now);
    assert.equal(view.events[0].destinations.ga4.configured,false,'property ID alone is not a browser destination');
  }
  for(const classification of ['legacy','excluded']) {
    const view=buildInventory({...manifest,assets:[{...asset,idType:'measurement',classification,configuredDestination:true}]},now);
    assert.equal(view.events[0].destinations.ga4.configured,false);
  }
});
test('evidence invalidates on resource, environment, configuration and measurement revision changes', () => {
  assert.equal(evidenceView(evidence,selection,asset,now).status,'verified');
  assert.equal(evidenceView(evidence,{...selection,configurationRevision:'2'},asset,now).status,'inapplicable');
  assert.equal(evidenceView(evidence,{...selection,measurementRevision:'2'},asset,now).status,'inapplicable');
  assert.equal(evidenceView(evidence,selection,{...asset,environment:'test'},now).status,'inapplicable');
  assert.equal(evidenceView(evidence,{...selection,assetKey:'other'},asset,now).status,'inapplicable');
});
test('30-day reminder does not rewrite evidence date and does not expire period-bound API observations', () => {
  const older={...evidence,verifiedAt:'2026-09-01T12:00:00Z'};
  assert.equal(evidenceView(older,selection,asset,now).status,'needs_recheck');
  assert.equal(evidenceView({...older,kind:'observation',method:'api',period:{start:'2026-08-01',end:'2026-08-28'}},selection,asset,now).status,'verified');
  assert.equal(buildInventory({...manifest,evidence:[older]},now).evidence[0].verifiedAt,older.verifiedAt);
  assert.equal(evidenceView({...evidence,verifiedAt:'2027-01-01'},selection,asset,now).status,'unknown');
});
test('observations, applicable registration and implementation remain independent', () => {
  const view=buildInventory(manifest,now);
  const lead=view.events.find(e=>e.name==='lead_submitted');
  assert.equal(lead.implementation,'implemented'); assert.equal(lead.destinations.ga4.configuration.status,'verified');
  assert.equal(lead.destinations.ga4.registration.status,'unknown'); assert.equal(lead.destinations.ga4.observation.status,'unknown');
  assert.equal(view.events.find(e=>e.name==='quote_change').destinations.meta.observation.status,'not_applicable');
  assert.equal(view.events.filter(e=>e.meta==='Contact').length,3);
  assert.ok(view.events.every(e=>!Object.hasOwn(e,'count')),'inventory does not invent observed counts');
});
test('inventory preserves classified assets and gaps are explicit about unknown owners', () => {
  const assets=['active','legacy','excluded','unclassified'].map((classification,i)=>({...asset,key:`asset-${i}`,classification}));
  const view=buildInventory({...manifest,assets},now);
  assert.deepEqual(view.assets.map(a=>a.classification),['active','legacy','excluded','unclassified']);
  assert.ok(view.gaps.some(g=>g.id==='ga4:selection'));
  assert.ok(view.gaps.every(g=>g.owner===null&&g.nextAction));
});
test('only registered public routes qualify for marketing collection', () => {
  for(const path of ['/','/contacto','/cotizaciones','/servicios/registro-de-marca'])assert.equal(publicAnalyticsPath(path),true);
  for(const path of ['/admin/analitica','/admin','/unknown','/servicios/not-real'])assert.equal(publicAnalyticsPath(path),false);
});
