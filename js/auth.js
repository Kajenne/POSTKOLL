// User account management med passwordless login

const USER_ACCOUNT_KEY = 'postkoll_account';
const LOGIN_CODES_KEY = 'postkoll_login_codes';
const LOGGED_IN_KEY = 'postkoll_logged_in';

function getUserAccount(){
  try{ 
    const raw = localStorage.getItem(USER_ACCOUNT_KEY); 
    return raw ? JSON.parse(raw) : null; 
  } catch(e){ 
    return null; 
  }
}

function saveUserAccount(account){ 
  try{ 
    localStorage.setItem(USER_ACCOUNT_KEY, JSON.stringify(account)); 
  } catch(e){} 
}

// Registrera nytt konto (fungerar offline med localStorage)
async function registerAccount(email, username) {
  try {
    // Kontrollera om kontot redan finns
    const accounts = JSON.parse(localStorage.getItem('postkoll_accounts') || '[]');
    if (accounts.some(acc => acc.email === email)) {
      return { success: false, error: 'E-postadressen är redan registrerad' };
    }

    // Skapa nytt konto
    const newAccount = {
      id: 'local-' + Date.now(),
      email: email,
      username: username,
      isDev: false,
      createdAt: new Date().toISOString()
    };

    // Spara i localStorage
    accounts.push(newAccount);
    localStorage.setItem('postkoll_accounts', JSON.stringify(accounts));
    saveUserAccount(newAccount);

    console.log('✅ Konto registrerat (demo-läge):', email);
    return { success: true, account: newAccount };
  } catch (error) {
    console.error('Registreringsfel:', error);
    return { success: false, error: 'Kunde inte registrera konto.' };
  }
}

// Validera e-postadress (fungerar offline med localStorage)
async function validateEmail(email) {
  try {
    // Söka i registrerade konton
    const accounts = JSON.parse(localStorage.getItem('postkoll_accounts') || '[]');
    const account = accounts.find(acc => acc.email === email);
    
    if (account) {
      saveUserAccount(account);
      return { success: true, account };
    }

    // Om inte registrerad, tillåt login ändå i demo (skapa tillfälligt konto)
    const tempAccount = {
      id: 'temp-' + Date.now(),
      email: email,
      username: email.split('@')[0],
      isDev: false,
      createdAt: new Date().toISOString()
    };
    saveUserAccount(tempAccount);
    console.log('✅ Tillfälligt konto skapat för:', email);
    return { success: true, account: tempAccount, temporary: true };
  } catch (error) {
    console.error('Valideringsfel:', error);
    return { success: false, error: 'Kunde inte validera e-post' };
  }
}


function isLoggedIn(){
  try{
    return localStorage.getItem(LOGGED_IN_KEY) === 'true';
  } catch(e){
    return false;
  }
}

function setLoggedIn(status){
  try{
    localStorage.setItem(LOGGED_IN_KEY, status ? 'true' : 'false');
    updateHeaderUI();
  } catch(e){}
}

function logout(){
  setLoggedIn(false);
}

// Developer quick login
async function devLogin() {
  const devAccount = {
    id: 'dev-' + Date.now(),
    email: 'developer@localhost',
    username: '👨‍💻 Developer',
    isDev: true,
    createdAt: new Date().toISOString()
  };
  
  saveUserAccount(devAccount);
  setLoggedIn(true);
  alert('✅ Inloggad som Developer\n\nAllt du gör sparas i localStorage.');
}


