import {addHtml, Ajax} from "../../../modules/component/Tool.js";

function Resources() {
    const resourcesMenu = document.querySelector('.resources-menu');
    const resourcesList = document.querySelector('.resources-list');

    resourcesMenu.addEventListener('click', function(e) {
        if (e.target.classList.contains('subject-tab')) {
            const subject = e.target.dataset.subject;
            
            // Remove active class from all tabs and resources
            document.querySelectorAll('.subject-tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.subject-resources').forEach(resource => resource.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding resources
            e.target.classList.add('active');
            document.querySelector(`.subject-resources[data-subject="${subject}"]`).classList.add('active');
        }
    });
}

function StickyNotes() {
    const addNoteBtn = document.getElementById('add-note');
    const notesBoard = document.getElementById('notes-board');
    const saveNotesBtn = document.getElementById('save-notes');
    const discardChangesBtn = document.getElementById('discard-changes');
    let isDragging = false;
    let isResizing = false;
    let isRotating = false;
    let currentNote = null;
    let startX, startY, startWidth, startHeight, startAngle, startRotation;

    const colors = ['#FFD1DC', '#BFECC5', '#AEC6CF', '#FFE5B4', '#E6E6FA'];
    let notes = [];
    let savedNotes = [];
    let hasUnsavedChanges = false;

    addNoteBtn.addEventListener('click', () => {
        const note = createNote();
        notes.push(note);
        updateNotePositions();
        setUnsavedChanges(true);
    });

    saveNotesBtn.addEventListener('click', () => {
        savedNotes = notes.map(note => ({
            id: note.id,
            x: parseFloat(note.style.left) / notesBoard.offsetWidth,
            y: parseFloat(note.style.top) / notesBoard.offsetHeight,
            width: parseFloat(note.style.width) / notesBoard.offsetWidth,
            height: parseFloat(note.style.height) / notesBoard.offsetHeight,
            rotation: getCurrentRotation(note),
            content: note.querySelector('textarea').value,
            color: note.style.backgroundColor,
            locked: note.classList.contains('locked')
        }));
        setUnsavedChanges(false);
    });

    discardChangesBtn.addEventListener('click', () => {
        notes.forEach((note, index) => {
            if (index < savedNotes.length) {
                applyNoteProperties(note, savedNotes[index]);
            } else {
                note.remove();
            }
        });
        notes = notes.slice(0, savedNotes.length);
        setUnsavedChanges(false);
    });

    function createNote() {
        const note = document.createElement('div');
        note.className = 'sticky-note';
        note.style.left = Math.random() * (notesBoard.offsetWidth - 200) + 'px';
        note.style.top = Math.random() * (notesBoard.offsetHeight - 200) + 'px';
        note.style.width = '200px';
        note.style.height = '200px';
        note.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        note.style.transform = 'rotate(0deg)';
        note.style.zIndex = getHighestZIndex() + 1;
        
        const noteHeader = document.createElement('div');
        noteHeader.className = 'note-header';
        
        const noteActions = document.createElement('div');
        noteActions.className = 'note-actions';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'note-btn';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = 'Delete';
        deleteBtn.addEventListener('click', () => {
            note.classList.add('shake');
            setTimeout(() => {
                note.remove();
                notes = notes.filter(n => n !== note);
                updateNotePositions();
                setUnsavedChanges(true);
            }, 500);
        });
        
        const lockBtn = document.createElement('button');
        lockBtn.className = 'note-btn';
        lockBtn.innerHTML = '🔓';
        lockBtn.title = 'Lock';
        lockBtn.addEventListener('click', () => {
            note.classList.toggle('locked');
            lockBtn.innerHTML = note.classList.contains('locked') ? '🔒' : '🔓';
            lockBtn.title = note.classList.contains('locked') ? 'Unlock' : 'Lock';
            setUnsavedChanges(true);
        });
        
        noteActions.appendChild(deleteBtn);
        noteActions.appendChild(lockBtn);
        noteHeader.appendChild(noteActions);
        
        const textarea = document.createElement('textarea');
        textarea.placeholder = 'Write your note here...';
        textarea.addEventListener('input', () => setUnsavedChanges(true));
        
        const colorPicker = document.createElement('div');
        colorPicker.className = 'color-picker';
        
        colors.forEach(color => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            colorOption.style.backgroundColor = color;
            colorOption.addEventListener('click', () => {
                note.style.backgroundColor = color;
                setUnsavedChanges(true);
            });
            colorPicker.appendChild(colorOption);
        });
        
        const customColorPicker = document.createElement('div');
        customColorPicker.className = 'custom-color-picker';
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.addEventListener('input', (e) => {
            note.style.backgroundColor = e.target.value;
            setUnsavedChanges(true);
        });
        customColorPicker.appendChild(colorInput);
        colorPicker.appendChild(customColorPicker);
        
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        
        const rotateHandle = document.createElement('div');
        rotateHandle.className = 'rotate-handle';
        
        note.appendChild(noteHeader);
        note.appendChild(textarea);
        note.appendChild(colorPicker);
        note.appendChild(resizeHandle);
        note.appendChild(rotateHandle);
        notesBoard.appendChild(note);
        
        textarea.focus();

        return note;
    }

    function applyNoteProperties(note, properties) {
        note.style.left = `${properties.x * notesBoard.offsetWidth}px`;
        note.style.top = `${properties.y * notesBoard.offsetHeight}px`;
        note.style.width = `${properties.width * notesBoard.offsetWidth}px`;
        note.style.height = `${properties.height * notesBoard.offsetHeight}px`;
        note.style.transform = `rotate(${properties.rotation}rad)`;
        note.querySelector('textarea').value = properties.content;
        note.style.backgroundColor = properties.color;
        note.classList.toggle('locked', properties.locked);
        note.querySelector('.note-btn[title="Lock"], .note-btn[title="Unlock"]').innerHTML = properties.locked ? '🔒' : '🔓';
        note.querySelector('.note-btn[title="Lock"], .note-btn[title="Unlock"]').title = properties.locked ? 'Unlock' : 'Lock';
    }

    notesBoard.addEventListener('mousedown', (e) => {
        const note = e.target.closest('.sticky-note');
        if (note && !note.classList.contains('locked')) {
            if (e.target.classList.contains('resize-handle')) {
                isResizing = true;
                currentNote = note;
                startX = e.clientX;
                startY = e.clientY;
                startWidth = parseFloat(getComputedStyle(note).width);
                startHeight = parseFloat(getComputedStyle(note).height);
            } else if (e.target.classList.contains('rotate-handle')) {
                isRotating = true;
                currentNote = note;
                const rect = note.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
                startRotation = getCurrentRotation(note);
            } else {
                isDragging = true;
                currentNote = note;
                startX = e.clientX - note.offsetLeft;
                startY = e.clientY - note.offsetTop;
            }
            note.style.zIndex = getHighestZIndex() + 1;
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            let newX = e.clientX - startX;
            let newY = e.clientY - startY;
            
            newX = Math.max(0, Math.min(newX, notesBoard.offsetWidth - currentNote.offsetWidth));
            newY = Math.max(0, Math.min(newY, notesBoard.offsetHeight - currentNote.offsetHeight));
            
            currentNote.style.left = newX + 'px';
            currentNote.style.top = newY + 'px';
            setUnsavedChanges(true);
        } else if (isResizing) {
            const width = Math.max(100, startWidth + e.clientX - startX);
            const height = Math.max(100, startHeight + e.clientY - startY);
            currentNote.style.width = width + 'px';
            currentNote.style.height = height + 'px';
            setUnsavedChanges(true);
        } else if (isRotating && currentNote) {
            const rect = currentNote.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
            const newRotation = angle - startAngle + startRotation;
            currentNote.style.transform = `rotate(${newRotation}rad)`;
            setUnsavedChanges(true);
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging || isResizing || isRotating) {
            updateNotePositions();
        }
        isDragging = false;
        isResizing = false;
        isRotating = false;
        currentNote = null;
    });

    function getHighestZIndex() {
        return Math.max(
            ...Array.from(document.querySelectorAll('.sticky-note'))
                .map(el => parseFloat(window.getComputedStyle(el).zIndex)),
            0
        );
    }

    function getCurrentRotation(el) {
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

    function updateNotePositions() {
        notes = Array.from(document.querySelectorAll('.sticky-note'));
        setUnsavedChanges(true);
    }

    function setUnsavedChanges(value) {
        hasUnsavedChanges = value;
        saveNotesBtn.disabled = !hasUnsavedChanges;
        discardChangesBtn.disabled = !hasUnsavedChanges;
    }
}

function Cards() {
    const cards = document.querySelectorAll(".cards-flex-container .card-flex-container");

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

    for (const card of cards) {
        card.addEventListener("click", function () {
            GetClassContent(card.getAttribute("data-id")).then((res) => {
                addHtml(content, res);

                Tabs();
                StickyNotes();
                Resources();
            })
        })
    }  
}

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
            const tabId = this.getAttribute('data-tab');

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

function Init() {
     Cards();
}

document.addEventListener('DOMContentLoaded', Init);    