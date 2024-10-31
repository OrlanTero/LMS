import {SelectModels} from "../../modules/app/Administrator.js";
import {PostRequest} from "../../modules/app/SystemFunctions.js";
import {CreateElement, append, addHtml} from "../../modules/component/Tool.js";

export default class StickyNoteEditor {
    constructor(options = {container, user, editor: {width: '100%', height: '500px'}}) {
        this.container = options.container;
        this.editor = this.reconstructEditor(options.editor);
        this.session_id = options.user.user_id.toString();
        this.name = options.user.displayName;
        this.image = options.user.photoURL;
        this.addNoteBtn = this.editor.querySelector('#add-note');
        this.saveNotesBtn = this.editor.querySelector('#save-notes');
        this.discardChangesBtn = this.editor.querySelector('#discard-changes');
        this.notesBoard = this.editor.querySelector('.notes-board');
        this.section_id = null;
        this.professor_id = null;
        this.isDragging = false;
        this.isResizing = false;
        this.isRotating = false;
        this.currentNote = null;
        this.startX = null;
        this.startY = null;
        this.startWidth = null;
        this.startHeight = null;
        this.startAngle = null;
        this.startRotation = null;

        this.colors = ['#FFD1DC', '#BFECC5', '#AEC6CF', '#FFE5B4', '#E6E6FA'];
        this.notes = [];
        this.savedNotes = [];
        this.hasUnsavedChanges = false;

        this.initEventListeners();
    }

    reconstructEditor(styles) {
        const editor = CreateElement({
            el: "DIV",
            className: "sticky-note-editor",
            childs: [
                CreateElement({
                    el: "DIV",
                    className: "notes-actions",
                    childs: [
                        CreateElement({
                            el: "BUTTON",
                            id: "add-note",
                            className: ["btn", "btn-primary"],
                            text: "Add Note"
                        }),
                        CreateElement({
                            el: "BUTTON",
                            id: "save-notes",
                            className: ["btn", "btn-success"],
                            text: "Save"
                        }),
                        CreateElement({
                            el: "BUTTON",
                            id: "discard-changes",
                            className: ["btn", "btn-danger"],
                            text: "Discard"
                        })
                    ]
                }),
                CreateElement({
                    el: "DIV",
                    className: "notes-board",
                    style: styles
                })
            ]
        });

        addHtml(this.container, "");
        append(this.container, editor);

        return editor;
    }

    initEventListeners() {
        this.addNoteBtn.addEventListener('click', () => this.addNote());
        this.saveNotesBtn.addEventListener('click', () => this.saveNotes());
        this.discardChangesBtn.addEventListener('click', () => this.discardChanges());
        this.notesBoard.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseup', () => this.onMouseUp());
        window.addEventListener('resize', () => this.onResize());
    }

    addNote() {
        const note = this.createNote();
        note.dataset.status = 'created';
        note.dataset.user_id = this.session_id;
        this.notes.push(note);
        this.updateNotePositions();
        this.setUnsavedChanges(true);
    }

    saveNotes() {
        this.savedNotes = this.notes.map(note => ({
            id: note.dataset.id,
            sticky_note_id: note.dataset.sticky_note_id,
            x: parseFloat(note.style.left) / 100,
            y: parseFloat(note.style.top) / 100,
            width: parseFloat(note.style.width) / 100,
            height: parseFloat(note.style.height) / 100,
            rotation: this.getCurrentRotation(note),
            content: note.querySelector('textarea').value,
            color: note.style.backgroundColor,
            locked: note.classList.contains('locked'),
            status: note.dataset.status,
            user_id: note.dataset.user_id,
            creator_name: note.dataset.creator_name,
            creator_image: note.dataset.creator_image
        }));

        this.SaveStickyNotes(this.savedNotes.filter(note => note.status !== 'preloaded'), this.section_id, this.professor_id).then((res) => {
            // Handle response if needed
        });

        this.setUnsavedChanges(false);
    }

    discardChanges() {
        this.notes.forEach((note, index) => {
            if (index < this.savedNotes.length) {
                this.applyNoteProperties(note, this.savedNotes[index]);
            } else {
                note.remove();
            }
        });
        this.notes = this.notes.slice(0, this.savedNotes.length);
        this.setUnsavedChanges(false);
    }

    createNote(properties = null) {
        const note = document.createElement('div');
        note.className = 'sticky-note';

        if (properties && properties.sticky_note_id) {
            note.dataset.sticky_note_id = properties.sticky_note_id;
            note.dataset.status = 'preloaded';
            note.dataset.user_id = properties.user_id;
            note.dataset.creator_name = properties.creator_name;
            note.dataset.creator_image = properties.creator_image;
        } else {
            note.dataset.id = this.makeID(10);
            note.dataset.status = 'created';
            note.dataset.user_id = this.session_id;
            note.dataset.creator_name = this.name;
            note.dataset.creator_image = this.image;
        }

        this.setNoteStyles(note, properties);
        this.addNoteHeader(note, properties);
        this.addNoteTextarea(note, properties);
        this.addColorPicker(note);
        this.addResizeAndRotateHandles(note);
        this.notesBoard.appendChild(note);

        if (properties && properties.locked) {
            note.classList.add('locked');
        }

        this.updateNoteInteractivity(note);
        return note;
    }

