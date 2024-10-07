import {addHtml, Ajax} from "../../../modules/component/Tool.js";
import {SelectModel} from "../../../modules/app/Administrator.js";

const content = document.querySelector(".main-content");

function GetClassContent(id) {
    return new Promise((resolve) => {
        Ajax({
            url: "/components/popup/classes/getClassContent",
            type: "POST",
            data: {id},
            success: (res) => {

              resolve(res);
            }
        })
    })
}

function Init() {
    const cards = document.querySelectorAll(".cards-flex-container .card-flex-container");

    for (const card of cards) {
        card.addEventListener("click", function () {
            GetClassContent(card.getAttribute("data-id")).then((res) => {
                addHtml(content, res);
            })
        })
    }
}

document.addEventListener("DOMContentLoaded", Init);