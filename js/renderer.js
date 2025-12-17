// Render schedule times

function renderTimes(day){
  const selectedDayEl = document.getElementById('selected-day');
  const timesList = document.getElementById('times-list');
  const note = document.getElementById('note');
  selectedDayEl.textContent = day[0].toUpperCase() + day.slice(1);
  timesList.innerHTML = '';
  const times = schedule[day] || [];
  
  if(times.length === 0){
    note.textContent = 'Ingen postleverans förväntas denna dag.';
    return;
  }

  note.textContent = '';

  times.forEach(t => {
    const li = document.createElement('li');
    const card = document.createElement('div'); 
    card.className = 'time-card';
    const lbl = document.createElement('div'); 
    lbl.className = 'time-label'; 
    lbl.textContent = t;
    card.appendChild(lbl);
    card.appendChild(createMeter(t));
    li.appendChild(card);
    timesList.appendChild(li);
  });
}
