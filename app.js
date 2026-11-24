const C=StockCore;let state=C.load(localStorage),page='home',selectedLesson=null,selectedStock=C.companies[0][0],side='buy',tradeTab='explore',stockSearch='',tradeQty='1',priceTimer=null;const answerState={};
const app=document.querySelector('#app');const money=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',minimumFractionDigits:2}).format(n/100);const gain=n=>`<span class="${n<0?'loss':'profit'}">${n>0?'+':''}${money(n)}</span>`;
function persist(){try{C.save(localStorage,state);}catch{toast(page==='trade'?'Unable to save trading records.':'Hriat rengna dah theih lo.');}}
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),3000);}
function navigate(p){page=p;selectedLesson=null;render();window.scrollTo(0,0);}
function stopPriceTimer(){if(priceTimer){clearInterval(priceTimer);priceTimer=null;}}
function startPriceTimer(){if(priceTimer)return;priceTimer=setInterval(()=>{if(page!=='trade'){stopPriceTimer();return;}C.move(state);persist();const active=document.activeElement;const hadSearch=!!(active&&active.id==='stock-search');const qv=document.querySelector('#qty');if(qv)tradeQty=qv.value;render();if(hadSearch){const el=document.querySelector('#stock-search');if(el){el.focus();try{el.setSelectionRange(stockSearch.length,stockSearch.length);}catch{}}}},10000);}
function stats(){const t=C.totals(state);return `<div class="stats"><div><small>${page==="trade"?"Virtual Balance":"Sum la awm"}</small><strong>${money(state.cash)}</strong></div><div><small>${page==="trade"?"Portfolio Value":"Share neih man"}</small><strong>${money(t.value)}</strong></div><div class="wide"><small>${page==="trade"?"Profit/Loss":"Hlawkna / Channa (a vai)"}</small><strong>${gain(t.pl)}</strong></div></div>`;}
function home(){const offlineReady=!!localStorage.getItem('stock-zirna-offline-ready');return `<section class="hero"><div class="eyebrow">STOCK ZIRNA • V1.2</div><h1>Stock zir tan ila!</h1><p>Sum tak hmang lovin stock lei leh hralh i zir thei.</p><div class="progress-head"><span>Zirna zawh tawh</span><b>${state.completed.length}/100</b></div><progress max="100" value="${state.completed.length}"></progress>${offlineReady?'<p class="note">Offline ready: works without internet.</p>':''}</section>${stats()}<div class="section-title">Zirna chhunzawm rawh</div><button class="tile" data-go="learn"><span class="tile-icon">▤</span><span><b>Stock Zirna</b><small>Zir tur 100 leh zawhna 300</small></span><b>›</b></button><button class="tile" data-go="trade"><span class="tile-icon">↗</span><span><b>Paper Trading</b><small>Sum lem hmanga zirna</small></span><b>›</b></button><section class="card"><h2>Records backup</h2><p>Export or import learning and trading records when changing device or browser.</p><div class="row"><button class="secondary" data-export>Export records</button><label class="secondary" for="import-file">Import records<input id="import-file" type="file" accept="application/json" hidden></label></div></section><p class="note">Sum tak a ni lo. Hlawkna a tiam lo.</p>`;}
function learn(){
 if(selectedLesson===null){
  let html=`<h1>Stock Zirna</h1><p class="sub">Zirna zawh tawh ${state.completed.length}/100</p><progress max="100" value="${state.completed.length}"></progress>`;
  for(let g=0;g<LESSON_GROUPS.length;g++){
    const groupLessons=LESSONS.filter(l=>l.group===g);
    if(!groupLessons.length)continue;
    html+=`<div class="section-title">${LESSON_GROUPS[g]}</div><div class="lessons">`+groupLessons.map(l=>`<button class="lesson" data-lesson="${l.id-1}"><span class="number ${state.completed.includes(l.id-1)?'done':''}">${state.completed.includes(l.id-1)?'✓':l.id}</span><span>${l.title}</span><b>›</b></button>`).join('')+`</div>`;
  }
  return html;
 }
 const l=LESSONS[selectedLesson];
 if(!answerState[selectedLesson])answerState[selectedLesson]=[null,null,null];
 const selections=answerState[selectedLesson];
 const quizProgress=(state.quiz&&state.quiz[selectedLesson])||l.quiz.map(()=>false);
 const allCorrect=quizProgress.every(Boolean);
 let html=`<button class="back" data-back>‹ Zirna te</button><div class="eyebrow">ZIRNA ${selectedLesson+1}/100 • ${LESSON_GROUPS[l.group]}</div><h1>${l.title}</h1>`;
 for(const p of l.paragraphs)html+=`<section class="card"><p>${p}</p></section>`;
 html+=`<section class="card"><h2>Thumal pawimawh (English)</h2><p>${l.term}</p><div class="example"><b>Entirna (₹)</b><p>${l.example}</p></div></section>`;
 html+=`<section class="card"><h2>Fimkhur tur / Common mistakes</h2><p>${l.care}</p></section>`;
 html+=`<section class="card"><h2>Chhinchhiahna (Summary)</h2><p>${l.summary}</p></section>`;
 html+=`<section class="card"><h2>Zawhna (3)</h2>`;
 for(let q=0;q<l.quiz.length;q++){
   const Q=l.quiz[q];
   const sel=selections[q];
   const correctDone=!!quizProgress[q];
   html+=`<div class="quiz-block"><p class="quiz-prompt"><b>Q${q+1}.</b> ${Q.prompt}</p>`;
   html+=Q.options.map((opt,i)=>`<button class="answer ${sel===i?'selected':''} ${correctDone&&i===Q.answer?'correct':''}" data-q="${q}" data-opt="${i}" ${correctDone?'disabled':''}>${opt}</button>`).join('');
   if(sel!==null){
     const isRight=sel===Q.answer;
     html+=`<p class="${isRight?'profit':'loss'}">${Q.explanations[sel]}</p>`;
   }
   html+=`</div>`;
 }
 if(allCorrect)html+=`<p class="profit">✓ I zir zo tawh.</p>`;
 html+=`</section>`;
 html+=`<div class="nav-row"><button class="secondary" data-prevlesson ${selectedLesson===0?'disabled':''}>‹ Previous Lesson</button><button class="primary" data-nextlesson ${selectedLesson===99?'disabled':''}>Next Lesson ›</button></div>`;
 return html;
}
function chart(id){const a=state.history[id],min=Math.min(...a),max=Math.max(...a),range=Math.max(1,max-min),points=a.map((v,i)=>`${8+i*304/Math.max(1,a.length-1)},${95-(v-min)*78/range}`).join(' ');const color=a.at(-1)>=a[0]?'#15805b':'#c43f4b';return `<svg viewBox="0 0 320 110" role="img" aria-label="Simulated stock price history"><path d="M8 20H312 M8 55H312 M8 95H312" stroke="#e2ebe7" fill="none" stroke-dasharray="4 5"/><polyline points="${points}" stroke="${color}" stroke-width="3" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg>`;}
function trading(){
 const t=C.totals(state);
 let html=`<h1>Paper Trading</h1><div class="warning"><span class="sim-badge">SIMULATED MARKET</span> All companies and prices are fictional. Trades use virtual money.</div>`;
 html+=`<div class="balance-card"><small>Virtual Balance</small><strong>${money(state.cash)}</strong></div>`;
 html+=`<div class="stats"><div><small>Portfolio Value</small><strong>${money(t.value)}</strong></div><div><small>Profit/Loss</small><strong>${gain(t.pl)}</strong></div></div>`;
 html+=`<div class="tabs"><button class="tab ${tradeTab==='explore'?'active':''}" data-tab="explore">Explore</button><button class="tab ${tradeTab==='holdings'?'active':''}" data-tab="holdings">Holdings</button><button class="tab ${tradeTab==='orders'?'active':''}" data-tab="orders">Orders</button></div>`;
 if(tradeTab==='explore'){
   const q=stockSearch.trim().toLowerCase();
   const filtered=C.companies.filter(([id,name])=>!q||id.toLowerCase().includes(q)||name.toLowerCase().includes(q));
   html+=`<div class="explore"><input id="stock-search" type="search" placeholder="Search companies" value="${stockSearch.replace(/"/g,'&quot;')}"><div class="company-grid">`;
   for(const [id,name] of filtered){
     const price=state.prices[id],prev=state.history[id].at(-2),change=price-prev,pct=prev?((change/prev)*100).toFixed(2):'0.00';
     html+=`<button class="company-card ${id===selectedStock?'selected':''}" data-selectstock="${id}"><span class="company-icon">${id[0]}</span><div class="company-meta"><b>${name}</b><small>${id}</small></div><div class="company-price">${money(price)}</div><div class="change ${change<0?'loss':'profit'}">${change>0?'+':''}${money(change)} (${change>0?'+':''}${pct}%)</div></button>`;
   }
   html+=`</div>`;
   const [id,name]=C.companies.find(c=>c[0]===selectedStock),h=state.holdings[id]||{qty:0,cost:0},price=state.prices[id],hist=state.history[id],change=price-hist.at(-2),pct=hist.at(-2)?(((change)/hist.at(-2))*100).toFixed(2):'0.00';
   html+=`<section class="card detail"><div class="row"><h2>${name} <small class="muted">${id}</small></h2><span class="sim-badge">SIMULATED</span></div>${chart(id)}<small class="muted">Price history (up to 14 prices)</small><div class="row price"><strong>Market Price ${money(price)}</strong><span class="change ${change<0?'loss':'profit'}">${change>0?'+':''}${money(change)} (${change>0?'+':''}${pct}%)</span></div><div class="holding"><span>Shares held: <b>${h.qty}</b></span><span>Average Buy Price: <b>${h.qty?money(h.cost/h.qty):'—'}</b></span><span>Unrealized P/L: <b>${gain(h.qty*price-h.cost)}</b></span></div><div class="segments"><button data-side="buy" class="${side==='buy'?'chosen':''}">Buy</button><button data-side="sell" class="${side==='sell'?'chosen':''}">Sell</button></div><form id="trade-form" novalidate><label for="qty">Quantity</label><input id="qty" type="number" inputmode="numeric" min="1" step="1" value="${tradeQty}" required><div class="row"><span>Order Value</span><strong id="quote">${Number.isSafeInteger(Number(tradeQty))&&Number(tradeQty)>0?money(Number(tradeQty)*price):'—'}</strong></div><button class="primary" type="submit">${side==='buy'?'Buy':'Sell'}</button></form></section>`;
 }else if(tradeTab==='holdings'){
   html+=`<section class="card"><h2>Holdings</h2>`;
   const entries=Object.entries(state.holdings);
   if(!entries.length)html+=`<p class="muted">You hold no shares.</p>`;
   for(const [id,h] of entries){
     const name=C.companies.find(c=>c[0]===id)[1],price=state.prices[id],value=h.qty*price,pl=value-h.cost,avg=h.cost/h.qty;
     html+=`<div class="record holding-row"><div><b>${name} <small class="muted">${id}</small></b><small>${h.qty} shares · Avg Buy ${money(avg)}</small></div><div><b>${money(value)}</b><small>${gain(pl)}</small></div></div>`;
   }
   html+=`</section>`;
 }else{
   html+=`<section class="card"><h2>Transaction History</h2>`;
   if(!state.transactions.length)html+=`<p class="muted">No transactions yet.</p>`;
   for(const x of state.transactions){
     const name=C.companies.find(c=>c[0]===x.id)[1];
     html+=`<div class="record"><div><b>${x.side.toUpperCase()} ${name}</b><small>${x.q} shares @ ${money(x.price)} · ${new Date(x.date).toLocaleString()}</small></div><div><b>${money(x.amount)}</b></div></div>`;
   }
   html+=`</section>`;
 }
 html+=`<div class="row actions"><button class="secondary" data-reset>Reset Virtual Account</button></div>`;
 return html;
}
function render(){const english=page==="trade";document.documentElement.lang=english?"en":"lus";document.querySelector(".brand small").textContent=english?"Learn and practice trading.":"Zir la, lei chhin rawh.";document.querySelector(".badge").textContent=english?"Virtual Money":"Sum lem";document.querySelector("nav").setAttribute("aria-label",english?"Navigation":"Phek thlan");document.querySelector("[data-page=home] span").textContent=english?"Home":"In";document.querySelector("[data-page=learn] span").textContent=english?"Lessons":"Stock Zirna";app.innerHTML=page==='home'?home():page==='learn'?learn():trading();document.querySelectorAll('nav button').forEach(b=>{b.classList.toggle('active',b.dataset.page===page);b.setAttribute('aria-current',b.dataset.page===page?'page':'false');});if(page==='trade')startPriceTimer();else stopPriceTimer();}
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.page||d.go){navigate(d.page||d.go);return;}
 if(d.lesson!==undefined){selectedLesson=Number(d.lesson);answerState[selectedLesson]=answerState[selectedLesson]||[null,null,null];render();window.scrollTo(0,0);return;}
 if(d.back!==undefined){selectedLesson=null;render();return;}
 if(d.q!==undefined){
   const q=Number(d.q),opt=Number(d.opt);
   if(!answerState[selectedLesson])answerState[selectedLesson]=[null,null,null];
   const qp=(state.quiz&&state.quiz[selectedLesson])||[];
   if(qp[q])return;
   answerState[selectedLesson][q]=opt;
   const ok=C.complete(state,selectedLesson,q,opt,LESSONS);
   if(ok)persist();
   render();
   return;
 }
 if(d.prevlesson!==undefined){if(selectedLesson>0){selectedLesson--;answerState[selectedLesson]=answerState[selectedLesson]||[null,null,null];render();window.scrollTo(0,0);}return;}
 if(d.nextlesson!==undefined){if(selectedLesson<LESSONS.length-1){selectedLesson++;answerState[selectedLesson]=answerState[selectedLesson]||[null,null,null];render();window.scrollTo(0,0);}return;}
 if(d.side){side=d.side;render();return;}
 if(d.selectstock!==undefined){selectedStock=d.selectstock;render();return;}
 if(d.tab!==undefined){tradeTab=d.tab;render();return;}
 if(d.reset!==undefined&&confirm('Reset your virtual balance to ₹10,000 and clear all holdings and transactions? Your lesson progress will be kept.')){state=C.resetTrading(state);persist();render();toast('Virtual account reset.');return;}
 if(d.export!==undefined){const blob=new Blob([JSON.stringify(state)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='stock-zirna-records.json';a.click();URL.revokeObjectURL(url);toast('Records exported.');return;}
});
app.addEventListener('change',e=>{if(e.target.id==='stock'){selectedStock=e.target.value;render();}});
app.addEventListener('input',e=>{
 if(e.target.id==='stock-search'){stockSearch=e.target.value;render();const el=document.querySelector('#stock-search');if(el){el.focus();try{el.setSelectionRange(stockSearch.length,stockSearch.length);}catch{}}}
 if(e.target.id==='qty'){tradeQty=e.target.value;const q=Number(tradeQty);const price=state.prices[selectedStock];const el=document.querySelector('#quote');if(el)el.textContent=Number.isSafeInteger(q)&&q>0?money(q*price):'—';}
 if(e.target.id==='import-file'&&e.target.files&&e.target.files[0]){
   const file=e.target.files[0];const reader=new FileReader();
   reader.onload=function(){try{const mem=new Map();mem.set('stock-zirna-v1',String(reader.result));const imported=C.load({getItem:k=>mem.get(k),setItem:(k,v)=>mem.set(k,v)});state=imported;persist();render();toast('Records imported.');}catch(err){toast('Invalid records file.');}};
   reader.readAsText(file);e.target.value='';
 }
});
app.addEventListener('submit',e=>{
 if(e.target.id!=='trade-form')return;e.preventDefault();
 const err=C.trade(state,selectedStock,Number(document.querySelector('#qty').value),side);
 if(err){toast(err);return;}
 tradeQty='1';
 persist();render();toast(side==='buy'?'Buy order completed.':'Sell order completed.');
});
if('serviceWorker' in navigator){
  window.addEventListener('load',function(){
    navigator.serviceWorker.register('./sw.js').then(function(){
      navigator.serviceWorker.ready.then(function(){
        if(!localStorage.getItem('stock-zirna-offline-ready')){
          localStorage.setItem('stock-zirna-offline-ready','1');
          toast('Offline ready. You can use STOCK ZIRNA without internet.');
        }
        render();
      });
    }).catch(function(err){console.error('Service worker registration failed',err);});
  });
}
render();