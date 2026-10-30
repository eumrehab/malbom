/* 참고 사이트와 동일한 Apps Script POST/iframe 방식. 응답 확인 후에만 저장 완료 처리. */
(() => {
  let token='';
  const endpoint=()=>String(window.MALBOM_CONFIG?.appsScriptUrl||'').trim();
  const configured=()=>/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint());
  const randomId=()=>crypto.randomUUID();
  function post(payload){
    if(!configured())return Promise.reject(new Error('관리자가 Google Sheets의 Apps Script 배포 주소를 연결해야 합니다.'));
    return new Promise((resolve,reject)=>{
      const nonce=randomId(),frame=document.createElement('iframe'),form=document.createElement('form'),input=document.createElement('input');
      let done=false;
      const finish=(error,data)=>{if(done)return;done=true;clearTimeout(timer);window.removeEventListener('message',receive);form.remove();setTimeout(()=>frame.remove(),200);error?reject(error):resolve(data);};
      const receive=event=>{
        const trusted=event.origin==='null'||event.origin==='https://script.google.com'||/^https:\/\/[^/]+-script\.googleusercontent\.com$/.test(event.origin);
        const data=event.data;
        if(!trusted||!data||data.source!=='malbom-sheets-v1'||data.nonce!==nonce)return;
        finish(null,data);
      };
      const timer=setTimeout(()=>finish(new Error('Google Sheets 응답이 늦어지고 있어요. 잠시 후 다시 시도해 주세요.')),45000);
      window.addEventListener('message',receive);
      frame.name='malbom_'+nonce;frame.hidden=true;frame.setAttribute('aria-hidden','true');
      form.method='POST';form.action=endpoint();form.target=frame.name;form.hidden=true;
      input.type='hidden';input.name='payload';input.value=JSON.stringify({...payload,nonce,replyOrigin:location.origin});
      form.appendChild(input);document.body.append(frame,form);
      try{form.submit();input.value='';}catch(e){finish(new Error('Google Sheets에 연결할 수 없습니다. 배포 주소를 확인해 주세요.'));}
    });
  }
  window.MalbomSheets={
    async request(path,options={}){
      if(path==='/api/status'){if(!configured())return {configured:false};const result=await post({action:'status'});if(!result.ok)throw new Error(result.message);return {configured:result.configured};}
      if(path==='/api/session'&&!token)return {profile:null};
      let body={};if(options.body)body=JSON.parse(options.body);
      const action=path==='/api/login'?'login':path==='/api/logout'?'logout':path==='/api/session'?'session':path==='/api/records'?(options.method==='POST'?'save':'records'):'';
      if(!action)throw new Error('지원하지 않는 요청입니다.');
      const payload={action,authToken:token};if(action==='login'){payload.name=body.name;payload.password=body.password;}if(action==='save')payload.record=body;
      const data=await post(payload);
      if(!data.ok){const e=new Error(data.message||'요청을 완료하지 못했어요.');e.expired=!!data.expired;if(e.expired)token='';throw e;}
      if(action==='login')token=data.authToken;if(action==='logout')token='';return data;
    },
    clear(){token='';}
  };
})();
