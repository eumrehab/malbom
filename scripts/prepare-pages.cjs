const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..'),output=path.join(root,'docs');
const files=['index.html','style.css','patient.css','config.js','sheets-bridge.js','content.js','app.js','practice.js','boot.js'];
fs.mkdirSync(output,{recursive:true});
for(const name of files)fs.copyFileSync(path.join(root,'dist',name),path.join(output,name));
fs.writeFileSync(path.join(output,'.nojekyll'),'');
for(const name of ['index.html','app.js','config.js'])if(!fs.statSync(path.join(output,name)).size)throw new Error('Missing deploy file: '+name);
const html=fs.readFileSync(path.join(output,'index.html'),'utf8');
for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){const target=match[1];if(!target.includes('://')&&!fs.existsSync(path.join(output,target)))throw new Error('Missing asset: '+target);}
if(fs.readFileSync(path.join(output,'config.js'),'utf8').includes('appsScriptUrl: ""'))throw new Error('Google Sheets endpoint is missing');
console.log('GitHub Pages 파일 준비 완료: docs/ (웹 파일 9개)');
