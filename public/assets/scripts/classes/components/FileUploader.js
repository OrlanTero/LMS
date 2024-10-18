export default class FileUploader {
    constructor(options) {
        this.options = {
            targetElement: null,
            supportedFormats: ['.csv'],
            multiple: false,
            callback: null,
            ...options
        };

        this.fileInput = null;
        this.dropZone = null;
        this.fileDetails = null;
        this.fileName = null;
        this.fileSize = null;
        this.processFileBtn = null;

        this.init();
    }

    init() {
        this.createElements();
        this.setupEventListeners();
    }

    createElements() {
        this.fileInput = this.options.targetElement.querySelector('#fileInput');
        this.dropZone = this.options.targetElement.querySelector('#dropZone');
        this.fileDetails = this.options.targetElement.querySelector('#fileDetails');
        this.fileName = this.options.targetElement.querySelector('#fileName');
        this.fileSize = this.options.targetElement.querySelector('#fileSize');
        this.processFileBtn = this.options.targetElement.querySelector('#processFileBtn');
    }

    setupEventListeners() {
        this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        this.processFileBtn.addEventListener('click', this.processFile.bind(this));

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, this.highlight.bind(this), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, this.unhighlight.bind(this), false);
        });

        this.dropZone.addEventListener('drop', this.handleDrop.bind(this), false);
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.updateFileInfo(file);
            this.onFileUpload(file);
        }
    }

    processFile() {
        const file = this.fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const csvData = e.target.result;
                this.onFileUpload(file, csvData);
            };
            reader.readAsText(file);
        }
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    highlight() {
        this.dropZone.classList.add('highlight');
    }

    unhighlight() {
        this.dropZone.classList.remove('highlight');
    }

    handleDrop(e) {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        if (file) {
            this.fileInput.files = dt.files;
            this.updateFileInfo(file);
        }
    }

    updateFileInfo(file) {
        this.fileName.textContent = file.name;
        this.fileSize.textContent = (file.size / 1024).toFixed(2) + ' KB';
        this.fileDetails.style.display = 'block';
        this.processFileBtn.style.display = 'inline-block';
    }

    onFileUpload(file, csvData = null) {
        if (csvData) {
            console.log('File uploaded and processed:', file.name);
            console.log('CSV Data:', csvData);

            if (this.options.callback) {
                this.options.callback({file, csvData});
            }
        } else {
            console.log('File uploaded:', file.name);
        }
        return { file, csvData };
    }
}