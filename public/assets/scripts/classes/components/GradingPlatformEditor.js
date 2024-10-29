import { SelectModelByFilter } from "./../../modules/app/Administrator.js";
import { PostRequest } from "./../../modules/app/SystemFunctions.js";
import { addHtml, append, CreateElement, MakeID } from "../../modules/component/Tool.js";

export default class GradingPlatformEditor {
    constructor({ container, students = [], buttons = { save: null, discard: null } }) {
        this.table = this.reconstructTable(container, students);
        this.saveGradesBtn = buttons.save;
        this.discardGradesBtn = buttons.discard;

        this.passingScores = { scores: {}, status: {} };
        this.categories = [];
        this.studentScores = {};
        this.columnStructure = {};
        this.originalGrades = {};
        this.hasUnsavedChanges = false;
    }

    Load(section_subject_id) {
        SelectModelByFilter(JSON.stringify({ section_subject_id: section_subject_id }), "GRADING_PLATFORM_CONTROL")
            .then(res => {
                this.LoadGradingPlatform(res[0]);
                this.initializeOriginalGrades(); // Initialize original grades after loading
                this.setUnsavedChanges(false); // Set initial state of save changes
            });
    }

    reconstructTable(container,students) {
        const table = CreateElement({
            el: "TABLE",
            className: "grading-table",
            childs: [
                CreateElement({
                    el: "THEAD",
                    childs: [
                        CreateElement({
                            el: "TR",
                            childs: [
                                CreateElement({
                                    el: "TH",
                                    text: "Student Name",
                                    attr: {
                                        rowspan: 2
                                    }
                                }),
                                CreateElement({
                                    el: "TH",
                                    text: "F",
                                    attr: {
                                        rowspan: 2
                                    }
                                }),
                                CreateElement({
                                    el: "TH",
                                    text: "E",
                                    attr: {
                                        rowspan: 2
                                    }
                                }),
                                CreateElement({
                                    el: "TH",
                                    attr: {
                                        rowspan: 2
                                    },
                                    child: CreateElement({
                                        el: "BUTTON",
                                        className: "add-category",
                                        text: "+",
                                        attr: {
                                            title: "Add Category"
                                        }
                                    })
                                })
                            ]
                        }),
                        CreateElement({
                            el: "TR",
                        })
                    ]
                }),
                CreateElement({
                    el: "TBODY",
                    childs: students.map((student) => {
                        return CreateElement({
                            el: "TR",
                            attr: {
                                "data-student": student.user_id
                            },
                            childs: [
                                CreateElement({
                                    el: "TD",
                                    text: student.displayName
                                }),
                                CreateElement({
                                    el: "TD",
                                    className: "final-grade",
                                    text: "0.00"
                                }),
                                CreateElement({
                                    el: "TD",
                                    className: "college-grade",
                                    text: "0.00"
                                })
                            ]
                        })
                    })
                })
            ]
        });

        addHtml(container , "");

        append(container, table);
        
        return table;
    }
    
    LoadGradingPlatform(grading_platform) {
        if (!grading_platform) return;

        this.categories = [];
        this.studentScores = {};
        this.columnStructure = {};
        this.passingScores = { scores: {}, status: {} };

        // Initialize student scores for all students
        this.table.querySelectorAll('tbody tr').forEach(row => {
            const userId = row.dataset.student;
            this.studentScores[userId] = {
                scores: {},
                weightedScores: {},
                scoreIds: {},
                status: {},
                finalGrade: 0,
                collegeGrade: 0
            };
        });

        grading_platform.categories?.forEach(category => {
            const categoryId = category.grading_category_id;
            this.addNewCategory(category.name, category.percentage, categoryId);
            category.columns?.forEach(col => this.addColumn(categoryId, col));
        });

        this.updateCategoryHeaders();
        this.addEventListeners();
        
        // Recalculate all grades after loading
        this.table.querySelectorAll('tbody tr').forEach(row => {
            this.recalculateGrades(row);
        });
    }

