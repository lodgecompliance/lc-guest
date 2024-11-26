<template>
    <v-list-item>
        <slot name="select" v-bind="{ instruction }" />
        <v-list-item-icon v-if="icon">
            <v-icon>mdi-note-text-outline</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
            <v-list-item-title>
                {{ instruction.title }} <v-btn @click="dialog = true" outlined color="primary" small text>View</v-btn>
            </v-list-item-title>
            <slot name="list-item-content" v-bind="{ instruction }" />
        </v-list-item-content>
        <v-dialog v-model="dialog" max-width="400" scrollable>
            <v-card>
                <v-card-title>
                    <h4>{{ instruction.title }}</h4>
                </v-card-title>
                <v-divider></v-divider> 
                <v-card-text class="pt-3">
                    {{ instruction.body }}
                </v-card-text>
                <v-card-actions>
                    <v-btn text color="red" @click="dialog = false">close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-list-item>
</template>

<script>
export default {
    name: "PropertyInstruction",
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
      instruction: Object,
    }
}
</script>