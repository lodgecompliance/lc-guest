<template>
  <!-- App.vue -->
  <v-app>
    <v-app-bar
      v-if="app_ready && app_layout === 'full'"
      app
      color="primary"
      dark
      shrink-on-scroll
      height="150"
      elevation="0"
      :src="current_property ? current_property.cover_image : null"
    >
      <template v-if="current_property" v-slot:img="{ props }">
        <v-img
            v-bind="props"
            gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
        ></v-img>
      </template>
      <v-toolbar-title v-if="current_property" class="align-center" dark>
        <profile-avatar
            :profile="current_property"
            :size="40"
        />
        <span class="ml-2">{{ current_property.name }}</span>
      </v-toolbar-title>
      <v-toolbar-title v-else dark>
        <h4>{{ current_page.title || appName }}</h4>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <header-notifications v-if="authenticated" class="mr-2" />
      <app-menu @signout="signUserOut" />
    </v-app-bar>

    <!-- Sizes your content based upon application components -->
    <v-main v-if="app_ready">
      <router-view v-if="!auth_required"></router-view>
    </v-main>
    <v-main v-else>
      <div  class="d-flex justify-center align-center" style="height: 80vh">
        <div v-if="error" >
          <error-handler :error="error" @retry=" updateExists ? refreshApp : reloadApp" />
          <div v-if="updateExists" class="text-center">
            <h2>This might be due to outdated version, please update the application</h2>
          </div>
        </div>
        <div v-else class="text-center">
          <img src="@/assets/img/logo.png" width="100px" class="loader" />
          <p>{{app_process}}</p>
        </div>
      </div>
    </v-main>

    <v-snackbar
        v-if="app_layout === 'full' && mode === 'application'" top right
        :value="updateExists" :timeout="-1"
        color="primary"
    >
      <v-row justify="space-around" align="start">
        <v-col cols="9" class="my-0 py-0">
          An update is available
        </v-col>
        <v-col cols="3" class="my-0 py-0">
          <v-btn text small dark @click="refreshApp" >
            Update
          </v-btn>
        </v-col>
      </v-row>
    </v-snackbar>

    <v-footer v-if="app_layout === 'full'" app>
      <a
          v-if="auth.profile"
          class="d-flex align-center" style="cursor: pointer"
          :href="authDomain"
          target="_blank"
          >
        <profile-avatar size="24" :profile="auth.profile" />
        <h6 class="ml-2">{{ auth.profile.full_name }}</h6>
      </a>
      <v-spacer></v-spacer>
      <v-btn x-small @click="updateApp" title="Reload app" icon><v-icon>mdi-refresh</v-icon></v-btn>
    </v-footer>
    <div :class="`auth-frame-container ${auth_required ? 'authenticate' : ''}`">
      <iframe
          id="authFrame"
          :src="authUrl"
      ></iframe>
    </div>
  </v-app>
</template>

<script>

import {mapActions, mapMutations, mapGetters} from 'vuex'
import CryptoJS from 'crypto-js';
import appHelper from '@/helper/app';
import update from './mixins/update';
import config from './config';
import ProfileAvatar from "@/components/ProfileAvatar.vue";
import ErrorHandler from "@/components/ErrorHandler.vue";
import AppMenu from "@/components/AppMenu.vue";
import HeaderNotifications from "@/components/HeaderNotifications.vue";