    initializeOriginalGrades() {
        this.table.querySelectorAll('tbody tr').forEach(row => {
            const userId = row.dataset.student;
            this.originalGrades[userId] = this.studentScores[userId] ? 
                JSON.parse(JSON.stringify(this.studentScores[userId])) : 
                { scores: {}, weightedScores: {}, finalGrade: 0, collegeGrade: 0, status: {} };
            this.categories.forEach((_, index) => {
                const categoryIndex = index + 1;
                this.originalGrades[userId].scores[categoryIndex] = {};
                this.originalGrades[userId].weightedScores[categoryIndex] = 0;
            });
        });
    }

    saveGrades() {
        const gradesData = {
            section_subject_id: this.table.dataset.sectionSubjectId,
            categories: this.categories.map(cat => ({
                id: cat.category_id,
                name: cat.name,
                percentage: cat.percentage,
                status: cat.status,
                columns: this.columnStructure[cat.category_id].columnIds.map((columnId, index) => ({
                    id: columnId,
                    column_number: this.columnStructure[cat.category_id].columns[index],
                    passing_score: this.passingScores.scores[`${cat.category_id}-${columnId}`],
                    passing_score_status: this.passingScores.status[`${cat.category_id}-${columnId}`]
                }))
            })),
            student_grades: Object.entries(this.studentScores).map(([studentId, data]) => ({
                student_id: studentId,
                category_scores: Object.entries(data.scores).map(([categoryId, scores]) => ({
                    category_id: categoryId,
                    scores: Object.entries(scores)
                        .filter(([columnId]) => data.status[`${studentId}-${categoryId}-${columnId}`] !== 'original')
                        .map(([columnId, score]) => ({
                            id: data.scoreIds?.[categoryId]?.[columnId] || MakeID(10),
                            column_id: columnId,
                            score: score,
                            status: data.status[`${studentId}-${categoryId}-${columnId}`]
                        }))
                })).filter(category => category.scores.length > 0),
                final_grade: data.finalGrade,
                college_grade: data.collegeGrade
            })).filter(student => student.category_scores.length > 0)
        };

        return PostRequest("SaveGrades", { data: JSON.stringify(gradesData) })
        .then((res) => {
            res = JSON.parse(res);
            if (res.code === 200) {
                alert('Grades saved successfully!');
            } else {
                alert('Failed to save grades. Please try again .');
            }
        });
    }

    discardGrades() {
        this.table.querySelectorAll('tbody tr').forEach(row => {
            const userId = row.querySelector('.grade-input').dataset.student;
            this.studentScores[userId] = JSON.parse(JSON.stringify(this.originalGrades[userId]));
            row.querySelectorAll('.grade-input').forEach(input => {
                const category = input.dataset.category;
                const column = input.dataset.column;
                const scoreKey = `${userId}-${category}-${column}`;
                this.studentScores[userId].status[scoreKey] = 'original';
                input.textContent = this.studentScores[userId].scores[category][column] || '0';
            });
            this.recalculateGrades(row);
        });
        this.setUnsavedChanges(false);
    }

    setUnsavedChanges(value) {
        this.hasUnsavedChanges = value;
        this.saveGradesBtn.disabled = !this.hasUnsavedChanges;
        this.discardGradesBtn.disabled = !this.hasUnsavedChanges;
    }

    recalculateGrades(row) {
        const userId = row.dataset.student;
        this.categories.forEach(category => {
            const category_id = category.category_id;
            const inputs = row.querySelectorAll(`.grade-input[data-category="${category_id}"]`);
            let total = 0;
            let validInputs = 0;

            inputs.forEach(input => {
                const columnId = input.dataset.columnId;
                const score = parseFloat(this.studentScores[userId].scores[category_id][columnId]);
                const passingScore = this.passingScores.scores[`${category_id}-${columnId}`];
                
                if (!isNaN(score) && passingScore > 0) {
                    // Calculate percentage based on passing score
                    const percentage = (score / passingScore) * 100;
                    total += percentage;
                    validInputs++;
                }
            });

            const wsCell = row.querySelector(`.ws[data-category="${category_id}"]`);
            const average = validInputs > 0 ? total / validInputs : 0;
            const weightedScore = average * (category.percentage / 100);

            if (wsCell) {
                wsCell.textContent = weightedScore.toFixed(2);
                this.studentScores[userId].weightedScores[category_id] = weightedScore;
            }
        });

        this.updateFinalGrade(row);
    }

