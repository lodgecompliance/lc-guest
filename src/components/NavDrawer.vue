<template>
    <v-navigation-drawer 
      app
      v-model="$store.state.navDrawer"
      class="primary" dark
      >
      <template v-slot:prepend>
        <img src="@/assets/img/gr-logo-white.png" height="60px" class="ml-2 mt-3"/>
        <v-divider></v-divider>
      </template>

      <v-list>
        <v-list-item-group v-model="currentNav" >
          <template v-for="(item, i) in modeNavItems">
            <!--     Item with subitem       -->
            <v-list-group
                v-if="item.render && item.subItems && item.subItems.length"
                :key="i"
                :value="$router.currentRoute.name === item.route.name"
                :prepend-icon="item.icon"
                active-class="white--text"
                no-action
            >
                <template v-slot:activator>
                  <v-list-item-content>
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                    <v-list-item-subtitle v-if="item.subtitle">{{ item.subtitle }}</v-list-item-subtitle>
                  </v-list-item-content>
                </template>
                <v-list-item
                    v-for="(subItem, j) in item.subItems"
                    :key="j"
                    :to="{name: subItem.route.name, params: subItem.route.params}"
                    active-class="white--text"
                >
                  <v-list-item-icon>
                    <v-badge
                        v-if="subItem.badge"
                        v-bind="subItem.badge"
                    >
                      <v-icon v-text="subItem.icon"></v-icon>
                    </v-badge>
                    <v-icon v-else v-text="subItem.icon"></v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title v-text="subItem.title"></v-list-item-title>
                    <v-list-item-subtitle v-if="subItem.subtitle" v-text="subItem.subtitle"></v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
            </v-list-group>
          <!--     Single item       -->
            <v-list-item
                :key="i"
                v-else-if="item.render"
                :to="item.route ? { name: item.route.name, params: item.route.params } : undefined"
                :href="item.href"
                :target="item.target"
            >
              <v-list-item-icon>
                <v-badge
                    v-if="item.badge"
                    v-bind="item.badge"
                >
                  <v-icon v-text="item.icon"></v-icon>
                </v-badge>
                <v-icon v-else v-text="item.icon"></v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="item.title"></v-list-item-title>
                <v-list-item-subtitle v-if="item.subtitle" v-text="item.subtitle"></v-list-item-subtitle>
              </v-list-item-content>
          </v-list-item>
            <!--     Disabled nav item       -->
          <v-list-item v-else disabled :key="i">
              <v-list-item-icon>
                <v-icon v-text="item.icon"></v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="item.title"></v-list-item-title>
                <v-list-item-subtitle v-if="item.subtitle" v-text="item.subtitle"></v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>
        </v-list-item-group>
      </v-list>

      <template v-slot:append>
        <v-list-item v-if="authenticated" @click="$emit('signout')">
          <v-list-item-icon>
            <v-icon>mdi-logout</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Signout</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-else @click="$router.push({name: 'signin'})">
          <v-list-item-icon>
            <v-icon>mdi-login</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Sign in</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>

    </v-navigation-drawer>
</template>

<script>
import { mapGetters} from 'vuex'
import config from "@/config";

export default {
    name: "NavDrawer",
    data(){
        return {
            appName: config.app.env,
            currentNav: null
        }
    },
    computed:{
      ...mapGetters([
        'current_user',
        'current_property',
        'authenticated',
      ]),


    hostItems() {
      let items = [
        {
          title: 'Home',
          icon: 'mdi-home',
          route: {
            name: 'home'
          },
          render: true,
          router: true,
        },
        {
          title: 'Account',
          icon: 'mdi-account',
          href: config.app.authDomain,
          target: '_blank',
          render: true,
        },
        {
          title: 'Notifications',
          icon: 'mdi-bell',
          route: {
            name: 'property.notifications',
            params: { property: this.activeProperty.id }
          },
          badge: this.unreadPropertyNotifications > 0 ? {
            color: 'red',
            content: this.unreadPropertyNotifications,
            overlap: true
          } : undefined,
          render: true,
          router: true,
        },
      ]
      if(this.hasAnyProperty) {
        items = items.concat([
          {
            title: 'Properties',
            icon: 'mdi-domain',
            route: {
              name: 'property.list'
            },
            render: true,
            router: true,
          },
          {
            title: 'Property settings',
            subtitle:  this.current_user.property.name,
            icon: 'mdi-cog',
            route: {
              name: 'property.settings',
              params: { property: this.activeProperty.id }
            },
            render: this.current_user.property.id !== undefined,
            router: true,
            subItems: this.propertySubItems
          },
        ])
      }

      return items;
    },
    modeNavItems() {
      return this.navItems[this.mode] || []
    },

    unreadPropertyNotifications() {
      return this.property_notifications.filter(n => !n.read).length
    }

  },

  methods: {
   
  },

}
</script>

<style scoped>
  .no-underline-nav-link{
    text-decoration: none !important;
  }
</style>