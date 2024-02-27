<template>
    <div class="d-flex">
        <v-btn v-if="actions.includes('open')" v-bind="iconsAttrs" @click="open" title="Open as PDF">
            <v-icon>mdi-open-in-new</v-icon>
        </v-btn>
        <v-btn v-if="actions.includes('download')" v-bind="iconsAttrs" @click="download" title="Download as PDF">
            <v-icon>mdi-download</v-icon>
        </v-btn>
        <v-btn v-if="actions.includes('print')" v-bind="iconsAttrs" @click="print" title="Print">
            <v-icon>mdi-printer</v-icon>
        </v-btn>
    </div>
</template>

<script>
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export default {
    name: "ConvertToPdf",
    data() {
        return {}
    },
    computed: {
        /**
         * https://pdfmake.github.io/docs/0.1/document-definition-object/
         */
        docDefinitions() {
            return {
                info: this.metadata,
                content: this.content,
                pageSize: 'A4',
                pageOrientation: 'portrait',
                pageMargins: [ 40, 60, 40, 60 ], // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
            }
        }
    },

    props: {
        fileName: {
            type: String,
            default: () => 'File.pdf'
        },
        actions: {
            type: Array,
            default: () => ['open', 'download', 'print']
        },
        content: {
            type: Array,
            default: () => ['This document is empty']
        },
        metadata: {
            type: Object,
            default: () => {
                return {
                    title: "", //The title of the document
                    author: "", //The name of the author
                    subject: "", //Tthe subject of the document
                    keywords: "", //Keywords associated with the document
                    creator: "Guest Registration via pdfmake", //The creator of the document (default is ‘pdfmake’)
                    producer: "Guest Registration via pdfmake", //The producer of the document (default is ‘pdfmake’)
                }
            }
        },

        downloadCallback: {
            type: Function,
            default: () => () => {}
        },
        downloadOptions: Object,

        openOption: Object,
        openWindow: {
            // default: () => window.open('', 'pdfWindow', 'location=no,toolbar=no,menubar=no')
        },

        printOption: Object,
        printWindow: {
            // default: () => window.open('', 'printWindow', 'location=no,toolbar=no,menubar=no')
        },
        iconsAttrs: {
            type: Object,
            default: () => {
                return {
                    icon: true,
                    color: 'primary'
                }
            }
        }


    },
    methods: {
        open() {
            pdfMake.createPdf(this.docDefinitions).open(this.openOption, this.openWindow);
        },

        print() {
            pdfMake.createPdf(this.docDefinitions).print(this.printOption, this.printWindow);
        },

        download() {
            pdfMake.createPdf(this.docDefinitions).download(this.fileName, this.downloadCallback(), this.downloadOptions);
        }
    },

}
</script>