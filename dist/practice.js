/* 혼자 연습하는 환자를 위한 순차 진행. 사용자별 배정은 로그인 응답에서 받습니다. */
const library=window.MALBOM_CONTENT;
let practice=null;
const defaultCounts=[2,3,2,0];
function planForUser(){const p=profile?.plan||{};return {pack:library.packs[p.pack]?p.pack:'basic',counts:defaultCounts.map((d,i)=>{const n=p.counts?.[i];return n===null||n===undefined||n===''?d:Number.isInteger(Number(n))?Math.min(8,Math.max(0,Number(n))):d;})};}
function queueForPlan(plan,onlyType){const group=library.packs[plan.pack],queue=[];for(let t=0;t<4;t++){if(onlyType!==undefined&&t!==onlyType)continue;const count=onlyType!==undefined?Math.min(5,group.items[t].length):plan.counts[t];const offset=records.filter(r=>r.day===todayKey()&&r.type===t).length;for(let i=0;i<count;i++)queue.push({type:t,index:group.items[t][(offset+i)%group.items[t].length]});}return queue;}
function currentItem(){return practice&&practice.queue[practice.cursor];}
function setupPractice(queue,mode){practice={id:crypto.randomUUID(),mode,queue,cursor:0,phase:'listen',paused:false,result:null,outcomes:[],complete:queue.length===0};scored=false;}
function openPractice(){if(location.hash==='#training')render();else location.hash='training';}
function startToday(){if(practice?.mode==='today'&&!practice.complete){practice.paused=false;openPractice();return;}const queue=queueForPlan(planForUser());if(!queue.length){toast('오늘 배정된 연습이 없어요. 담당자에게 문의해 주세요.');return;}setupPractice(queue,'today');openPractice();}
function go(t=0){setupPractice(queueForPlan(planForUser(),t),'area');openPractice();}
function home(){const p=planForUser(),total=p.counts.reduce((a,b)=>a+b,0),continuing=practice?.mode==='today'&&!practice.complete;const today=records.filter(r=>r.day===todayKey());return `<section class="intro patient-intro"><div><h1>${esc(profile.name)}님, 반가워요.</h1><p>오늘도 나의 속도로 한마디씩 연습해요.</p></div><button class="text-button" id="guide">사용 방법 보기</button></section><section class="hero patient-hero"><div class="hero-copy"><span class="patient-label">나의 오늘 연습</span><h2>${continuing?'쉬었던 곳부터<br>이어 해볼까요?':'준비되셨나요?<br>천천히 시작해요.'}</h2><p>${p.counts.map((n,i)=>n?`${['소리','단어','문장','이야기'][i]} ${n}개`:'').filter(Boolean).join(' · ')||'아직 배정된 연습이 없어요.'}</p><button class="primary patient-start" id="start" ${!total?'disabled':''}>${continuing?'이어서 연습하기':'오늘의 연습 시작'} <span>→</span></button><small>시간 제한이 없어요. 중간에 쉬어도 괜찮아요.</small></div>${art()}</section><section class="area-section" aria-labelledby="areaTitle"><h2 id="areaTitle">어떤 연습을 해볼까요?</h2><p>원하는 영역을 눌러 바로 시작해요.</p><div class="area-grid">${['자음·모음','단어 읽기','문장 읽기','문단 읽기'].map((label,i)=>`<button class="area-card" data-type="${i}"><span class="area-symbol" aria-hidden="true">${['가','나무','한 문장','이야기'][i]}</span><strong>${label}</strong><small>${['한 소리씩 따라 해요','익숙한 낱말을 읽어요','짧은 문장을 읽어요','이야기를 천천히 읽어요'][i]}</small><span aria-hidden="true">시작하기 →</span></button>`).join('')}</div></section><div class="patient-actions"><button class="patient-action" id="reviewHome"><span class="action-symbol">↻</span><div><h2>다시 연습하기</h2><p>했던 내용을 한 번 더 연습해요.</p></div><span>→</span></button><button class="patient-action" id="reportHome"><span class="action-symbol">▥</span><div><h2>나의 기록</h2><p>차곡차곡 쌓인 연습을 살펴봐요.</p></div><span>→</span></button></div><div class="patient-today"><span>✳</span><p>${today.length?`오늘 <strong>${today.length}번</strong> 연습을 저장했어요.`:'오늘의 첫 연습을 기다리고 있어요.'}</p></div>`;}
function reviewPage(){const recent=[...new Map(records.slice().reverse().map(r=>[r.type+':'+r.target,r])).values()].slice(0,6);return `<div class="intro"><div><h1>다시 연습해 볼까요?</h1><p>한 번 더 읽고 싶은 내용을 골라 주세요.</p></div></div>${recent.length?`<section class="panel"><h2>최근에 연습한 내용</h2><div class="recent-grid">${recent.map((r,i)=>`<button class="recent-item" data-recent="${i}"><small>${types[r.type].name}</small><strong>${esc(r.target)}</strong><span>다시 읽기 →</span></button>`).join('')}</div></section>`:''}<section class="panel"><h2>단계별로 연습하기</h2><div class="review-levels">${types.map((t,i)=>`<button class="secondary" data-type="${i}">${t.name} →</button>`).join('')}</div></section>`;}
function exerciseHint(){if(practice.phase==='listen')return '먼저 소리를 들어보세요.';if(practice.phase==='ready')return '준비되면 눌러서 말해 주세요.';if(practice.phase==='captured')return '인식된 내용을 확인해 주세요.';if(practice.phase==='speaking')return '다 읽었으면 말하기 마침을 눌러 주세요.';return '한 번 연습했어요. 다음으로 가도 좋아요.';}
function training(){
 if(!practice)setupPractice(queueForPlan(planForUser()),'today');
 if(practice.complete)return finishedPage();
 const item=currentItem();type=item.type;index=item.index;
 if(practice.paused)return `<section class="panel rest-screen"><span>☼</span><h1>잠깐 쉬어가요.</h1><p>준비되면 같은 곳에서 이어서 할 수 있어요.</p><button class="primary" id="resume">계속 연습하기 →</button><button class="text-button" id="homeRest">홈으로 가기</button></section>`;
 const r=practice.result;
 return `<div class="practice-heading"><span>${practice.mode==='today'?'오늘의 연습':practice.mode==='area'?'영역별 연습':'다시 연습하기'}</span><button class="secondary" id="pause">Ⅱ 잠깐 쉬기</button></div><section class="panel guided-exercise"><div class="exercise-meta"><span>${types[type].name}</span><strong>${practice.cursor+1} / ${practice.queue.length}</strong></div><div class="progress"><div style="width:${practice.cursor/practice.queue.length*100}%"></div></div><p class="step-hint" id="recordStatus" role="status" aria-live="polite">${esc(practice.speechMessage||exerciseHint())}</p><div class="target ${type===3?'paragraph':type===2?'sentence':''}">${esc(types[type].items[index])}</div>${!r?`<div class="guide-primary"><button class="${practice.phase==='listen'?'primary':'secondary'} guided-listen" id="listen">♫ ${practice.phase==='listen'?'먼저 들어보기':'한 번 더 듣기'}</button>${practice.phase!=='listen'?'<button class="primary mic" id="record">● 말하기 시작</button>':'<button class="text-button" id="skipListen">바로 말해볼게요 →</button>'}</div><div class="listen-options"><label for="voiceRate">듣기 속도</label><select id="voiceRate"><option value="0.55">더 천천히</option><option value="0.7" selected>천천히</option><option value="0.9">보통</option></select></div>`:''}${!r?`<div class="speech-preview" id="speechPreview" ${practice.capture?'':'hidden'}><span>인식된 내용</span><p id="liveTranscript">${esc(practice.capture?.text||'')}</p><small id="speechDetail">${practice.capture?'다르게 인식됐다면 다시 말해도 괜찮아요.':'말하는 동안 인식된 글자가 여기에 나타나요.'}</small>${practice.capture?'<button class="primary" id="useRecognized">이 내용으로 연습 마치기 →</button>':''}</div><p class="speech-help">제시문과 같은 글자로 인식되면 자동으로 다음 연습으로 넘어가요. 마이크가 켜진 뒤 읽어 주세요. 잘되지 않으면 Chrome에서 마이크 허용 여부를 확인해 주세요.${type===0?' 자음·모음처럼 짧은 소리는 다르게 인식될 수 있어요.':''}</p><div class="mic-check"><button class="secondary" id="testMic">마이크 소리 점검</button><p id="micTestStatus" role="status" aria-live="polite">말해도 글자가 안 나오면 먼저 마이크 입력을 확인해 보세요.</p></div>`:''}<div id="result" aria-live="polite">${r?resultMarkup(r):''}</div><div class="exercise-bottom"><button class="text-button" id="skip">이번 글 건너뛰기 →</button><span>잘되지 않아도 넘어가도 괜찮아요.</span></div><details class="manual"><summary>마이크 없이 화면만 체험하기</summary><label for="manualText">직접 입력 체험은 연습 기록에 저장되지 않아요.</label><input id="manualText" placeholder="읽은 내용을 입력해 주세요"><button class="secondary" id="manualScore">체험 결과 보기</button></details></section>`;
}
function resultMarkup(r){return `<div class="guided-result"><div class="practice-check">✓</div><h2>한 번 연습했어요.</h2><p>${r.autoAdvance&&r.status==='saved'?'제시문과 같게 인식됐어요. 잠시 후 다음 연습으로 넘어가요.':'더 연습해도 좋고, 다음으로 가도 좋아요.'}</p><p class="save-status" role="status">${r.status==='saving'?'기록을 저장하고 있어요…':r.status==='saved'?'✓ 연습 기록을 저장했어요.':r.status==='manual'?'화면 체험 · 기록에는 저장하지 않아요.':'아직 저장되지 않았어요. 아래에서 다시 저장해 주세요.'}</p>${r.status==='failed'?'<button class="secondary" id="retrySave">기록 다시 저장하기</button>':''}<div class="actions"><button class="primary" id="next" ${saving?'disabled':''}>${practice.cursor===practice.queue.length-1?'오늘의 연습 마치기':'다음으로 →'}</button><button class="secondary" id="retry" ${saving?'disabled':''}>한 번 더 연습</button></div><details class="recognition-details"><summary>인식된 내용 보기</summary><p>${esc(r.text)}</p><small>글자 일치도 ${r.score}% · 발음 정확도를 판단하는 검사는 아니에요.</small></details></div>`;}
function finishedPage(){const completed=practice.outcomes.filter(o=>o==='practiced').length;return `<section class="panel finished-screen"><span class="finish-flower">✳</span><p>오늘도 수고하셨어요.</p><h1>연습을 마쳤어요!</h1><p>${completed?`${completed}개의 글을 말해 보았어요.`:'다음에 편안하게 다시 시작해요.'}</p>${pendingRecords.size?'<div class="sync-notice">아직 저장하지 못한 결과가 있어요.<br>화면을 닫기 전에 다시 저장해 주세요.<br><button class="secondary" id="syncPendingDone">기록 다시 저장</button></div>':''}<button class="primary" id="finishHome">홈으로 가기 →</button><button class="secondary" id="finishReport">나의 기록 보기</button></section>`;}
let cancelSpeech=null,requestSpeechStop=null,stopMicTest=null,autoAdvanceTimer=null;
const originalStopRecognition=stopRecognition;
stopRecognition=function(){const was=recording;clearTimeout(autoAdvanceTimer);autoAdvanceTimer=null;if(stopMicTest){stopMicTest();stopMicTest=null;}if(cancelSpeech){cancelSpeech();cancelSpeech=null;}requestSpeechStop=null;originalStopRecognition();if(was&&practice?.phase==='speaking')practice.phase='ready';};
const originalClearAccount=clearAccount;
clearAccount=function(){practice=null;originalClearAccount();};
const originalRetryPending=retryPending;
retryPending=async function(){await originalRetryPending();if(practice?.result?.attemptId&&!pendingRecords.has(practice.result.attemptId)){practice.result.status='saved';render();}};
function bind(){const on=(id,fn)=>{const e=$('#'+id);if(e)e.onclick=fn;};on('start',startToday);on('reviewHome',()=>location.hash='review');on('reportHome',()=>location.hash='report');on('guide',()=>$('#helpDialog').showModal());on('print',()=>window.print());on('export',exportRecords);document.querySelectorAll('[data-type]').forEach(b=>b.onclick=()=>go(+b.dataset.type));document.querySelectorAll('[data-recent]').forEach(b=>b.onclick=()=>{const recent=[...new Map(records.slice().reverse().map(r=>[r.type+':'+r.target,r])).values()].slice(0,6);const r=recent[+b.dataset.recent],i=types[r.type].items.indexOf(r.target);if(i<0){toast('이 문항을 찾지 못했어요. 다른 연습을 골라 주세요.');return;}setupPractice([{type:r.type,index:i}],'review');openPractice();});on('pause',()=>{stopRecognition();practice.paused=true;render();});on('resume',()=>{practice.paused=false;render();});on('homeRest',()=>location.hash='home');on('finishHome',()=>location.hash='home');on('finishReport',()=>location.hash='report');on('syncPendingDone',retryPending);on('listen',listen);on('skipListen',()=>{practice.phase='ready';render();});on('record',record);on('testMic',testMicrophone);on('useRecognized',()=>{const text=practice.capture?.text;if(text)evaluate(text,false);});on('skip',()=>next(false));on('retry',()=>{if(saving)return;practice.phase='listen';practice.result=null;practice.capture=null;practice.speechMessage='';scored=false;render();});on('next',()=>next(true));on('retrySave',retryPending);on('manualScore',()=>evaluate($('#manualText').value,true));scheduleAutoAdvance();}
function listen(){if(recording)return;if(!('speechSynthesis'in window)){toast('소리 듣기를 사용할 수 없어요. 바로 말하기로 진행할 수 있어요.');return;}const key=practice.id+':'+practice.cursor,rate=Number($('#voiceRate')?.value||.7),utter=new SpeechSynthesisUtterance(types[type].items[index]);utter.lang='ko-KR';utter.rate=rate;window.speechSynthesis.cancel();$('#listen').disabled=true;$('#recordStatus').textContent='듣고 있어요. 편안하게 따라 읽어보세요.';if($('#record'))$('#record').disabled=true;utter.onend=()=>{if(practice&&!practice.paused&&practice.id+':'+practice.cursor===key){practice.phase='ready';render();}};utter.onerror=()=>{if(practice&&!practice.paused&&practice.id+':'+practice.cursor===key){practice.phase='ready';render();toast('소리를 재생하지 못했어요. 다시 듣거나 말하기를 시작해 주세요.');}};window.speechSynthesis.speak(utter);}
function scheduleAutoAdvance(){
 clearTimeout(autoAdvanceTimer);autoAdvanceTimer=null;
 if(route!=='training'||!profile||!practice||practice.paused||practice.complete||saving||!practice.result?.autoAdvance||practice.result.status!=='saved'||practice.result.score!==100)return;
 const session=practice,position=practice.cursor,result=practice.result;
 autoAdvanceTimer=setTimeout(()=>{autoAdvanceTimer=null;if(profile&&route==='training'&&practice===session&&!practice.paused&&practice.cursor===position&&practice.result===result&&!saving&&result.status==='saved')next(true);},1400);
}
async function testMicrophone(){
 if(saving)return;
 stopRecognition();render();
 const status=$('#micTestStatus'),button=$('#testMic');
 if(!navigator.mediaDevices?.getUserMedia){status.textContent='이 브라우저에서 마이크를 점검할 수 없어요. Chrome에서 다시 열어 주세요.';return;}
 let stream,ctx,interval,timeout,cancelled=false,detected=false;
 const cleanup=()=>{cancelled=true;clearInterval(interval);clearTimeout(timeout);if(stream)stream.getTracks().forEach(t=>t.stop());if(ctx)ctx.close().catch(()=>{});};
 stopMicTest=cleanup;button.disabled=true;status.textContent='마이크 연결 중이에요. 허용한 뒤 “안녕하세요”라고 말해 주세요.';
 try{
  stream=await navigator.mediaDevices.getUserMedia({audio:true});
  if(cancelled){stream.getTracks().forEach(t=>t.stop());return;}
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)throw new Error('unsupported');
  ctx=new AC();await ctx.resume();if(cancelled)return;
  const analyser=ctx.createAnalyser();analyser.fftSize=1024;ctx.createMediaStreamSource(stream).connect(analyser);
  const samples=new Uint8Array(analyser.fftSize);
  status.textContent='마이크가 연결됐어요. 8초 동안 편안하게 말해 주세요.';
  interval=setInterval(()=>{analyser.getByteTimeDomainData(samples);let sum=0;for(const n of samples)sum+=((n-128)/128)**2;if(Math.sqrt(sum/samples.length)>.015)detected=true;status.textContent=detected?'마이크 입력이 감지돼요. 글자가 나오지 않으면 음성인식 서비스 또는 브라우저를 확인해야 해요.':'마이크는 연결됐지만 소리가 작아요. 마이크 가까이에서 말해 주세요.';},250);
  timeout=setTimeout(()=>{cleanup();stopMicTest=null;button.disabled=false;status.textContent=detected?'마이크 입력 정상 · “말하기 시작”으로 연습해 보세요. 여전히 글자가 안 나오면 Chrome에서 다시 열어 주세요.':'마이크 소리가 감지되지 않았어요. 선택한 마이크와 기기의 입력 음량을 확인해 주세요.';},8000);
 }catch(e){if(cancelled)return;cleanup();stopMicTest=null;button.disabled=false;status.textContent=e.name==='NotAllowedError'?'마이크가 차단됐어요. 주소창 옆 사이트 설정에서 마이크를 허용해 주세요.':e.name==='NotFoundError'?'연결된 마이크가 없어요. 마이크를 연결한 뒤 다시 눌러 주세요.':'마이크 입력을 확인하지 못했어요. 다른 앱의 마이크 사용 여부와 브라우저를 확인해 주세요.';}
}
function record(){
 if(saving)return;
 if(cancelSpeech){if(recording){$('#record').disabled=true;$('#recordStatus').textContent='말씀하신 내용을 확인하고 있어요…';requestSpeechStop();}return;}
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){$('#recordStatus').textContent='이 브라우저에서는 음성인식을 사용할 수 없어요. Chrome에서 다시 열어 주세요.';return;}
 if(window.isSecureContext===false){$('#recordStatus').textContent='마이크를 사용하려면 https 주소로 접속해 주세요.';return;}
 stopRecognition();transcript='';scored=false;practice.capture=null;practice.speechMessage='';
 const key=practice.id+':'+practice.cursor,rec=new SR();recognition=rec;
 rec.lang='ko-KR';rec.continuous=currentItem().type>=2;rec.interimResults=true;rec.maxAlternatives=1;
 let ended=false,error='',finalText='',startTimer,endTimer,resultTimer,matched=false;
 const active=()=>!ended&&practice&&!practice.paused&&practice.id+':'+practice.cursor===key&&route==='training';
 const release=()=>{clearTimeout(startTimer);clearTimeout(endTimer);clearTimeout(resultTimer);rec.onstart=rec.onresult=rec.onerror=rec.onend=rec.onaudiostart=rec.onspeechstart=null;};
 const finish=()=>{
  if(!active())return;
  ended=true;release();cancelSpeech=null;requestSpeechStop=null;recording=false;recognition=null;
  practice.phase=transcript.trim()?'captured':'ready';
  practice.capture=transcript.trim()?{text:transcript.trim(),seconds:Math.min(1800,Math.max(1,Math.round((Date.now()-started)/1000)))}:null;
  practice.speechMessage=error||(practice.capture?'인식된 내용을 확인하고 연습을 마쳐 주세요.':'목소리를 듣지 못했어요. 마이크를 확인한 뒤 다시 말해 주세요.');
  if(matched&&!error){evaluate(transcript,false,true);return;}
  render();
 };
 cancelSpeech=()=>{ended=true;release();};
 $('#record').disabled=true;$('#recordStatus').textContent='마이크를 연결하고 있어요. 허용 안내가 나오면 허용해 주세요.';
 startTimer=setTimeout(()=>{if(!active())return;error='마이크 연결이 지연되고 있어요. 마이크 권한과 인터넷을 확인한 뒤 Chrome에서 다시 시도해 주세요.';try{rec.abort();}finally{finish();}},15000);
 rec.onstart=()=>{if(!active())return;clearTimeout(startTimer);recording=true;practice.phase='speaking';started=Date.now();$('#record').disabled=false;$('#record').textContent='■ 말하기 마침';$('#record').classList.add('recording');$('#listen').disabled=true;$('#recordStatus').textContent='마이크가 켜졌어요. 천천히 읽고 말하기 마침을 눌러 주세요.';$('#speechPreview').hidden=false;$('#liveTranscript').textContent='목소리를 기다리고 있어요…';resultTimer=setTimeout(()=>{if(active()&&!transcript.trim())$('#recordStatus').textContent='아직 글자가 인식되지 않았어요. 아래의 마이크 소리 점검으로 입력 상태를 확인해 주세요.';},15000);};
 rec.onaudiostart=()=>{if(active())$('#recordStatus').textContent='마이크 입력을 받고 있어요. 제시문을 읽어 주세요.';};
 rec.onspeechstart=()=>{if(active())$('#recordStatus').textContent='목소리가 들려요. 편안하게 계속 읽어 주세요.';};
 rec.onresult=e=>{
  if(!active())return;
  clearTimeout(resultTimer);finalText='';let interim='';
  for(let i=0;i<e.results.length;i++){const text=e.results[i][0].transcript;if(e.results[i].isFinal)finalText+=text;else interim+=text;}
  transcript=finalText+interim;
  $('#liveTranscript').textContent=transcript||'목소리를 기다리고 있어요…';
  $('#speechDetail').textContent=interim?'인식 중이에요. 글자가 바뀔 수 있어요.':'여기까지 인식했어요. 계속 읽어도 좋아요.';
  // Only final, complete text may trigger automatic completion.
  const target=types[currentItem().type].items[currentItem().index];
  if(!interim.trim()&&normalize(finalText)&&normalize(finalText)===normalize(target)){matched=true;finish();try{rec.abort();}catch{}}
 };
 rec.onerror=e=>{
  if(!active())return;
  const messages={'not-allowed':'마이크가 허용되지 않았어요. 주소창 옆 사이트 설정에서 마이크를 허용해 주세요.','service-not-allowed':'이 브라우저에서 음성인식 서비스가 차단됐어요. Chrome에서 다시 열어 주세요.','audio-capture':'마이크를 찾지 못했어요. 연결 상태와 다른 앱의 마이크 사용 여부를 확인해 주세요.','no-speech':'목소리를 듣지 못했어요. 마이크가 켜진 뒤 천천히 읽어 주세요.','network':'음성인식 서비스에 연결되지 않았어요. 인터넷을 확인하거나 Chrome에서 다시 열어 주세요.','aborted':'말하기가 중단됐어요. 준비되면 다시 시작해 주세요.','language-not-supported':'이 브라우저에서 한국어 음성인식을 지원하지 않아요. Chrome에서 다시 열어 주세요.'};
  error=messages[e.error]||'말하기가 중단됐어요. 다시 말해 주세요.';
  // Preserve recognized text even if the service ends with an error.
  finish();try{rec.abort();}catch{}
 };
 rec.onend=finish;
 // A stop request may never receive onend from a failed service.
 requestSpeechStop=()=>{endTimer=setTimeout(()=>{if(active()){error='인식된 내용까지만 가져왔어요. 내용을 확인해 주세요.';finish();try{rec.abort();}catch{}}},4000);try{rec.stop();}catch{finish();}};
 try{rec.start();}catch{error='마이크를 시작하지 못했어요. 마이크 권한을 확인하고 다시 눌러 주세요.';finish();}
}
async function evaluate(text,manual,autoAdvance=false){
 if(!text.trim()){toast('읽은 내용을 먼저 입력해 주세요.');return;}
 if(!profile||!practice||practice.complete)return;
 if(!manual&&(scored||saving))return;
 const item=currentItem(),session=practice,position=practice.cursor,score=similarity(types[item.type].items[item.index],text);
 const result={text,score,autoAdvance:!manual&&autoAdvance,status:manual?'manual':'saving'};practice.result=result;practice.phase='result';
 let attempt;if(!manual){scored=true;saving=true;practice.outcomes[position]='practiced';attempt={id:crypto.randomUUID(),type:item.type,itemIndex:item.index,transcript:text,seconds:practice.capture?.seconds||Math.min(1800,Math.max(1,Math.round((Date.now()-started)/1000))),userId:profile.id};pendingRecords.set(attempt.id,attempt);result.attemptId=attempt.id;}
 render();if(!attempt)return;
 try{const saved=await saveAttempt(attempt);if(saved){result.score=saved.score;result.status='saved';}}catch(e){result.status='failed';toast(e.message);}finally{saving=false;if(practice===session&&practice.cursor===position)render();}
}
function next(practiced=false){if(saving)return;if(!practice||practice.complete)return;stopRecognition();if(!practice.outcomes[practice.cursor])practice.outcomes[practice.cursor]=practice.result?.status==='manual'?'demo':practiced?'practiced':'skipped';practice.cursor++;practice.result=null;practice.phase='listen';practice.capture=null;practice.speechMessage='';scored=false;practice.complete=practice.cursor>=practice.queue.length;render();}
const originalReport=report;
report=function(){const days=new Set(records.map(r=>r.day)),today=records.filter(r=>r.day===todayKey());return `<div class="patient-report"><h1>나의 연습 기록</h1><p>한 번씩 연습한 내용이 모이고 있어요.</p><div class="progress-numbers"><div><strong>${today.length}</strong><span>오늘 저장한 연습</span></div><div><strong>${days.size}</strong><span>함께 연습한 날</span></div><div><strong>${records.length}</strong><span>전체 저장한 연습</span></div></div>${!records.length?'<section class="panel empty"><h2>첫 번째 연습을 기다리고 있어요.</h2><p>편안하게 오늘의 연습을 시작해 보세요.</p><button class="primary" id="start">오늘의 연습 시작 →</button></section>':''}<details class="full-report"><summary>자세한 기록과 읽기 일치도 보기</summary>${originalReport()}</details></div>`;};
