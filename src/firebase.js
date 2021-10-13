import firebase from 'firebase';

  // Initialize Firebase
var firebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyCYqxi91d4V75W8AoE5AugXnXE_5eSlAb4",
  authDomain: "insta-react-app-c9d5e.firebaseapp.com",
  projectId: "insta-react-app-c9d5e",
  storageBucket: "insta-react-app-c9d5e.appspot.com",
  messagingSenderId: "406356692460",
  appId: "1:406356692460:web:595decf9e9cf12d32ec4c9",
  measurementId: "G-CR00RB5FRZ"
});

const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

export {db,auth,storage};
// export default db;