import {ExecuteFn} from "../../modules/component/Tool.js";

export class PINCodeEditor {
    constructor(parent) {
        this.parent = parent;
        this.elements = this.getElements();
        this.pin = null;
        this.listeners = {};
    }

    getElements() {
        const parent = this.parent;

        return {
            items: [...parent.querySelectorAll(".pin-code-item")],
            input: parent.querySelector("input[name=pin-code]")
        };
    }

    addListeners(listeners) {
        this.listeners = listeners;
    }

    listens() {
        let obj = this;
        let i = 0;
        for (const item of this.elements.items) {
            let index = i;

            item.addEventListener("input", function () {
                if (item.innerText.length === 1) {
                    obj.pin = obj.getPIN();
                    obj.focusItem(index + 1);
                } else if (item.innerText.length > 1) {
                    item.querySelector(".text").innerText = item.innerText.charAt(0);
                    obj.focusItem(index + 1);
                } else if (item.innerText.length === 0) {
                    if (index !== 0 && obj.elements.items[index - 1].innerText.trim().length === 0) {
                        obj.focusItem(index - 1);
                    }
                }

                ExecuteFn(obj.listeners, 'onChange', obj.pin);
            })

            item.addEventListener("keydown", function (e) {
                if(e.keyCode === 8) {
                    if (item.innerText.length === 1) {
                        item.querySelector('.text').innerText = "";

                        obj.pin = obj.getPIN();
                    } else {
                        obj.focusItem(index - 1);
                    }

                    ExecuteFn(obj.listeners, 'onChange', obj.pin);
                }
            });

            item.addEventListener("click", function () {
                obj.focusToAvailable();
            })

            i++;
        }

        obj.focusItem(0);
    }

    focusToAvailable() {
        let i = 0;

        for (const item of this.elements.items) {

            if (item.innerText.trim().length === 0) {

                this.focusItem(i);

                return;
            }

            i++;
        }

        this.focusItem(this.elements.items.length - 1);

    }

    getPIN() {
        let PINNN = "";

        for (const item of this.elements.items) {
            PINNN += item.innerText.trim();
        }

        this.elements.input.value = PINNN;

        return PINNN;
    }

    focusItem(i) {
        for (let ii = 0; ii < this.elements.items.length; ii++) {
            if (i === ii) {
                this.elements.items[ii].querySelector('.text').setAttribute("contenteditable", true);
                this.elements.items[ii].querySelector('.text').focus();
            } else {
                this.elements.items[ii].querySelector('.text').setAttribute("contenteditable", false);
            }
        }
    }

    shake() {

    }

    reset() {
        for (let ii = 0; ii < this.elements.items.length; ii++) {
            this.elements.items[ii].querySelector('.text').innerText = "";
        }

        this.focusToAvailable();
    }
}

export default PINCodeEditor;