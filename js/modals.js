// Modal management för login och registrering

function closeModal(modal){
  if(!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
}

function openModal(modal){
  if(!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  const first = modal.querySelector('input');
  if(first) first.focus();
}

function initModals(){
  const openLoginBtn = document.getElementById('open-login');
  const openRegisterBtn = document.getElementById('open-register');
  const loginModal = document.getElementById('login-modal');
  const registerModal = document.getElementById('register-modal');
  
  const loginCloseBtn = loginModal && loginModal.querySelector('.modal-close');
  const registerCloseBtn = registerModal && registerModal.querySelector('.modal-close');
  
  const loginForm = loginModal && loginModal.querySelector('#login-form');
  const registerForm = registerModal && registerModal.querySelector('#register-form');

  // Login modal
  if(openLoginBtn && loginModal){
    openLoginBtn.addEventListener('click', ()=> openModal(loginModal));
    if(loginCloseBtn) loginCloseBtn.addEventListener('click', ()=> closeModal(loginModal));
    loginModal.addEventListener('click', (e)=>{ if(e.target === loginModal) closeModal(loginModal); });
  }

  // Register modal
  if(openRegisterBtn && registerModal){
    openRegisterBtn.addEventListener('click', ()=> openModal(registerModal));
    if(registerCloseBtn) registerCloseBtn.addEventListener('click', ()=> closeModal(registerModal));
    registerModal.addEventListener('click', (e)=>{ if(e.target === registerModal) closeModal(registerModal); });
  }

  // Close any modal on Escape
  document.addEventListener('keydown', (e)=>{ 
    if(e.key === 'Escape') {
      closeModal(loginModal);
      closeModal(registerModal);
    }
  });

  // Login form submission
  if(loginForm){
    let codeRequested = false;
    let currentEmail = '';
    
    loginForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const email = loginForm.elements['email'] ? loginForm.elements['email'].value : '';
      const codeInput = loginForm.elements['code'];
      const codeSection = document.getElementById('code-section');
      const submitBtn = document.getElementById('login-submit-btn');
      
      if(!codeRequested){
        // Step 1: Request code
        const validation = await validateEmail(email);
        
        if(!validation.success){
          alert('Inget konto hittat med den e-postadressen. Skapa ett konto först.');
          return;
        }
        
        // Generate and send code
        const code = generateLoginCode();
        saveLoginCode(email, code);
        sendLoginCode(email, code);
        
        // Show code input field
        codeSection.style.display = 'block';
        submitBtn.textContent = 'Verifiera kod';
        codeRequested = true;
        currentEmail = email;
        
        // Focus on code input
        if(codeInput) codeInput.focus();
      } else {
        // Step 2: Verify code
        const code = codeInput ? codeInput.value : '';
        
        if(verifyLoginCode(currentEmail, code)){
          const account = getUserAccount();
          setLoggedIn(true);
          alert(`Välkommen tillbaka, ${account.username}!`);
          closeModal(loginModal);
          
          // Reset form
          loginForm.reset();
          codeSection.style.display = 'none';
          submitBtn.textContent = 'Skicka kod';
          codeRequested = false;
          currentEmail = '';
        } else {
          alert('Felaktig eller utgången kod. Försök igen.');
          codeInput.value = '';
        }
      }
    });
  }

  // Register form submission
  if(registerForm){
    registerForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const email = registerForm.elements['email'] ? registerForm.elements['email'].value : '';
      const username = registerForm.elements['username'] ? registerForm.elements['username'].value : '';
      
      if(email && username){
        const result = await registerAccount(email, username);
        
        if(result.success){
          alert(`Konto skapat för ${username}!\nE-postnotifikationer kommer skickas till ${email}\n\nDu kan nu logga in med din e-post.`);
          closeModal(registerModal);
          registerForm.reset();
        } else {
          alert(`Fel: ${result.error}`);
        }
      }
    });
  }
  
  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if(logoutBtn){
    logoutBtn.addEventListener('click', ()=>{
      logout();
      alert('Du är nu utloggad.');
    });
  }
  
  // Developer login button
  const devLoginBtn = document.getElementById('dev-login');
  if(devLoginBtn){
    devLoginBtn.addEventListener('click', ()=>{
      devLogin();
    });
  }
  
  // Initialize header UI on load
  updateHeaderUI();
}
