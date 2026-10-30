import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const files={'/':['index.html','text/html'],'/index.html':['index.html','text/html'],'/style.css':['style.css','text/css'],'/patient.css':['patient.css','text/css'],'/content.js':['content.js','text/javascript'],'/practice.js':['practice.js','text/javascript'],'/boot.js':['boot.js','text/javascript'],'/app.js':['app.js','text/javascript'],'/config.js':['config.js','text/javascript'],'/sheets-bridge.js':['sheets-bridge.js','text/javascript']};
// 로컬 화면 검토 시에만 사용한다. dist에는 예시 로그인이나 계정 우회 코드가 없다.
if(process.env.MALBOM_QA==='1'){files['/__qa']=['../tmp/patient-demo.html','text/html'];files['/__qa-session.js']=['../tmp/qa-session.js','text/javascript'];}
const server=createServer(async(req,res)=>{
 try{
  const path=new URL(req.url,'http://localhost:4173').pathname;
  if(!['GET','HEAD'].includes(req.method)||!files[path]){res.writeHead(404);res.end('Not found');return;}
  const [name,type]=files[path],bytes=await readFile(new URL('../dist/'+name,import.meta.url));
  res.writeHead(200,{'Content-Type':type+'; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; frame-src https://script.google.com https://*.googleusercontent.com; form-action https://script.google.com; base-uri 'self'; frame-ancestors 'none'"});
  res.end(req.method==='HEAD'?undefined:bytes);
 }catch{res.writeHead(500);res.end('Preview error');}
});
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?'다른 프로그램이 4173 포트를 사용 중입니다.':e.code);process.exitCode=1;});
server.listen(4173,'127.0.0.1',()=>console.log('말봄 화면: http://localhost:4173\n로그인과 결과 저장은 Google Sheets의 Apps Script에 직접 연결합니다.'));