    setNoteStyles(note, properties) {
        if (properties) {
            note.style.left = `${properties.x * 100}%`;
            note.style.top = `${properties.y * 100}%`;
            note.style.width = `${properties.width * 100}%`;
            note.style.height = `${properties.height * 100}%`;
        } else {
            note.style.left = '0%';
            note.style.top = '0%';
            note.style.width = '25%';
            note.style.height = '33.33%';
        }

        const backgroundColor = properties ? properties.color : this.colors[Math.floor(Math.random() * this.colors.length)];
        note.style.backgroundColor = backgroundColor;
        note.style.color = this.getContrastColor(backgroundColor);
        note.style.transform = properties ? `rotate(${properties.rotation}rad)` : 'rotate(0deg)';
        note.style.zIndex = this.getHighestZIndex() + 1;
    }

    addNoteHeader(note, properties) {
        const noteHeader = document.createElement('div');
        noteHeader.className = 'note-header';

        const creatorInfo = document.createElement('div');
        creatorInfo.className = 'creator-info';

        const creatorImage = document.createElement('img');
        creatorImage.src = note.dataset.creator_image;
        creatorImage.alt = note.dataset.creator_name;
        creatorImage.className = 'creator-image';

        const creatorName = document.createElement('span');
        creatorName.textContent = note.dataset.creator_name;
        creatorName.className = 'creator-name';

        creatorInfo.appendChild(creatorImage);
        creatorInfo.appendChild(creatorName);

        const noteActions = document.createElement('div');
        noteActions.className = 'note-actions';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'note-btn';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = 'Delete';
        deleteBtn.addEventListener('click', () => {
            note.classList.add('shake');
            setTimeout(() => {
                if (note.dataset.status === 'preloaded') {
                    note.dataset.status = 'deleted';
                    note.style.display = 'none';
                } else {
                    note.remove();
                    this.notes = this.notes.filter(n => n !== note);
                }
                this.updateNotePositions();
                this.setUnsavedChanges(true);
            }, 500);
        });

        const lockBtn = document.createElement('button');
        lockBtn.className = 'note-btn';
        lockBtn.innerHTML = properties && properties.locked ? '🔒' : '🔓';
        lockBtn.title = properties && properties.locked ? 'Unlock' : 'Lock';
        lockBtn.addEventListener('click', () => {
            note.classList.toggle('locked');
            lockBtn.innerHTML = note.classList.contains('locked') ? '🔒' : '🔓';
            lockBtn.title = note.classList.contains('locked') ? 'Unlock' : 'Lock';
            this.setUnsavedChanges(true);
            this.updateNoteInteractivity(note);
        });

        noteActions.appendChild(deleteBtn);
        noteActions.appendChild(lockBtn);

        noteHeader.appendChild(creatorInfo);
        noteHeader.appendChild(noteActions);

        note.appendChild(noteHeader);
    }

    addNoteTextarea(note, properties) {
        const textarea = document.createElement('textarea');
        textarea.placeholder = 'Write your note here...';
        textarea.value = properties ? properties.content : '';
        textarea.style.color = note.style.color;
        textarea.addEventListener('input', () => {
            if (note.dataset.user_id === this.session_id) {
                if (note.dataset.status === 'preloaded') {
                    note.dataset.status = 'edited';
                }
                this.setUnsavedChanges(true);
            }
        });

        note.appendChild(textarea);
    }

    addColorPicker(note) {
        const colorPicker = document.createElement('div');
        colorPicker.className = 'color-picker';

        this.colors.forEach(color => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            colorOption.style.backgroundColor = color;
            colorOption.addEventListener('click', () => {
                if (note.dataset.user_id === this.session_id) {
                    note.style.backgroundColor = color;
                    note.style.color = this.getContrastColor(color);
                    note.querySelector('textarea').style.color = note.style.color;
                    if (note.dataset.status === 'preloaded') {
                        note.dataset.status = 'edited';
                    }
                    this.setUnsavedChanges(true);
                }
            });
            colorPicker.appendChild(colorOption);
        });

        const customColorPicker = document.createElement('div');
        customColorPicker.className = 'custom-color-picker';

        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.addEventListener('input', (e) => {
            if (note.dataset.user_id === this.session_id) {
                const newColor = e.target.value;
                note.style.backgroundColor = newColor;
                note.style.color = this.getContrastColor(newColor);
                note.querySelector('textarea'). style.color = note.style.color;
                if (note.dataset.status === 'preloaded') {
                    note.dataset.status = 'edited';
                }
                this.setUnsavedChanges(true);
            }
        });

