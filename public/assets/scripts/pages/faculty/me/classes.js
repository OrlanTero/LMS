import {
    addHtml, 
    Ajax, 
    ListenToForm, 
    ManageComboBoxes, 
    ListenToCombo, 
    AddNewComboItem, 
    SetComboValue, 
    GetComboValue, 
    MakeID, 
    SetNewComboItems
} from "../../../modules/component/Tool.js";
import Popup from "../../../classes/components/Popup.js";
import {AddRecord, PostRequest, UploadFileFromFile} from "../../../modules/app/SystemFunctions.js";
import {SelectModels, SelectModel, SelectModelByFilter} from "../../../modules/app/Administrator.js";
import GradingPlatformEditor from "../../../classes/components/GradingPlatformEditor.js";
import StickyNoteEditor from "../../../classes/components/StickyNoteEditor.js";

// Handle creating new exam
function NewExam(section_id) {
    return new Promise((resolve) => {
        const popup = new Popup(`${"exams"}/add_new_exams`, {section_id}, {
            backgroundDismiss: false
        });

        popup.Create().then(() => {
            popup.Show();

            const form = popup.ELEMENT.querySelector("form");
            const section_subject_id = form.querySelector(".section_subject_id");

            ListenToForm(form, (data) => {
                UploadFileFromFile(data.file, data.file.name, "public/assets/media/uploads/exams/").then((res) => {
                    if (res.code === 200) {
                        data.file = res.body.path;
                        data.section_id = section_id;
                        data.section_subject_id = GetComboValue(section_subject_id).value;

                        popup.Remove();

                        AddRecord("exams", {data: JSON.stringify(data)}).then((res) => {
                            popup.Remove();
                            resolve(res);
                        });
                    }
                });
            }, ['description']);

            ManageComboBoxes();
        });
    });
}

// Handle exam functionality
function Exams() {
    const addExamBtn = document.querySelector(".add-exam-btn");
    if (addExamBtn) {
        addExamBtn.addEventListener("click", () => {
            NewExam(addExamBtn.dataset.section_id);
        });
    }
}

// Handle grades functionality
function Grades() {
    const menuItems = document.querySelectorAll('.grades-menu li');
    const gradeContainers = document.querySelectorAll('.subject-grades');
    
    // Handle menu item clicks
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(i => i.classList.remove('active'));
            gradeContainers.forEach(c => c.classList.remove('active'));
            
            item.classList.add('active');
            const subject = item.dataset.subject;
            document.querySelector(`.subject-grades[data-subject="${subject}"]`).classList.add('active');
        });
    });

    // Initialize grading platforms
    gradeContainers.forEach(container => {
        const platformContainer = container.querySelector('.grading-platform-container');
        if (!platformContainer) return;

        const saveBtn = container.querySelector('.save-grades');
        const discardBtn = container.querySelector('.discard-grades');
        const sectionSubjectId = platformContainer.dataset.sectionSubjectId;
        
        SelectModel(sectionSubjectId, "SECTION_SUBJECT_CONTROL").then((res) => {
            SelectModelByFilter(JSON.stringify({section_id: res.section_id}), "SECTION_STUDENT_CONTROL")
                .then((students) => {
                    const gradingEditor = new GradingPlatformEditor({
                        container: platformContainer,
                        students: students.map(student => ({
                            user_id: student.user_id,
                            displayName: student.displayName
                        })),
                        buttons: {save: saveBtn, discard: discardBtn}
                    });
                
                    gradingEditor.Load(sectionSubjectId);
                });
        });
    });
}

