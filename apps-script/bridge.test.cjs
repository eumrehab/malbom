const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
function fixture(){
 const listeners=new Set(),sent=[],timers=new Map();let responseData={ok:true,authToken:'test-token',profile:{id:'u',name:'테스트'}},auto=true,ignored=0;
 const element=tag=>({tag,children:[],appendChild(v){this.children.push(v);},setAttribute(){},remove(){},submit(){const payload=JSON.parse(this.children[0].value);sent.push({action:this.action,method:this.method,payload});if(auto)queueMicrotask(()=>{
   const nonce=payload.nonce;
   for(const receive of [...listeners]){
    receive({origin:'https://attacker.invalid',data:{...responseData,nonce,source:'malbom-sheets-v1'}});
    receive({origin:'https://script.google.com',data:{...responseData,nonce:'wrong',source:'malbom-sheets-v1'}});
    receive({origin:'https://script.google.com',data:{...responseData,nonce,source:'wrong-source'}});
    ignored+=3;
    receive({origin:'https://script.google.com',data:{...responseData,nonce,source:'malbom-sheets-v1'}});
   }
  });}});
 const context={console,JSON,String,RegExp,Promise,crypto:crypto.webcrypto,location:{origin:'https://malbom.example'},document:{createElement:element,body:{append(){}}},window:{MALBOM_CONFIG:{appsScriptUrl:''},addEventListener:(name,fn)=>listeners.add(fn),removeEventListener:(name,fn)=>listeners.delete(fn)},setTimeout:(fn,ms)=>{const id=crypto.randomUUID();if(ms<1000)fn();else timers.set(id,fn);return id;},clearTimeout:id=>timers.delete(id)};
 vm.createContext(context);vm.runInContext(fs.readFileSync('dist/sheets-bridge.js','utf8'),context);
 return {api:context.window.MalbomSheets,context,sent,listeners,timers,setResponse:value=>responseData=value,setAuto:value=>auto=value,ignored:()=>ignored};
}
test('unconfigured endpoint stays blocked without contacting any service',async()=>{const f=fixture();assert.equal((await f.api.request('/api/status')).configured,false);await assert.rejects(f.api.request('/api/login',{body:JSON.stringify({name:'x',password:'secret'})}),/배포 주소/);assert.equal(f.sent.length,0);});
test('form POST goes only to configured Apps Script, responses need nonce/source/origin',async()=>{const f=fixture();f.context.window.MALBOM_CONFIG.appsScriptUrl='https://script.google.com/macros/s/test-endpoint/exec';const response=await f.api.request('/api/login',{method:'POST',body:JSON.stringify({name:'테스트',password:'test-password'})});assert(response.ok);assert.equal(f.sent[0].method,'POST');assert(!f.sent[0].action.includes('test-password'));assert.equal(f.sent[0].payload.password,'test-password');assert.equal(f.sent[0].payload.replyOrigin,'https://malbom.example');assert.equal(f.ignored(),3);assert.equal(f.listeners.size,0);});
test('server token used for result requests and cleared on logout',async()=>{const f=fixture();f.context.window.MALBOM_CONFIG.appsScriptUrl='https://script.google.com/macros/s/test-endpoint/exec';await f.api.request('/api/login',{body:JSON.stringify({name:'테스트',password:'test-password'})});f.setResponse({ok:true,records:[]});await f.api.request('/api/records');assert.equal(f.sent.at(-1).payload.authToken,'test-token');await f.api.request('/api/logout',{method:'POST',body:'{}'});const count=f.sent.length;assert.equal((await f.api.request('/api/session')).profile,null);assert.equal(f.sent.length,count);});
test('expired sessions are reported rather than successful saves',async()=>{const f=fixture();f.context.window.MALBOM_CONFIG.appsScriptUrl='https://script.google.com/macros/s/test-endpoint/exec';f.setResponse({ok:false,expired:true,message:'다시 로그인'});await assert.rejects(f.api.request('/api/records',{method:'POST',body:'{}'}),error=>error.expired&&/로그인/.test(error.message));assert.equal((await f.api.request('/api/session')).profile,null);});
test('timeout rejects pending request and removes response listener',async()=>{const f=fixture();f.context.window.MALBOM_CONFIG.appsScriptUrl='https://script.google.com/macros/s/test-endpoint/exec';f.setAuto(false);const pending=f.api.request('/api/login',{body:'{}'});assert.equal(f.timers.size,1);for(const fn of f.timers.values())fn();await assert.rejects(pending,/응답이 늦어/);assert.equal(f.listeners.size,0);});
