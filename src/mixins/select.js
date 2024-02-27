export default {
    props: {
        items: {
            default: () => []
        },
        selectFirstAsDefault: {
            default: () => false
        }
    },
    computed: {
        value() {
            return this.$attrs.value
        }
    },
    methods: {
        emitValue() {
            if(typeof this.value !== 'object' && typeof this.$attrs['return-object'] !== "undefined") {
                this.$emit("input", this.items.find(item => item.id === this.value))
            }
        }
    },
    mounted() {
        if(this.selectFirstAsDefault && this.items.length) {
            this.$emit("input", this.items[0])
        }
    },
    watch: {
        value: {
            immediate: true,
            handler() {
                this.emitValue()
            }
        },
        items: {
            immediate: true,
            handler() {
                this.emitValue()
            }
        }
    }
}