// Handle creating new activity
function NewActivity(section_id, professor_id) {    
    return new Promise((resolve) => {
        const popup = new Popup(`${"activities"}/add_new_activity`, {section_id, professor_id}, {
            backgroundDismiss: false
        });

        popup.Create().then(() => {
            popup.Show();

            const form = popup.ELEMENT.querySelector("form");
            const section_subject_id = form.querySelector(".section_subject_id");

            ListenToForm(form, async (data) => {
                popup.Remove();

                const uploadResult = await new Promise((resolve) => {
                    if (data.file.name) {
                        UploadFileFromFile(data.file, data.file.name, "public/assets/media/uploads/activities/")
                            .then(resolve);
                    } else {
                        resolve({code: 300, body: {path: null}});
                    }
                });

                if (uploadResult.code === 200) {
                    data.file = uploadResult.body.path;
                } else {
                    delete data.file;
                }

                if (!data.due_date) {
                    delete data.due_date;
                }

                data.section_subject_id = GetComboValue(section_subject_id).value;
            
                AddRecord("activities", {data: JSON.stringify(data)}).then(() => {
                    popup.Remove();
                });
            }, ['description', 'due_date', 'file']);

            ManageComboBoxes();
        });
    });
}

// Handle activities functionality
function Activities() {
    const addActivityBtn = document.querySelector(".add-activity-btn");
    if (addActivityBtn) {
        addActivityBtn.addEventListener("click", () => {
            NewActivity(addActivityBtn.dataset.section_id, addActivityBtn.dataset.professor_id);
        });
    }
}

// Handle creating new resource group
function NewResourceGroup() {
    return new Promise((resolve) => {
        const popup = new Popup(`${"resources"}/add_new_resource_group`, null, {
            backgroundDismiss: false
        });

        popup.Create().then(() => {
            popup.Show();
            const form = popup.ELEMENT.querySelector("form");

            ListenToForm(form, (data) => {
                popup.Remove();
                resolve(data);
            }, ['description']);
        });
    });
}

// Handle creating new resource
function NewResource(section_id, professor_id) {
    return new Promise((resolve) => {
        const popup = new Popup(`${"resources"}/add_new_resource`, {section_id, professor_id}, {
            backgroundDismiss: false
        });
    
        popup.Create().then(() => {
            popup.Show();

            const form = popup.ELEMENT.querySelector("form");
            const group_id = form.querySelector(".group_id");
            const section_subject_id = form.querySelector(".section_subject_id");
            const createdGroups = {};

            ListenToForm(form, (data) => {
                const group_id_value = GetComboValue(group_id);

                if (group_id_value.value) {
                    data.group_id = createdGroups[group_id_value.value] || group_id_value.value;
                } else {
                    delete data.group_id;
                }

                data.section_id = section_id;
                data.section_subject_id = GetComboValue(section_subject_id).value;

                AddRecord(TARGET, {data: JSON.stringify(data), file: data.file}).then(() => {
                    popup.Remove();
                });
            }, ['description', 'group_id']);

            ListenToCombo(section_subject_id, () => {
                SelectModels("RESOURCES_GROUP_CONTROL", {
                    section_id,
                    section_subject_id: GetComboValue(section_subject_id).value
                }).then((groups) => {
                    SetNewComboItems(group_id, [
                        {value: "0", text: "Create New Group"},
                        ...groups.map(group => ({
                            value: group.resources_group_id,
                            text: group.title
                        }))
                    ], (value) => {
                        if (value === 0) {
                            NewResourceGroup().then((res) => {
                                const id = MakeID(10);
                                AddNewComboItem(group_id, res.resource_group_id, res.title);
                                SetComboValue(group_id, res.title, id);
                                ManageComboBoxes();
                                createdGroups[id] = res;
                            });
                        }
                    });
                });
            });

            ManageComboBoxes();
        });
    });
}

// Handle downloading resource
function DownloadResource(id) {
    return PostRequest("DownloadResource", {id});
}

// Handle downloading resource group
function DownloadResourceGroup(id) {
    return PostRequest("DownloadResourceGroup", {id});
}

