export default {
    data() {
       return {
           selectAll: false,
           selected: [],
           items: []
       }
    },
    computed: {
        allSelected() {
            return this.items.every(n => this.selected.includes(n.id))
        }
    },
    methods: {
        selectItem(id) {
            if(!this.selected.includes(id))
                this.selected.push(id)
        },

        unselectItem(id) {
            const index = this.selected.findIndex(n => n === id);
            if(index >= 0) {
                this.selected.splice(index, 1);
            }
        },

        selectAllItems() {
            if(this.allSelected) {
                this.selected = []
            } else {
                this.selected = this.items.map(n => n.id)
            }
        }
    }
}