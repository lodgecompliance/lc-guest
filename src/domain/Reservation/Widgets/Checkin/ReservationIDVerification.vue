<template>
  <user-identity-verification :user-id="userId" v-on="$listeners" flat>
    <template #default="{ loading, verification }">
      <slot v-bind="{ loading, verification }" />
    </template>
  </user-identity-verification>
</template>
<script>
import UserIdentityVerification from "@/domain/User/Components/IdentityVerification.vue";

export default {
  name: "ReservationIdVerification",
  components: { UserIdentityVerification },
  data(){
    return {}
  },
  props: {
    userId: String
  }
}
</script>