// Handle resources functionality
function Resources() {
    const resourcesMenu = document.querySelector('.resources-menu');
    const accordionItems = document.querySelectorAll('.accordion-item');
    const uploadResourceBtn = document.querySelector('.upload-resource-btn');

    if (uploadResourceBtn) {
        uploadResourceBtn.addEventListener("click", () => {
            NewResource(uploadResourceBtn.dataset.section_id, uploadResourceBtn.dataset.professor_id);
        });
    }

    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        const content = item.querySelector('.accordion-content');
        const resourceItems = item.querySelectorAll('.resource-item');
        const downloadResourceGroupBtn = item.querySelector('.download-resource-group-btn');

        // Handle downloading resource group
        downloadResourceGroupBtn.addEventListener('click', () => {
            DownloadResourceGroup(item.dataset.id).then((res) => {
                res = JSON.parse(res);
                const binaryStr = atob(res.body);
                const bytes = new Uint8Array(binaryStr.length);
                for (let i = 0; i < binaryStr.length; i++) {
                    bytes[i] = binaryStr.charCodeAt(i);
                }

                JSZip.loadAsync(bytes)
                    .then(zip => zip.generateAsync({type: "blob"}))
                    .then(content => saveAs(content, `${item.dataset.title}.zip`));
            });
        });

        // Handle downloading individual resources
        resourceItems.forEach(resourceItem => {
            const downloadBtn = resourceItem.querySelector('.download-resource-btn');
            downloadBtn.addEventListener('click', () => {
                DownloadResource(resourceItem.dataset.id).then((res) => {
                    res = JSON.parse(res);
                    const binaryStr = atob(res.body);
                    const bytes = new Uint8Array(binaryStr.length);
                    for (let i = 0; i < binaryStr.length; i++) {
                        bytes[i] = binaryStr.charCodeAt(i);
                    }

                    JSZip.loadAsync(bytes)
                        .then(zip => zip.generateAsync({type: "blob"}))
                        .then(content => saveAs(content, `${resourceItem.dataset.title}.zip`));
                });
            });
        });

        // Handle accordion functionality
        header.addEventListener('click', () => {
            accordionItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.accordion-content').style.display = 'none';
                }
            });

            item.classList.toggle('active');
            content.style.display = item.classList.contains('active') ? 'block' : 'none';
        });
    });

    // Handle resources menu
    resourcesMenu.addEventListener('click', (e) => {
        if (e.target.classList.contains('subject-tab')) {
            const subject = e.target.dataset.subject;
            document.querySelectorAll('.subject-tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.subject-resources').forEach(resource => resource.classList.remove('active'));
            
            e.target.classList.add('active');
            document.querySelector(`.subject-resources[data-subject="${subject}"]`).classList.add('active');
        }
    });
}

// Handle sticky notes functionality
function StickyNotes() {
    const container = document.querySelector('.sticky-note-editor-container');
    const user_id = container.dataset.user_id;
    const section_id = container.dataset.section_id;
    const professor_id = container.dataset.professor_id;
    
    SelectModel(user_id, "USER_CONTROL").then((user) => {
        const stickyNoteEditor = new StickyNoteEditor({container, user});
        stickyNoteEditor.Load(section_id, professor_id);
    });
}

// Handle cards functionality
function Cards() {
    const cards = document.querySelectorAll(".cards-flex-container .card-flex-container");
    const content = document.querySelector(".main-content");

    function GetClassContent(id, professor_id) {
        return new Promise((resolve) => {
            Ajax({
                url: "/components/popup/classes/getClassContent",
                type: "POST",
                data: {id, professor_id},
                success: resolve
            });
        });
    }

    cards.forEach(card => {
        card.addEventListener("click", () => {
            GetClassContent(card.dataset.id, card.dataset.professor_id).then((res) => {
                addHtml(content, res);
                Tabs();
                Resources();
                Activities();
                Exams();
                Grades();
                StickyNotes();
            });
        });
    });
}

// Handle tabs functionality
function Tabs() {
    const tabItems = document.querySelectorAll('.tab-item');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const topicHeaders = document.querySelectorAll('.topic-header');
    
    topicHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const resources = header.nextElementSibling;
            resources.style.display = resources.style.display === 'none' ? 'block' : 'none';
        });
    });

    tabItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            tabItems.forEach(tab => tab.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            this.classList.add('active');
            const targetTab = document.getElementById(tabId);
            if (targetTab) {
                targetTab.classList.add('active');
            }
        });
    });
}

// Initialize application
function Init() {
    Cards();
}

document.addEventListener('DOMContentLoaded', Init);