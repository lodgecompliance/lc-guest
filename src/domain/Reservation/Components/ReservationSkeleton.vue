<template>
    <v-container class="text-center">
        <v-row justify="center">
            <v-col cols="12" md="6">
                <v-skeleton-loader
                    type="heading, list-item-two-line"
                    class="mb-5"
                ></v-skeleton-loader>
                <v-skeleton-loader
                    type="card"
                ></v-skeleton-loader>
            </v-col>
        </v-row>
        
    </v-container>
    
</template>
<script>
export default {
    name: "ReservationSkeleton"
}
</script>