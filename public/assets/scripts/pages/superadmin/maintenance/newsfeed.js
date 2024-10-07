import Popup from "../../../classes/components/Popup.js";
import {append, CreateElement} from "../../../modules/component/Tool.js";

const TARGET = "posts";
const MINI_TARGET = "post";
const MAIN_TITLE = "Post";

function ListenToDropZone(drop_zone, callback) {
    drop_zone.addEventListener("drop", dropHandler);
    drop_zone.addEventListener("dragover", dragOverHandler);

    function dragOverHandler(ev) {

        // Prevent default behavior (Prevent file from being opened)
        ev.preventDefault();
    }

    function dropHandler(ev) {

        ev.preventDefault();

        if (!ev.dataTransfer.items.length) return;

        const items = [...ev.dataTransfer.items].map((file) => file.getAsFile());

        callback(items);
    }
}


function CreateNewPost() {

    // console.log(Macy)
    const popup = new Popup(`${TARGET}/create_new_${MINI_TARGET}`, null, {
        backgroundDismiss: false,
    });

    popup.Create().then(((pop) => {
        popup.Show();

        const editor = popup.ELEMENT.querySelector("#editor");
        const drop_zone = popup.ELEMENT.querySelector("#drop_zone");
        const post_gallery = popup.ELEMENT.querySelector(".post-gallery");

        const wall = new Freewall(".gg-box");

        wall.fitWidth();

        ClassicEditor
            .create( editor )
            .catch( error => {
                console.error( error );
            } );

        ListenToDropZone(drop_zone, function (files) {
            files.forEach((file) => {
                append(gg, CreateElement({
                    el:"IMG",
                    attr: {
                        src: URL.createObjectURL(file)
                    }
                }))
            })

            wall.fitWidth();

        })

    }));
}

function Init() {
    const creator = document.querySelector(".post-creator-container");
    const creatorTextArea = creator.querySelector(".textarea-container");
    
    creatorTextArea.addEventListener("click", function () {
        CreateNewPost();
    })
}

document.addEventListener("DOMContentLoaded", Init);