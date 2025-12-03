import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

// CONFIGURAÇÃO DO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBIzQoA074zEPVw2hADDiRMEyhbPwnEkfM",
  authDomain: "oficina-mais-mais.firebaseapp.com",
  projectId: "oficina-mais-mais",
  storageBucket: "oficina-mais-mais.appspot.com",   
  messagingSenderId: "902876694909",
  appId: "1:902876694909:web:5b7ce1753202a654a7e414"
};


let app;
if (!firebase.apps.length) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app();
}


const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();


export { auth, firestore, storage, firebase };
