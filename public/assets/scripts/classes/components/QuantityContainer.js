import {CreateElement, ListenToThisQuantityContainer} from "../../modules/component/Tool.js";

export class QuantityContainer {
    constructor(minimum, maximum) {
        this.minimum = minimum;
        this.maximum = maximum;
        this.element = this.create();
        this.callback = null;
    }

    listen(callback) {
        this.callback = callback;

        ListenToThisQuantityContainer(this.element, callback, {minimum: this.minimum, maximum: this.maximum});
    }

    create() {
        const obj = this;
        return CreateElement({
            el:"DIV",
            className: "quantity-container",
            childs: [
                CreateElement({
                    el: "DIV",
                    className: ["icon-button", "left"],
                    child: CreateElement({
                        el: "DIV",
                        className: "icon",
                        html: `<svg width="256px" height="256px" viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg">
                                              <path d="M160,212a3.98805,3.98805,0,0,1-2.82861-1.17163l-80-80a4,4,0,0,1,0-5.65674l80-80a4.00009,4.00009,0,0,1,5.65722,5.65674L85.65674,128l77.17187,77.17163A4,4,0,0,1,160,212Z"/>
                                            </svg>`
                    })
                }),
                CreateElement({
                    el: "DIV",
                    className: "text-input",
                    attr: {
                        contenteditable: true
                    },
                    html: 0,
                    listener: {
                        input: function (e) {
                            obj.callback &&  obj.callback(parseInt(e.target.innerText));
                        }
                    }
                }),
                CreateElement({
                    el: "DIV",
                    className: ["icon-button", "right"],
                    child: CreateElement({
                        el: "DIV",
                        className: "icon",
                        html: `<svg width="256px" height="256px" viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg">
                                                  <path d="M96,212a4,4,0,0,1-2.82861-6.82837L170.34326,128,93.17139,50.82837a4.00009,4.00009,0,0,1,5.65722-5.65674l80,80a4,4,0,0,1,0,5.65674l-80,80A3.98805,3.98805,0,0,1,96,212Z"/>
                                                </svg>`
                    })
                }),
            ]
        });
    }
}