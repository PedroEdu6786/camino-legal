import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, verify } from 'node:crypto';
import { summaryPeriod, formatSummaryMetric } from '../app/lib/dashboard/reporting.ts';
import { createGoogleSummaryReader, parseSummaryReport } from '../app/lib/server/dashboard/googleSummary.ts';

const now = new Date('2026-10-24T12:00:00Z');
const env = { GOOGLE_ANALYTICS_PROPERTY_ID:'123456',GOOGLE_ANALYTICS_STREAM_ID:'789012',GOOGLE_ANALYTICS_TIME_ZONE:'America/Merida',GOOGLE_ANALYTICS_ACCESS_TOKEN:'synthetic-private-token' };
const report = () => ({ metricHeaders:[{name:'totalUsers'},{name:'screenPageViews'},{name:'bounceRate'},{name:'sessions'}], rows:[{metricValues:[{value:'120'},{value:'340'},{value:'0.375'},{value:'160'}]}],rowCount:1,metadata:{timeZone:'America/Merida'} });
test('date presets use complete property-local days and custom range limits do not limit historical age',()=>{
  assert.deepEqual(summaryPeriod(new URLSearchParams('days=7'),'America/Merida',now),{start:'2026-10-17',end:'2026-10-23',timezone:'America/Merida',days:7});
  assert.equal(summaryPeriod(new URLSearchParams('start=2020-01-01&end=2020-01-03'),'UTC',now).days,3);
  for(const query of ['days=91','days=0','start=2026-02-30&end=2026-03-01','start=2026-01-01&end=2026-10-01','start=2026-10-24&end=2026-10-24','days=7&start=2026-01-01&end=2026-01-02']) assert.throws(()=>summaryPeriod(new URLSearchParams(query),'America/Merida',now));
});
test('metrics are parsed by header name and bounce fractions formatted once',()=>{
  const payload=report();payload.metricHeaders.reverse();payload.rows[0].metricValues.reverse();
  const result=parseSummaryReport(payload,'America/Merida');
  assert.equal(result.state,'available');assert.equal(result.metrics.totalUsers,120);assert.equal(result.metrics.bounceRate,.375);
  assert.equal(formatSummaryMetric('bounceRate',.375),'37.5%');assert.equal(formatSummaryMetric('screenPageViews',0),'0');assert.equal(formatSummaryMetric('bounceRate',null),'No disponible');
});
test('empty, malformed, thresholded, sampled, restricted and truncated reports never fabricate totals',()=>{
  assert.equal(parseSummaryReport({...report(),rows:[],rowCount:0},'America/Merida').state,'no_observations');
  for(const metadata of [{subjectToThresholding:true},{samplingMetadatas:[{}]},{dataLossFromOtherRow:true},{dataTruncationReasons:['OTHER']},{schemaRestrictionResponse:{activeMetricRestrictions:[{}]}},{timeZone:'UTC'}]){
    const value=parseSummaryReport({...report(),metadata:{...report().metadata,...metadata}},'America/Merida');assert.equal(value.state,'partial');assert.equal(value.metrics.totalUsers,null);
  }
  for(const change of [{rows:{}},{metricHeaders:{}},{rows:[{}]},{rowCount:2}])assert.equal(parseSummaryReport({...report(),...change},'America/Merida').state,'partial');
});
test('explicit zero stays zero while zero sessions gives no bounce denominator',()=>{
  const payload=report();payload.rows[0].metricValues.forEach(metric=>metric.value='0');
  const value=parseSummaryReport(payload,'America/Merida');assert.equal(value.state,'available');assert.equal(value.metrics.totalUsers,0);assert.equal(value.metrics.screenPageViews,0);assert.equal(value.metrics.bounceRate,null);
});
test('reader sends one bounded web-stream report, coalesces requests and never serializes credentials',async()=>{
  const calls=[];const fetcher=async(url,init)=>{calls.push([url,init]);await new Promise(resolve=>setTimeout(resolve,5));return Response.json(report());};
  const read=createGoogleSummaryReader({env,fetcher,now:()=>now});
  const [a,b]=await Promise.all([read(new URLSearchParams('days=28')),read(new URLSearchParams('days=28'))]);
  assert.equal(a.state,'available');assert.deepEqual(a,b);assert.equal(calls.length,1);
  const [url,init]=calls[0];assert.equal(url,'https://analyticsdata.googleapis.com/v1beta/properties/123456:runReport');
  const body=JSON.parse(init.body);assert.equal(body.dimensionFilter.andGroup.expressions[0].filter.stringFilter.value,'789012');assert.equal(body.dimensionFilter.andGroup.expressions[1].filter.stringFilter.value,'web');assert.ok(init.signal);assert.equal(init.cache,'no-store');
  assert.ok(!JSON.stringify(a).includes(env.GOOGLE_ANALYTICS_ACCESS_TOKEN));
  assert.equal((await read(new URLSearchParams('days=28'))).state,'available');assert.equal(calls.length,1);
  const changed=await read(new URLSearchParams('days=7'));assert.equal(changed.state,'deferred');assert.equal(changed.metrics.totalUsers,null);assert.equal(changed.period.days,7);
});
test('provider denial and rate limits are safe and consume cooldown without retry',async()=>{
  for(const status of [403,429,503]){
    let calls=0;const read=createGoogleSummaryReader({env,now:()=>now,fetcher:async()=>{calls++;return new Response('private-provider-body',{status,headers:{'retry-after':'1800'}});}});
    const result=await read(new URLSearchParams());assert.equal(result.state,status===403?'forbidden':'error');assert.ok(!JSON.stringify(result).includes('private-provider-body'));
    if(status===429)assert.equal(Date.parse(result.nextRefreshAt)-now.getTime(),1800000);
    assert.equal((await read(new URLSearchParams())).state,'deferred');assert.equal(calls,1);
  }
});
test('missing configuration is unavailable and invalid requests still reject',async()=>{
  const read=createGoogleSummaryReader({env:{},now:()=>now,fetcher:async()=>{throw Error('must not call');}});
  const result=await read(new URLSearchParams());assert.equal(result.state,'not_connected');assert.equal(result.metrics.totalUsers,null);
  await assert.rejects(read(new URLSearchParams('days=500')));
});
test('expired matching cache can remain visibly stale, never relabeled with another period',async()=>{
  let time=now;let healthy=true;
  const read=createGoogleSummaryReader({env,now:()=>time,fetcher:async()=>{if(!healthy)throw Error('private');return Response.json(report());}});
  const first=await read(new URLSearchParams('days=28'));time=new Date(now.getTime()+16*60_000);healthy=false;
  const stale=await read(new URLSearchParams('days=28'));assert.equal(stale.state,'stale');assert.deepEqual(stale.metrics,first.metrics);assert.equal(stale.retrievedAt,first.retrievedAt);
  const other=await read(new URLSearchParams('days=7'));assert.equal(other.state,'deferred');assert.equal(other.metrics.totalUsers,null);
});
test('service account uses official read-only token exchange and ignores supplied token_uri',async()=>{
  const keys=generateKeyPairSync('rsa',{modulusLength:2048});
  const credentials={type:'service_account',client_email:'synthetic@example.test',private_key:keys.privateKey.export({type:'pkcs8',format:'pem'}),token_uri:'https://attacker.invalid/token'};
  const requests=[];
  const read=createGoogleSummaryReader({env:{...env,GOOGLE_ANALYTICS_ACCESS_TOKEN:undefined,GOOGLE_ANALYTICS_CREDENTIALS_JSON:JSON.stringify(credentials)},now:()=>now,fetcher:async(url,init)=>{
    requests.push(url);
    if(url==='https://oauth2.googleapis.com/token'){
      const assertion=new URLSearchParams(init.body).get('assertion');const [header,claims,signature]=assertion.split('.');
      assert.equal(JSON.parse(Buffer.from(claims,'base64url')).scope,'https://www.googleapis.com/auth/analytics.readonly');assert.ok(verify('RSA-SHA256',Buffer.from(`${header}.${claims}`),keys.publicKey,Buffer.from(signature,'base64url')));
      return Response.json({access_token:'private-synthetic-access',expires_in:3600});
    }
    return Response.json(report());
  }});
  const result=await read(new URLSearchParams());assert.equal(result.state,'available');assert.equal(requests.length,2);assert.ok(!JSON.stringify(result).includes('private-synthetic'));
});
