import {addHtml, Ajax, ListenToForm, ManageComboBoxes, ListenToCombo, AddNewComboItem, SetComboValue, GetComboValue, MakeID, SetNewComboItems} from "../../../modules/component/Tool.js";
import Popup from "../../../classes/components/Popup.js";
import {AddRecord, PostRequest, UploadFileFromFile} from "../../../modules/app/SystemFunctions.js";
import { SelectModels, SelectModelByFilter } from "../../../modules/app/Administrator.js";

const TARGET = "resources";
const MINI_TARGET = "resource";

function NewExam(section_id) {
    return new Promise((resolve) => {
        const popup = new Popup(`${"exams"}/add_new_exams`, {section_id},{
            backgroundDismiss: false,
        });

        popup.Create().then((() => {
            popup.Show();

            const form = popup.ELEMENT.querySelector("form");
            const section_subject_id = form.querySelector(".section_subject_id");

            ListenToForm(form, (data) => {
                UploadFileFromFile(data.file, data.file.name, "public/assets/media/uploads/exams/").then((res) => {
                    if (res.code == 200) {
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
        }));
    });
}   

function Exams() {
    const addExamBtn = document.querySelector(".add-exam-btn");

    if (addExamBtn) {
        addExamBtn.addEventListener("click", function() {
            NewExam(addExamBtn.dataset.section_id);
        });
    }
}

function Grades() {
    const table = document.querySelector('.grading-table');
    let passingScores = {
        scores: {},    // Will store the actual scores
        status: {}     // Will store the status for each passing score
    };
    
    let categories = [];

    // Track student scores
    let studentScores = {};  // Remove the initial structure, we'll build it per student
    
    // Track column structure for each category
    let columnStructure = {};

    const saveGradesBtn = document.getElementById('save-grades');
    const discardGradesBtn = document.getElementById('discard-grades');
    let originalGrades = {};
    let hasUnsavedChanges = false;

    function LoadGradingPlatform(grading_platform) {
        if (!grading_platform) return;

        // Reset existing structures
        categories = [];
        studentScores = {};
        columnStructure = {};
        passingScores = { scores: {}, status: {} };

        // Process categories and their columns
        if (grading_platform.categories) {
            grading_platform.categories.forEach(category => {
                const categoryId = category.grading_category_id;

                addNewCategory(category.name, category.percentage, categoryId);

                if (category.columns && Array.isArray(category.columns)) {
                    category.columns.forEach(col => {
                        addColumn(categoryId, col);
                    });
                }
            });
        }

        // Update UI and recalculate grades
        // initializeOriginalGrades();
        updateCategoryHeaders();
        
        // // Recalculate grades for all rows
        // table.querySelectorAll('tbody tr').forEach(row => {
        //     recalculateGrades(row);
        // });
    }
        

    function Load(section_subject_id) {
        SelectModelByFilter(JSON.stringify({section_subject_id: section_subject_id}), "GRADING_PLATFORM_CONTROL").then((res) => {
            LoadGradingPlatform(res[0]);
        }); 
    }

    // Initialize original grades
    function initializeOriginalGrades() {
        table.querySelectorAll('tbody tr').forEach(row => {
            const userId = row.dataset.student;
            // Check if studentScores[userId] exists before copying
            if (studentScores[userId]) {
                originalGrades[userId] = JSON.parse(JSON.stringify(studentScores[userId]));
            } else {
                // Initialize empty structure if studentScores not yet set
                originalGrades[userId] = {
                    scores: {},
                    weightedScores: {},
                    finalGrade: 0,
                    collegeGrade: 0,
                    status: {} // Add status object
                };
                categories.forEach((_, index) => {
                    const categoryIndex = index + 1;
                    originalGrades[userId].scores[categoryIndex] = {};
                    originalGrades[userId].weightedScores[categoryIndex] = 0;
                });
            }
        });
    }

    // Save grades to the server
    function saveGrades() {
        const gradesData = {
            section_subject_id: table.dataset.sectionSubjectId,
            categories: categories
                .map((cat) => ({
                    id: cat.category_id,
                    name: cat.name,
                    percentage: cat.percentage,
                    status: cat.status,
                    columns: columnStructure[cat.category_id].columnIds
                        .map((columnId, index) => ({
                            id: columnId,
                            column_number: columnStructure[cat.category_id].columns[index],
                            passing_score: passingScores.scores[`${cat.category_id}-${columnId}`],
                            passing_score_status: passingScores.status[`${cat.category_id}-${columnId}`]
                        }))
                })),
            student_grades: Object.entries(studentScores)
                .map(([studentId, data]) => ({
                    student_id: studentId,
                    category_scores: Object.entries(data.scores)
                        .map(([categoryId, scores]) => ({
                            category_id: categoryId,
                            scores: Object.entries(scores)
                                .filter(([columnId]) => {
                                    const status = data.status[`${studentId}-${categoryId}-${columnId}`];
                                    return status && status !== 'original';
                                })
                                .map(([columnId, score]) => {
                                    const scoreId = data.scoreIds?.[categoryId]?.[columnId] || MakeID(10);
                                    return {
                                        id: scoreId,
                                        column_id: columnId,
                                        score: score,
                                        status: data.status[`${studentId}-${categoryId}-${columnId}`]
                                    };
                                })
                        }))
                        .filter(category => category.scores.length > 0),
                    final_grade: data.finalGrade,
                    college_grade: data.collegeGrade
                }))
                .filter(student => student.category_scores.length > 0)
        };

        return new Promise((resolve) => {
            PostRequest("SaveGrades", {data: JSON.stringify(gradesData)}).then((res) => {
                resolve(res);
            });
        });
    }

    // Discard changes and revert to original grades
    function discardGrades() {
        table.querySelectorAll('tbody tr').forEach(row => {
            const userId = row.querySelector('.grade-input').dataset.student;
            studentScores[userId] = JSON.parse(JSON.stringify(originalGrades[userId]));
            
            // Reset all statuses to original
            row.querySelectorAll('.grade-input').forEach(input => {
                const category = input.dataset.category;
                const column = input.dataset.column;
                const scoreKey = `${userId}-${category}-${column}`;
                studentScores[userId].status[scoreKey] = 'original';
                input.textContent = studentScores[userId].scores[category][column] || '0';
            });
            
            recalculateGrades(row);
        });
        
        setUnsavedChanges(false);
    }

    // Track changes in grades
    function setUnsavedChanges(value) {
        hasUnsavedChanges = value;
        saveGradesBtn.disabled = !hasUnsavedChanges;
        discardGradesBtn.disabled = !hasUnsavedChanges;
    }

    // Modify the existing grade input handler to track changes
    table.addEventListener('input', function(e) {
        if (e.target.classList.contains('grade-input')) {
            const category = e.target.dataset.category;
            const columnId = e.target.dataset.columnId;
            const userId = e.target.dataset.student;
            const scoreKey = `${userId}-${category}-${columnId}`;
            let value = e.target.textContent === '' ? 0 : parseFloat(e.target.textContent);

            // Initialize structures if needed...
            if (!studentScores[userId]) {
                studentScores[userId] = {
                    scores: {},
                    scoreIds: {}, // Add scoreIds structure
                    weightedScores: {},
                    finalGrade: 0,
                    collegeGrade: 0,
                    status: {}
                };
            }

            if (!studentScores[userId].scores[category]) {
                studentScores[userId].scores[category] = {};
                studentScores[userId].scoreIds[category] = {}; // Initialize score IDs
                studentScores[userId].status = studentScores[userId].status || {}; // Initialize status object if needed
            }

            // Update score
            studentScores[userId].scores[category][columnId] = value;

            if (!studentScores[userId].status[scoreKey]) {
                studentScores[userId].status[scoreKey] = 'created';
            } else if (studentScores[userId].status[scoreKey] === 'original') {
                studentScores[userId].status[scoreKey] = 'edited';
            }

            recalculateGrades(e.target.closest('tr'));
            setUnsavedChanges(true);
        }
    });

    // Add event listeners for save and discard buttons
    saveGradesBtn.addEventListener('click', () => {
        saveGrades().then(res => {
            res = JSON.parse(res);
            
            if (res.code === 200) {
                // Show success notification
                alert('Grades saved successfully!');
            } else {
                // Show error notification
                alert('Failed to save grades. Please try again.');
            }
        });
    });

    // Recalculate all grades for a row
    function recalculateGrades(row) {
        const userId = row.dataset.student;

        categories.forEach((category) => {
            const category_id = category.category_id;
            const inputs = row.querySelectorAll(`.grade-input[data-category="${category_id}"]`);
            let total = 0;
            let validInputs = inputs.length; // Count all inputs as valid

            inputs.forEach(input => {
                const value = studentScores[userId].scores[category_id][input.dataset.column];
                total += (value === undefined || value === '') ? 0 : value;
            });

            const wsCell = row.querySelector(`.ws[data-category="${category_id}"]`);
            const average = validInputs > 0 ? total / validInputs : 0;
            const weightedScore = average * (category.percentage / 100);

            if (wsCell) {
                wsCell.textContent = weightedScore.toFixed(2);
                studentScores[userId].weightedScores[category_id] = weightedScore;
            }
        });

        updateFinalGrade(row);
    }

    function updateFinalGrade(row) {
        const userId = row.dataset.student;
        let finalGrade = 0;
        
        Object.values(studentScores[userId].weightedScores).forEach(score => {
            finalGrade += score;
        });
        
        studentScores[userId].finalGrade = finalGrade;
        const finalGradeCell = row.querySelector('.final-grade');
        finalGradeCell.textContent = finalGrade.toFixed(2);
        updateCollegeGrade(row, finalGrade, finalGradeCell);
    }

    function updateCollegeGrade(row, finalGrade, finalGradeCell) {
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
        studentScores[userId].collegeGrade = collegeGrade;
        collegeGradeCell.textContent = collegeGrade.toFixed(1);
        if (finalGrade < 75) {
            finalGradeCell.classList.add('failed-grade');
            collegeGradeCell.classList.add('failed-grade');
        } else {
            finalGradeCell.classList.remove('failed-grade');
            collegeGradeCell.classList.remove('failed-grade');
        }
    }

    function showPassingScoreEditor(header, category, column) {
        const existingContainer = document.querySelector('.floating-container');
        if (existingContainer) existingContainer.remove();

        // Get the columnId from the header
        const columnId = header.dataset.columnId;
        const scoreKey = `${category}-${columnId}`;

        const container = document.createElement('div');
        container.className = 'floating-container';
        container.innerHTML = `
            <input type="number" value="${passingScores.scores[scoreKey] || 100}" min="0" max="100">
            <button>Save</button>
        `;

        const rect = header.getBoundingClientRect();
        container.style.top = `${rect.bottom + window.scrollY}px`;
        container.style.left = `${rect.left + window.scrollX}px`;
        document.body.appendChild(container);

        setupPassingScoreEvents(container, category, columnId); // Pass columnId instead of column number
    }

    function setupPassingScoreEvents(container, category, columnId) {
        container.querySelector('button').addEventListener('click', function() {
            const passingScore = parseFloat(container.querySelector('input').value);
            const scoreKey = `${category}-${columnId}`;
            
            // Store the score
            passingScores.scores[scoreKey] = passingScore;
            
            // Set status as 'edited' if it exists, otherwise 'created'
            if (!passingScores.status[scoreKey]) {
                passingScores.status[scoreKey] = 'created';
            } else if (passingScores.status[scoreKey] === 'original') {
                passingScores.status[scoreKey] = 'edited';
            }
            
            // Update grades to respect new passing score
            const inputs = table.querySelectorAll(
                `.grade-input[data-category="${category}"][data-column-id="${columnId}"]`
            );
            inputs.forEach(input => {
                let value = input.textContent === '' ? 0 : parseFloat(input.textContent);
                if (!isNaN(value)) {
                    value = Math.min(value, passingScore);
                    input.textContent = value;
                    recalculateGrades(input.closest('tr'));
                }
            });
            
            container.remove();
            setUnsavedChanges(true);
        });

        // Close on outside click
        document.addEventListener('click', function closeContainer(e) {
            if (!container.contains(e.target) && !e.target.classList.contains('score-header')) {
                container.remove();
                document.removeEventListener('click', closeContainer);
            }
        });
    }


    function showNewCategoryEditor(button) {
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

        container.querySelector('button').addEventListener('click', function() {
            const name = container.querySelector('input[type="text"]').value;
            const percentage = parseInt(container.querySelector('input[type="number"]').value);
            
            if (name && !isNaN(percentage)) {
                addNewCategory(name, percentage);
                container.remove();
            }
        });

        // Close on outside click
        document.addEventListener('click', function closeContainer(e) {
            if (!container.contains(e.target) && !e.target.classList.contains('add-category')) {
                container.remove();
                document.removeEventListener('click', closeContainer);
            }
        });
    }

    function addNewCategory(name, percentage, category_id = null) {

        let status = category_id ? 'original' : 'created';

        category_id = category_id ?? MakeID(10);

        categories.push({ name, percentage, status, category_id});

        columnStructure[category_id] = {
            columns: [],
            columnIds: [], // Add columnIds array
            columnStatus: {},
            totalColumns: 0,
        };

        // Add new category header
        const headerRow = table.querySelector('thead tr:first-child');
        const newHeader = document.createElement('th');
        newHeader.classList.add('category-header');
        newHeader.dataset.category = category_id;
        newHeader.colSpan = 0; 

        newHeader.innerHTML = `
            ${name} (${percentage}%)
            <span class="edit-header" title="Edit Header">
                <?= UseIcon("pencil-thin") ?>
            </span>
        `;
        
        headerRow.insertBefore(newHeader, headerRow.querySelector('th:nth-last-child(3)'));

        // Add column headers
        const subHeaderRow = table.querySelector('thead tr:last-child');
        const insertBeforeElement = subHeaderRow.querySelector(`th.add-column-header[data-category="${category_id}"]`);

        const addColumnHeader = document.createElement('th');
        addColumnHeader.classList.add('add-column-header');
        addColumnHeader.dataset.category = category_id;
        addColumnHeader.innerHTML = `<button class="add-column" data-category="${category_id}">+</button>`;
        subHeaderRow.insertBefore(addColumnHeader, insertBeforeElement ? insertBeforeElement.nextSibling : null);

        // Add cells to each row
        table.querySelectorAll('tbody tr').forEach(row => {
            const insertBeforeCell = row.querySelector('td:nth-last-child(2)');
            const userId = row.dataset.student;

            // Initialize scores for new category if not already initialized
            if (!studentScores[userId]) {
                studentScores[userId] = { scores: {}, weightedScores: {}, status: {} };
            }

            studentScores[userId].scores[category_id] = {};
            studentScores[userId].weightedScores[category_id] = 0;
            studentScores[userId].status[category_id] = 'created';
       
            // Add weighted score cell
            const wsCell = document.createElement('td');
            wsCell.className = 'ws';
            wsCell.dataset.category = category_id;
            wsCell.textContent = '0.00';
            row.insertBefore(wsCell, insertBeforeCell);
            
            recalculateGrades(row);
        });

        // Update column structure
        columnStructure[category_id].columns = [];
        columnStructure[category_id].totalColumns = 0;

        reindexColumns(category_id);
        updateHeaderColspan(category_id);
        setUnsavedChanges(true);
    }

    function showCategoryEditor(header, categoryIndex) {
        const existingContainer = document.querySelector('.floating-container');
        if (existingContainer) existingContainer.remove();

        const container = createFloatingEditor(
            header,
            categories[categoryIndex - 1].name,
            categories[categoryIndex - 1].percentage,
            (newName, newPercentage) => {
                if (categories[categoryIndex - 1].status === 'original') {
                    categories[categoryIndex - 1].status = 'edited';
                }
                categories[categoryIndex - 1].name = newName;
                categories[categoryIndex - 1].percentage = newPercentage;
                updateCategoryHeaders();
                table.querySelectorAll('tbody tr').forEach(row => {
                    recalculateGrades(row);
                });
                setUnsavedChanges(true);
            }
        );
        document.body.appendChild(container);

        // Close on outside click
        document.addEventListener('click', function closeContainer(e) {
            if (!container.contains(e.target) && !e.target.classList.contains('edit-header')) {
                container.remove();
                document.removeEventListener('click', closeContainer);
            }
        });
    }

    function createFloatingEditor(element, defaultName, defaultPercentage, onSave) {
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

        container.querySelector('button').addEventListener('click', function() {
            const newName = container.querySelector('input[type="text"]').value;
            const newPercentage = parseInt(container.querySelector('input[type="number"]').value);

            if (newName && !isNaN(newPercentage)) {
                onSave(newName, newPercentage);
            }
            container.remove();
        });

        return container;
    }

    function addColumn(category, column = null) {
        columnStructure[category].totalColumns++;
        const newColumnNum = columnStructure[category].totalColumns;
        columnStructure[category].columns.push(newColumnNum);
        
        // Add status for new column
        const status = column ? 'original' : 'created';
        const newColumnId = column?.grading_score_column_id ?? MakeID(20);
        columnStructure[category].columnIds.push(newColumnId);
        columnStructure[category].columnStatus[newColumnId] = status;

        // Initialize passing score for the new column
        const scoreKey = `${category}-${newColumnId}`;
        passingScores.scores[scoreKey] = column?.passing_score ?? 100; // Default passing score
        passingScores.status[scoreKey] = status;

        // Create header
        const headerRow = table.querySelector('thead tr:last-child');
        const newHeader = document.createElement('th');
        newHeader.classList.add('score-header');
        newHeader.dataset.category = category;
        newHeader.dataset.column = newColumnNum;
        newHeader.dataset.columnId = newColumnId;
        newHeader.innerHTML = `${newColumnNum} <button class="remove-column" data-category="${category}" data-column="${newColumnNum}">-</button>`;

        // Add header to table
        const addColumnHeader = headerRow.querySelector(`.add-column[data-category="${category}"]`).parentElement;
        headerRow.insertBefore(newHeader, addColumnHeader);

        // Add new cell in each row before the weighted score cell for this category
        const rows = table.querySelectorAll('tbody tr');

        const getScore = (userId) => {
            if (column) {
                for (const score of column.scores) {
                    if (score.student_id == userId) {
                        return score;
                    }
                }
            }

            return null;
        }


        rows.forEach(row => {
            const userId = row.dataset.student;
            const score = getScore(userId);
            const newScoreId = score ? score.grading_score_id : MakeID(10);

            
            // Initialize scoreIds structure if needed
            if (!studentScores[userId].scoreIds) {
                studentScores[userId].scoreIds = {};
            }
            if (!studentScores[userId].scoreIds[category]) {
                studentScores[userId].scoreIds[category] = {};
            }

            // Add new cell with all necessary data attributes
            const newCell = document.createElement('td');
            newCell.innerHTML = `<span class="grade-input" contenteditable="true" 
                data-student="${userId}" 
                data-category="${category}" 
                data-column="${newColumnNum}"
                data-column-id="${newColumnId}"
                data-score-id="${newScoreId}">${score ? score.score : 0}</span>`;
            
            const wsCell = row.querySelector(`.ws[data-category="${category}"]`);
            row.insertBefore(newCell, wsCell);
            
            studentScores[userId].scores[category][newColumnId] = 0;
            studentScores[userId].scoreIds[category][newColumnId] = newScoreId;
       
            recalculateGrades(row);
        });

        updateHeaderColspan(category);
        setUnsavedChanges(true);

    }

    function removeColumn(category, column) {
        const columnId = table.querySelector(`th.score-header[data-category="${category}"][data-column="${column}"]`)
        .dataset.columnId;
    
        // Update passing scores status
        const scoreKey = `${category}-${columnId}`;
        if (passingScores.status[scoreKey] === 'original') {
            passingScores.status[scoreKey] = 'removed';
        } else if (passingScores.status[scoreKey] === 'created') {
            // If the column was newly created, remove it completely
            delete passingScores.scores[scoreKey];
            delete passingScores.status[scoreKey];
        }

        // Remove elements and update scores using columnId
        table.querySelector(`th.score-header[data-category="${category}"][data-column="${column}"]`).remove();
        table.querySelectorAll(`td .grade-input[data-category="${category}"][data-column="${column}"]`)
            .forEach(input => {
                const row = input.closest('tr');
                const userId = input.dataset.student;
                delete studentScores[userId].scores[category][columnId];
                input.closest('td').remove();
                recalculateGrades(row);
            });

        reindexColumns(category);
        updateHeaderColspan(category);
        delete passingScores[scoreKey];
        setUnsavedChanges(true);
    }

    function reindexColumns(category) {
        const headers = table.querySelectorAll(`th.score-header[data-category="${category}"]`);
        headers.forEach((header, index) => {
            const newColumn = index + 1;
            const oldColumn = header.dataset.column;
            header.dataset.column = newColumn;
            header.innerHTML = `${newColumn} <button class="remove-column" data-category="${category}" data-column="${newColumn}">-</button>`;
            
            table.querySelectorAll(`.grade-input[data-category="${category}"][data-column="${oldColumn}"]`)
                .forEach(input => {
                    const userId = input.dataset.student;
                    input.dataset.column = newColumn;
                    if (studentScores[userId].scores[category][oldColumn] !== undefined) {
                        studentScores[userId].scores[category][newColumn] = studentScores[userId].scores[category][oldColumn];
                        delete studentScores[userId].scores[category][oldColumn];
                    }
                });
        });
    }

    function updateHeaderColspan(category) {
        const categoryHeader = table.querySelector(`thead tr:first-child th[data-category="${category}"]`);
        categoryHeader.colSpan = columnStructure[category].totalColumns + 1;
    }

    function updateCategoryHeaders() {
        categories.forEach(category => {
            const header = table.querySelector(`th[data-category="${category.category_id}"]`);
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

    // Handle grade input with passing score check
    table.addEventListener('input', function(e) {
        if (e.target.classList.contains('grade-input')) {
            const category = e.target.dataset.category;
            const column = e.target.dataset.column;
            const userId = e.target.dataset.student;
            const passingScore = passingScores[`${category}-${column}`] || 100;
            let value = e.target.textContent === '' ? 0 : parseFloat(e.target.textContent);

            if (isNaN(value)) {
                e.target.textContent = '0';
                studentScores[userId].scores[category][column] = 0;
            } else {
                value = Math.min(value, passingScore);
                e.target.textContent = value;
                studentScores[userId].scores[category][column] = value;
                recalculateGrades(e.target.closest('tr'));
            }
        }
    });

    // Manage passing scores
    table.addEventListener('click', function(e) {
        if (e.target.classList.contains('score-header')) {
            const category = e.target.dataset.category;
            const column = e.target.dataset.column;
            showPassingScoreEditor(e.target, category, column);
        }
    });
    

    // Category management
    table.addEventListener('click', function(e) {
        if (e.target.closest('.edit-header')) {
            const categoryHeader = e.target.closest('.category-header');
            const category = parseInt(categoryHeader.dataset.category);
            showCategoryEditor(categoryHeader, category);
        } else if (e.target.closest('.add-category')) {
            showNewCategoryEditor(e.target.closest('.add-category'));
        }
    });
    
    // Add/Remove column functionality
    table.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-column')) {
            addColumn(e.target.dataset.category);
        } else if (e.target.classList.contains('remove-column')) {
            removeColumn(e.target.dataset.category, e.target.dataset.column);
        }
    });

    discardGradesBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to discard all changes?')) {
            discardGrades();
        }
    });

    // Add warning when leaving page with unsaved changes
    window.addEventListener('beforeunload', (e) => {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        }
    });


    // Initialize original grades when the component loads
    // initializeOriginalGrades();

    // Move Load call before initializeColumns
    Load(table.dataset.section_subject_id);

    // Initialize columns after loading data
    // initializeColumns();

    // Update grades after initialization
    // table.querySelectorAll('tbody tr').forEach(row => {
    //     recalculateGrades(row);
    // });

}

function NewActivity(section_id) {    
    return new Promise((resolve) => {
        const popup = new Popup(`${"activities"}/add_new_activity`, {section_id},{
            backgroundDismiss: false,
        });

        popup.Create().then((() => {
            popup.Show(); 

            const form = popup.ELEMENT.querySelector("form");
            const section_subject_id = form.querySelector(".section_subject_id");

            ListenToForm(form, async (data) => {
                popup.Remove();

                UploadFileFromFile(data.file, data.file.name, "public/assets/media/uploads/activities/").then((res) => {
                    if (res.code == 200) {

                        data.file = res.body.path;
                        data.section_subject_id = GetComboValue(section_subject_id).value;

                        AddRecord("activities", {data: JSON.stringify(data)}).then((res) => {
                            popup.Remove();
                            resolve(res);
                        });
                    }
                });
            },['description', 'due_date', 'file']);

        ManageComboBoxes();

        }));

    })
}

function Activities() {
    const addActivityBtn = document.querySelector(".add-activity-btn");

    if (addActivityBtn) {
        addActivityBtn.addEventListener("click", function() {
            NewActivity(addActivityBtn.dataset.section_id);
        });
    }
}

function NewResourceGroup() {
    return new Promise((resolve) => {
        const popup = new Popup(`${TARGET}/add_new_resource_group`, null,{
            backgroundDismiss: false,
        });

        popup.Create().then((() => {
            popup.Show();

            const form = popup.ELEMENT.querySelector("form");

            ListenToForm(form, (data) => {
                popup.Remove();
                resolve(data);
            },['description']);
        }));
    })
}

function NewResource(section_id) {
    return new Promise((resolve) => {
        const popup = new Popup(`${TARGET}/add_new_${MINI_TARGET}`, {section_id},{
            backgroundDismiss: false,
        });
    
        popup.Create().then((() => {
            popup.Show();

            const form = popup.ELEMENT.querySelector("form");
            const group_id = form.querySelector(".group_id");
            const section_subject_id = form.querySelector(".section_subject_id");
            const createdGroups = {};

            ListenToForm(form, (data) => {
                let group_id_value = GetComboValue(group_id);

                if (group_id_value.value) {
                    if (createdGroups[group_id_value.value]) {
                        data.group_id = createdGroups[group_id_value.value];
                    } else {
                        data.group_id = group_id_value.value;
                    }
                } else {
                    delete data.group_id;
                }

                data.section_id = section_id;
                data.section_subject_id = GetComboValue(section_subject_id).value;

                AddRecord(TARGET, {data: JSON.stringify(data), file: data.file}).then((res) => {
                    console.log(res);
                    popup.Remove();
    
                    // NewNotification({
                    //     title: res.code === 200 ? 'Success' : 'Failed',
                    //     message: res.code === 200 ? 'Successfully Added' : 'Task Failed to perform!'
                    // }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR)
    
                    // UpdateData()
                })
            },['description', 'group_id']);

            ListenToCombo(section_subject_id, (value) => {
                SelectModels("RESOURCES_GROUP_CONTROL", {section_id: section_id, section_subject_id: GetComboValue(section_subject_id).value}).then((groups) => {
                    SetNewComboItems(group_id, [{
                        value: "0",
                        text: "Create New Group"
                    },...groups.map((group) => {
                        return {
                            value: group.resources_group_id,
                            text: group.title
                        }
                    })], (value) => {
                        console.log(value);
                        if (value == 0) {
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
        }));
    })
}


function Resources() {
    const resourcesMenu = document.querySelector('.resources-menu');
    const resourcesList = document.querySelector('.resources-list');
    const accordionItems = document.querySelectorAll('.accordion-item');
    const uploadResourceBtn = document.querySelector('.upload-resource-btn');

    if (uploadResourceBtn) {
        uploadResourceBtn.addEventListener("click", function() {
            NewResource(uploadResourceBtn.dataset.section_id);
        })
    }

    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        const content = item.querySelector('.accordion-content');

        header.addEventListener('click', () => {
            // Close all other accordion items
            accordionItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.accordion-content').style.display = 'none';
                }
            });

            // Toggle the clicked item
            item.classList.toggle('active');
            if (item.classList.contains('active')) {
                content.style.display = 'block';
            } else {
                content.style.display = 'none';
            }
        });
    });


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

function SaveStickyNotes(stickyNotes, section_id, professor_id) {
    return new Promise((resolve) => {
        PostRequest("SaveStickyNotes", {stickyNotes: JSON.stringify(stickyNotes), section_id, professor_id}).then(res => {
            resolve(res);
        });
    });
}

function StickyNotes() {
    const session_id = document.querySelector('.main-body-body').dataset.session_id;
    const name = document.querySelector('.main-body-body').dataset.name;
    const image = document.querySelector('.main-body-body').dataset.image;
    const addNoteBtn = document.getElementById('add-note');
    const notesBoard = document.getElementById('notes-board');
    const saveNotesBtn = document.getElementById('save-notes');
    const discardChangesBtn = document.getElementById('discard-changes');
    const section_id = addNoteBtn.dataset.section_id;
    const professor_id = addNoteBtn.dataset.professor_id;
    let isDragging = false;
    let isResizing = false;
    let isRotating = false;
    let currentNote = null;
    let startX, startY, startWidth, startHeight, startAngle, startRotation;

    console.log(session_id);

    const colors = ['#FFD1DC', '#BFECC5', '#AEC6CF', '#FFE5B4', '#E6E6FA'];
    let notes = [];
    let savedNotes = [];
    let hasUnsavedChanges = false;

    addNoteBtn.addEventListener('click', () => {
        const note = createNote();
        note.dataset.status = 'created';
        note.dataset.user_id = session_id;
        notes.push(note);
        updateNotePositions();
        setUnsavedChanges(true);
    });

    saveNotesBtn.addEventListener('click', () => {
        savedNotes = notes.map(note => ({
            id: note.dataset.id,
            sticky_note_id: note.dataset.sticky_note_id,
            x: parseFloat(note.style.left) / 100,
            y: parseFloat(note.style.top) / 100,
            width: parseFloat(note.style.width) / 100,
            height: parseFloat(note.style.height) / 100,
            rotation: getCurrentRotation(note),
            content: note.querySelector('textarea').value,
            color: note.style.backgroundColor,
            locked: note.classList.contains('locked'),
            status: note.dataset.status,
            user_id: note.dataset.user_id,
            creator_name: note.dataset.creator_name,
            creator_image: note.dataset.creator_image
        }));

        SaveStickyNotes(savedNotes.filter(note => note.status !== 'preloaded'), section_id, professor_id).then((res) => {

        }); 

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

    function createNote(properties = null) {
        const note = document.createElement('div');
        
        note.className = 'sticky-note';
        if (properties && properties.sticky_note_id) {
            note.dataset.sticky_note_id = properties.sticky_note_id;
            note.dataset.status = 'preloaded';
            note.dataset.user_id = properties.user_id;
            note.dataset.creator_name = properties.creator_name;
            note.dataset.creator_image = properties.creator_image;
        } else {
            note.dataset.id = MakeID(10);
            note.dataset.status = 'created';
            note.dataset.user_id = session_id;
            note.dataset.creator_name = name;
            note.dataset.creator_image = image;
        }
        
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
        
        const backgroundColor = properties ? properties.color : colors[Math.floor(Math.random() * colors.length)];
        note.style.backgroundColor = backgroundColor;
        note.style.color = getContrastColor(backgroundColor);
        note.style.transform = properties ? `rotate(${properties.rotation}rad)` : 'rotate(0deg)';
        note.style.zIndex = getHighestZIndex() + 1;
        
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
        noteHeader.appendChild(creatorInfo);
        
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
                    notes = notes.filter(n => n !== note);
                }
                updateNotePositions();
                setUnsavedChanges(true);
            }, 500);
        });
        noteActions.appendChild(deleteBtn);

        const lockBtn = document.createElement('button');
        lockBtn.className = 'note-btn';
        lockBtn.innerHTML = properties && properties.locked ? '🔒' : '🔓';
        lockBtn.title = properties && properties.locked ? 'Unlock' : 'Lock';
        lockBtn.addEventListener('click', () => {
            note.classList.toggle('locked');
            lockBtn.innerHTML = note.classList.contains('locked') ? '🔒' : '🔓';
            lockBtn.title = note.classList.contains('locked') ? 'Unlock' : 'Lock';
            setUnsavedChanges(true);
            updateNoteInteractivity(note);
        });
        noteActions.appendChild(lockBtn);
        
        noteHeader.appendChild(noteActions);
        
        const textarea = document.createElement('textarea');
        textarea.placeholder = 'Write your note here...';
        textarea.value = properties ? properties.content : '';
        textarea.style.color = note.style.color;
        textarea.addEventListener('input', () => {
            if (note.dataset.user_id === session_id) {
                if (note.dataset.status === 'preloaded') {
                    note.dataset.status = 'edited';
                }
                setUnsavedChanges(true);
            }
        });
        
        const colorPicker = document.createElement('div');
        colorPicker.className = 'color-picker';
        
        colors.forEach(color => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            colorOption.style.backgroundColor = color;
            colorOption.addEventListener('click', () => {
                if (note.dataset.user_id === session_id) {
                    note.style.backgroundColor = color;
                    note.style.color = getContrastColor(color);
                    textarea.style.color = note.style.color;
                    if (note.dataset.status === 'preloaded') {
                        note.dataset.status = 'edited';
                    }
                    setUnsavedChanges(true);
                }
            });
            colorPicker.appendChild(colorOption);
        });
        
        const customColorPicker = document.createElement('div');
        customColorPicker.className = 'custom-color-picker';
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.addEventListener('input', (e) => {
            if (note.dataset.user_id === session_id) {
                const newColor = e.target.value;
                note.style.backgroundColor = newColor;
                note.style.color = getContrastColor(newColor);
                textarea.style.color = note.style.color;
                if (note.dataset.status === 'preloaded') {
                    note.dataset.status = 'edited';
                }
                setUnsavedChanges(true);
            }
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
        
        if (properties && properties.locked) {
            note.classList.add('locked');
        }
        
        updateNoteInteractivity(note);

        return note;
    }

    function applyNoteProperties(note, properties) {
        note.style.left = `${properties.x * 100}%`;
        note.style.top = `${properties.y * 100}%`;
        note.style.width = `${properties.width * 100}%`;
        note.style.height = `${properties.height * 100}%`;
        note.style.transform = `rotate(${properties.rotation}rad)`;
        note.querySelector('textarea').value = properties.content;
        note.style.backgroundColor = properties.color;
        note.style.color = getContrastColor(properties.color);
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
        updateNoteInteractivity(note);
    }

    notesBoard.addEventListener('mousedown', (e) => {
        const note = e.target.closest('.sticky-note');
        if (note && note.dataset.user_id === session_id && !note.classList.contains('locked')) {
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
            } else if (!e.target.classList.contains('note-btn') && !e.target.classList.contains('color-option') && !e.target.classList.contains('custom-color-picker')) {
                isDragging = true;
                currentNote = note;
                startX = e.clientX - note.offsetLeft;
                startY = e.clientY - note.offsetTop;
            }
            note.style.zIndex = getHighestZIndex() + 1;
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging && currentNote && currentNote.dataset.user_id === session_id && !currentNote.classList.contains('locked')) {
            let newX = (e.clientX - startX) / notesBoard.offsetWidth * 100;
            let newY = (e.clientY - startY) / notesBoard.offsetHeight * 100;
            
            newX = Math.max(0, Math.min(newX, 100 - parseFloat(currentNote.style.width)));
            newY = Math.max(0, Math.min(newY, 100 - parseFloat(currentNote.style.height)));
            
            currentNote.style.left = newX + '%';
            currentNote.style.top = newY + '%';
            if (currentNote.dataset.status === 'preloaded') {
                currentNote.dataset.status = 'edited';
            }
            setUnsavedChanges(true);
        } else if (isResizing && currentNote && currentNote.dataset.user_id === session_id && !currentNote.classList.contains('locked')) {
            const width = Math.max(10, (startWidth + e.clientX - startX) / notesBoard.offsetWidth * 100);
            const height = Math.max(10, (startHeight + e.clientY - startY) / notesBoard.offsetHeight * 100);
            currentNote.style.width = width + '%';
            currentNote.style.height = height + '%';
            if (currentNote.dataset.status === 'preloaded') {
                currentNote.dataset.status = 'edited';
            }
            setUnsavedChanges(true);
        } else if (isRotating && currentNote && currentNote.dataset.user_id === session_id && !currentNote.classList.contains('locked')) {
            const rect = currentNote.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
            const newRotation = angle - startAngle + startRotation;
            currentNote.style.transform = `rotate(${newRotation}rad)`;
            if (currentNote.dataset.status === 'preloaded') {
                currentNote.dataset.status = 'edited';
            }
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

    function updateNoteInteractivity(note) {
        const textarea = note.querySelector('textarea');
        const colorPicker = note.querySelector('.color-picker');
        const resizeHandle = note.querySelector('.resize-handle');
        const rotateHandle = note.querySelector('.rotate-handle');
        const deleteBtn = note.querySelector('.note-btn[title="Delete"]');
        const lockBtn = note.querySelector('.note-btn[title="Lock"], .note-btn[title="Unlock"]');

        if (note.dataset.user_id === session_id) {
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

    function LoadStickyNotes(section_id, professor_id) {
        return new Promise((resolve) => {
            SelectModels("STICKY_NOTE_CONTROL", JSON.stringify({section_id, professor_id})).then(res => {
                resolve(res);    
            })
        })
    }

    function getContrastColor(hexColor) {
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

    setTimeout(function() {
        LoadStickyNotes(section_id, professor_id).then(res => {
            savedNotes = res;
            savedNotes.forEach(noteData => {
                const note = createNote(noteData);
                notes.push(note);
            });
            
            updateNotePositions();
        })
    }, 2000)

    window.addEventListener('resize', () => {
        notes.forEach(note => {
            const left = parseFloat(note.style.left);
            const top = parseFloat(note.style.top);
            const width = parseFloat(note.style.width);
            const height = parseFloat(note.style.height);

            note.style.left = `${left}%`;
            note.style.top = `${top}%`;
            note.style.width = `${width}%`;
            note.style.height = `${height}%`;
        });
    });
}

function Cards() {
    const cards = document.querySelectorAll(".cards-flex-container .card-flex-container");

    const content = document.querySelector(".main-content");

    function GetClassContent(id, professor_id) {
        return new Promise((resolve) => {
            Ajax({
                url: "/components/popup/classes/getClassContent",
                type: "POST",
                data: {id, professor_id},
                success: (res) => {

                resolve(res);
                }
            })
        })
    }

    for (const card of cards) {
        card.addEventListener("click", function () {
            GetClassContent(card.getAttribute("data-id"), card.getAttribute("data-professor_id")).then((res) => {
                addHtml(content, res);

                Tabs();
                Resources();
                Activities();
                Exams();
                Grades();
                StickyNotes();
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