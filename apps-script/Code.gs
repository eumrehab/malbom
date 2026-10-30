/* 말봄: Google Sheets에 연결하는 Apps Script. Cloud Console/서비스 계정 키 불필요. */
const MALBOM_SHEET_ID = '1dD0Cmmw8iEVpc8fPRFTULMqxXVEUh1PYFsz1rMEoX9g';
const MALBOM_SOURCE = 'malbom-sheets-v1';
const MALBOM_USER_HEADERS = ['사용자ID','이름','설정할 비밀번호','사용가능','메모','비밀번호검증값','솔트','비밀번호상태'];
const MALBOM_RESULT_HEADERS = ['기록ID','사용자ID','이름','훈련일시','훈련단계','문항번호','제시문','인식내용','읽기일치도(%)','소요시간(초)','훈련일'];
/* CATALOG_START */
const MALBOM_CATALOG = [
  {
    "short": "자음 · 모음",
    "items": [
      "아",
      "오",
      "우",
      "이",
      "가",
      "나",
      "다",
      "마",
      "바",
      "파",
      "라",
      "타",
      "사",
      "자",
      "까",
      "꺼",
      "꼬",
      "꾸",
      "끼",
      "까까까",
      "따따따",
      "빠빠빠",
      "싸싸싸",
      "짜짜짜"
    ]
  },
  {
    "short": "단어",
    "items": [
      "나무",
      "사과",
      "바다",
      "가족",
      "물",
      "커피",
      "의자",
      "전화",
      "나비",
      "우유",
      "오리",
      "모자",
      "비누",
      "가구",
      "포도",
      "엄마",
      "바나나",
      "피자",
      "풍선",
      "오이",
      "두부",
      "미소",
      "네모",
      "보라색 모자",
      "바나나 우유",
      "다리",
      "도토리",
      "토마토",
      "토끼",
      "라면",
      "라디오",
      "리본",
      "노래",
      "세수",
      "지우개",
      "자동차",
      "까치",
      "꼬리",
      "꽃",
      "딸기",
      "떡",
      "땅콩",
      "빵",
      "빨대",
      "뿌리",
      "쌀",
      "씨앗",
      "새싹",
      "짜장면",
      "쪽지",
      "찌개"
    ]
  },
  {
    "short": "문장",
    "items": [
      "물을 마셔요.",
      "오늘 날씨가 좋아요.",
      "가족과 밥을 먹어요.",
      "창문을 열어 주세요.",
      "천천히 산책을 해요.",
      "엄마가 맛있는 밥을 먹어요.",
      "우유를 마시고 미소를 지어요.",
      "라디오에서 노래가 흘러나와요.",
      "보라색 풍선이 둥둥 떠요.",
      "바나나와 포도를 맛있게 먹어요.",
      "파란 모자를 쓰고 밖으로 나가요.",
      "노란 리본을 나란히 놓아요.",
      "새싹이 쑥쑥 자라고 있어요.",
      "차가운 참치를 천천히 먹어요.",
      "빨간 리본을 돌돌 말아 주세요.",
      "까치가 까만 꼬리를 흔들어요.",
      "똑똑한 딸이 땅콩을 먹어요.",
      "아빠가 빨간 빨대를 뽑았어요.",
      "씩씩한 쌍둥이가 쌀을 씻어요.",
      "짝꿍과 짜장면을 조금씩 먹어요.",
      "까만 까치가 높은 나뭇가지에 앉아 있다가, 땅에 떨어진 작은 과자를 발견하고 빠르게 날아왔습니다.",
      "엄마는 찌개가 너무 짜지 않도록 물을 조금 더 넣고, 뜨거운 국물이 튀지 않게 천천히 저었습니다."
    ]
  },
  {
    "short": "문단",
    "items": [
      "아침에 창문을 열었어요. 시원한 바람이 불어요. 오늘도 기분 좋게 하루를 시작해요.",
      "공원에 나무가 많아요. 새들이 노래해요. 벤치에 앉아 잠시 쉬어요.",
      "가족과 함께 시장에 갔어요. 빨간 사과를 샀어요. 집에 와서 맛있게 나누어 먹었어요."
    ]
  }
];
/* CATALOG_END */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('말봄 관리')
    .addItem('처음 연결 설정', 'setupMalbom')
    .addItem('입력한 비밀번호 적용', 'applyPasswords').addToUi();
}

