export class ProgressBar {
    constructor() {
        this.progressBar = this.createElement();
        this.progress = 0;
    }

    createElement() {
        const progressBar = document.createElement('div');
        progressBar.classList.add('progressbar');

        // Inner div to show progress
        this.progressFill = document.createElement('div');
        this.progressFill.classList.add('progress-fill');
        progressBar.appendChild(this.progressFill);

        return progressBar;
    }

    update(value) {
        this.progress = value;
        this.render();
    }

    reset() {
        this.progress = 0;
        this.render();
    }

    render() {
        this.progressFill.style.width = `${this.progress}%`;
    }
}