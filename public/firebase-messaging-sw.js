// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAUczU0ThvpxxCDVkSrvm2DTEUh1elBq3I",
  authDomain: "volleyball-finder-local.firebaseapp.com",
  projectId: "volleyball-finder-local",
  storageBucket: "volleyball-finder-local.appspot.com",
  messagingSenderId: "125184621350",
  appId: "1:125184621350:web:f9df51821866865aabdfe7",
  measurementId: "G-SFPZB34VSE"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || '背景通知';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/firebase-logo.png', // 可以換成你自己網站的icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});