function setupMalbom() {
  const book = SpreadsheetApp.openById(MALBOM_SHEET_ID);
  let users = book.getSheetByName('사용자');
  if (!users) users = book.insertSheet('사용자');
  if (users.getRange(1,3).getDisplayValue() === '비밀번호해시' && users.getLastRow()>1) {
    const old = users.getRange(2,3,users.getLastRow()-1,1).getDisplayValues();
    if (old.some(r=>r[0])) throw new Error('이전 비밀번호 해시가 있습니다. 기존 값을 보존하고 이전 작업을 먼저 완료해 주세요.');
  }
  users.getRange(1,1,1,8).setValues([MALBOM_USER_HEADERS]);
  users.getRange(1,9,1,5).setValues([['연습묶음','소리 개수','단어 개수','문장 개수','이야기 개수']]);
  users.getRange('A:C').setNumberFormat('@');
  users.setFrozenRows(1);users.showColumns(3);users.hideColumns(6,2);
  users.setColumnWidth(2,170);users.setColumnWidth(3,200);users.setColumnWidth(8,170);
  users.getRange('D2:D1001').setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build());
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('MALBOM_PEPPER')) props.setProperty('MALBOM_PEPPER',Utilities.getUuid()+Utilities.getUuid()+Utilities.getUuid());
  let results = book.getSheetByName('훈련결과');
  if (!results) results = book.insertSheet('훈련결과');
  if (!results.getLastRow()) results.getRange(1,1,1,11).setValues([MALBOM_RESULT_HEADERS]);
  assertHeaders_(results,MALBOM_RESULT_HEADERS);
  book.setSpreadsheetTimeZone('Asia/Seoul');
  applyPasswords();
  return {ok:true};
}

function onEdit(e) {
  if (!e || !e.range || e.range.getSheet().getName()!=='사용자' || e.range.getLastRow()<2) return;
  if(e.range.getColumn()>3 || e.range.getLastColumn()<2) return;
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(8000))return;
  try{applyPasswordRows_(e.range.getSheet(),Math.max(2,e.range.getRow()),Math.min(1001,e.range.getLastRow()));}
  finally{lock.releaseLock();}
}

function applyPasswords() {
  const lock=LockService.getScriptLock();lock.waitLock(10000);
  try{const sheet=SpreadsheetApp.openById(MALBOM_SHEET_ID).getSheetByName('사용자');assertHeaders_(sheet,MALBOM_USER_HEADERS);applyPasswordRows_(sheet,2,Math.min(sheet.getLastRow(),1001));}
  finally{lock.releaseLock();}
}

function applyPasswordRows_(sheet,start,end) {
  if(end<start)return;
  const rows=sheet.getRange(start,1,end-start+1,8).getValues();
  rows.forEach((r,i)=>{
    const row=start+i,name=String(r[1]||'').trim().normalize('NFC'),password=String(r[2]||'');
    if(!name){if(password){sheet.getRange(row,3).clearContent();sheet.getRange(row,8).setValue('이름 먼저 입력');}return;}
    if(!r[0])sheet.getRange(row,1).setValue(Utilities.getUuid());
    if(!password)return;
    if(password.length<4||password.length>128){sheet.getRange(row,3).clearContent();sheet.getRange(row,8).setValue('비밀번호 4~128자로 다시 입력');return;}
    const salt=Utilities.getUuid();
    sheet.getRange(row,6,1,3).setValues([[passwordVerifier_(password,salt),salt,'설정됨']]);
    sheet.getRange(row,3).clearContent();
  });
}

function doGet() {return ContentService.createTextOutput(JSON.stringify({ok:true,service:'malbom-sheets-v1',contentVersion:2})).setMimeType(ContentService.MimeType.JSON);}

function doPost(e) {
  let data={};let response;
  try {
    const raw=e&&e.parameter&&e.parameter.payload;
    if(typeof raw!=='string'||raw.length>12000)throw new Error('요청 내용을 확인해 주세요.');
    data=JSON.parse(raw);
    if(!data||typeof data!=='object'||!/^[a-f0-9-]{36}$/i.test(String(data.nonce||'')))throw new Error('잘못된 요청입니다.');
    const lock=LockService.getScriptLock();lock.waitLock(10000);
    try{response=handleRequest_(data);}finally{lock.releaseLock();}
  }catch(error){response={ok:false,message:'Google Sheets 연결 또는 요청 처리에 실패했습니다. 관리자에게 문의해 주세요.'};}
  return bridgeResponse_(Object.assign({},response,{nonce:String(data.nonce||''),source:MALBOM_SOURCE}),data.replyOrigin);
}

