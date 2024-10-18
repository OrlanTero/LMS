export default class ImportWizard {
    constructor() {
        this.tabButtons = document.querySelectorAll('.tab-button');
        this.tabPanes = document.querySelectorAll('.tab-pane');
        this.backBtn = document.getElementById('backBtn');
        this.skipBtn = document.getElementById('skipBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.currentStep = 1;
        this.steps = [
            { required: true },
            { required: true },
            { required: true },
            { required: false },
            { required: true }
        ];

        

        this.init();
    }

    init() {
        this.addEventListeners();
        this.updateStepVisibility();
    }

    addEventListeners() {
        this.tabButtons.forEach((button, index) => {
            button.addEventListener('click', () => this.handleTabClick(index));
        });

        this.backBtn.addEventListener('click', () => this.handleBack());
        this.skipBtn.addEventListener('click', () => this.handleSkip());
        this.nextBtn.addEventListener('click', () => this.handleNext());
    }

    updateStepVisibility() {
        this.tabButtons.forEach((btn, index) => {
            btn.disabled = index >= this.currentStep;
        });

        this.backBtn.disabled = this.currentStep === 1;
        this.nextBtn.disabled = this.currentStep === this.steps.length;
        this.skipBtn.style.display = !this.steps[this.currentStep - 1].required ? 'inline-block' : 'none';
    }

    showStep(step) {
        this.tabButtons.forEach(btn => btn.classList.remove('active'));
        this.tabPanes.forEach(pane => pane.classList.remove('active'));

        this.tabButtons[step - 1].classList.add('active');
        this.tabPanes[step - 1].classList.add('active');
    }

    handleTabClick(index) {
        if (index < this.currentStep) {
            this.currentStep = index + 1;
            this.showStep(this.currentStep);
            this.updateStepVisibility();
        }
    }

    handleBack() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
            this.updateStepVisibility();
        }
    }

    handleSkip() {
        if (!this.steps[this.currentStep - 1].required) {
            this.currentStep++;
            this.showStep(this.currentStep);
            this.updateStepVisibility();
        }
    }

    handleNext() {
        if (this.currentStep < this.steps.length) {
            this.currentStep++;
            this.showStep(this.currentStep);
            this.updateStepVisibility();
        }
    }
}