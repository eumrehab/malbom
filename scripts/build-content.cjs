const fs=require('node:fs');
// 기존 문항 순서는 보존한다. 저장된 itemIndex를 바꾸지 않고 PDF 문항을 뒤에 추가한다.
const base=JSON.parse(fs.readFileSync('apps-script/catalog.json','utf8'));
const metadata=[{name:'소리 따라하기',short:'자음 · 모음',icon:'가',desc:'먼저 듣고 한 소리씩 따라 해요.',level:'소리'},{name:'단어 읽기',short:'단어',icon:'나무',desc:'익숙한 단어를 천천히 읽어요.',level:'단어'},{name:'문장 읽기',short:'문장',icon:'말',desc:'한 문장씩 편안하게 읽어요.',level:'문장'},{name:'이야기 읽기',short:'문단',icon:'☷',desc:'짧은 이야기를 이어서 읽어요.',level:'이야기'}];
const types=base.map((t,i)=>({...metadata[i],items:[...t.items]}));
const sources={};
function add(type,text,page,note){let index=types[type].items.indexOf(text);if(index<0){index=types[type].items.length;types[type].items.push(text);}sources[`${type}:${index}`]={file:'혀운동 및 조음 연습 단어.pdf',page,note:note||'원문'};return index;}
const sets={
 basic:{label:'기본 연습',sounds:['아','오','우','이','가','나','다','마'],words:['나무','나비','사과','바다','우유','오리','모자','비누','가구','포도'],sentences:['엄마가 맛있는 밥을 먹어요.','우유를 마시고 미소를 지어요.','라디오에서 노래가 흘러나와요.','보라색 풍선이 둥둥 떠요.'],pages:[4,1,5]},
 lips:{label:'입술 소리',sounds:['마','바','파','오','우','이'],words:['엄마','모자','바나나','비누','포도','피자','풍선','우유','오이','두부','미소','네모','보라색 모자','바나나 우유'],sentences:['엄마가 맛있는 밥을 먹어요.','보라색 풍선이 둥둥 떠요.','바나나와 포도를 맛있게 먹어요.','파란 모자를 쓰고 밖으로 나가요.','우유를 마시고 미소를 지어요.'],pages:[4,4,5]},
 tongue:{label:'혀 소리',sounds:['나','다','라','타','사','자'],words:['나비','나무','다리','도토리','토마토','토끼','라면','라디오','리본','노래','사과','세수','지우개','자동차'],sentences:['노란 리본을 나란히 놓아요.','라디오에서 노래가 흘러나와요.','새싹이 쑥쑥 자라고 있어요.','차가운 참치를 천천히 먹어요.','빨간 리본을 돌돌 말아 주세요.'],pages:[2,2,3]},
 double:{label:'쌍자음',sounds:['까','꺼','꼬','꾸','끼','까까까','따따따','빠빠빠','싸싸싸','짜짜짜'],words:['까치','꼬리','꽃','딸기','떡','땅콩','빵','빨대','뿌리','쌀','씨앗','새싹','짜장면','쪽지','찌개'],sentences:['까치가 까만 꼬리를 흔들어요.','똑똑한 딸이 땅콩을 먹어요.','아빠가 빨간 빨대를 뽑았어요.','씩씩한 쌍둥이가 쌀을 씻어요.','짝꿍과 짜장면을 조금씩 먹어요.'],pages:[7,6,8]}
};
const packs={};for(const [key,s]of Object.entries(sets))packs[key]={label:s.label,items:[s.sounds.map(t=>add(0,t,s.pages[0],t.length===1?'원문 목표 소리를 음절로 구성':'원문 반복 음절')),s.words.map(t=>add(1,t,t==='새싹'?2:s.pages[1])),s.sentences.map(t=>add(2,t,t==='라디오에서 노래가 흘러나와요.'?3:s.pages[2])),[0,1,2]]};
// 원문의 9~10쪽은 독립된 긴 문장이다. 이야기 단계로 재분류하지 않는다.
add(2,'까만 까치가 높은 나뭇가지에 앉아 있다가, 땅에 떨어진 작은 과자를 발견하고 빠르게 날아왔습니다.',9);
add(2,'엄마는 찌개가 너무 짜지 않도록 물을 조금 더 넣고, 뜨거운 국물이 튀지 않게 천천히 저었습니다.',10);
for(let i=0;i<3;i++)sources[`3:${i}`]={note:'초안에서 별도로 작성한 이야기 · PDF 원문 아님'};
fs.writeFileSync('dist/content.js','/* PDF 문항과 별도 작성 이야기. 기존 문항 번호는 유지합니다. */\nwindow.MALBOM_CONTENT = '+JSON.stringify({types,packs,sources},null,2)+';\n');
const catalog=types.map(({short,items})=>({short,items}));fs.writeFileSync('apps-script/catalog.json',JSON.stringify(catalog,null,2));
let gs=fs.readFileSync('apps-script/Code.gs','utf8');gs=gs.replace(/\/\* CATALOG_START \*\/[\s\S]*?\/\* CATALOG_END \*\//,'/* CATALOG_START */\nconst MALBOM_CATALOG = '+JSON.stringify(catalog,null,2)+';\n/* CATALOG_END */');fs.writeFileSync('apps-script/Code.gs',gs);
console.log('Content built:',types.map(t=>t.items.length).join('/'),'items; 4 assigned packs');
