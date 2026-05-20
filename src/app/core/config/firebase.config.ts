// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: 'AIzaSyA1FwgRLY-QpQ3B7DS_JFkYIpuSR4NwtBw',
  authDomain: 'vet-link-859a3.firebaseapp.com',
  projectId: 'vet-link-859a3',
  storageBucket: 'vet-link-859a3.firebasestorage.app',
  messagingSenderId: '721264060677',
  appId: '1:721264060677:web:3bb42eca69ba5b0845ef6c',
  measurementId: 'G-CC3QK2DQYW',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);
