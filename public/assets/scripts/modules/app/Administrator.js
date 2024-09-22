import {AddRecord, EditRecord, SearchRecords} from "./SystemFunctions.js";
import Popup from "../../classes/components/Popup.js";
import {addHtml, Ajax, GetComboValue, ListenToForm, ManageComboBoxes, ToData} from "../component/Tool.js";
import {TableListener} from "../../classes/components/TableListener.js";
import {NewNotification, NotificationType} from "../../classes/components/NotificationPopup.js";

export const AUTHENTICATION_TYPE = {
    STUDENT: 1,
    FACULTY: 2,
    ADMIN: 3,
    SUPER_ADMIN: 4
};

export function SetAuthentication(type, data) {
    return new Promise((resolve) => {
        Ajax({
            url: "/api/post/SetAuthentication",
            type: "POST",
            data: {type, data: JSON.stringify(data)},
            success: (res) => {
                try {
                    resolve(JSON.parse(res));
                } catch (e) {
                    resolve(null);
                }
            }
        })
    })
}

export function TryFinalAuthenticate(type, user_id, data, code) {
    return new Promise((resolve) => {
        Ajax({
            url: "/api/post/DoAuthenticate",
            type: "POST",
            data: {type, data: JSON.stringify(data), code, user_id},
            success: (res) => {
                try {
                    resolve(JSON.parse(res));
                } catch (e) {
                    resolve(null);
                }
            }
        })
    })
}

export function TryAuthenticate(type, data) {
    return new Promise((resolve) => {
        Ajax({
            url: "/api/post/TryAuthenticate",
            type: "POST",
            data: {type, data: JSON.stringify(data)},
            success: (res) => {
                try {
                    resolve(JSON.parse(res));
                } catch (e) {
                    resolve(null);
                }
            }
        })
    })
}

export function GetAvailableScheduleIn(data) {
    return new Promise((resolve) => {
        Ajax({
            url: "/api/post/GetAvailableScheduleIn",
            type: "POST",
            data: {data: JSON.stringify(data)},
            success: (res) => {
                try {
                    resolve(JSON.parse(res));
                } catch (e) {
                    resolve(null);
                }
            }
        })
    })
}

export function TryRegisterPatient(data) {
    return new Promise((resolve) => {
        Ajax({
            url: "/api/post/TryRegisterPatient",
            type: "POST",
            data: {data: JSON.stringify(data)},
            success: (res) => {
                console.log(res);
                try {
                    resolve(JSON.parse(res));
                } catch (e) {
                    resolve(null);
                }
            }
        })
    })
}

export function RequestPreviewPatient(id) {
    return new Promise((resolve) => {
        Ajax({
            url: `/components/popup/users/request_preview_patient`,
            type: "POST",
            data: ToData({patient_id: id}),
            success: (pop) => {
                resolve(pop);
            },
        });
    })
}

export function SelectModel(id, controller) {
    return new Promise((resolve) => {
        Ajax({
            url: "/api/post/SelectModel",
            type: "POST",
            data: {id, controller},
            success: (res) => {
                try {
                    resolve(JSON.parse(res));
                } catch (e) {
                    resolve(null);
                }
            }
        })
    })
}

export function SelectModels(controller, filter) {
    return new Promise((resolve) => {
        Ajax({
            url: "/api/post/SelectModels",
            type: "POST",
            data: {filter, controller},
            success: (res) => {
                try {
                    resolve(JSON.parse(res));
                } catch (e) {
                    resolve(null);
                }
            }
        })
    })
}

export function SendVerificationToEmail(user_id, email_address) {
    return new Promise((resolve) => {
        Ajax({
            url: "/api/post/SendVerificationToEmail",
            type: "POST",
            data: {email_address, user_id},
            success: (res) => {
                console.log(res);
                try {
                    resolve(JSON.parse(res));
                } catch (e) {
                    resolve(null);
                }
            }
        })
    })
}

export function ConfirmAuthenticationVerification(user_id, code) {
    return new Promise((resolve) => {
        Ajax({
            url: "/api/post/ConfirmAuthenticationVerification",
            type: "POST",
            data: {code, user_id},
            success: (res) => {
                try {
                    resolve(JSON.parse(res));
                } catch (e) {
                    resolve(null);
                }
            }
        })
    })
}
export function SelectSomething(popup_url, target, controller, data, single = false) {
    const popup = new Popup(popup_url, {data}, {
        backgroundDismiss: false,
    });

    return new Promise((resolve) => {
        const SelectRequest = (ids) => {
            if (single) {
                SelectModel(ids, controller).then((res) => resolve(res)).finally(() => popup.Remove());
            } else {
                Promise.all(ids.map((id) => SelectModel(id, controller))).then((res) => resolve(res)).finally(() => {
                    popup.Remove();
                });
            }
        }

        function Search(toSearch, filter) {
            SearchRecords(target, toSearch, filter).then((HTML) => UpdateTable(HTML));
        }

        function UpdateTable(TABLE_HTML) {
            const TABLE_BODY = popup.ELEMENT.querySelector(".main-table-body");

            addHtml(TABLE_BODY, TABLE_HTML);

            ManageTable();
        }

        function ManageTable() {
            const TABLE = popup.ELEMENT.querySelector(".main-table-container.table-component");

            const TABLE_LISTENER = new TableListener(TABLE);

            TABLE_LISTENER.singularSelection = false;

            TABLE_LISTENER.addListeners({
                none: {
                    view: [],
                    remove: ["select-request"],
                },

                select: {
                    view: ["select-request"],
                },
                selects: {
                    view: ["select-request"],
                    remove:  [],
                },
            })
            
            if (single) {
                TABLE_LISTENER.singularSelection = true;
            }

            TABLE_LISTENER.init();

            TABLE_LISTENER.listen(() => {
                TABLE_LISTENER.addButtonListener([
                    {
                        name: "select-request",
                        action: SelectRequest,
                        single: false
                    },
                ]);
            });
        }

        popup.Create().then((pop) => {
            popup.Show();

            ManageTable();

            const searchEngine = popup.ELEMENT.querySelector(".search-engine input[name=search-records]");

            searchEngine.addEventListener("input", () => {
                Search(searchEngine.value)
            })
        })
    })
}

export function RequestLeave(sessionID, {month, day, year}) {
    const dd  = new Date(year, month, day);

    const popup = new Popup(`schedules/request_leave`, {date: dd.toISOString()}, {
        backgroundDismiss: false,
    });

    popup.Create().then(() => {
        popup.Show();

        const form = popup.ELEMENT.querySelector("form.form-control");

        ListenToForm(form,function (data) {
            data['doctor_id'] = sessionID;

            AddRecord("leave_requests", {data: JSON.stringify(data)}).then((res) => {
                popup.Remove();

                NewNotification({
                    title: res.code === 200 ? 'Success' : 'Failed',
                    message: res.code === 200 ? 'Successfully Added' : 'Task Failed to perform!'
                }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR)
            })
        })
    })
}