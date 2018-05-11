importScripts('https://www.gstatic.com/firebasejs/4.9.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.9.0/firebase-messaging.js');

// Initialize Firebase
var config = {
    apiKey: "AIzaSyAh1_rHkp6py_uMZdn7yiJFYOlO3c0HNhA",
    authDomain: "projetocartolada.firebaseapp.com",
    databaseURL: "https://projetocartolada.firebaseio.com",
    projectId: "projetocartolada",
    storageBucket: "projetocartolada.appspot.com",
    messagingSenderId: "477812496466"
  };
firebase.initializeApp(config);

const messaging = firebase.messaging();
messaging.setBackgroundMessageHandler(payload => {
    const title = 'Novo pedido';
    const options = {
        body: payload.data.body,
        icon: '/ic_notification.png',
        tag: 'renotify',
        renotify: true
    }
    return self.registration.showNotification(title, options);
})