    updateFinalGrade(row) {
        const userId = row.dataset.student;
        let finalGrade = 0;

        Object.values(this.studentScores[userId].weightedScores).forEach(score => {
            finalGrade += score;
        });

        this.studentScores[userId].finalGrade = finalGrade;
        const finalGradeCell = row.querySelector('.final-grade');
        finalGradeCell.textContent = finalGrade.toFixed(2);
        this.updateCollegeGrade(row, finalGrade, finalGradeCell);
    }

    updateCollegeGrade(row, finalGrade, finalGradeCell) {
        const userId = row.dataset.student;
        const collegeGradeCell = row.querySelector('.college-grade');
        let collegeGrade;

        if (finalGrade >= 95) {
            collegeGrade = 1.0;
        } else if (finalGrade >= 90) {
            collegeGrade = 1.5;
        } else if (finalGrade >= 85) {
            collegeGrade = 2.0;
        } else if (finalGrade >= 80) {
            collegeGrade = 2.5;
        } else if (finalGrade >= 75) {
            collegeGrade = 3.0;
        } else {
            collegeGrade = 5.0;
        }

        this.studentScores[userId].collegeGrade = collegeGrade;
        collegeGradeCell.textContent = collegeGrade.toFixed(1);

        if (finalGrade < 75) {
            finalGradeCell.classList.add('failed-grade');
            collegeGradeCell.classList.add('failed-grade');
        } else {
            finalGradeCell.classList.remove('failed-grade');
            collegeGradeCell.classList.remove('failed-grade');
        }
    }

    showPassingScoreEditor(header, category, column) {
        const existingContainer = document.querySelector('.floating-container');

        if (existingContainer) existingContainer.remove();

        const columnId = header.dataset.columnId;
        const scoreKey = `${category}-${columnId}`;

        const container = document.createElement('div');
        container.className = 'floating-container';
        container.innerHTML = `
            <input type="number" value="${this.passingScores.scores[scoreKey] || 100}" min="0" max="100">
            <button>Save</button>
        `;

        const rect = header.getBoundingClientRect();
        container.style.top = `${rect.bottom + window.scrollY}px`;
        container.style.left = `${rect.left + window.scrollX}px`;
        document.body.appendChild(container);

        this.setupPassingScoreEvents(container, category, columnId);
    }

    setupPassingScoreEvents(container, category, columnId) {
        container.querySelector('button').addEventListener('click', () => {
            const passingScore = parseFloat(container.querySelector('input').value);
            const scoreKey = `${category}-${columnId}`;

            // Update passing score
            this.passingScores.scores[scoreKey] = passingScore;

            if (!this.passingScores.status[scoreKey]) {
                this.passingScores.status[scoreKey] = 'created';
            } else if (this.passingScores.status[scoreKey] === 'original') {
                this.passingScores.status[scoreKey] = 'edited';
            }

            // Get all inputs for this column
            const inputs = this.table.querySelectorAll(
                `.grade-input[data-category="${category}"][data-column-id="${columnId}"]`
            );

            // Update each input and recalculate
            inputs.forEach(input => {
                const userId = input.dataset.student;
                let currentScore = this.studentScores[userId].scores[category][columnId];
                
                // Ensure score doesn't exceed new passing score
                if (currentScore > passingScore) {
                    currentScore = passingScore;
                    this.studentScores[userId].scores[category][columnId] = currentScore;
                    input.textContent = currentScore;
                    
                    // Mark as edited if score was changed
                    const scoreKey = `${userId}-${category}-${columnId}`;
                    if (this.studentScores[userId].status[scoreKey] !== 'created') {
                        this.studentScores[userId].status[scoreKey] = 'edited';
                    }
                }
                
                // Recalculate grades for this student
                this.recalculateGrades(input.closest('tr'));
            });

            container.remove();
            this.setUnsavedChanges(true);
        });

        document.addEventListener('click', (e) => {
            if (!container.contains(e.target) && !e.target.classList.contains('score-header')) {
                container.remove();
                document.removeEventListener('click', this.closeContainer);
            }
        });
    }

