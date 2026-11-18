/* 기존 문항 번호와 Google Sheets 저장 형식을 유지하는 연결 학습 과정. */
(() => {
 const content=window.MALBOM_CONTENT;
 // code는 저장된 결과 ID에 사용된다. 기존 code와 문항 순서는 변경하거나 재사용하지 않는다.
 const definitions=[
  {code:1,pack:'basic',title:'가족과 함께하는 하루',pairs:[['가','가족','가족과 밥을 먹어요.'],['나','바나나','바나나와 포도를 맛있게 먹어요.'],['마','엄마','엄마가 맛있는 밥을 먹어요.']]},
  {code:2,pack:'basic',title:'맛보고 듣는 하루',pairs:[['바','바나나','바나나와 포도를 맛있게 먹어요.'],['라','라디오','라디오에서 노래가 흘러나와요.'],['우','우유','우유를 마시고 미소를 지어요.']]},
  {code:3,pack:'lips',title:'입술로 여는 한마디',pairs:[['마','엄마','엄마가 맛있는 밥을 먹어요.'],['바','바나나','바나나와 포도를 맛있게 먹어요.']]},
  {code:4,pack:'tongue',title:'혀끝에서 문장까지',pairs:[['나','바나나','바나나와 포도를 맛있게 먹어요.'],['라','라디오','라디오에서 노래가 흘러나와요.']]},
  {code:5,pack:'double',title:'까치와 꼬리 이야기',pairs:[['까','까치','까치가 까만 꼬리를 흔들어요.'],['꼬','꼬리','까치가 까만 꼬리를 흔들어요.']]},
  {code:6,pack:'double',title:'또박또박 쌍자음',pairs:[['싸싸싸','쌀','씩씩한 쌍둥이가 쌀을 씻어요.'],['짜짜짜','짜장면','짝꿍과 짜장면을 조금씩 먹어요.']]}
 ];
 const lessons=definitions.map(lesson=>{
  const queue=[];
  for(let type=0;type<3;type++)for(let link=0;link<lesson.pairs.length;link++){
   const target=lesson.pairs[link][type],index=content.types[type].items.indexOf(target);
   if(index<0)throw new Error('연결 학습 문항이 없습니다: '+target);
   // 두 단어가 같은 문장으로 연결되면 문장은 한 번만 연습한다.
   if(queue.some(q=>q.type===type&&q.index===index))continue;
   queue.push({type,index,slot:queue.length,lessonCode:lesson.code,link});
  }
  return {...lesson,queue};
 });
 function forPack(pack){const list=lessons.filter(l=>l.pack===pack);return list.length?list:lessons.filter(l=>l.pack==='basic');}
 function attemptId(code,slot){if(!lessons.some(l=>l.code===code)||!Number.isInteger(slot)||slot<0||slot>255)throw new Error('Invalid course attempt');return 'c04e'+code.toString(16).padStart(2,'0')+slot.toString(16).padStart(2,'0')+crypto.randomUUID().slice(8);}
 function parseId(id){const m=/^c04e([a-f0-9]{2})([a-f0-9]{2})-/i.exec(id||'');return m?{code:parseInt(m[1],16),slot:parseInt(m[2],16)}:null;}
 function savedSlots(lesson,records,day){const saved=new Set();for(const r of records){if(r.day!==day)continue;const tag=parseId(r.id),item=tag?.code===lesson.code?lesson.queue[tag.slot]:null;if(item&&r.type===item.type&&r.target===content.types[item.type].items[item.index])saved.add(item.slot);}return saved;}
 function daily(pack,records,day){
  const list=forPack(pack),days=[...new Set(records.filter(r=>r.day&&r.day<day&&parseId(r.id)).map(r=>r.day))];
  const completed=days.filter(d=>list.some(l=>savedSlots(l,records,d).size===l.queue.length));
  const lesson=list[completed.length%list.length],saved=savedSlots(lesson,records,day);
  return {lesson,saved,queue:lesson.queue.filter(q=>!saved.has(q.slot)),complete:saved.size===lesson.queue.length,number:completed.length+1};
 }
 window.MALBOM_JOURNEY={lessons,forPack,attemptId,parseId,savedSlots,daily};
})();
