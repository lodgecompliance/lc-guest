<template>
    <div style="min-height:100%">
        <slot name="notice" />

        <v-snackbar v-model="snackbar.status" 
            :timeout="snackbar.timeout ? snackbar.timeout : 5000"
            :color="snackbar.color"
            top rounded transition="fade-transition"
            >
            <v-row justify="space-around" align="start">
                <v-col cols="11" class="my-0 py-0">
                  {{ snackbar.text ? snackbar.text.replace('GraphQL error:', '').trim() : "" }}
                </v-col>
                <v-col cols="1" class="my-0 py-0">
                    <v-btn icon x-small dark text @click="closeAlert" >
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-col>
            </v-row>
        </v-snackbar>

        <section v-if="$slots['header']" class="primary--text text--darken-4 px-3">
          <slot name="header" />
        </section>

        <section :class="`px-1 px-sm-2`">
            <slot/>
        </section>
        
    </div>
</template>

<script>
    import { mapMutations, mapGetters } from 'vuex';
    export default {
      name: "AppLayer",
      components: {},
      data(){
          return {}
      },

      computed:{
          ...mapGetters([
              'snackbar'
          ]),
      },
      methods: {
          ...mapMutations([
              'SNACKBAR'
          ]),
        closeAlert(){
          this.SNACKBAR({ status: false })
        },
      },
    }
</script>