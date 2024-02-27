<template>
    <v-list v-if="reservation" dense>
        <metadata-list-item
            v-if="showDetail('booking_name')"
            :metadata="{ key: 'Booking Name', value: reservation.name }"
            :type="displayType"
        />
      <metadata-list-item
          v-if="showDetail('checkin_date')"
          :metadata="{ key: 'Checkin date', value: checkinMoment.format('ll') }"
          :type="displayType"
      />
      <metadata-list-item
          v-if="showDetail('checkout_date')"
          :metadata="{ key: 'Checkout date', value: checkoutMoment.format('ll') }"
          :type="displayType"
      />
      <metadata-list-item
          v-if="reservation.booking_reference && showDetail('booking_reference')"
          :metadata="{ key: 'Booking Ref', value: reservation.booking_reference }"
          :type="displayType"
      />
      <metadata-list-item
          v-if="reservation.booking_channel && showDetail('booking_channel')"
          :metadata="{ key: 'Booking Channel', value: bookingChannel }"
          :type="displayType"
      />
      <metadata-list-item
          v-if="reservation.room && showDetail('room')"
          :metadata="{ key: 'Room/Listing', value: reservation.room }"
          :type="displayType"
      />
      <metadata-list-item
          v-if="reservation.room && showDetail('balance')"
          :metadata="{ key: 'Balance', value: $options.filters.money(reservation.balance,reservation.currency ) }"
          :type="displayType"
      />
      <metadata-list-item
          v-if="showDetail('status')"
          :metadata="{ key: 'Status', value: reservation.status }"
          :type="displayType"
      >
        <template #content>
          <div :class="`${displayType === 'edge' ? 'd-flex justify-space-between' : ''}`">
            <v-list-item-subtitle class="grey--text">Status</v-list-item-subtitle>
            <reservation-status :reservation="reservation">
              <template #default="{ status }">
                <v-list-item-title>{{ status.label }}</v-list-item-title>
              </template>
            </reservation-status>
          </div>
        </template>
      </metadata-list-item>
    </v-list>
</template>

<script>
    import reservationMixin from '../Mixins/reservation';
    import MetadataListItem from "@/components/MetadataListItem.vue";
    import ReservationStatus from "@/domain/Reservation/Components/ReservationStatus.vue";
    export default {
        name: "ReservationDetails",
      components: {ReservationStatus, MetadataListItem},
        mixins: [reservationMixin],
        data(){
            return {
            }
        },
        props: {
            reservation: Object,
            showOnly: {
              type: Array,
              default: () => ['*']
            },
            displayType: String,
        },
        methods:{
          showDetail(detail) {
            return (this.showOnly.length == 1 && this.showOnly[0] == '*') || this.showOnly.includes(detail)
          }
        },
        watch: {
           
        }
    }
</script>