    showNewCategoryEditor(button) {
        const existingContainer = document.querySelector('.floating-container');
        if (existingContainer) existingContainer.remove();

        const container = document.createElement('div');
        container.className = 'floating-container';
        container.innerHTML = `
            <input type="text" placeholder="Category Name">
            <input type="number" placeholder="Percentage" min="0" max="100">
            <button>Add Category</button>
        `;

        const rect = button.getBoundingClientRect();
        container.style.top = `${rect.bottom + window.scrollY}px`;
        container.style.left = `${rect.left + window.scrollX}px`;
        document.body.appendChild(container);

        container.querySelector('button').addEventListener('click', () => {
            const name = container.querySelector('input[type="text"]').value;
            const percentage = parseInt(container.querySelector('input[type="number"]').value);

            if (name && !isNaN(percentage)) {
                this.addNewCategory(name, percentage);
                container.remove();
            }
        });

        document.addEventListener('click', (e) => {
            if (!container.contains(e.target) && !e.target.classList.contains('add-category')) {
                container.remove();
                document.removeEventListener('click', this.closeContainer);
            }
        });
    }

    addNewCategory(name, percentage, category_id = null) {
        category_id = category_id ?? MakeID(10);

        this.categories.push({ name, percentage, status: 'created', category_id });

        this.columnStructure[category_id] = {
            columns: [],
            columnIds: [],
            columnStatus: {},
            totalColumns: 0,
        };

        const headerRow = this.table.querySelector('thead tr:first-child');
        const newHeader = document.createElement('th');
        newHeader.classList.add('category-header');
        newHeader.dataset.category = category_id;
        newHeader.colSpan = 0;

        newHeader.innerHTML = `
            ${name} (${percentage}%)
            <span class="edit-header" title="Edit Header" style="font-size: 10px;">
            Edit
            </span>
        `;

        headerRow.insertBefore(newHeader, headerRow.querySelector('th:nth-last-child(3)'));

        const subHeaderRow = this.table.querySelector('thead tr:last-child');
        const insertBeforeElement = subHeaderRow.querySelector(`th.add-column-header[data-category="${category_id}"]`);

        const addColumnHeader = document.createElement('th');
        addColumnHeader.classList.add('add-column-header');
        addColumnHeader.dataset.category = category_id;
        addColumnHeader.innerHTML = `<button class="add-column" data-category="${category_id}">+</button>`;
        subHeaderRow.insertBefore(addColumnHeader, insertBeforeElement ? insertBeforeElement.nextSibling : null);

        this.table.querySelectorAll('tbody tr').forEach(row => {
            const insertBeforeCell = row.querySelector('td:nth-last-child(2)');
            const userId = row.dataset.student;

            // Initialize scores and scoreIds for the new category
            if (!this.studentScores[userId].scores[category_id]) {
                this.studentScores[userId].scores[category_id] = {};
            }
            if (!this.studentScores[userId].scoreIds) {
                this.studentScores[userId].scoreIds = {};
            }
            this.studentScores[userId].scoreIds[category_id] = {};
            
            this.studentScores[userId].weightedScores[category_id] = 0;
            this.studentScores[userId].status[category_id] = 'created';

            const wsCell = document.createElement('td');
            wsCell.className = 'ws';
            wsCell.dataset.category = category_id;
            wsCell.textContent = '0.00';
            row.insertBefore(wsCell, insertBeforeCell);

            this.recalculateGrades(row);
        });

        this.reindexColumns(category_id);
        this.updateHeaderColspan(category_id);
        this.setUnsavedChanges(true);
    }

    showCategoryEditor(header, categoryId) {
        const existingContainer = document.querySelector('.floating-container');
        if (existingContainer) existingContainer.remove();

        // Convert categoryId to string for consistent comparison
        const category = this.categories.find(cat => cat.category_id.toString() === categoryId.toString());
        if (!category) return;

        const container = this.createFloatingEditor(
            header,
            category.name,
            category.percentage,
            (newName, newPercentage) => {
                // Update the found category
                category.name = newName;
                category.percentage = newPercentage;
                category.status = category.status === 'original' ? 'edited' : category.status;
                
                this.updateCategoryHeaders();
                this.table.querySelectorAll('tbody tr').forEach(row => {
                    this.recalculateGrades(row);
                });
                this.setUnsavedChanges(true);
            }
        );
        document.body.appendChild(container);

        document.addEventListener('click', (e) => {
            if (!container.contains(e.target) && !e.target.classList.contains('edit-header')) {
                container.remove();
                document.removeEventListener('click', this.closeContainer);
            }
        });
    }

