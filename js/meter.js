// Meter visualization med tooltip

// Convert hex color to [r,g,b]
function hexToRgb(hex){
  hex = (hex || '#0b5cff').trim().replace('#','');
  if(hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
  const n = parseInt(hex,16);
  return [(n>>16)&255, (n>>8)&255, n&255];
}

// Ensure single tooltip element exists
function ensureTooltip(){
  let tip = document.getElementById('meter-tooltip');
  if(!tip){
    tip = document.createElement('div');
    tip.id = 'meter-tooltip';
    tip.className = 'meter-tooltip';
    document.body.appendChild(tip);
  }
  return tip;
}

// Position tooltip near cursor
function positionTooltip(evt, tip){
  const pad = 10;
  let x = evt.clientX;
  let y = evt.clientY;
  tip.style.left = (x) + 'px';
  tip.style.top = (y - pad) + 'px';
}

// Attach hover handlers to show custom tooltip
function attachSegmentTooltips(meterEl){
  const tip = ensureTooltip();
  Array.from(meterEl.children).forEach(seg => {
    seg.addEventListener('mouseenter', (e)=>{
      const t = seg.dataset.time || '';
      const p = seg.dataset.prob ? seg.dataset.prob + '%' : '';
      tip.textContent = t + (p ? ' — ' + p : '');
      tip.classList.add('visible');
      positionTooltip(e, tip);
    });
    seg.addEventListener('mousemove', (e)=> positionTooltip(e, tip));
    seg.addEventListener('mouseleave', ()=>{ tip.classList.remove('visible'); });
  });
}

// Create meter visualization
function createMeter(expectedTime){
  const accentRgb = hexToRgb(getComputedStyle(document.documentElement).getPropertyValue('--accent'));
  
  const [hh,mm] = expectedTime.split(':').map(n=>parseInt(n,10));
  const expected = (hh || 0) + ((mm || 0) / 60);
  const expectedHour = Math.floor(expected);
  const sigma = 1.6;

  const meter = document.createElement('div');
  meter.className = 'meter';

  const startHour = 6;
  const endHour = 20;

  let bestIndex = 0;
  let bestVal = -Infinity;

  for(let h=startHour; h<=endHour; h++){
    const seg = document.createElement('div');
    seg.className = 'meter-segment';
    const diff = h - expectedHour;
    const intensity = Math.exp(-(diff*diff)/(2*sigma*sigma));
    if(intensity > bestVal){ bestVal = intensity; bestIndex = h - startHour; }
    const alpha = 0.12 + intensity * 0.88;
    seg.style.backgroundColor = `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, ${alpha.toFixed(3)})`;
    seg.dataset.time = `${String(h).padStart(2,'0')}:00`;
    seg.dataset.prob = String(Math.round(intensity * 100));
    seg.removeAttribute('title');
    meter.appendChild(seg);
  }

  const children = meter.children;
  if(children && children[bestIndex]){
    children[bestIndex].style.boxShadow = `0 0 0 2px rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.22)`;
  }

  const hoursRow = document.createElement('div');
  hoursRow.className = 'meter-hours';
  const leftLabel = document.createElement('span');
  leftLabel.textContent = `${startHour}:00`;
  const rightLabel = document.createElement('span');
  rightLabel.textContent = `${endHour}:00`;
  hoursRow.appendChild(leftLabel);
  hoursRow.appendChild(rightLabel);

  const wrap = document.createElement('div');
  wrap.appendChild(meter);
  wrap.appendChild(hoursRow);
  attachSegmentTooltips(meter);
  return wrap;
}
