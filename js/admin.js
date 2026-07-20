/* Lógica del panel admin de Perfumería LIVA */
const auth = window.firebaseApp?.auth || null;
const db = window.firebaseApp?.db || null;
const storage = window.firebaseApp?.storage || null;

function loginAdmin(){
  const email=document.getElementById('adminEmail').value.trim();
  const password=document.getElementById('adminPassword').value.trim();
  const error=document.getElementById('loginError');
  error.textContent='';
  if(!email||!password){
    error.textContent='Completa ambos campos para continuar.';
    return;
  }

  const navigateToDashboard = ()=>{
    window.adminLoggedIn = true;
    window.location.href='../pages/dashboard.html';
  };

  if(auth && auth.signInWithEmailAndPassword && window.firebaseApp?.isFirebaseConfigured){
    auth.signInWithEmailAndPassword(email,password)
      .then(navigateToDashboard)
      .catch(err=>{
        console.error('Firebase auth error:', err);
        error.textContent='Error al iniciar sesión: '+err.message;
      });
    return;
  }

  // Fallback local admin login cuando Firebase no está deshabilitado o no configurado.
  if(email === 'admin@liva.com' && password === 'perfume123'){
    navigateToDashboard();
    return;
  }

  error.textContent='No se pudo iniciar sesión. Verifica tu configuración de Firebase o las credenciales.';
}

window.loginAdmin = loginAdmin;
