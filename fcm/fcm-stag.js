importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');
firebase.initializeApp({
    apiKey: 'AIzaSyB9lA-Kv3O0CSM_lhDqkkWbhIEF2yrWlEg',
    authDomain: 'guestregistration-4140a.firebaseapp.com',
    databaseURL: 'https://guestregistration-4140a.firebaseio.com',
    projectId: 'guestregistration-4140a',
    storageBucket: 'guestregistration-4140a.appspot.com',
    messagingSenderId: '840040500916',
    appId: '1:840040500916:web:7a1dcb5214f4e597b091e1',
    measurementId: 'G-15CD9K4NN1',
});
firebase.messaging()
    .onBackgroundMessage(function(payload) {
        self.registration.showNotification(payload.notification.title, {
            body: payload.notification.body,
            icon: payload.notification.icon,
            click_action: payload.notification.click_action
        });
    });