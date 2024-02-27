<template>
  <reservation-page>
    <template #checkedin="{ reservation, property }">
      <reservation-checkedin-page
          :reservation="reservation"
          :property="property"
      >
        <h2 class="headline my-5">Documents</h2>
        <reservation-document-requests
            :reservation="reservation"
        >
          <template #actions="{ request, requestUpdated }">
            <reservation-document-request-submission
                :property="property"
                :reservation="reservation"
                :request="request"
                @document-request-updated="req => requestUpdated(req)"
            >
              <template #default="{ on }">
                <v-btn v-on="on" color="primary" small>Submit Document</v-btn>
              </template>
            </reservation-document-request-submission>
          </template>
        </reservation-document-requests>
      </reservation-checkedin-page>
    </template>
  </reservation-page>
</template>

<script>
import ReservationPage from "@/domain/Reservation/Views/Show.vue";
import ReservationCheckedinPage from "@/domain/Reservation/Widgets/CheckedInPage.vue";
import ReservationDocumentRequests from "@/domain/Reservation/Widgets/ReservationDocumentRequests.vue";
import ReservationDocumentRequestSubmission
  from "@/domain/Reservation/Widgets/ReservationDocumentRequestSubmission.vue";

export default {
  name: 'ReservationDamagesPage',
  components: {
    ReservationDocumentRequestSubmission,
    ReservationDocumentRequests,
    ReservationCheckedinPage,
    ReservationPage
  }
}
</script>
