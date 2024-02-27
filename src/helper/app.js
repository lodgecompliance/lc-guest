import platform from 'platform';
import h from './index';

const helper = {

    useServiceWorker() {
        if(process.env.NODE_ENV !== 'production') return false;
        let supportedBrowsers = h.getSystemParam("sw_browsers");
        if(supportedBrowsers) {
            supportedBrowsers = JSON.parse(supportedBrowsers);
            const browserInfo = helper.getBrowserInfo();
            return supportedBrowsers.includes(browserInfo["Browser Name"].toLowerCase())
        }
        return false;
    },

    getAuthProviders() {
        const providers = h.getSystemParam("auth_providers")
        return providers ? JSON.parse(providers) : []
    },

    getAppLastUpdate: () => {
        return Number(window.localStorage.getItem('last-update'))
    },

    setLastAppUpdate: () => {
        window.localStorage.setItem('last-update', h.nowTimestamp())
    },

    checkForCriticalUpdate: () => {
        try {
            const param = h.getSystemParam("last_critical_update");
            const lastUpdate = helper.getAppLastUpdate();
            return  lastUpdate && param && lastUpdate < param;
        } catch (e) {
           return false
        }
    },

    getBrowserInfo() {
        return {
            "Platform": platform.toString(),
            "OS": platform.os.toString(),
            "Browser Name": platform.name,
            "Browser Version": platform.version,
            "Browser Description": platform.description,
            "Browser Language": navigator.language.toString(),
            "Browser Color Depth": screen.colorDepth.toString(),
            "Browser Screen Height": screen.height.toString(),
            "Browser Screen Width": screen.width.toString(),
            "Browser Time Difference": new Date().getTimezoneOffset().toString(),
            "Agent Browser": navigator.userAgent.toString()
        }
    },

    getDeviceId() {
        const device = helper.getBrowserInfo();
        return `${device["Browser Name"]} ${device.OS}`.replace(/[-,.\s]/g, '.').toLowerCase()
    },

    async getIpAddress() {
        try {
            const { ip } = await (await fetch("https://api.ipify.org?format=json")).json();
            return ip;
        } catch (e) {
            return null
        }
    },

    getLocation() {
        return new Promise(resolve => {
            navigator.geolocation.getCurrentPosition(function(location) {
                resolve({
                    "Location Accuracy": location.coords.accuracy?.toString(),
                    "Altitude": location.coords.altitude?.toString(),
                    "Altitude Accuracy": location.coords.altitudeAccuracy?.toString(),
                    "Latitude": location.coords.latitude?.toString(),
                    "Longitude": location.coords.longitude?.toString(),
                    "Speed": location.coords.speed?.toString(),
                    "Timestamp": location.timestamp?.toString()
                })
            }, function(c) {
                resolve({})
            })
        })
    }
}
export default helper;