    createFloatingEditor(element, defaultName, defaultPercentage, onSave) {
        const container = document.createElement('div');
        container.className = 'floating-container';
        container.innerHTML = `
            <input type="text" value="${defaultName}" placeholder="Category Name">
            <input type="number" value="${defaultPercentage}" min="0" max="100" placeholder="Percentage">
            <button>Save</button>
        `;

        const rect = element.getBoundingClientRect();
        container.style.top = `${rect.bottom + window.scrollY}px`;
        container.style.left = `${rect.left + window.scrollX}px`;

        container.querySelector('button').addEventListener('click', () => {
            const newName = container.querySelector('input[type="text"]').value;
            const newPercentage = parseInt(container.querySelector('input[type="number"]').value);

            if (newName && !isNaN(newPercentage)) {
                onSave(newName, newPercentage);
            }
            container.remove();
        });

        return container;
    }

    addColumn(category, column = null) {
        this.columnStructure[category].totalColumns++;
        const newColumnNum = this.columnStructure[category].totalColumns;
        this.columnStructure[category].columns.push(newColumnNum);

        const newColumnId = column?.grading_score_column_id ?? MakeID(20);
        this.columnStructure[category].columnIds.push(newColumnId);
        this.columnStructure[category].columnStatus[newColumnId] = column ? 'original' : 'created';

        this.passingScores.scores[`${category}-${newColumnId}`] = column?.passing_score ?? 100;
        this.passingScores.status[`${category}-${newColumnId}`] = column ? 'original' : 'created';

        const headerRow = this.table.querySelector('thead tr:last-child');
        const newHeader = document.createElement('th');
        newHeader.classList.add('score-header');
        newHeader.dataset.category = category;
        newHeader.dataset.column = newColumnNum;
        newHeader.dataset.columnId = newColumnId;
        newHeader.innerHTML = `${newColumnNum} <button class="remove-column" data-category="${category}" data-column="${newColumnNum}">-</button>`;

        const addColumnHeader = headerRow.querySelector(`.add-column[data-category="${category}"]`).parentElement;
        headerRow.insertBefore(newHeader, addColumnHeader);

        this.table.querySelectorAll('tbody tr').forEach(row => {
            const userId = row.dataset.student;
            const score = column?.scores.find(score => score.student_id == userId);
            const newScoreId = score ? score.grading_score_id : MakeID(10);

            // Initialize scoreIds if not exists
            if (!this.studentScores[userId].scoreIds[category]) {
                this.studentScores[userId].scoreIds[category] = {};
            }

            const scoreValue = score ? score.score : 0;
            this.studentScores[userId].scores[category][newColumnId] = scoreValue;
            this.studentScores[userId].scoreIds[category][newColumnId] = newScoreId;

            const newCell = document.createElement('td');
            newCell.innerHTML = `<span class="grade-input" contenteditable="true" 
                data-student="${userId}" 
                data-category="${category}" 
                data-column="${newColumnNum}"
                data-column-id="${newColumnId}"
                data-score-id="${newScoreId}">${scoreValue}</span>`;

            const wsCell = row.querySelector(`.ws[data-category="${category}"]`);
            row.insertBefore(newCell, wsCell);

            this.recalculateGrades(row);
        });

        this.updateHeaderColspan(category);
        this.setUnsavedChanges(true);
    }