function updateHeaderUI(){
  const userNameEl = document.getElementById('user-name');
  const devBadgeEl = document.getElementById('dev-badge');
  const registerBtn = document.getElementById('open-register');
  const loginBtn = document.getElementById('open-login');
  const devLoginBtn = document.getElementById('dev-login');
  const logoutBtn = document.getElementById('logout-btn');
  
  if(isLoggedIn()){
    const account = getUserAccount();
    const isDev = account && account.isDev;
    
    if(isDev){
      // Dev-mode
      if(devBadgeEl) devBadgeEl.style.display = 'inline-block';
      if(userNameEl) userNameEl.style.display = 'none';
    } else {
      // Regular user
      if(devBadgeEl) devBadgeEl.style.display = 'none';
      if(account && userNameEl){
        userNameEl.textContent = account.username;
        userNameEl.style.display = 'inline';
      }
    }
    
    if(registerBtn) registerBtn.style.display = 'none';
    if(loginBtn) loginBtn.style.display = 'none';
    if(devLoginBtn) devLoginBtn.style.display = 'none';
    if(logoutBtn) logoutBtn.style.display = 'inline-block';
  } else {
    if(userNameEl) userNameEl.style.display = 'none';
    if(devBadgeEl) devBadgeEl.style.display = 'none';
    if(registerBtn) registerBtn.style.display = 'inline-block';
    if(loginBtn) loginBtn.style.display = 'inline-block';
    if(devLoginBtn) devLoginBtn.style.display = 'inline-block';
    if(logoutBtn) logoutBtn.style.display = 'none';
  }
}

// Generate 6-digit code
function generateLoginCode(){
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Save login code temporarily
function saveLoginCode(email, code){
  try{
    const codes = JSON.parse(localStorage.getItem(LOGIN_CODES_KEY) || '{}');
    codes[email] = {
      code: code,
      timestamp: Date.now(),
      expires: Date.now() + (10 * 60 * 1000) // 10 minutes
    };
    localStorage.setItem(LOGIN_CODES_KEY, JSON.stringify(codes));
  } catch(e){}
}

// Verify login code
function verifyLoginCode(email, code){
  try{
    const codes = JSON.parse(localStorage.getItem(LOGIN_CODES_KEY) || '{}');
    const savedCode = codes[email];
    
    if(!savedCode) return false;
    if(Date.now() > savedCode.expires) return false;
    if(savedCode.code !== code) return false;
    
    // Clear used code
    delete codes[email];
    localStorage.setItem(LOGIN_CODES_KEY, JSON.stringify(codes));
    return true;
  } catch(e){
    return false;
  }
}

// Send email notification (demo version - would use backend API in production)
async function sendEmailNotification(subject, body){
  const user = getUserAccount();
  if(!user || !user.email) return;
  
  // Try to send via backend API
  try {
    const response = await fetch('http://localhost:3000/api/send-mailbox-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: user.email, 
        subject, 
        message: body 
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`📧 E-post skickad till ${user.email}`);
      return true;
    } else {
      throw new Error(data.error || 'Kunde inte skicka e-post');
    }
  } catch (error) {
    console.error('Backend-fel:', error);
    // Fallback till demo-läge
    console.log(`📧 DEMO: E-post skulle skickas till ${user.email}`);
    console.log(`Ämne: ${subject}`);
    console.log(`Meddelande: ${body}`);
    return false;
  }
}

// Send login code via email
async function sendLoginCode(email, code){
  // Try to send via backend API
  try {
    const response = await fetch('http://localhost:3000/api/send-login-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code })
    });

    const data = await response.json();
    
    if (response.ok) {
      alert(`📧 E-post skickad till ${email}\n\nKolla din inkorg för verifieringskoden.\n(Koden är giltig i 10 minuter)`);
      return true;
    } else {
      throw new Error(data.error || 'Kunde inte skicka e-post');
    }
  } catch (error) {
    console.error('Backend-fel:', error);
    // Fallback till demo-läge om backend inte körs
    console.log(`📧 DEMO: E-post skulle skickas till ${email}`);
    console.log(`Kod: ${code}`);
    alert(`⚠️ Backend körs inte - DEMO-läge\n\nDin inloggningskod: ${code}\n\n(För riktiga e-post, starta backend-servern)\n\nKoden är giltig i 10 minuter`);
    return false;
  }
}
