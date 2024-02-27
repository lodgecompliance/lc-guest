<template>
    <item-status :status="status.status" :color="status.color" />
</template>

<script>
  import ItemStatus from "@/components/ItemStatus";
  export default {
    name: "ReservationDamageStatus",
    components: {ItemStatus},
    data() {
      return {}
    },
    computed: {
      status() {
        if(!this.damage.amount) return { status:'No charge' };
        if(this.damage.payment) return { status: 'Paid', color: 'success'};
        return { status: 'pending', color: 'warning'};
      }
    },
    props: {
        damage: Object
      },
  }
</script>