    removeColumn(category, column) {
        const columnId = this.table.querySelector(`th.score-header[data-category="${category}"][data-column="${column}"]`)
            .dataset.columnId;

        // Update column structure
        const columnIndex = this.columnStructure[category].columns.indexOf(parseInt(column));
        if (columnIndex > -1) {
            this.columnStructure[category].columns.splice(columnIndex, 1);
            this.columnStructure[category].columnIds.splice(columnIndex, 1);
            this.columnStructure[category].totalColumns--;
        }

        this.passingScores.status[`${category}-${columnId}`] = 'removed';

        // Remove header and cells
        this.table.querySelector(`th.score-header[data-category="${category}"][data-column="${column}"]`).remove();
        this.table.querySelectorAll(`td .grade-input[data-category="${category}"][data-column="${column}"]`)
            .forEach(input => {
                const row = input.closest('tr');
                const userId = input.dataset.student;
                delete this.studentScores[userId].scores[category][columnId];
                input.closest('td').remove();
                this.recalculateGrades(row);
            });

        this.reindexColumns(category);
        this.updateHeaderColspan(category);
        delete this.passingScores.scores[`${category}-${columnId}`];
        this.setUnsavedChanges(true);
    }

    reindexColumns(category) {
        // Update headers
        const headers = Array.from(this.table.querySelectorAll(`th.score-header[data-category="${category}"]`));
        headers.forEach((header, index) => {
            const newColumn = index + 1;
            const oldColumn = header.dataset.column;
            const columnId = header.dataset.columnId;
            
            // Update header
            header.dataset.column = newColumn;
            header.innerHTML = `${newColumn} <button class="remove-column" data-category="${category}" data-column="${newColumn}">-</button>`;

            // Update all corresponding grade inputs
            this.table.querySelectorAll(`.grade-input[data-category="${category}"][data-column="${oldColumn}"]`)
                .forEach(input => {
                    input.dataset.column = newColumn;
                });
        });

        // Update column structure
        this.columnStructure[category].columns = headers.map((_, index) => index + 1);
    }

    updateHeaderColspan(category) {
        const categoryHeader = this.table.querySelector(`thead tr:first-child th[data-category="${category}"]`);
        if (categoryHeader) {
            // Add 1 to account for the weighted score column
            categoryHeader.colSpan = this.columnStructure[category].totalColumns + 1;
        }
    }

    updateCategoryHeaders() {
        this.categories.forEach(category => {
            const header = this.table.querySelector(`th[data-category="${category.category_id}"]`);
            if (header) {
                header.classList.add('category-header');
                header.innerHTML = `
                    ${category.name} (${category.percentage}%)
                    <span class="edit-header" title="Edit Header" style="font-size: 10px;">
                    Edit
                    </span>
                `;
            }
        });
    }

    addEventListeners() {
        this.table.addEventListener('input', (e) => {
            if (e.target.classList.contains('grade-input')) {
                const category = e.target.dataset.category;
                const columnId = e.target.dataset.columnId;
                const userId = e.target.dataset.student;
                const scoreKey = `${userId}-${category}-${columnId}`;
                let value = e.target.textContent === '' ? 0 : parseFloat(e.target.textContent);

                if (isNaN(value)) {
                    e.target.textContent = '0';
                    value = 0;
                } else {
                    value = Math.min(value, this.passingScores.scores[`${category}-${columnId}`] || 100);
                    e.target.textContent = value;
                }
                
                this.studentScores[userId].scores[category][columnId] = value;
                this.studentScores[userId].status[scoreKey] = 'edited';
                this.recalculateGrades(e.target.closest('tr'));
                this.setUnsavedChanges(true);
            }
        });

        this.table.addEventListener('click', (e) => {
            if (e.target.classList.contains('score-header')) {
                const category = e.target.dataset.category;
                const column = e.target.dataset.column;
                this.showPassingScoreEditor(e.target, category, column);
            }
        });

        this.table.addEventListener('click', (e) => {
            if (e.target.closest('.edit-header')) {
                const categoryHeader = e.target.closest('.category-header');
                // Get category ID as string
                const categoryId = categoryHeader.dataset.category.toString();
                this.showCategoryEditor(categoryHeader, categoryId);
            } else if (e.target.closest('.add-category')) {
                this.showNewCategoryEditor(e.target.closest('.add-category'));
            }
        });

        this.table.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-column')) {
                this.addColumn(e.target.dataset.category);
            } else if (e.target.classList.contains('remove-column')) {
                this.removeColumn(e.target.dataset.category, e.target.dataset.column);
            }
        });

        this.discardGradesBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to discard all changes?')) {
                this.discardGrades();
            }
        });

        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            }
        });
    }
}