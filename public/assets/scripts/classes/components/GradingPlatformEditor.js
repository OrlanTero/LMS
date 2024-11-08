import { SelectModelByFilter } from "./../../modules/app/Administrator.js";
import { PostRequest } from "./../../modules/app/SystemFunctions.js";
import { addHtml, append, CreateElement, MakeID, ManageComboBoxes, ListenToCombo, SetNewComboItems, HideShowComponent } from "../../modules/component/Tool.js";
import Popup from "./Popup.js";

export default class GradingPlatformEditor {
    constructor({ container, students = [], buttons = { save: null, discard: null, export: null } }) {
        this.grading_platform_id = null;
        this.container = container;
        this.students = students;
        this.table = this.reconstructTable(container, students);
        this.saveGradesBtn = buttons.save;
        this.discardGradesBtn = buttons.discard;
        this.exportBtn = buttons.export;

        this.passingScores = { scores: {}, status: {} };
        this.categories = [];
        this.studentScores = {};
        this.columnStructure = {};
        this.originalGrades = {};
        this.hasUnsavedChanges = false;
        this.sectionSubjectId = null;
        this.removedColumns = {};
        this.removedCategories = [];

        // Add event listener if export button exists
        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', () => {
                this.exportToExcel();
            });
        }
    }

    Load(section_subject_id) {
        this.sectionSubjectId = section_subject_id;

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

        this.grading_platform_id = grading_platform.grading_platform_id;
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
            
            // Initialize column structure even if there are no columns
            if (!this.columnStructure[categoryId]) {
                this.columnStructure[categoryId] = {
                    columns: [],
                    columnIds: [],
                    columnStatus: {},
                    totalColumns: 0
                };
            }
            
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
            
            this.categories.forEach(category => {
                const categoryId = category.category_id;
                // Initialize scores only if category has columns
                if (this.columnStructure[categoryId].totalColumns > 0) {
                    this.originalGrades[userId].scores[categoryId] = {};
                }
                // Always initialize weighted scores
                this.originalGrades[userId].weightedScores[categoryId] = 
                    this.columnStructure[categoryId].totalColumns === 0 ? 
                    category.percentage : 0;
            });
        });
    }

    saveGrades() {
        const gradesData = {
            section_subject_id: this.sectionSubjectId,
            removed_categories: this.removedCategories,
            categories: this.categories
                .filter(cat => this.columnStructure[cat.category_id])
                .map(cat => ({
                    id: cat.category_id,
                    name: cat.name,
                    percentage: cat.percentage,
                    status: cat.status,
                    columns: this.columnStructure[cat.category_id].columnIds.map((columnId, index) => ({
                        id: columnId,
                        column_number: this.columnStructure[cat.category_id].columns[index],
                        passing_score: this.passingScores.scores[`${cat.category_id}-${columnId}`],
                        passing_score_status: this.passingScores.status[`${cat.category_id}-${columnId}`]
                    })),
                    removed_columns: this.removedColumns[cat.category_id] || []
                })),
            student_grades: Object.entries(this.studentScores)
                .map(([studentId, data]) => ({
                    student_id: studentId,
                    category_scores: Object.entries(data.scores)
                        .filter(([categoryId]) => this.columnStructure[categoryId])
                        .map(([categoryId, scores]) => ({
                            category_id: categoryId,
                            scores: Object.entries(scores)
                                .filter(([columnId]) => data.status[`${studentId}-${categoryId}-${columnId}`] !== 'original')
                                .filter(([columnId]) => data.status[`${studentId}-${categoryId}-${columnId}`] !== undefined)
                                .map(([columnId, score]) => ({
                                    id: data.scoreIds?.[categoryId]?.[columnId],
                                    column_id: columnId,
                                    score: score,
                                    status: data.status[`${studentId}-${categoryId}-${columnId}`]
                                }))
                        })).filter(category => category.scores.length > 0),
                    final_grade: data.finalGrade,
                    college_grade: data.collegeGrade
                })).filter(student => student.category_scores.length > 0)
        };

        return new Promise((resolve, reject) => {
            PostRequest("SaveGrades", { data: JSON.stringify(gradesData) })
            .then((res) => {
                console.log(res);
                res = JSON.parse(res);

                if (res.code === 200) {
                    alert('Grades saved successfully!');
                    this.updateCreatedObjects(res.body.created_objects);
                    resolve(true);
                } else {
                    alert('Failed to save grades. Please try again .');
                    resolve(false);
                }
            });
        });
    }

    updateCreatedObjects(created_objects) {
        // Update category IDs and data
        created_objects.categories.forEach(mapping => {
            this.categories.forEach(category => {
                if (category.category_id === mapping.previous_id) {
                    // Delete old category data
                    delete this.columnStructure[category.category_id];
                    delete this.passingScores.scores[category.category_id];
                    
                    // Update with new data
                    category.category_id = mapping.latest_id;
                    Object.assign(category, {
                        name: mapping.object.name,
                        percentage: mapping.object.percentage,
                        status: 'original'
                    });
                }
            });
        });

        // Update column IDs and passing scores
        created_objects.columns.forEach(mapping => {
            Object.keys(this.columnStructure).forEach(categoryId => {
                const columnIndex = this.columnStructure[categoryId].columnIds.indexOf(mapping.previous_id);
                if (columnIndex !== -1) {
                    // Delete old column data
                    delete this.passingScores.scores[`${categoryId}-${mapping.previous_id}`];
                    delete this.passingScores.status[`${categoryId}-${mapping.previous_id}`];
                    
                    // Update with new data
                    this.columnStructure[categoryId].columnIds[columnIndex] = mapping.latest_id;
                    this.passingScores.scores[`${categoryId}-${mapping.latest_id}`] = mapping.object.passing_score;
                    this.passingScores.status[`${categoryId}-${mapping.latest_id}`] = 'original';
                }
            });
        });

        // Update score IDs and values
        created_objects.scores.forEach(mapping => {
            Object.values(this.studentScores).forEach(student => {
                Object.keys(student.scoreIds || {}).forEach(categoryId => {
                    Object.keys(student.scoreIds[categoryId]).forEach(columnId => {
                        if (student.scoreIds[categoryId][columnId] === mapping.previous_id) {
                            // Delete old score data
                            delete student.scores[categoryId][mapping.previous_id];
                            delete student.status[`${student.student_id}-${categoryId}-${mapping.previous_id}`];
                            
                            // Update with new data
                            student.scoreIds[categoryId][columnId] = mapping.latest_id;
                            student.scores[categoryId][columnId] = mapping.object.score;
                            student.status[`${student.student_id}-${categoryId}-${columnId}`] = 'original';
                        }
                    });
                });
            });
        });
    }

    discardGrades() {
        this.table.querySelectorAll('tbody tr').forEach(row => {
            const userId = row.dataset.student;
            this.studentScores[userId] = JSON.parse(JSON.stringify(this.originalGrades[userId]));
            
            // Only reset inputs for categories with columns
            row.querySelectorAll('.grade-input').forEach(input => {
                const category = input.dataset.category;
                const column = input.dataset.column;
                const scoreKey = `${userId}-${category}-${column}`;
                
                if (this.columnStructure[category].totalColumns > 0) {
                    this.studentScores[userId].status[scoreKey] = 'original';
                    input.textContent = this.studentScores[userId].scores[category][column] || '0';
                }
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
            const wsCell = row.querySelector(`.ws[data-category="${category_id}"]`);
            let weightedScore = 0;

            // If category has no columns, weighted score is the full percentage
            if (inputs.length === 0) {
                weightedScore = category.percentage;
            } else {
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

                // If no valid inputs, use full percentage, otherwise calculate average
                weightedScore = validInputs === 0 ? 
                    category.percentage : 
                    (total / validInputs) * (category.percentage / 100);
            }

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

        const container = document.createElement('div');
        container.className = 'floating-container';
        container.innerHTML = `
            <h3>Edit Passing Score</h3>
            <label for="passingScore">Passing Score</label>
            <input type="number" 
                   id="passingScore" 
                   value="${this.passingScores.scores[`${category}-${header.dataset.columnId}`] || 100}" 
                   min="0" 
                   max="100">
            <button>Save Changes</button>
            <button class="import-data">Import Data</button>
            
        `;

        const rect = header.getBoundingClientRect();
        container.style.top = `${rect.bottom + window.scrollY}px`;
        container.style.left = `${rect.left + window.scrollX}px`;
        document.body.appendChild(container);

        // Add click event listener to document
        const handleClickOutside = (e) => {
            if (!container.contains(e.target) && !header.contains(e.target)) {
                container.remove();
                document.removeEventListener('click', handleClickOutside);
            }
        };

        // Use setTimeout to prevent immediate triggering
        setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 0);

        this.setupPassingScoreEvents(container, category, header.dataset.columnId);
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

        container.querySelector('.import-data').addEventListener('click', () => {
            this.showImportDataModal(category, columnId, this.grading_platform_id);
        });

        document.addEventListener('click', (e) => {
            if (!container.contains(e.target) && !e.target.classList.contains('score-header')) {
                container.remove();
                document.removeEventListener('click', this.closeContainer);
            }
        });
    }

    showImportDataModal(categoryIndex, columnId, grading_platform_id) {
        const popup = new Popup(`${"classes"}/import_grade_score_data`, {
            grading_platform_id
        }, {
            backgroundDismiss: false
        });
    
        popup.Create().then(() => {
            popup.Show();

            const category = popup.ELEMENT.querySelector('.category');
            const data = popup.ELEMENT.querySelector('.data');
            const mainContent = popup.ELEMENT.querySelector('.data-main-content');
            const sectionSubjectId = this.section_subject_id;

            ListenToCombo(category, (cat) => {
                SelectModelByFilter(JSON.stringify({
                    section_subject_id: sectionSubjectId
                }), cat == "Activity" ? "ACTIVITY_CONTROL" : "EXAM_CONTROL")
                .then(res => {
                    const newData = res.map((item) => {
                        return {
                            value: cat == "Activity" ? item.activity_id : item.exam_id,
                            text: item.title
                        }
                    });

                    SetNewComboItems(data, newData, function(value) {
                        console.log({
                            category: cat,
                            parent_id: value
                        });
                        SelectModelByFilter(JSON.stringify({
                            category: cat,
                            parent_id: value
                        }), "GRADE_SCORE_CONTROL")
                        .then(res => {
                            
                        });
                    });

                    mainContent.classList.remove("hide-component");
                });

            });

            ManageComboBoxes();
        });
    }

    showNewCategoryEditor(button) {
        const existingContainer = document.querySelector('.floating-container');
        if (existingContainer) existingContainer.remove();

        const container = document.createElement('div');
        container.className = 'floating-container';
        container.innerHTML = `
            <h3>Add New Category</h3>
            <label for="categoryName">Category Name</label>
            <input type="text" id="categoryName" placeholder="Enter category name">
            <label for="categoryPercentage">Percentage Weight</label>
            <input type="number" id="categoryPercentage" placeholder="Enter percentage" min="0" max="100">
            <button>Add Category</button>
        `;

        const rect = button.getBoundingClientRect();
        container.style.top = `${rect.bottom + window.scrollY}px`;
        container.style.left = `${rect.left + window.scrollX}px`;
        document.body.appendChild(container);

        // Add click event listener to document
        const handleClickOutside = (e) => {
            if (!container.contains(e.target) && !button.contains(e.target)) {
                container.remove();
                document.removeEventListener('click', handleClickOutside);
            }
        };

        // Use setTimeout to prevent immediate triggering
        setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 0);

        container.querySelector('button').addEventListener('click', () => {
            const name = container.querySelector('#categoryName').value;
            const percentage = parseInt(container.querySelector('#categoryPercentage').value);

            if (name && !isNaN(percentage)) {
                this.addNewCategory(name, percentage);
                container.remove();
            }
        });
    }

    addNewCategory(name, percentage, category_id = null) {
        let status = category_id ? 'original' : 'created';
        category_id = category_id ?? MakeID(10);

        this.categories.push({ name, percentage, status, category_id });

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

        const category = this.categories.find(cat => cat.category_id.toString() === categoryId.toString());
        if (!category) return;

        const container = document.createElement('div');
        container.className = 'floating-container';
        container.innerHTML = `
            <h3>Edit Category</h3>
            <label for="editCategoryName">Category Name</label>
            <input type="text" id="editCategoryName" value="${category.name}">
            <label for="editCategoryPercentage">Percentage Weight</label>
            <input type="number" id="editCategoryPercentage" value="${category.percentage}" min="0" max="100">
            <button class="save-category">Save Changes</button>
            <div class="button-divider"></div>
            <button class="delete-category">Delete Category</button>
        `;

        const rect = header.getBoundingClientRect();
        container.style.top = `${rect.bottom + window.scrollY}px`;
        container.style.left = `${rect.left + window.scrollX}px`;
        document.body.appendChild(container);

        // Add click event listener to document
        const handleClickOutside = (e) => {
            if (!container.contains(e.target) && !header.contains(e.target)) {
                container.remove();
                document.removeEventListener('click', handleClickOutside);
            }
        };

        // Use setTimeout to prevent immediate triggering
        setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 0);

        // Setup event listeners
        container.querySelector('.save-category').addEventListener('click', () => {
            const newName = container.querySelector('#editCategoryName').value;
            const newPercentage = parseInt(container.querySelector('#editCategoryPercentage').value);

            if (newName && !isNaN(newPercentage)) {
                category.name = newName;
                category.percentage = newPercentage;
                category.status = category.status === 'original' ? 'edited' : category.status;
                
                this.updateCategoryHeaders();
                this.table.querySelectorAll('tbody tr').forEach(row => {
                    this.recalculateGrades(row);
                });
                this.setUnsavedChanges(true);
                container.remove();
            }
        });

        container.querySelector('.delete-category').addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
                this.removeCategory(categoryId);
                container.remove();
            }
        });
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
        const header = this.table.querySelector(`th.score-header[data-category="${category}"][data-column="${column}"]`);
        const columnId = header.dataset.columnId;
        const columnStatus = this.columnStructure[category].columnStatus[columnId];

        // Only track removed columns that were original
        if (columnStatus === 'original') {
            if (!this.removedColumns[category]) {
                this.removedColumns[category] = [];
            }
            this.removedColumns[category].push(columnId);
        }

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

    removeCategory(categoryId) {
        const category = this.categories.find(cat => cat.category_id.toString() === categoryId.toString());

        if (!category) return;

        // If it was an original category, track it for deletion
        if (category.status === 'original') {
            this.removedCategories.push(categoryId);
        }


        // Remove category header and all related columns
        const categoryHeader = this.table.querySelector(`thead tr:first-child th[data-category="${categoryId}"]`);
        if (categoryHeader) {
            categoryHeader.remove();
        } else {
            console.log('Category header not found');
        }

        // Remove all score headers for this category
        const scoreHeaders = this.table.querySelectorAll(`thead tr:last-child th[data-category="${categoryId}"]`);
        scoreHeaders.forEach(el => el.remove());

        // Remove all data cells and weighted score cells
        this.table.querySelectorAll('tbody tr').forEach(row => {
            // Remove grade input cells
            const inputCells = row.querySelectorAll(`td .grade-input[data-category="${categoryId}"]`);
            inputCells.forEach(input => input.closest('td').remove());
            
            // Remove weighted score cell
            const wsCell = row.querySelector(`td.ws[data-category="${categoryId}"]`);
            if (wsCell) {
                wsCell.remove();
            }
        });

        // Remove from internal data structures
        this.categories = this.categories.filter(cat => cat.category_id !== categoryId);
        delete this.columnStructure[categoryId];

        // Clean up student scores
        Object.values(this.studentScores).forEach(student => {
            delete student.scores[categoryId];
            delete student.weightedScores[categoryId];
            delete student.scoreIds?.[categoryId];
        });

        // Recalculate grades for all students
        this.table.querySelectorAll('tbody tr').forEach(row => {
            this.recalculateGrades(row);
        });

        this.setUnsavedChanges(true);
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

        if (this.saveGradesBtn) {
            this.saveGradesBtn.addEventListener('click', () => {
                this.saveGrades().then((res) => {

                    if (res) {
                        this.initializeOriginalGrades(); // Initialize original grades after loading
                        this.setUnsavedChanges(false); // Set initial state of save changes
                    }
                });
            });
        }

        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            }
        });
    }

    async exportToExcel() {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Grading Sheet');

        // Add title with better spacing
        worksheet.mergeCells('A1:H1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = 'GRADING SHEET';
        titleCell.font = { bold: true, size: 16 };
        titleCell.alignment = { horizontal: 'center' };

        // Add category weights with better layout
        worksheet.addRow([]); // Add spacing
        const weightLabelCell = worksheet.getCell('A3');
        weightLabelCell.value = 'CATEGORY WEIGHTS:';
        weightLabelCell.font = { bold: true };

        // Split category weights into multiple rows if needed
        let currentRow = 3;
        let currentCol = 2;
        this.categories.forEach((category, index) => {
            const cell = worksheet.getCell(currentRow, currentCol);
            cell.value = `${category.name} - ${category.percentage}%`;
            cell.alignment = { wrapText: true };
            
            currentCol++;
            if (currentCol > 5) { // Start new row after 4 categories
                currentRow++;
                currentCol = 2;
            }
        });

        // Add empty row for spacing
        worksheet.addRow([]);

        // Add headers
        const headers = ['STUDENT NAME'];
        this.categories.forEach(category => {
            const columnCount = this.columnStructure[category.category_id].totalColumns;
            headers.push(category.name);
            for (let i = 1; i < columnCount + 1; i++) {
                headers.push('');
            }
        });
        headers.push('FINAL GRADE', 'EQUIVALENT');

        const headerRow = worksheet.addRow(headers);
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '4472C4' }
            };
            cell.font = { bold: true, color: { argb: 'FFFFFF' } };
            cell.alignment = { horizontal: 'center' };
        });

        // Add subheaders
        const subHeaders = [''];
        this.categories.forEach(category => {
            const columnCount = this.columnStructure[category.category_id].totalColumns;
            for (let i = 1; i <= columnCount; i++) {
                subHeaders.push(`Score ${i}`);
            }
            subHeaders.push('WS');
        });
        subHeaders.push('', '');
        
        const subHeaderRow = worksheet.addRow(subHeaders);
        subHeaderRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'D9E1F2' }
            };
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center' };
        });

        // Add passing scores
        const passingScores = ['PASSING SCORES:'];
        this.categories.forEach(category => {
            const categoryId = category.category_id;
            this.columnStructure[categoryId].columnIds.forEach(columnId => {
                passingScores.push(this.passingScores.scores[`${categoryId}-${columnId}`] || 100);
            });
            passingScores.push('');
        });
        passingScores.push('', '');
        
        const passingScoreRow = worksheet.addRow(passingScores);
        passingScoreRow.getCell(1).font = { bold: true };

        // Get the number of actual students
        const studentCount = this.table.querySelectorAll('tbody tr').length;
        const totalRows = studentCount + 100; // Extend formulas 100 rows beyond

        // Add student data and extend formulas
        for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
            const actualRow = rowIndex + 6; // Starting from row 6
            const studentRow = this.table.querySelectorAll('tbody tr')[rowIndex];
            
            // Initialize row data with student name or empty string
            const rowData = [studentRow ? studentRow.querySelector('td').textContent : ''];
            let currentCol = 2; // Start from column B
            
            this.categories.forEach(category => {
                const categoryId = category.category_id;
                const columnCount = this.columnStructure[category.category_id].totalColumns;
                
                // Add individual scores if there are columns
                if (columnCount > 0) {
                    // Add actual scores for existing students, empty cells for extended rows
                    if (studentRow) {
                        studentRow.querySelectorAll(`.grade-input[data-category="${categoryId}"]`)
                            .forEach(input => {
                                const value = parseFloat(input.textContent) || 0;
                                rowData.push(value);
                                currentCol++;
                            });
                    } else {
                        // Add empty cells for score columns in extended rows
                        for (let i = 0; i < columnCount; i++) {
                            rowData.push(null);
                            currentCol++;
                        }
                    }
                    
                    // Add weighted score formula for all rows
                    const startCol = currentCol - columnCount;
                    const endCol = currentCol - 1;
                    const startLetter = getExcelColumn(startCol);
                    const endLetter = getExcelColumn(endCol);
                    
                    const wsFormula = `IF(A${actualRow}="","",IF(COUNTA(${startLetter}${actualRow}:${endLetter}${actualRow})=0,${category.percentage},AVERAGE(${startLetter}${actualRow}:${endLetter}${actualRow}))*${category.percentage/100})`;
                    worksheet.getCell(`${getExcelColumn(currentCol)}${actualRow}`).value = {
                        formula: wsFormula
                    };
                } else {
                    // If category has no columns, weighted score is the full percentage, but only if there's a student name
                    const wsFormula = `IF(A${actualRow}="","",${category.percentage})`;
                    worksheet.getCell(`${getExcelColumn(currentCol)}${actualRow}`).value = {
                        formula: wsFormula
                    };
                }
                
                rowData.push(null); // Placeholder for weighted score cell
                currentCol++;
            });

            // Add final grade formula for all rows
            const wsCols = this.categories.map((_, index) => {
                const categoryStartCol = 2 + this.categories.slice(0, index).reduce((acc, cat) => 
                    acc + this.columnStructure[cat.category_id].totalColumns + 1, 0) + 
                    this.columnStructure[this.categories[index].category_id].totalColumns;
                return getExcelColumn(categoryStartCol);
            });
            
            const finalGradeFormula = `IF(A${actualRow}="","",ROUND(SUM(${wsCols.map(col => `${col}${actualRow}`).join(',')}),2))`;
            const finalGradeCell = worksheet.getCell(`${getExcelColumn(currentCol)}${actualRow}`);
            finalGradeCell.value = { formula: finalGradeFormula };
            finalGradeCell.numFmt = '0.00'; // Format as decimal
            rowData.push(null);
            currentCol++;

            // Updated equivalent grade formula with more precise ranges
            const finalGradeCol = getExcelColumn(currentCol - 1);
            const equivalentFormula = `IF(A${actualRow}="","",
                IF(${finalGradeCol}${actualRow}>=95,1.00,
                IF(${finalGradeCol}${actualRow}>=91.5,1.25,
                IF(${finalGradeCol}${actualRow}>=88,1.50,
                IF(${finalGradeCol}${actualRow}>=84.5,1.75,
                IF(${finalGradeCol}${actualRow}>=81,2.00,
                IF(${finalGradeCol}${actualRow}>=77.5,2.25,
                IF(${finalGradeCol}${actualRow}>=74,2.50,
                IF(${finalGradeCol}${actualRow}>=70.5,2.75,
                IF(${finalGradeCol}${actualRow}>=67,3.00,5.00))))))))))`;
            
            const equivalentCell = worksheet.getCell(`${getExcelColumn(currentCol)}${actualRow}`);
            equivalentCell.value = { formula: equivalentFormula };
            equivalentCell.numFmt = '0.00'; // Format as decimal

            // Add conditional formatting for pass/fail
            worksheet.addConditionalFormatting({
                ref: `${getExcelColumn(currentCol)}${6}:${getExcelColumn(currentCol)}${totalRows + 5}`,
                rules: [
                    {
                        type: 'cellIs',
                        operator: 'equal',
                        formulae: ['5.00'],
                        style: {
                            fill: {
                                type: 'pattern',
                                pattern: 'solid',
                                bgColor: { argb: 'FFFF0000' } // Red for failed
                            },
                            font: {
                                color: { argb: 'FFFFFFFF' }
                            }
                        }
                    },
                    {
                        type: 'cellIs',
                        operator: 'lessThan',
                        formulae: ['5.00'],
                        style: {
                            fill: {
                                type: 'pattern',
                                pattern: 'solid',
                                bgColor: { argb: 'FF92D050' } // Green for passed
                            }
                        }
                    }
                ]
            });

            // Add the row data
            const dataRow = worksheet.addRow(rowData);
            
            // Set alignment for all cells in the row
            dataRow.eachCell((cell, colNumber) => {
                if (colNumber > 1) { // Skip student name column
                    cell.alignment = { horizontal: 'center' };
                }
            });
        }

        // Set column widths
        worksheet.columns = [
            { width: 35 }, // Student Name
            ...Array(headers.length - 1).fill({ width: 12 }) // Other columns
        ];

        // Add category header merges
        let startCol = 2; // Start from B column (1-based)
        this.categories.forEach(category => {
            const columnCount = this.columnStructure[category.category_id].totalColumns;
            const endCol = startCol + columnCount;
            const startCell = worksheet.getCell(4, startCol);
            worksheet.mergeCells(4, startCol, 4, endCol);
            startCell.alignment = { horizontal: 'center' };
            startCol = endCol + 1;
        });

        // Generate filename
        const date = new Date();
        const filename = `Grading_Sheet_${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}.xlsx`;

        // Save file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
        window.URL.revokeObjectURL(url);
    }
}

// Helper function to convert column number to Excel column letter
function getExcelColumn(column) {
    let temp, letter = '';
    while (column > 0) {
        temp = (column - 1) % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        column = (column - temp - 1) / 26;
    }
    return letter;
}