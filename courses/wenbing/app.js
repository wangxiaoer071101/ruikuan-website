(() => {
  'use strict';
  const course = window.WENBING_COURSE;
  const lessons = course.lessons;
  const $ = id => document.getElementById(id);
  const key = 'ruikuan.wenbing.companion.v1';
  const mapNames = ['全课总图 · 一张图一条线','今天为什么要学温病','温病就两件事','卫气营血 · 热进到哪一层','三焦看湿堵在哪一段','火郁 · 郁有轻重','火郁发之','透热转气 · 一路都要透','升降散','验舌 · 看来去','和四层处方思路接上','温病杂病治无二理'];
  const mapPath = n => `assets/map-${String(n).padStart(2,'0')}.png`;
  let state = {current:0,completed:[],notes:{},answers:{}};
  let persistent = true;
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (saved && typeof saved === 'object') {
      if (Number.isInteger(saved.current) && saved.current >= 0 && saved.current < 10) state.current = saved.current;
      if (Array.isArray(saved.completed)) state.completed = [...new Set(saved.completed.filter(n => Number.isInteger(n) && n >= 0 && n < 10))];
      for(let i=0;i<10;i++) {
        if (saved.notes && typeof saved.notes[i] === 'string') state.notes[i] = saved.notes[i].slice(0,10000);
        if (saved.answers && Number.isInteger(saved.answers[i]) && saved.answers[i] >= 0 && saved.answers[i] < 3) state.answers[i] = saved.answers[i];
      }
    }
    localStorage.setItem(key,JSON.stringify(state));
  } catch { persistent = false; }
  const memoryNotice = () => {
    $('storage-hint').textContent = '当前浏览器无法保存数据，笔记和进度只在本次页面中保留。关闭前请导出学习笔记。';
    $('note-status').textContent = '仅本次有效 · 请导出';
  };
  if(!persistent) memoryNotice();
  function save() {
    if(persistent) {
      try { localStorage.setItem(key,JSON.stringify(state)); return true; }
      catch { persistent=false; memoryNotice(); }
    }
    return false;
  }
  function progress() {
    $('progress-text').textContent=`已复习 ${state.completed.length} / 10 讲`;
    $('progress-fill').style.width=`${state.completed.length*10}%`;
  }
  function renderList() {
    const query=$('lesson-search').value.trim().toLowerCase();
    const list=$('lesson-list'); list.replaceChildren();
    let lastGroup='',count=0;
    lessons.forEach((lesson,i) => {
      if(query && !`${i+1} ${String(i+1).padStart(2,'0')} ${lesson.title} ${lesson.subtitle} ${lesson.tags.join(' ')} ${lesson.points.join(' ')}`.toLowerCase().includes(query)) return;
      count++;
      if(lastGroup!==lesson.group){const h=document.createElement('p');h.className='lesson-group';h.textContent=lesson.group;list.append(h);lastGroup=lesson.group;}
      const button=document.createElement('button');button.type='button';button.className='lesson-select';button.dataset.lesson=i;button.setAttribute('aria-current',String(i===state.current));
      const num=document.createElement('span');num.className='num';num.textContent=String(i+1).padStart(2,'0');
      const title=document.createElement('span');title.textContent=lesson.title;
      const done=document.createElement('span');done.className='done';done.textContent=state.completed.includes(i)?'✓':'';done.setAttribute('aria-label',state.completed.includes(i)?'已复习':'未复习');
      button.append(num,title,done);button.addEventListener('click',()=>selectLesson(i,true));list.append(button);
    });
    $('search-empty').hidden=count>0;
  }
  function renderQuiz() {
    const quiz=lessons[state.current].quiz;
    $('quiz-question').textContent=quiz.q;
    $('quiz-options').replaceChildren();
    const answer=state.answers[state.current];
    quiz.options.forEach((option,i)=>{
      const b=document.createElement('button');b.className='quiz-option';b.type='button';b.setAttribute('aria-pressed',String(answer===i));
      const letter=document.createElement('span');letter.className='option-letter';letter.textContent='ABC'[i];
      const label=document.createElement('span');label.textContent=option;b.append(letter,label);
      if(answer!==undefined && i===quiz.correct)b.classList.add('correct');
      if(answer===i && i!==quiz.correct)b.classList.add('incorrect');
      b.addEventListener('click',()=>{state.answers[state.current]=i;save();renderQuiz();$('quiz-options').children[i].focus({preventScroll:true});});
      $('quiz-options').append(b);
    });
    const feedback=$('quiz-feedback');feedback.hidden=answer===undefined;feedback.replaceChildren();
    if(answer!==undefined){const strong=document.createElement('strong');strong.textContent=answer===quiz.correct?'答对了 · 再把思路说一遍':'再想一想 · 参考本讲的主线';const p=document.createElement('p');p.textContent=quiz.explanation;feedback.append(strong,p);}
  }
  function renderLesson() {
    const i=state.current,l=lessons[i];
    $('lesson-kicker').textContent=`第 ${String(i+1).padStart(2,'0')} 讲 / ${l.group}`;
    $('lesson-title').textContent=l.title;
    $('lesson-question').textContent=l.question;
    $('lesson-points').replaceChildren(...l.points.map(p=>{const li=document.createElement('li');li.textContent=p;return li;}));
    $('lesson-image').src=mapPath(l.map);$('lesson-image').alt=mapNames[l.map]+'，点击放大';
    $('lesson-takeaway').textContent=l.takeaway;
    $('extra-map').hidden=l.extraMap===undefined;
    $('lesson-note').value=state.notes[i]||'';
    $('note-status').textContent=persistent?'本机保存':'仅本次有效 · 请导出';
    $('lesson-source').textContent=`伴读依据：${l.source}；原课图解。要点为网页归纳，自测为概念复习。`;
    const completed=state.completed.includes(i);
    $('complete-lesson').textContent=completed?'✓ 已复习 · 点击取消':'标记本讲已复习';
    $('complete-lesson').setAttribute('aria-pressed',String(completed));
    $('lesson-position').textContent=`${i+1} / 10`;
    $('prev-lesson').disabled=i===0;$('next-lesson').disabled=i===9;
    renderQuiz();progress();
  }
  function selectLesson(i,focus=false) {
    if(i<0 || i>=lessons.length)return;
    state.current=i;save();renderList();renderLesson();
    if(focus){$('lesson-title').focus({preventScroll:true});$('lesson-panel').scrollIntoView({behavior:'auto',block:'start'});}
  }
  lessons.forEach((lesson,i)=>{
    const button=document.createElement('button');button.type='button';button.className='syllabus-row';
    const n=document.createElement('span');n.className='syllabus-num';n.textContent=String(i+1).padStart(2,'0');
    const content=document.createElement('span');const title=document.createElement('span');title.className='syllabus-name';title.textContent=lesson.title;const sub=document.createElement('span');sub.className='syllabus-sub';sub.textContent=lesson.subtitle;content.append(title,sub);
    const arrow=document.createElement('span');arrow.className='syllabus-arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');button.append(n,content,arrow);
    button.setAttribute('aria-label',`第${i+1}讲 ${lesson.title}，打开伴读`);
    button.addEventListener('click',()=>{$('lesson-search').value='';selectLesson(i,true);});$('syllabus').append(button);
  });
  $('lesson-search').addEventListener('input',renderList);
  $('lesson-note').addEventListener('input',()=>{state.notes[state.current]=$('lesson-note').value;const ok=save();$('note-status').textContent=ok?'已保存到本机':'仅本次有效 · 请导出';});
  $('complete-lesson').addEventListener('click',()=>{const i=state.current;state.completed=state.completed.includes(i)?state.completed.filter(n=>n!==i):[...state.completed,i];save();renderList();renderLesson();});
  $('prev-lesson').addEventListener('click',()=>selectLesson(state.current-1,true));
  $('next-lesson').addEventListener('click',()=>selectLesson(state.current+1,true));
  $('export-notes').addEventListener('click',()=>{
    const text=['温病入门十讲 · 我的学习笔记',`导出时间：${new Date().toLocaleString()}`,`已复习 ${state.completed.length} / 10 讲`,'仅导出本浏览器保存的记录；与视频课程平台不互通。','',...lessons.flatMap((l,i)=>[`第${i+1}讲 ${l.title}`,`复习状态：${state.completed.includes(i)?'已复习':'未标记'}`,`自测：${state.answers[i]===undefined?'未作答':state.answers[i]===l.quiz.correct?'回答正确':'已作答，建议再复习'}`,state.notes[i]||'（暂无笔记）',''])].join('\n');
    const url=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='温病入门十讲-学习笔记.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
  });
  if(course.platformUrl && /^https:\/\//.test(course.platformUrl)){$('platform-link').href=course.platformUrl;$('platform-link').textContent='去课程平台学习 ↗';$('platform-link').target='_blank';$('platform-link').rel='noopener';}
  let mapIndex=0,qrMode=false;
  const dialog=$('image-dialog');
  function updateDialog() {
    const path=qrMode?'assets/wechat-qr.jpg':mapPath(mapIndex);
    $('dialog-title').textContent=qrMode?'添加阿宽微信 · 备注“温病十讲”':mapNames[mapIndex];
    $('dialog-image').src=path;$('dialog-image').alt=qrMode?'阿宽个人微信二维码':mapNames[mapIndex];
    $('dialog-image').parentElement.classList.toggle('qr-view',qrMode);
    $('open-original').href=path;
    $('previous-map').hidden=qrMode;$('next-map').hidden=qrMode;$('map-counter').hidden=qrMode;
    $('map-counter').textContent=`${mapIndex+1} / 12`;
    $('previous-map').disabled=mapIndex===0;$('next-map').disabled=mapIndex===11;
    $('dialog-image').parentElement.scrollLeft=0;
  }
  function showMap(n,qr=false){mapIndex=n;qrMode=qr;updateDialog();dialog.showModal();document.body.classList.add('modal-open');$('close-dialog').focus();}
  document.querySelectorAll('[data-map]').forEach(b=>b.addEventListener('click',()=>showMap(Number(b.dataset.map))));
  $('lesson-map').addEventListener('click',()=>showMap(lessons[state.current].map));
  $('extra-map').addEventListener('click',()=>showMap(10));
  $('open-qr').addEventListener('click',()=>showMap(0,true));
  $('previous-map').addEventListener('click',()=>{if(mapIndex>0){mapIndex--;updateDialog();}});
  $('next-map').addEventListener('click',()=>{if(mapIndex<11){mapIndex++;updateDialog();}});
  $('close-dialog').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>document.body.classList.remove('modal-open'));
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom)dialog.close();}});
  $('copy-message').addEventListener('click',async()=>{try{await navigator.clipboard.writeText('温病十讲');$('copy-status').textContent='已复制：温病十讲';}catch{$('copy-status').textContent='请手动复制备注：温病十讲';}});
  renderList();renderLesson();
})();