        customColorPicker.appendChild(colorInput);
        colorPicker.appendChild(customColorPicker);

        note.appendChild(colorPicker);
    }

    addResizeAndRotateHandles(note) {
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';

        const rotateHandle = document.createElement('div');
        rotateHandle.className = 'rotate-handle';

        note.appendChild(resizeHandle);
        note.appendChild(rotateHandle);
    }

    applyNoteProperties(note, properties) {
        note.style.left = `${properties.x * 100}%`;
        note.style.top = `${properties.y * 100}%`;
        note.style.width = `${properties.width * 100}%`;
        note.style.height = `${properties.height * 100}%`;
        note.style.transform = `rotate(${properties.rotation}rad)`;
        note.querySelector('textarea').value = properties.content;
        note.style.backgroundColor = properties.color;
        note.style.color = this.getContrastColor(properties.color);
        note.querySelector('textarea').style.color = note.style.color;
        note.classList.toggle('locked', properties.locked);
        const lockBtn = note.querySelector('.note-btn[title="Lock"], .note-btn[title="Unlock"]');
        if (lockBtn) {
            lockBtn.innerHTML = properties.locked ? '🔒' : '🔓';
            lockBtn.title = properties.locked ? 'Unlock' : 'Lock';
        }
        note.dataset.status = properties.status;
        note.dataset.user_id = properties.user_id;
        note.dataset.creator_name = properties.creator_name;
        note.dataset.creator_image = properties.creator_image;
        note.querySelector('.creator-name').textContent = properties.creator_name;
        note.querySelector('.creator-image').src = properties.creator_image;
        this.updateNoteInteractivity(note);
    }

    onMouseDown(e) {
        const note = e.target.closest('.sticky-note');
        if (note && note.dataset.user_id === this.session_id && !note.classList.contains('locked')) {
            if (e.target.classList.contains('resize-handle')) {
                this.isResizing = true;
                this.currentNote = note;
                this.startX = e.clientX;
                this.startY = e.clientY;
                this.startWidth = parseFloat(getComputedStyle(note).width);
                this.startHeight = parseFloat(getComputedStyle(note).height);
            } else if (e.target.classList.contains('rotate-handle')) {
                this.isRotating = true;
                this.currentNote = note;
                const rect = note.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                this.startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
                this.startRotation = this.getCurrentRotation(note);
            } else if (!e.target.classList.contains('note-btn') && !e.target.classList.contains('color-option') && !e.target.classList.contains('custom-color-picker')) {
                this.isDragging = true;
                this.currentNote = note;
                this.startX = e.clientX - note.offsetLeft;
                this.startY = e.clientY - note.offsetTop;
            }
            note.style.zIndex = this.getHighestZIndex() + 1;
        }
    }

    onMouseMove(e) {
        if (this.isDragging && this.currentNote && this.currentNote.dataset.user_id === this.session_id && !this.currentNote.classList.contains('locked')) {
            let newX = (e.clientX - this.startX) / this.notesBoard.offsetWidth * 100;
            let newY = (e.clientY - this.startY) / this.notesBoard.offsetHeight * 100;

            newX = Math.max(0, Math.min(newX, 100 - parseFloat(this.currentNote.style.width)));
            newY = Math.max(0, Math.min(newY, 100 - parseFloat(this.currentNote.style.height)));

            this.currentNote.style.left = newX + '%';
            this.currentNote.style.top = newY + '%';
            if (this.currentNote.dataset.status === 'preloaded') {
                this.currentNote.dataset.status = 'edited';
            }
            this.setUnsavedChanges(true);
        } else if (this.isResizing && this.currentNote && this.currentNote.dataset.user_id === this.session_id && !this.currentNote.classList.contains('locked')) {
            const width = Math.max(10, (this.startWidth + e.clientX - this.startX) / this.notesBoard.offsetWidth * 100);
            const height = Math.max(10, (this.startHeight + e.clientY - this.startY) / this.notesBoard.offsetHeight * 100);
            this.currentNote.style.width = width + '%';
            this.currentNote.style.height = height + '%';
            if (this.currentNote.dataset.status === 'preloaded') {
                this.currentNote.dataset.status = 'edited';
            }
            this.setUnsavedChanges(true);
 } else if (this.isRotating && this.currentNote && this.currentNote.dataset.user_id === this.session_id && !this.currentNote.classList.contains('locked')) {
            const rect = this.currentNote.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
            const newRotation = angle - this.startAngle + this.startRotation;
            this.currentNote.style.transform = `rotate(${newRotation}rad)`;
            if (this.currentNote.dataset.status === 'preloaded') {
                this.currentNote.dataset.status = 'edited';
            }
            this.setUnsavedChanges(true);
        }
    }

    onMouseUp() {
        if (this.isDragging || this.isResizing || this.isRotating) {
            this.updateNotePositions();
        }
        this.isDragging = false;
        this.isResizing = false;
        this.isRotating = false;
        this.currentNote = null;
    }

    onResize() {
        this.notes.forEach(note => {
            const left = parseFloat(note.style.left);
            const top = parseFloat(note.style.top);
            const width = parseFloat(note.style.width);
            const height = parseFloat(note.style.height);

            note.style.left = `${left}%`;
            note.style.top = `${top}%`;
            note.style.width = `${width}%`;
            note.style.height = `${height}%`;
        });
    }

    getHighestZIndex() {
        return Math.max(
            ...Array.from(document.querySelectorAll('.sticky-note'))
                .map(el => parseFloat(window.getComputedStyle(el).zIndex)),
            0
        );
    }

    getCurrentRotation(el) {
        const st = window.getComputedStyle(el, null);
        const tm = st.getPropertyValue("-webkit-transform") ||
                   st.getPropertyValue("-moz-transform") ||
                   st.getPropertyValue("-ms-transform") ||
                   st.getPropertyValue("-o-transform") ||
                   st.getPropertyValue("transform");
        if (tm !== "none") {
            const values = tm.split('(')[1].split(')')[0].split(',');
            const angle = Math.atan2(parseFloat(values[1]), parseFloat(values[0]));
            return angle;
        }
        return 0;
    }

    updateNotePositions() {
        this.notes = Array.from(document.querySelectorAll('.sticky-note'));
        this.setUnsavedChanges(true);
    }

    setUnsavedChanges(value) {
        this.hasUnsavedChanges = value;
        this.saveNotesBtn.disabled = !this.hasUnsavedChanges;
        this.discardChangesBtn.disabled = !this.hasUnsavedChanges;
    }

    updateNoteInteractivity(note) {
        const textarea = note.querySelector('textarea');
        const colorPicker = note.querySelector('.color-picker');
        const resizeHandle = note.querySelector('.resize-handle');
        const rotateHandle = note.querySelector('.rotate-handle');
        const deleteBtn = note.querySelector('.note-btn[title="Delete"]');
        const lockBtn = note.querySelector('.note-btn[title="Lock"], .note-btn[title="Unlock"]');

        if (note.dataset.user_id === this.session_id) {
            if (note.classList.contains('locked')) {
                textarea.readOnly = true;
                colorPicker.style.display = 'none';
                resizeHandle.style.display = 'none';
                rotateHandle.style.display = 'none';
                note.style.cursor = 'default';
                deleteBtn.style.display = 'none';
            } else {
                textarea.readOnly = false;
                colorPicker.style.display = 'flex';
                resizeHandle.style.display = 'block';
                rotateHandle.style.display = 'block';
                note.style.cursor = 'move';
                deleteBtn.style.display = 'inline-block';
            }
            lockBtn.style.display = 'inline-block';
        } else {
            textarea.readOnly = true;
            colorPicker.style.display = 'none';
            resizeHandle.style.display = 'none';
            rotateHandle.style.display = 'none';
            note.style.cursor = 'default';
            deleteBtn.style.display = 'none';
            lockBtn.style.display = 'none';
        }
    }

    SaveStickyNotes(stickyNotes, section_id, professor_id) {
        return new Promise((resolve) => {
            PostRequest("SaveStickyNotes", {stickyNotes: JSON.stringify(stickyNotes), section_id, professor_id}).then(res => {
                resolve(res);
            });
        });
    }
    
    LoadStickyNote(section_id, professor_id) {
        return new Promise((resolve) => {
            SelectModels("STICKY_NOTE_CONTROL", JSON.stringify({section_id, professor_id})).then(res => {
                resolve(res);    
            })
        })
    }

    loadStickyNotes(section_id, professor_id) {
        this.section_id = section_id;
        this.professor_id = professor_id;

        this.LoadStickyNote(section_id, professor_id).then(res => {
            this.savedNotes = res;
            this.savedNotes.forEach(noteData => {
                const note = this.createNote(noteData);
                this.notes.push(note);
            });
            
            this.updateNotePositions();
            this.setUnsavedChanges(false);
        })
    }

    Load(section_id, professor_id) {
        this.loadStickyNotes(section_id, professor_id);
    }

    makeID(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    getContrastColor(hexColor) {
        // Convert hex to RGB
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        
        // Calculate relative luminance using sRGB
        const sRGB = [r, g, b].map(c => {
            c /= 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        const luminance = 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
        
        // Use WCAG contrast ratio for better accessibility
        return luminance > 0.179 ? '#000000' : '#FFFFFF';
    }
}