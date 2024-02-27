export default {
    app: {
        name: process.env.VUE_APP_NAME,
        url: process.env.VUE_APP_URL,
        env: process.env.VUE_APP_ENV,
        mode: process.env.NODE_ENV,
        authDomain: process.env.VUE_APP_AUTH_DOMAIN,
    },

    google: {
        api_key: process.env.VUE_APP_GOOGLE_API_KEY,
    },

    firebase: {
        sdk: {
            apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
            authDomain: process.env.VUE_APP_FIREBASE_DOMAIN,
            databaseURL: process.env.VUE_APP_FIREBASE_DB_URL,
            projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
            storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.VUE_APP_FIREBASE_API_ID,
            measurementId: process.env.VUE_APP_FIREBASE_MEASUREMENT_ID
        },
        VapidKey: process.env.VUE_APP_FIREBASE_VAPID_KEY
    },

    api: {
        baseUrl: process.env.VUE_APP_API_BASE_URL,
    },
    
    apollo: {
        gr: process.env.VUE_APP_GRAPHQL_GR_ENDPOINT,
        auth: process.env.VUE_APP_GRAPHQL_AUTH_ENDPOINT,
        account: process.env.VUE_APP_GRAPHQL_ACCOUNT_ENDPOINT,
        client_key: process.env.VUE_APP_GRAPHQL_CLIENT_KEY
    },

    stripe: {
        publishable_key: process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY,
        secret_key: process.env.VUE_APP_STRIPE_SECRET_KEY,
        client_id: process.env.VUE_APP_STRIPE_CLIENT_ID
    },

    intercom: {
        app_id: process.env.VUE_APP_INTERCOM_APP_ID,
        secret_key: process.env.VUE_APP_INTERCOM_SECRET_KEY,
    } 

}