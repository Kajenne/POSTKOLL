// Mailbox openings log management

const OPENINGS_KEY = 'mailbox_openings';

function loadOpenings(){
  try{ 
    const raw = localStorage.getItem(OPENINGS_KEY); 
    return raw ? JSON.parse(raw) : []; 
  } catch(e){ 
    return []; 
  }
}

function saveOpenings(items){ 
  try{ 
    localStorage.setItem(OPENINGS_KEY, JSON.stringify(items)); 
  } catch(e){} 
}

function formatTs(ts){ 
  const d = new Date(ts); 
  const today = new Date(); 
  const yesterday = new Date(today); 
  yesterday.setDate(yesterday.getDate() - 1);
  const hh = String(d.getHours()).padStart(2,'0'); 
  const mm = String(d.getMinutes()).padStart(2,'0');
  
  if(d.toDateString() === today.toDateString()) return `Idag ${hh}:${mm}`;
  if(d.toDateString() === yesterday.toDateString()) return `Igår ${hh}:${mm}`;
  
  const y = d.getFullYear(); 
  const m = String(d.getMonth()+1).padStart(2,'0'); 
  const day = String(d.getDate()).padStart(2,'0'); 
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

function renderOpenings(){
  const list = document.getElementById('openings-list'); 
  if(!list) return;
  
  list.innerHTML = '';
  const items = loadOpenings();
  
  if(items.length === 0){
    const p = document.createElement('li'); 
    p.textContent = 'Inga öppningar registrerade.'; 
    list.appendChild(p); 
    return;
  }
  
  items.slice().reverse().forEach((it, idx)=>{
    const li2 = document.createElement('li'); 
    li2.className = 'opening-item';
    const left = document.createElement('div'); 
    left.className = 'opening-left';
    const time = document.createElement('div'); 
    time.className = 'opening-time'; 
    time.textContent = formatTs(it.opened);
    const meta = document.createElement('div'); 
    meta.className = 'opening-meta'; 
    
    if(it.closed){
      const duration = it.closed - it.opened;
      const secs = Math.floor(duration / 1000);
      const mins = Math.floor(secs / 60);
      const hours = Math.floor(mins / 60);
      const remainMins = mins % 60;
      let durationText = '';
      if(hours > 0) durationText = hours + ' timme' + (hours > 1 ? 'r' : '');
      if(remainMins > 0) durationText += (durationText ? ' ' : '') + remainMins + ' minut' + (remainMins > 1 ? 'er' : '');
      if(!durationText) durationText = 'Mindre än 1 minut';
      meta.textContent = 'Öppen i ' + durationText;
    } else {
      meta.textContent = 'Fortfarande öppen';
    }
    
    left.appendChild(time); 
    left.appendChild(meta);
    const right = document.createElement('div');
    const del = document.createElement('button'); 
    del.className = 'secondary-btn'; 
    del.textContent = 'Ta bort';
    del.addEventListener('click', ()=>{
      const all = loadOpenings(); 
      all.splice(all.length - 1 - idx, 1); 
      saveOpenings(all); 
      renderOpenings();
    });
    right.appendChild(del);
    li2.appendChild(left); 
    li2.appendChild(right);
    list.appendChild(li2);
  });
}

function toggleOpening(){
  try {
    const items = loadOpenings();
    const lastItem = items.length > 0 ? items[items.length - 1] : null;
    const logBtn = document.getElementById('log-open');
    
    if(lastItem && !lastItem.closed){
      // Stäng den öppna brevlådan
      lastItem.closed = Date.now();
      saveOpenings(items);
      if(logBtn) logBtn.textContent = 'Öppna brevlådan';
      
      // Skicka e-post när brevlådan stängs
      const openedTime = formatTs(lastItem.opened);
      const closedTime = formatTs(lastItem.closed);
      const duration = lastItem.closed - lastItem.opened;
      const mins = Math.floor(duration / 60000);
      if(typeof sendEmailNotification === 'function'){
        sendEmailNotification(
          'Brevlådan stängd - Postkoll',
          `Brevlådan öppnades: ${openedTime}\nBrevlådan stängdes: ${closedTime}\nÖppen i: ${mins} minuter`
        );
      }
    } else {
      // Öppna en ny brevlåda
      items.push({opened: Date.now(), closed: null});
      saveOpenings(items);
      if(logBtn) logBtn.textContent = 'Stäng brevlådan';
      
      // Skicka e-post när brevlådan öppnas
      const openedTime = formatTs(Date.now());
      if(typeof sendEmailNotification === 'function'){
        sendEmailNotification(
          'Brevlådan öppnad - Postkoll',
          `Brevlådan öppnades: ${openedTime}`
        );
      }
    }
    renderOpenings();
  } catch(err){
    console.error('Fel när brevlådan skulle öppnas/stängas:', err);
    alert('Något gick fel. Kolla webläsarens Console (F12).');
  }
}

function clearOpenings(){ 
  saveOpenings([]); 
  const logBtn = document.getElementById('log-open'); 
  if(logBtn) logBtn.textContent = 'Öppna brevlådan'; 
  renderOpenings(); 
}

function initOpenings(){
  const logBtn = document.getElementById('log-open');
  if(logBtn){
    // Set initial button text based on current state
    const items = loadOpenings();
    const lastItem = items.length > 0 ? items[items.length - 1] : null;
    if(lastItem && !lastItem.closed) logBtn.textContent = 'Stäng brevlådan';
    logBtn.addEventListener('click', ()=> toggleOpening());
  }
  
  const clearBtn = document.getElementById('clear-openings'); 
  if(clearBtn) clearBtn.addEventListener('click', ()=> clearOpenings());
  
  renderOpenings();
}
