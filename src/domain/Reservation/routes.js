import ReservationShow from './Views/Show.vue';
import ReservationGuestCheckin from './Views/GuestCheckin';
import ReservationInstruction from './Views/Instruction.vue';
import ReservationCharges from './Views/Charges.vue';
import ReservationDamages from './Views/Damages.vue';
import ReservationGuests from './Views/Guests.vue';
import ReservationDocuments from './Views/Documents.vue';
import ReservationFormSdk from './Widgets/SdkForm.vue';

export default [
    {
        path: '/:reservation',
        name: 'reservation.show',
        component: ReservationShow,
        meta: {
            title: "Reservation",
            requiresAuth: false,
        },
    },
    {
        path: '/:reservation/guest',
        name: 'reservation.guest.checkin',
        component: ReservationGuestCheckin,
        meta: {
            title: "Guest Checkin",
        },
    },
    {
        path: '/:reservation/instructions',
        name: 'reservation.instruction',
        component: ReservationInstruction,
        meta: {
            title: "Instructions",
            requiresAuth: true,
        },
    },
    {
        path: '/:reservation/charges',
        name: 'reservation.charges',
        component: ReservationCharges,
        meta: {
            title: "Charges",
            requiresAuth: true,
        },
    },
    {
        path: '/:reservation/damages',
        name: 'reservation.damages',
        component: ReservationDamages,
        meta: {
            title: "Damages",
            requiresAuth: true,
        },
    },
    {
        path: '/:reservation/guests',
        name: 'reservation.guests',
        component: ReservationGuests,
        meta: {
            title: "Guests",
            requiresAuth: true,
        },
    },
    {
        path: '/:reservation/documents',
        name: 'reservation.documents',
        component: ReservationDocuments,
        meta: {
            title: "Documents",
            requiresAuth: true,
        },
    },
    {
        path: '/sdk',
        name: 'reservation.sdk.form',
        component: ReservationFormSdk,
        meta: {
            layout: 'plain',
            requiresAuth: false,
        },
    }
]