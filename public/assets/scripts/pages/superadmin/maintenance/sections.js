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


const TARGET = "sections";
const MINI_TARGET = "section";
const MAIN_TITLE = "Section";

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

function ManageStudentsTable(popup, students, update) {
    const TABLE = popup.ELEMENT.querySelector(".main-table-container.table-component");

    if (!TABLE) return;

    const TABLE_LISTENER = new TableListener(TABLE);

    let ALLSTUDENTS = students;

    const _Add = () => {
        const popup = new Popup("sections/add_new_student", null, {
            backgroundDismiss: false,
        });

        popup.Create().then((p) => {
            popup.Show();

            const form = p.ELEMENT.querySelector("form.form-control");
            let student = p.ELEMENT.querySelector(".select-student");
            let studentInput = p.ELEMENT.querySelector("input[name=student_id]");
            let selectedStudents;

            const check = ListenToForm(form, function () {
                popup.Remove();

                selectedStudents.forEach((student) => {
                    TABLE_LISTENER.insertItem(ALLSTUDENTS.length + 1, [ALLSTUDENTS.length + 1, student.user_id, student.no, student.displayName]);

                    ALLSTUDENTS.push({student_id: student.user_id, status: 'created'});
                })

                update(ALLSTUDENTS);
            })

            student.addEventListener("click", function() {
                SelectSomething("students/select_student", "users", "STUDENT_CONTROL", null, false).then((students) => {
                    selectedStudents = students;
                    studentInput.value = students.map(student => student.displayName).join(",");
                    check(true);
                })
            });

            ManageComboBoxes();
        })
    }

    const _Del = (id) => {
        TABLE_LISTENER.removeItem(id);

        ALLSTUDENTS = ALLSTUDENTS.map((b) => {
            if (b.id === id) {
                if (b.status === 'created') {
                    return false;
                } else {
                    return  {...b, status: 'deleted'}
                }
            }
            return b;
        }).filter(b => b);

        update(ALLSTUDENTS);
    }

    const _Edit = (id) => {
        const popup = new Popup("users/view_user", {id}, {
            backgroundDismiss: false,
        });

        popup.Create().then(async (p) => {
            popup.Show();

            const form = p.ELEMENT.querySelector("form.form-control");
            let employee = p.ELEMENT.querySelector(".select-employee");
            let employeeInput = p.ELEMENT.querySelector("input[name=employee]");
            let selectedEmployee = await GetEmployee(employee.getAttribute("data-current"));

            ListenToForm(form, function (data) {
                popup.Remove();

                TABLE_LISTENER.updateItem(id, [id, data.student_id, data.type, data.name]);
                //
                data['employee_id'] = selectedEmployee.employee_id;
                //
                delete data['employee'];

                ALLSTUDENTS = ALLSTUDENTS.map((b) => {
                    if (b.id === id) {
                        return {...data, id,  status: b.status === 'current' ? 'edited' : 'created'};
                    }

                    return b;
                });

                update(ALLSTUDENTS);

                // beneficiaries.push(data);
            })

            employee.addEventListener("click", function() {
                SelectEmployee().then((employ) => {
                    selectedEmployee = employ;
                    employeeInput.value = employ.name;
                })
            });

            ManageComboBoxes();
        })
    }

    const PlaceCurrents = () => {
        for (const el of TABLE_LISTENER.elements.items) {
            const id = el.getAttribute("data-id");

            ALLSTUDENTS.push({id, status: 'current'});
        }

        update(ALLSTUDENTS);
    }

    TABLE_LISTENER.addListeners({
        none: {
            remove: ["delete-request", "view-request", "edit-request"],
            view: ["add-request"],
        },
        select: {
            view: ["delete-request", "view-request", "edit-request"],
        },
        selects: {
            view: ["delete-request"],
            remove: ["view-request", "edit-request"]
        },
    });

    TABLE_LISTENER.init();

    TABLE_LISTENER.listen(() => {
        TABLE_LISTENER.addButtonListener([
            {
                name: "add-request",
                action: _Add,
                single: true
            },
            {
                name: "delete-request",
                action: _Del,
                single: true
            },
            {
                name: "edit-request",
                action: _Edit,
                single: true
            },
        ]);
    });

    PlaceCurrents();
}
function ViewRequest(id) {
    const popup = new Popup(`${TARGET}/view_${MINI_TARGET}`, {id}, {
        backgroundDismiss: false,
    });

    popup.Create().then(((pop) => {
        popup.Show();

        const form = pop.ELEMENT.querySelector("form.form-control");
        const select = pop.ELEMENT.querySelector(".select-professor");
        const selectInput = pop.ELEMENT.querySelector("input[name=adviser_id]");
        const course_id = pop.ELEMENT.querySelector(".course_id");
        const semester = pop.ELEMENT.querySelector(".semester");
        const year_level = pop.ELEMENT.querySelector(".year_level");

        let selected_user;
        let students = [];

        ListenToForm(form, function (data) {
            data.course_id = GetComboValue(course_id).value;
            data.semester = GetComboValue(semester).value;
            data.year_level = GetComboValue(year_level).value;

            EditRecord(TARGET, {data: JSON.stringify({id, data, students})}).then((res) => {
                popup.Remove();

                NewNotification({
                    title: res.code === 200 ? 'Success' : 'Failed',
                    message: res.code === 200 ? 'Successfully Updated Data' : 'Task Failed to perform!'
                }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR)

            })
        })

        select.addEventListener("click", function() {
            SelectSomething(`professors/select_professors`, "professors", "PROFESSOR_CONTROL", null, true).then(user => {
                selected_user = user;
                selectInput.value = user.professor_id;
            });
        })

        ManageStudentsTable(pop, students, (up) => {
            students = up;
        });

        ManageComboBoxes()
    }))
}

function AddRequest() {
    const body= document.querySelector(".main-table-body");
    const user_type = body.getAttribute("data-user-type");

    const popup = new Popup(`${TARGET}/add_new_${MINI_TARGET}`, null, {
        backgroundDismiss: false,
    });

    popup.Create().then(((pop) => {
        popup.Show();

        const form = pop.ELEMENT.querySelector("form.form-control");
        const select = pop.ELEMENT.querySelector(".select-professor");
        const selectInput = pop.ELEMENT.querySelector("input[name=adviser_id]");
        const course_id = pop.ELEMENT.querySelector(".course_id");
        const semester = pop.ELEMENT.querySelector(".semester");
        const year_level = pop.ELEMENT.querySelector(".year_level");

        let selected_user;

        ListenToForm(form, function (data) {
            data.course_id = GetComboValue(course_id).value;
            data.semester = GetComboValue(semester).value;
            data.year_level = GetComboValue(year_level).value;

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
            SelectSomething(`professors/select_professors`, "professors", "PROFESSOR_CONTROL", null, true).then(user => {
                selected_user = user;
                selectInput.value = user.professor_id;
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