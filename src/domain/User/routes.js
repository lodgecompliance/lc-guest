import UserNotifications from './Views/Notifications';

export default [
    {
        path: '/notifications/:notification?',
        name: 'notification.list',
        component: UserNotifications,
        meta: {
            requiresAuth: true,
        },
    },
];