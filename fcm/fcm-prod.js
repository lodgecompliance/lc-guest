importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');
firebase.initializeApp({
    apiKey: 'AIzaSyCgNHqFc5m3Tl-wwA9A5Bn3g98T-jvNkLI',
    authDomain: 'app.guestregistration.com',
    databaseURL: 'https://guest-registration-prod.firebaseio.com',
    projectId: 'guest-registration-prod',
    storageBucket: 'guest-registration-prod.appspot.com',
    messagingSenderId: '496454377261',
    appId: '1:496454377261:web:963a83f3fef165f3ca7da4',
    measurementId: 'G-JKPB3JZPKQ',
});
firebase.messaging()
    .onBackgroundMessage(function(payload) {
        self.registration.showNotification(payload.notification.title, {
            body: payload.notification.body,
            icon: payload.notification.icon,
            click_action: payload.notification.click_action
        });
    });