function handleRequest_(data) {
  const book=SpreadsheetApp.openById(MALBOM_SHEET_ID);
  if(data.action==='status'){const sheet=book.getSheetByName('사용자');assertHeaders_(sheet,MALBOM_USER_HEADERS);return {ok:true,configured:!!PropertiesService.getScriptProperties().getProperty('MALBOM_PEPPER')};}
  const users=readUsers_(book),cache=CacheService.getScriptCache();
  if(data.action==='login')return login_(data,users,cache);
  const key='session_'+String(data.authToken||'');
  if(data.action==='logout'){if(data.authToken)cache.remove(key);return {ok:true};}
  const saved=data.authToken&&cache.get(key);let session;try{session=saved&&JSON.parse(saved);}catch(_){session=null;}
  const user=session&&users.find(u=>u.id===session.id);
  if(!session||session.expires<=Date.now()||!validUser_(user,users)||session.version!==version_(user)||user.pending){if(data.authToken)cache.remove(key);return {ok:false,expired:true,message:'로그인이 만료되었어요. 다시 로그인해 주세요.'};}
  if(data.action==='session')return {ok:true,profile:{id:user.id,name:user.name,plan:user.plan}};
  const sheet=book.getSheetByName('훈련결과');assertHeaders_(sheet,MALBOM_RESULT_HEADERS);
  const rows=readResults_(sheet);
  if(data.action==='records')return {ok:true,records:rows.filter(r=>r.userId===user.id).map(recordView_)};
  if(data.action==='save')return saveResult_(sheet,rows,data.record,user);
  return {ok:false,message:'지원하지 않는 요청입니다.'};
}

function readUsers_(book) {
  const sheet=book.getSheetByName('사용자');assertHeaders_(sheet,MALBOM_USER_HEADERS);
  if(sheet.getLastRow()>1001)throw new Error('사용자 한도를 확인해 주세요.');
  if(sheet.getLastRow()<2)return [];
  return sheet.getRange(2,1,sheet.getLastRow()-1,13).getValues().map(r=>({id:String(r[0]||''),name:String(r[1]||'').trim().normalize('NFC'),pending:String(r[2]||'')!=='',enabled:r[3]===true||String(r[3]).toUpperCase()==='TRUE'||r[3]==='사용',hash:String(r[5]||''),salt:String(r[6]||''),plan:plan_(r.slice(8,13))})).filter(u=>u.id||u.name);
}

function plan_(cells){const names={'기본 연습':'basic','입술 소리':'lips','혀 소리':'tongue','쌍자음':'double',basic:'basic',lips:'lips',tongue:'tongue',double:'double'},defaults=[2,3,2,0];return {pack:names[String(cells[0]||'').trim()]||'basic',counts:defaults.map((d,i)=>{const v=cells[i+1];return v===''||v===null||v===undefined?d:Number.isInteger(Number(v))&&Number(v)>=0&&Number(v)<=8?Number(v):d;})};}

function validUser_(u,users){return !!u&&u.enabled&&!!u.id&&!!u.hash&&!!u.salt&&users.filter(v=>v.id===u.id).length===1&&users.filter(v=>v.name===u.name).length===1;}
function version_(u){return hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,u.hash+':'+u.salt,Utilities.Charset.UTF_8));}
function passwordVerifier_(password,salt){const pepper=PropertiesService.getScriptProperties().getProperty('MALBOM_PEPPER');if(!pepper)throw new Error('초기 연결 설정이 필요합니다.');return hex_(Utilities.computeHmacSha256Signature(String(salt)+':'+String(password),pepper,Utilities.Charset.UTF_8));}
function hex_(bytes){return bytes.map(b=>((b+256)%256).toString(16).padStart(2,'0')).join('');}
function equal_(a,b){if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}

function login_(data,users,cache) {
  if(typeof data.name!=='string'||typeof data.password!=='string'||!data.name.trim()||data.name.length>40||data.password.length>128)return {ok:false,message:'이름 또는 비밀번호를 확인해 주세요.'};
  const name=data.name.trim().normalize('NFC');
  const attemptKey='attempt_'+hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,name,Utilities.Charset.UTF_8));
  const attempts=Number(cache.get(attemptKey)||0);
  if(attempts>=10)return {ok:false,message:'로그인 시도가 많아요. 10분 후 다시 시도해 주세요.'};
  const matches=users.filter(u=>u.name===name),user=matches.length===1?matches[0]:null;
  const computed=passwordVerifier_(data.password,user?user.salt:'invalid-user');
  if(!validUser_(user,users)||user.pending||!equal_(computed,user.hash)){cache.put(attemptKey,String(attempts+1),600);return {ok:false,message:user&&user.pending?'관리자가 입력한 비밀번호를 적용해야 합니다. 담당자에게 문의해 주세요.':'이름 또는 비밀번호를 확인해 주세요.'};}
  cache.remove(attemptKey);
  const token=Utilities.getUuid()+Utilities.getUuid(),expires=Date.now()+4*60*60*1000;
  cache.put('session_'+token,JSON.stringify({id:user.id,version:version_(user),expires}),14400);
  return {ok:true,profile:{id:user.id,name:user.name,plan:user.plan},authToken:token,authExpiresAt:expires};
}

