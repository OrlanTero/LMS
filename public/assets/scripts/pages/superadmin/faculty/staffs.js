import {
    addHtml, GetComboValue,
    ListenToForm,
    ManageComboBoxes
} from "../../../modules/component/Tool.js";
import Popup from "../../../classes/components/Popup.js";
import {TableListener} from "../../../classes/components/TableListener.js";
import {
    AddRecord, EditRecord,
    RemoveRecordsBatch,
    SearchRecords,
    UpdateRecords
} from "../../../modules/app/SystemFunctions.js";
import {NewNotification, NotificationType} from "../../../classes/components/NotificationPopup.js";
import AlertPopup, {AlertTypes} from "../../../classes/components/AlertPopup.js";
import {SelectModel, SelectSomething} from "../../../modules/app/Administrator.js";


const TARGET = "staffs";
const MINI_TARGET = "staff";
const MAIN_TITLE = "Staff";

function UpdateTable(TABLE_HTML) {
    const TABLE_BODY = document.querySelector(".main-table-body");

    addHtml(TABLE_BODY, TABLE_HTML);
    ManageTable();
}

function UpdateData() {
    return UpdateRecords(TARGET).then((HTML) => UpdateTable(HTML));
}

function DeleteRequests(ids) {
    const popup = new AlertPopup({
        primary: `Delete ${MAIN_TITLE}?`,
        secondary: `${ids.length} selected`,
        message: `Deleting these ${MAIN_TITLE.toLowerCase()}, cant be undone!`
    }, {
        alert_type: AlertTypes.YES_NO,
    });

    popup.AddListeners({
        onYes: () => {
            RemoveRecordsBatch(TARGET, {data: JSON.stringify(ids)}).then((res) => {
                NewNotification({
                    title: res.code === 200 ? 'Success' : 'Failed',
                    message: res.code === 200 ? 'Successfully Deleted Data' : 'Task Failed to perform!'
                }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR)

                UpdateData();
            })
        }
    })

    popup.Create().then(() => { popup.Show() })
}

function ViewRequest(id) {
    const popup = new Popup(`${TARGET}/view_${MINI_TARGET}`, {id}, {
        backgroundDismiss: false,
    });

    popup.Create().then(((pop) => {
        popup.Show();

        const form = pop.ELEMENT.querySelector("form.form-control");
        const main_course_id = pop.ELEMENT.querySelector(".department_id");

        ListenToForm(form, function (data) {
            data.department_id = GetComboValue(main_course_id).value

            EditRecord(TARGET, {id, data: JSON.stringify(data)}).then((res) => {
                popup.Remove();

                NewNotification({
                    title: res.code === 200 ? 'Success' : 'Failed',
                    message: res.code === 200 ? 'Successfully Edited' : 'Task Failed to perform!'
                }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR)

                UpdateData()
            })
        })

        ManageComboBoxes()
    }))
}

function AddRequest() {
    const body= document.querySelector(".main-table-body");
    const user_type = body.getAttribute("data-user-type");

    const popup = new Popup(`${TARGET}/add_new_${MINI_TARGET}`, {user_type}, {
        backgroundDismiss: false,
    });

    popup.Create().then(((pop) => {
        popup.Show();

        const form = pop.ELEMENT.querySelector("form.form-control");
        const select = pop.ELEMENT.querySelector(".select-faculty");
        const selectInput = pop.ELEMENT.querySelector("input[name=user_id]");
        const main_course_id = pop.ELEMENT.querySelector(".department_id");

        let selected_user;

        ListenToForm(form, function (data) {
            data.user_id = selected_user.user_id;
            data.department_id = GetComboValue(main_course_id).value

            AddRecord(TARGET, {data: JSON.stringify(data)}).then((res) => {
                popup.Remove();

                NewNotification({
                    title: res.code === 200 ? 'Success' : 'Failed',
                    message: res.code === 200 ? 'Successfully Added' : 'Task Failed to perform!'
                }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR)

                UpdateData()
            })
        })

        select.addEventListener("click", function() {
            SelectSomething(`${TARGET}/select_faculty`, "users", "USER_CONTROL", null, true).then(user => {
                selected_user = user;
                selectInput.value = user.displayName;
            });
        })

        ManageComboBoxes()
    }))
}


function ManageTable() {
    const TABLE = document.querySelector(".main-table-container.table-component");

    if (!TABLE) return;

    const TABLE_LISTENER = new TableListener(TABLE);

    TABLE_LISTENER.addListeners({
        none: {
            remove: ["delete-request", "view-request", "view-schedule-request"],
            view: ["add-request"],
        },
        select: {
            view: ["delete-request", "view-request", "view-schedule-request"],
        },
        selects: {
            view: ["delete-request"],
            remove: ["view-request", "view-schedule-request"]
        },
    });

    TABLE_LISTENER.init();

    TABLE_LISTENER.listen(() => {
        TABLE_LISTENER.addButtonListener([
            {
                name: "add-request",
                action: AddRequest,
                single: true
            },
            {
                name: "view-request",
                action: ViewRequest,
                single: true
            },
            {
                name: "delete-request",
                action: DeleteRequests,
                single: false
            },
        ]);
    });
}

function Search(toSearch, filter) {
    SearchRecords(TARGET, toSearch, filter).then((HTML) => UpdateTable(HTML));
}

function ManageSearchEngine() {
    const searchEngine = document.querySelector(".search-engine input[name=search-records]");
    const body = document.querySelector(".main-table-body");
    const user_type = body.getAttribute("data-users-type");

    searchEngine.addEventListener("input", () => {
        Search(searchEngine.value, JSON.stringify({user_type}))
    })
}

function ManageButtons() {

}

function Init() {
    ManageSearchEngine();
    ManageTable();
    ManageButtons();
}

document.addEventListener("DOMContentLoaded", Init);