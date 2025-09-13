// app.js
const listEl=document.getElementById('list');
const taskInput=document.getElementById('taskInput');
const timeInput=document.getElementById('timeInput');
const addBtn=document.getElementById('addBtn');
const toasts=document.getElementById('toasts');
const deleteModal=document.getElementById('deleteModal');
const cancelBtn=deleteModal.querySelector('.cancel');
const deleteConfirmBtn=deleteModal.querySelector('.delete-confirm');

let routines=JSON.parse(localStorage.getItem('routines')||'[]');
let deleteIndex=null;

function save(){localStorage.setItem('routines',JSON.stringify(routines));}
function showToast(msg){const t=document.createElement('div');t.className='toast show';t.innerText=msg;toasts.appendChild(t);setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),400);},2000);}

// Notification functions
function requestNotificationPermission(){
  if(Notification.permission!=='granted') Notification.requestPermission();
}
function notifyUser(title,body){
  if(Notification.permission==='granted') new Notification(title,{body});
}
function checkNotifications(){
  const now=new Date();
  routines.forEach(t=>{
    if(t.status==='pending'){
      const [h,m]=t.time.split(':').map(Number);
      if(h===now.getHours()&&m===now.getMinutes()){
        notifyUser('Daily Sky Reminder',`Are you Finish: ${t.text}?`);
      }
    }
  });
}
setInterval(checkNotifications,60000);

function render(){
  listEl.innerHTML='';
  routines.forEach((t,idx)=>{
    const el=document.createElement('div');
    el.className='task '+(t.status||'pending');
    const doneDisabled=t.status!=='pending'?'disabled':'';
    el.innerHTML=`
      <div class="meta"><h3>${t.text}</h3><p>${t.time||'--:--'}</p></div>
      <div class="actions">
        <button class="icon-btn done" ${doneDisabled}>✅</button>
        <button class="icon-btn notdone" ${doneDisabled}>❌</button>
        <button class="icon-btn edit">✏️</button>
        <button class="icon-btn delete">🗑️</button>
      </div>`;

    const doneBtn=el.querySelector('.done');
    const notdoneBtn=el.querySelector('.notdone');
    const editBtn=el.querySelector('.edit');
    const deleteBtn=el.querySelector('.delete');

    doneBtn.addEventListener('click',()=>{
      if(doneBtn.disabled) return;
      t.status='done'; save(); render(); showToast('🎉 Done!');
    });

    notdoneBtn.addEventListener('click',()=>{
      if(notdoneBtn.disabled) return;
      t.status='notdone'; save(); render(); showToast('⚠️ Not Done');
    });

    editBtn.addEventListener('click',()=>{
      const newText=prompt('Edit routine',t.text);
      if(newText){ t.text=newText; save(); render(); showToast('✏️ Edited'); }
    });

    deleteBtn.addEventListener('click',()=>{
      deleteIndex=idx; deleteModal.style.display='flex';
    });

    listEl.appendChild(el);
  });
}

addBtn.addEventListener('click',()=>{
  const text=taskInput.value.trim();
  const time=timeInput.value;
  if(!text){showToast('Enter a routine'); return;}
  routines.push({text,time,status:'pending'});
  save(); render();
  taskInput.value=''; timeInput.value='08:00';
  showToast(`✅ Your [${text}] Created!`);
  requestNotificationPermission();
});

cancelBtn.addEventListener('click',()=>{ deleteModal.style.display='none'; deleteIndex=null; });
deleteConfirmBtn.addEventListener('click',()=>{
  if(deleteIndex!==null){
    routines.splice(deleteIndex,1); save(); render(); deleteIndex=null; deleteModal.style.display='none';
    showToast('Deleted');
  }
});

render();
