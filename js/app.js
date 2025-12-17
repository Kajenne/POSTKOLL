// Main application initialization

function init(){
  const buttons = document.querySelectorAll('.day-buttons button');
  buttons.forEach(btn => {
    btn.addEventListener('click', ()=>{
      const day = btn.dataset.day;
      selectButton(day);
      renderTimes(day);
    });
    btn.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        btn.click();
      }
    });
  });

  // Välj dagens dag som standard
  const today = getTodaySwedish();
  const defaultDay = today || 'måndag';
  selectButton(defaultDay);
  renderTimes(defaultDay);

  // Initialize modals och openings
  initModals();
  initOpenings();
}

document.addEventListener('DOMContentLoaded', init);