export default {
  name: 'App',
  mixins: [update],
  components: {
    HeaderNotifications,
    AppMenu,
    ErrorHandler,
    ProfileAvatar,
  },
  data(){
    return {
      appName: config.app.name,
      authDomain: config.app.authDomain,
      error: null,
    }
  },

  computed:{
    ...mapGetters([
      'app_ready',
      'app_process',
      'authenticated',
      'profile_loaded',
      'app_layout',
      'current_user',
      'current_property',
      'current_page',
      'is_mobile',
      'auth', 'mode',
      'auth_required'
    ]),

    authUrl() {
      return `${this.authDomain}/auth`;
    }
  },

    methods:{

      ...mapActions([
          'syncAuthUser',
          'getSystemParams',
          'signout',
          'query',
          'mutate'
      ]),
      
      ...mapMutations([
          'SET_AUTH',
          'SET_AUTH_REQUIRED',
          'SET_APP_STATE',
          'SET_USER_AUTH',
          'SNACKBAR',
          'UNSET_CURRENT_USER',
          'SET_APP_LAYOUT',
          'SET_MOBILE',
          'SET_MODE',
          'SET_CURRENT_PAGE'
      ]),

      setUser(){
          this.error = null;
          this.SET_APP_STATE(!!this.auth.token && !!this.current_user.profile);
          this.syncAuthUser()
          .then(() => {
            this.SET_APP_STATE(!!this.current_user.profile)
          })
          .catch(e => {
            if(this.updateExists) {
              this.refreshApp();
            } else {
              this.error = e
            }
          })
          .finally(() => {
              this.bootIntercom();
          })
      },

      bootIntercom() {
        if(config.intercom.app_id && this.current_user.auth) {
          this.$intercom.boot({
            user_id: this.current_user.auth.uid,
            name: [this.current_user.profile.first_name, this.current_user.profile.last_name].join(' '),
            email: this.current_user.profile.email,
            user_hash: CryptoJS.HmacSHA256(this.current_user.auth.uid, config.intercom.secret_key).toString(),
            hide_default_launcher: false
          })
        }
      },

      signUserOut(){
        this.SET_APP_STATE(false)
        this.signout()
        .then(() => {
            this.$intercom.shutdown()
        }).finally(() => {
          this.SET_APP_STATE(true);
        })
      },

    },

    mounted() {
      if(this.mode === 'sdk'){
        this.SET_APP_STATE(true);
        return
      }
      this.getSystemParams().then(() => {
        const critical = appHelper.checkForCriticalUpdate()
        if(critical) {
          if(appHelper.useServiceWorker()) {
            this.updateCritical = critical;
            this.refreshApp()
          } else this.updateApp();
          return Promise.reject(
              "Cannot start application, critical update is required. Hold on while application is rebooted"
          )
        }
      })
      .catch(e => {
        console.log(e);
      });
    },

    created() {
      const vm = this;
        this.SET_MOBILE( screen.width < 768);
        window.addEventListener('resize', (e) => {
          this.SET_MOBILE( screen.width < 768)
        })
        window.addEventListener('message', function(message) {
          if (message.origin === config.app.authDomain) {
            let { type, token, expires, profile, status } = message.data;
            switch (type) {
              case "auth":
                if(status === 'signedin') {
                  vm.SET_AUTH({ token, expires, profile })
                  vm.SET_AUTH_REQUIRED(!(token && expires && profile));
                  vm.setUser()
                }
                else if(status === 'signedout') {
                  vm.SET_AUTH({ token: null, expires: null, profile: null })
                  vm.SET_MODE(null)
                  vm.UNSET_CURRENT_USER()
                  if(vm.$route.meta.requiresAuth) {
                    vm.SET_AUTH_REQUIRED(true);
                  }
                }
                break;
              case "view-account":
                window.location.replace(config.app.authDomain);
                break;
            }
          }
        });
    },

    watch: {
      $route: {
        immediate: true,
        handler(route) {
          this.SET_APP_LAYOUT(route.meta.layout || 'full');
          this.SET_CURRENT_PAGE({ title: route.meta.title });
          this.SET_MODE(
              route.query?.source === "sdk" || route.name === 'reservation.sdk.form'
              ? 'sdk' : 'application'
          )
          if(route.meta.requiresAuth && !this.authenticated) {
            this.SET_AUTH_REQUIRED(true);
          } else this.SET_APP_STATE(true)
        }
      }
    }
}
</script>

<style>
  .theme--light.v-application {
    background-color: #f7f7f7 !important;
  }

  .required label::after {
    content: "*";
  }

  .loader {
    animation: fadeInfadeOut 1.5s linear 0s infinite;
  }

  @keyframes fadeInfadeOut {
    0% {
      opacity: 0.2;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.2;
    }
  }
  .text-transform-unset {
    text-transform: unset !important;
  }
  .box-shadow-unset {
    box-shadow: unset !important;
    -webkit-box-shadow: unset !important;
  }

  .auth-frame-container {
    display: none
  }

  .auth-frame-container iframe {
    border: 0;
  }

  .auth-frame-container.authenticate {
    padding: 50px 0;
    display: flex;
    position: fixed;
    height: 100vh;
    top: 0;
    left: 0;
    right: 0;
    background-color: rgba(0,0,0,.5);
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    z-index:1000000;
  }

  .auth-frame-container.authenticate iframe {
    width: 90%;
    height: 90%;
  }

  @media screen and (min-width: 768px) {
    .auth-frame-container.authenticate iframe {
      width: 50%;
    }
  }

  @media screen and (min-width: 992px) {
    .auth-frame-container.authenticate iframe {
      width: 30%;
    }
  }

</style>
