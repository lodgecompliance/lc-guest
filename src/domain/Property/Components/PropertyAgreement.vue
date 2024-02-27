<template>
    <v-list-item>
        <slot name="select" v-bind="{ agreement }" />
        <v-list-item-icon v-if="icon">
            <v-icon>mdi-handshake</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
            <v-list-item-title>
                {{ agreement.agreement }}
            </v-list-item-title>
          <v-list-item-subtitle v-if="agreement.link">
            <small class="grey--text">{{ agreement.link }}</small>
          </v-list-item-subtitle>
            <slot name="list-item-content" v-bind="{ agreement }" />
        </v-list-item-content>
        <v-list-item-action v-if="agreement.text || agreement.link">
          <v-btn @click="openAgreement" icon>
            <v-icon>mdi-open-in-new</v-icon>
          </v-btn>
        </v-list-item-action>
        <v-dialog v-model="dialog" max-width="400" scrollable>
            <v-card>
                <v-card-title>
                    <h4>{{ agreement.agreement }}</h4>
                </v-card-title>
                <v-divider></v-divider> 
                <v-card-text class="pt-3">
                    {{ agreement.text }}
                </v-card-text>
                <v-card-actions>
                    <v-btn text color="red" @click="dialog = false">close</v-btn>
                    <v-btn v-if="agreement.link" color="primary" @click="openLink()">Open link <v-icon>mdi-open-in-new</v-icon></v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-list-item>
</template>

<script>
export default {
    name: "PropertyAgreement",
    data() {
        return {
            dialog: false
        }
    },
    props: {
        icon: {
            type: Boolean,
            default: () => true
        },
        agreement: Object,
    },

    methods: {
        openAgreement() {
            if(this.agreement.text) {
                this.dialog = true;
            } else if(this.agreement.link) {
                this.openLink()
            }
        },

        openLink() {
            window.open(this.agreement.link, 'agreementWindow', 'location=no,toolbar=no,menubar=no')
        }
    }
}
</script>