<template>
    <div>
        <template v-if="loading">
            <slot name="loading">
               <dotted-spinner-loader />
            </slot>
        </template>
        <template v-else-if="error">
          <slot name="error" v-bind="{ error }">
            <error-handler :error="error" v-on="$listeners" />
          </slot>
        </template>
        <template v-else>
            <slot />
        </template>
    </div>
</template>

<script>
import DottedSpinnerLoader from "@/components/Loaders/DottedSpinner";
import ErrorHandler from "@/components/ErrorHandler";
export default {
    name: "DataContainer",
  components: {ErrorHandler, DottedSpinnerLoader},
  props: {
        loading: Boolean,
        type: {
            default: () => 'list-item-two-line'
        },
        error: [Object, Error],
    }
}
</script>