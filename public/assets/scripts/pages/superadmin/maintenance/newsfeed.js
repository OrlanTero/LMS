import Popup from "../../../classes/components/Popup.js";
import {
    append,
    CreateElement,
    GetComboValue,
    ListenToForm,
    MakeID,
    ManageComboBoxes
} from "../../../modules/component/Tool.js";
import {AddRecord, UploadFileFromFile} from "../../../modules/app/SystemFunctions.js";
import {NewNotification, NotificationType} from "../../../classes/components/NotificationPopup.js";

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

function PublishPost(data) {
    return new Promise((resolve) => {
        AddRecord(TARGET, {data: JSON.stringify(data)}).then((res) => {
            NewNotification({
                title: res.code === 200 ? 'Success' : 'Failed',
                message: res.code === 200 ? 'Successfully Added' : 'Task Failed to perform!'
            }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR)
        })
    })
}

function PublishAnnouncement(data) {
    return new Promise((resolve) => {
        AddRecord("announcements", {data: JSON.stringify(data)}).then((res) => {
            console.log(data)
            NewNotification({
                title: res.code === 200 ? 'Success' : 'Failed',
                message: res.code === 200 ? 'Successfully Added' : 'Task Failed to perform!'
            }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR)
        })
    })
}

function PublishEvent(data) {
    return new Promise((resolve) => {
        AddRecord("events", {data: JSON.stringify(data)}).then((res) => {
            console.log(res);
            NewNotification({
                title: res.code === 200 ? 'Success' : 'Failed',
                message: res.code === 200 ? 'Successfully Added' : 'Task Failed to perform!'
            }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR)
        })
    })
}

function CreateNewPost() {
    const popup = new Popup(`${TARGET}/create_new_${MINI_TARGET}`, null, {
        backgroundDismiss: false,
    });

    popup.Create().then(((pop) => {
        popup.Show();

        const editor = popup.ELEMENT.querySelector("#editor");
        const drop_zone = popup.ELEMENT.querySelector("#drop_zone");
        const post_gallery = popup.ELEMENT.querySelector(".post-gallery");
        const form = popup.ELEMENT.querySelector("form.form-control");
        const post_type = popup.ELEMENT.querySelector(".post_type");

        const sp = new Splide(post_gallery);

        const uploadedFiles = [];

        sp.mount();

        ClassicEditor
            .create( editor )
            .catch( error => {
                console.error( error );
            } );

        ListenToDropZone(drop_zone, function (files) {

            if (!post_gallery.classList.contains("show")) {
                post_gallery.classList.add("show");
            }

            files.forEach((file) => {
                sp.add(CreateElement({
                    el:"IMG",
                    className:"splide__slide",
                    attr: {
                        src: URL.createObjectURL(file)
                    }
                }))

                uploadedFiles.push(file);
            });
        })
        
        ListenToForm(form, function (data) {
            return new Promise((resolve, reject) => {
                if (uploadedFiles.length > 0) {
                    Promise.all([...uploadedFiles].map(async (file) => {
                        return await UploadFileFromFile(file, MakeID(), "public/assets/media/uploads/").then((res) => res.body.path);
                    })).then((fff) => {
                        return PublishPost({
                            content: data.content,
                            post_type: post_type ? GetComboValue(post_type).value : 2,
                            files: fff
                        }).then(resolve).finally(() => popup.Remove());
                    })   
                } else {
                    PublishPost({
                        content: data.content,
                        post_type: post_type ? GetComboValue(post_type).value : 2,
                    }).then(resolve).finally(() => popup.Remove());
                }
            })
        })

        ManageComboBoxes();
    }));
}

function CreateNewEvent() {
    const popup = new Popup(`events/add_new_event`, null, {
        backgroundDismiss: false,
    });

    popup.Create().then(((pop) => {
        popup.Show();

        const editor = popup.ELEMENT.querySelector("#editor");
        const form = popup.ELEMENT.querySelector("form.form-control");

        ClassicEditor
            .create( editor )
            .catch( error => {
                console.error( error );
            } );

        ListenToForm(form, function (data) {
            new Promise((resolve) => {
                if (data.poster.name) {
                    UploadFileFromFile(data.poster, MakeID(), "public/assets/media/uploads/").then((res) => {
                        data.poster = res.body.path;

                        resolve();
                    })
                } else {
                    delete data.poster;

                    resolve();
                }

            }).then(() => {
                PublishEvent(data).then(() => popup.Remove());
            })
        }, ['poster'])
    }))
}

function CreateNewAnnouncement() {
    const popup = new Popup(`announcement/add_new_announcement`, null, {
        backgroundDismiss: false,
    });

    popup.Create().then(((pop) => {
        popup.Show();

        const editor = popup.ELEMENT.querySelector("#editor");
        const form = popup.ELEMENT.querySelector("form.form-control");

        ClassicEditor
            .create( editor )
            .catch( error => {
                console.error( error );
            } );

        ListenToForm(form, function (data) {
            PublishAnnouncement(data).then(() => popup.Remove());
        })
    }));
}

function LikeAPost(post_id) {
    return new Promise((resolve) => {
        AddRecord("post_likes", {data: JSON.stringify({post_id})}).then(resolve);
    })
}

function CreateNewComment(post_id, comment) {
    return new Promise((resolve) => {
        AddRecord("post_comments", {data: JSON.stringify({post_id, comment})}).then(resolve);
    })
}

function ManageAllPosts() {
    const posts = document.querySelectorAll(".post-container");
    const creator = document.querySelector(".announcement-creator");
    const eventCreator = document.querySelector(".event-creator");
    // const announcement 

    for (const post of posts) {
        const splide = post.querySelector(".splide.user-post-gallery");
        const postMedia = post.querySelector(".post-media");
        const likeButton = post.querySelector(".like-button");
        const likeCount = post.querySelector(".reaction-content-result span");
        const commentButton = post.querySelector(".comment-button");
        const commentInput = post.querySelector(".comment-input input");
        const commentsContainer = post.querySelector(".comments-container");

        if (splide && postMedia) {
            const ss = new Splide(splide);

            ss.mount();
        }

        function UpdateLikeButton(code) {
            if (code == 200) {
                likeButton.classList.add("active");
            } else {
                likeButton.classList.remove("active");
            }
        }

        if (commentButton) {
            commentButton.addEventListener("click", function () {
                commentInput.focus();
            })
        }

        if (commentInput) {
            commentInput.addEventListener("keypress", function (ev) {
                if (ev.key == "Enter") {
                    CreateNewComment(post.dataset.id, commentInput.value);
                    commentInput.value = "";
                }
            })
        }

        if (likeButton) {
            likeButton.addEventListener("click", function () {
                LikeAPost(post.dataset.id).then((res) => {
                    UpdateLikeButton(res.code);

                    likeCount.textContent = `${res.body.likes} People like this`;

                    if (res.body.likes == 0) {
                        likeCount.parentElement.classList.add("hide-component");
                    } else {
                        likeCount.parentElement.classList.remove("hide-component");
                    }
                });
            })
        }
    }

    if (creator) {
        creator.addEventListener("click", function () {
            CreateNewAnnouncement();
        })
    }

    if (eventCreator) {
        eventCreator.addEventListener("click", function () {
            CreateNewEvent();
        })
    }
}


function Init() {
    const creator = document.querySelector(".post-creator-container");
    const creatorTextArea = creator.querySelector(".textarea-container");
    
    creatorTextArea.addEventListener("click", function () {
        CreateNewPost();
    })


    ManageAllPosts();
}

document.addEventListener("DOMContentLoaded", Init);