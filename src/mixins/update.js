import GET_SYSTEM_PARAMS from '../graphql/query/getSystemParam';
import helper from '../helper';
import appHelper from '../helper/app';

export default {
  data() {
    return {
      // refresh variables
      refreshing: false,
      swRegistration: null,
      updateExists: false,
      updateCritical: false,
    }
  },

  created() {
    // Listen for our custom event from the SW registration
    document.addEventListener('swUpdated', this.updateAvailable, { once: true })
    // Prevent multiple refreshes
    navigator.serviceWorker.addEventListener('controllerchange', this.updateApp)
  },

  methods: {
    // Store the SW registration so we can send it a message
    // We use `updateExists` to control whatever alert, toast, dialog, etc we want to use
    // To alert the user there is an update they need to refresh for
    updateAvailable(event) {
      this.swRegistration = event.detail;
      if(this.updateCritical) this.criticalUpdate()
      else this.updateExists = true;
    },

    criticalUpdate() {
      if ('Notification' in window) {
        if(Notification.permission === "granted"){
          new Notification("The app is being updated");
        }
      }
      this.refreshApp();
    },

    // Called when the user accepts the update
    refreshApp() {
      this.updateExists = false;
      // Make sure we only send a 'skip waiting' message if the SW is waiting
      if (!(this.swRegistration && this.swRegistration.waiting)) return
      // send message to SW to skip the waiting and activate the new SW
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    },

    updateApp() {
      if (this.refreshing) return;
      this.refreshing = true;
      appHelper.setLastAppUpdate();
      this.reloadApp();
    },

    reloadApp() {
      window.location.reload();
    }

  },

}