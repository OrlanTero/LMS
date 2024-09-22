import Popup from "./Popup.js";
import {append, CreateElement, prepend} from "../../modules/component/Tool.js";
// import JsPDF from "../../libraries/jsPDF-master/dist/";


export default class PDFManager {
    constructor() {

    }

    preview(type, data) {
        window.jsPDF = window.jspdf.jsPDF;

        const popup = new Popup("reports/view_pdf_report", {type, data}, {
            backgroundDismiss: false,
        });


        popup.Create().then((pop) => {
            popup.Show();

            const form = pop.ELEMENT.querySelector("form.form-control");
            const content = pop.ELEMENT.querySelector(".print-preview-container");
            const header = pop.ELEMENT.querySelector(".print-preview-header");
            const pagesContainer = content.querySelector('.pay-slip-pages');
            const pages = content.querySelectorAll('.pay-slip-pages .pay-slip-page');

            const prepWidth = parseInt(content.getBoundingClientRect().width);
            const prepH = parseInt(content.getBoundingClientRect().height);
            const prepHeight = parseInt(header.getBoundingClientRect().height);
            const sampleDoc = new jsPDF('p','mm');
            const docHeight = sampleDoc.internal.pageSize.getHeight();
            const initPages = (ppp, ind) => {
                if (ppp[ind]) {
                    const ph = (parseFloat(ppp[ind].getBoundingClientRect().height) * 25.4 / 96) - 20;

                    if (ph >= docHeight) {
                        const nextPage = ppp[ind + 1] ?? (() => {
                            const el = CreateElement({
                                el: "DIV",
                                className: 'pay-slip-page',
                            });

                            append(pagesContainer, el);

                            ppp = pagesContainer.querySelectorAll('.pay-slip-page');

                            return el;
                        })()


                        if (nextPage) {
                            const fragment = document.createDocumentFragment();
                            const all =  ppp[ind].querySelectorAll('.pay-slip-container');
                            const last = all[all.length - 1];

                            append(fragment, last);

                            prepend(nextPage, fragment);

                            initPages(ppp, ind + 1);
                        }
                    }
                }
            }

            initPages(pages, 0);

            const downloadBaby = async function (e) {
                e.preventDefault();
                var doc = new jsPDF('p','mm');

                const createPages = Promise.all([...pages].map(async (page, i) => {
                    return html2canvas(header, {
                        useCORS: true,
                        allowTaint: true,
                        width: prepWidth,
                        height: prepHeight,
                    }).then((canvas) => {
                        const imgData = canvas.toDataURL(
                            'image/png');
                        const imgProps= doc.getImageProperties(imgData);
                        const pdfWidth = doc.internal.pageSize.getWidth();
                        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                        doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

                        return pdfHeight;
                    }).then((height) => {
                        return html2canvas(page, {
                            useCORS: true,
                            allowTaint: true,
                            width: prepWidth,
                        }).then((canvas) => {
                            const imgData = canvas.toDataURL(
                                'image/png');
                            const imgProps= doc.getImageProperties(imgData);
                            const pdfWidth = doc.internal.pageSize.getWidth();
                            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                            if (i !== 0) {
                                doc.addPage('p','mm');
                            }

                            doc.addImage(imgData, 'PNG', 0, i === 0 ? height : 5, pdfWidth, pdfHeight);

                            return pdfHeight;
                        })
                    })
                }))

                createPages.then(() => doc.save('download.pdf'));
            };


            form.addEventListener('submit', downloadBaby)

        })
    }
}