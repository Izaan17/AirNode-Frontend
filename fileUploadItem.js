import { ProgressBar } from "./progressBar.js";

export class FileUploadItem {
    
    constructor(fileName) {
        this.fileName = fileName;
        this.progressBar = new ProgressBar();
        
        // Create elements directly in the constructor
        this.containerElement = document.createElement('div');
        this.containerElement.classList.add('file-upload-item');

        const fileContainer = document.createElement('div'); // Create a container for filename and status
        fileContainer.classList.add('file-container');

        const nameEntryElement = document.createElement('input');
        nameEntryElement.classList.add('file-upload-item-name', 'file-name-entry');
        nameEntryElement.value = this.fileName;

        this.statusLabel = document.createElement('span');
        this.statusLabel.classList.add('file-item-status');

        const removeButton = document.createElement('button');
        removeButton.innerText = 'X';
        removeButton.classList.add('remove-button');
        removeButton.addEventListener('click', () => this.removeItem());

        // Append the name entry and status label to the fileContainer
        fileContainer.appendChild(nameEntryElement);
        fileContainer.appendChild(this.statusLabel);

        // Append all child elements
        this.containerElement.appendChild(fileContainer);
        this.containerElement.appendChild(this.progressBar.progressBar); // Append progress bar element
        this.containerElement.appendChild(removeButton);
    }

    removeItem() {
        this.containerElement.remove();
    }

    updateStatus(status, type = 'success') {
        this.statusLabel.textContent = status; // Set the text
        // Clear previous status classes
        this.statusLabel.classList.remove('success', 'error', 'pending');
        this.statusLabel.style.display = 'inline-block';
    
        // Add the appropriate status class based on the current status
        if (type === 'success') {
            this.statusLabel.classList.add('success');
        } else if (type === 'error') {
            this.statusLabel.classList.add('error');
        } else {
            this.statusLabel.classList.add('pending');
        }
    }

    updateProgress(value) {
        this.progressBar.update(value);
    }
}