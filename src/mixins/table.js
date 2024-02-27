export default {
    data() {
       return {
           data: [],
           selected: [],
           selectAll: false,
       }
    },
    computed: {
        tableHeaders() {
            return this.headers.filter(header => this.columns.includes(header.value));
        }
    },
    watch: {
        selectAll: {
            immediate: true,
            handler(select) {
                if(select) this.selected = this.data;
                else this.selected = [];
            }
        }
    }
}