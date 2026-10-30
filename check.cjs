const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map(),requests=[];let failSave=false;
const el=key=>{if(!elements.has(key))elements.set(key,{innerHTML:'',textContent:'',style:{},isConnected:false,classList:{toggle(){},add(){},remove(){}},setAttribute(){},value:'',showModal(){},close(){}});return elements.get(key);};
const context={console,Date,Set,Map,Math,JSON,String,Array,Blob,URL,crypto:require('node:crypto').webcrypto,setTimeout,clearTimeout,document:{body:el('body'),querySelector:el,querySelectorAll:()=>[],createElement:()=>({click(){}})},location:{hash:'#report',protocol:'http:'},window:{addEventListener(){},speechSynthesis:{cancel(){}}},confirm:()=>false,fetch:async(path,init={})=>{requests.push({path,init});if(path==='/api/status')return Response.json({configured:true});if(path==='/api/session')return Response.json({profile:null});if(path==='/api/records'&&!init.method)return Response.json({records:[]});if(path==='/api/records'&&init.method==='POST'){if(failSave)return Response.json({error:'offline'},{status:503});const a=JSON.parse(init.body);return Response.json({record:{id:a.id,at:'2026-10-30T00:00:00Z',day:'2026-10-30',type:a.type,target:'나무',transcript:a.transcript,score:100,seconds:a.seconds}},{status:201});}return Response.json({error:'unexpected'},{status:404});}};
context.window.MalbomSheets={request:async(path,options={})=>{const response=await context.fetch(path,options);const data=await response.json();if(!response.ok)throw new Error(data.error);return data;},clear(){}};
vm.createContext(context);
(async()=>{
  vm.runInContext(fs.readFileSync('dist/content.js','utf8'),context);vm.runInContext(fs.readFileSync('dist/app.js','utf8'),context);vm.runInContext(fs.readFileSync('dist/practice.js','utf8'),context);await vm.runInContext('checkSession()',context);
  assert.match(el('#content').innerHTML,/type="password"/);assert(!el('#content').innerHTML.includes('나의 훈련 기록'));
  const catalog=JSON.parse(fs.readFileSync('apps-script/catalog.json','utf8'));assert.equal(vm.runInContext('JSON.stringify(types.map(({short,items})=>({short,items})))',context),JSON.stringify(catalog));
  await vm.runInContext(`(async()=>{
  profile={id:'u',name:'테스트'};render();
  if(!home().includes('오늘의 연습 시작')||!home().includes('다시 연습하기'))throw Error('patient home');
  const plan=planForUser(),queue=queueForPlan(plan);if(queue.length!==7||queue.map(q=>q.type).join(',')!=='0,0,1,1,1,2,2')throw Error('default sequence');
  if(!report().includes('첫 번째 연습'))throw Error('empty report');
  for(let i=0;i<4;i++){setupPractice([{type:i,index:0}],'review');if(!training().includes(types[i].items[0]))throw Error('training content');}
  setupPractice([{type:1,index:0}],'review');type=1;index=0;started=Date.now();await evaluate('나무',true);
  if(records.length!==0||pendingRecords.size!==0)throw Error('manual saved');
  await Promise.all([evaluate('나무',false),evaluate('나무',false)]);
  if(records.length!==1||records[0].score!==100)throw Error('saved score');
  if(!report().includes('100%'))throw Error('report');
  if(esc('<img>')!=='&lt;img&gt;')throw Error('escaping');
  })()`,context);
  assert.equal(requests.filter(r=>r.init.method==='POST'&&r.path==='/api/records').length,1);
  failSave=true;await vm.runInContext("(async()=>{scored=false;await evaluate('나무',false);if(pendingRecords.size!==1||records.length!==1)throw Error('failed save not retained');})()",context);
  const failedId=JSON.parse(requests.at(-1).init.body).id;failSave=false;
  await vm.runInContext("(async()=>{await retryPending();if(pendingRecords.size!==0||records.length!==2)throw Error('retry failed');})()",context);assert.equal(JSON.parse(requests.at(-1).init.body).id,failedId);
  vm.runInContext("clearAccount();render();if(profile!==null||records.length!==0||pendingRecords.size!==0)throw Error('logout data retained');",context);
  assert.match(el('#content').innerHTML,/id="loginForm"/);
  vm.runInContext("profile={id:'u',name:'테스트',plan:{pack:'lips',counts:[0,2,1,0]}};const assigned=queueForPlan(planForUser());if(assigned.length!==3||assigned[0].type!==1)throw Error('assigned plan');setupPractice([{type:0,index:0},{type:1,index:0}],'today');next(false);if(practice.cursor!==1||practice.outcomes[0]!=='skipped')throw Error('skip');practice.paused=true;if(!training().includes('계속 연습하기'))throw Error('pause');practice.paused=false;next(false);if(!practice.complete||!training().includes('연습을 마쳤어요'))throw Error('finish');",context);
  console.log('PASS: login gate, four stages, shared catalog, manual exclusion, save deduplication, failure retry with same ID, own report and memory clearing');
})().catch(e=>{console.error(e);process.exitCode=1;});
