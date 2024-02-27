<template>
    <div style="position: relative;">
      <vue-tel-input-vuetify
          :valid-characters-only="true"
          @input="onPhoneInput"
          :value="phone"
          :disabled="disabled"
          v-bind="$attrs"
      >
      </vue-tel-input-vuetify>
      <div v-if="$slots['append']" style="position: absolute; right: 8px; top: 0; padding: 5px;">
        <slot name="append" />
      </div>
    </div>
</template>
<script>
export default {
    name: "PhoneNumber",
    components: {},
    props: {
        value: {},
        includeMeta: {
            default: () => true
        },
        disabled: Boolean
    },

    computed: {
        phone() {
            return this.value instanceof Object ? this.value.international : this.value;
        }
    },

    methods: {
        onPhoneInput(formattedNumber, {country, number, valid}) {
            if(this.includeMeta) {
                this.$emit('input', {
                    isoCode: country.iso2,
                    dialCode: country.dialCode,
                    international: number.international ? number.international.replace(/ /g,'') : number.international,
                    significant: number.significant,
                    valid
                });
            } else {
                this.$emit('input', number.international)
            }
        },
    },

}
</script>

<style>
  .vue-tel-input-vuetify .v-text-field--outlined:nth-child(1) {
      border-radius: 4px 0px 0px 4px !important;
      border-right-width: 0 !important;
    }
  .vue-tel-input-vuetify .v-text-field--outlined:nth-child(2) {
      border-radius: 0px 4px 4px 0px !important;
    }
</style>