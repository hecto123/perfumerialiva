// Inicialización básica de Firebase para Perfumería LIVA.
// Reemplaza estas claves con la configuración de tu proyecto de Firebase.
const firebaseConfig = {
  apiKey: 'REEMPLAZAR_API_KEY',
  authDomain: 'REEMPLAZAR_AUTH_DOMAIN',
  projectId: 'REEMPLAZAR_PROJECT_ID',
  storageBucket: 'REEMPLAZAR_STORAGE_BUCKET',
  messagingSenderId: 'REEMPLAZAR_MESSAGING_SENDER_ID',
  appId: 'REEMPLAZAR_APP_ID'
};

const isFirebaseConfigValid = Object.values(firebaseConfig).every(value => value && !value.includes('REEMPLAZAR'));
let auth = null;
let db = null;
let storage = null;

if(isFirebaseConfigValid){
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore ? firebase.firestore() : null;
  storage = firebase.storage ? firebase.storage() : null;
} else {
  console.warn('Firebase no está configurado. Usando login local de desarrollo.');
}

window.firebaseApp = {auth, db, storage, isFirebaseConfigured: isFirebaseConfigValid};