function readResults_(sheet){
  if(sheet.getLastRow()>10001)throw new Error('결과 저장 한도에 도달했습니다.');
  if(sheet.getLastRow()<2)return [];
  return sheet.getRange(2,1,sheet.getLastRow()-1,11).getValues().filter(r=>r[0]).map(r=>({id:String(r[0]),userId:String(r[1]),name:String(r[2]),at:r[3] instanceof Date?r[3].toISOString():new Date((Number(r[3])-25569)*86400000-32400000).toISOString(),stage:String(r[4]),target:String(r[6]),transcript:String(r[7]),score:Number(r[8]),seconds:Number(r[9]),day:String(r[10])}));
}
function recordView_(r){const type=MALBOM_CATALOG.findIndex(t=>t.short===r.stage);if(type<0||!Number.isFinite(r.score)||r.score<0||r.score>100)throw new Error('기록 형식을 확인해 주세요.');return {id:r.id,at:r.at,day:r.day,type,target:r.target,transcript:r.transcript,score:r.score,seconds:r.seconds};}
function saveResult_(sheet,rows,r,user){
  if(!r||typeof r.id!=='string'||!/^[a-f0-9-]{36}$/i.test(r.id)||!Number.isInteger(r.type)||!MALBOM_CATALOG[r.type]||!Number.isInteger(r.itemIndex)||!MALBOM_CATALOG[r.type].items[r.itemIndex]||typeof r.transcript!=='string'||!r.transcript.trim()||r.transcript.length>1000||!Number.isFinite(r.seconds)||r.seconds<0||r.seconds>1800)return {ok:false,message:'훈련 결과를 확인해 주세요.'};
  const target=MALBOM_CATALOG[r.type].items[r.itemIndex],existing=rows.find(v=>v.id===r.id);
  if(existing){if(existing.userId!==user.id||existing.target!==target||existing.transcript!==r.transcript)return {ok:false,message:'기록 번호가 중복되었습니다.'};return {ok:true,record:recordView_(existing),alreadySaved:true};}
  if(rows.length>=10000)return {ok:false,message:'저장 한도에 도달했습니다. 담당자에게 문의해 주세요.'};
  const now=new Date(),day=Utilities.formatDate(now,'Asia/Seoul','yyyy-MM-dd'),score=similarity_(target,r.transcript);
  const row=sheet.getLastRow()+1;
  sheet.getRange(row,1,1,11).setValues([[r.id,user.id,sheetText_(user.name),now,MALBOM_CATALOG[r.type].short,r.itemIndex+1,target,sheetText_(r.transcript),score,Math.round(r.seconds),day]]);
  sheet.getRange(row,4).setNumberFormat('yyyy-mm-dd hh:mm:ss');sheet.getRange(row,9).setNumberFormat('0"%"');
  SpreadsheetApp.flush();
  return {ok:true,record:{id:r.id,at:now.toISOString(),day,type:r.type,target,transcript:r.transcript,score,seconds:Math.round(r.seconds)}};
}
function sheetText_(s){return /^[\s]*[=+@-]|^[\t\r\n]/.test(s)?"'"+s:s;}
function similarity_(a,b){const norm=s=>s.normalize('NFC').replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]/g,'').toLowerCase();a=norm(a);b=norm(b);if(!a||!b)return 0;let p=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const row=[i];for(let j=1;j<=b.length;j++)row[j]=Math.min(row[j-1]+1,p[j]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=row;}return Math.max(0,Math.round(100*(1-p[b.length]/Math.max(a.length,b.length))));}
function assertHeaders_(sheet,headers){if(!sheet||headers.some((h,i)=>sheet.getRange(1,i+1).getDisplayValue()!==h))throw new Error('시트 제목과 열 구성을 확인해 주세요.');}
function bridgeResponse_(data,replyOrigin){
  const target=typeof replyOrigin==='string'&&/^https?:\/\/[^/]+$/.test(replyOrigin)?replyOrigin:'*';
  const safe=JSON.stringify(data).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  return HtmlService.createHtmlOutput('<!doctype html><meta charset="utf-8"><script>window.top.postMessage('+safe+','+JSON.stringify(target)+');</script>').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

