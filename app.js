import { Notifier } from "./modules/Notifier.js";
import { AirService } from "./modules/AirService.js";
import { FileUploadItem } from "./fileUploadItem.js";

const API_URL = 'http://192.168.1.197:5500/api';
const UPLOAD_TIMEOUT = 60000; // 1 minute
const elements = {
    fileInput: document.getElementById('file-input'),
    uploadButton: document.getElementById('upload-button'),
    progressContainer: document.getElementById('progress-container'),
    notificationContainer: document.getElementById('notification-container'),
    fileUploadItemContainer: document.getElementById('file-upload-item-container'),
};
const notifier = new Notifier(elements.notificationContainer);
const airService = new AirService(API_URL);

// Track each FileUploadItem instance
const fileUploadItemsMap = new Map();

// File Upload Functions
async function handleUpload() {
    const files = elements.fileInput.files;

    if (files.length === 0) {
        notifier.notify('No files selected!', notifier.error);
        return;
    }

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileUploadItem = fileUploadItemsMap.get(file.name);

        if (!fileUploadItem) {
            notifier.notify(`Could not find upload item for ${file.name}`, notifier.error);
            continue;
        }

        try {
            const result = await airService.uploadFile(
                file,
                (progress) => fileUploadItem.updateProgress(progress),
                UPLOAD_TIMEOUT
            );
            fileUploadItem.updateStatus(result.message);
        } catch (error) {
            const message = error.message === 'Upload timed out'
                ? 'Upload timed out. Please try again or check your connection.'
                : 'Upload failed: ' + error.message;
            notifier.notify(message, notifier.error);
        }
    }
}

// File Preview Functions
function handleFileSelection() {
    const files = elements.fileInput.files;

    for (const file of files) {
        const fileUploadItem = new FileUploadItem(file.name);
        fileUploadItemsMap.set(file.name, fileUploadItem);
        elements.fileUploadItemContainer.appendChild(fileUploadItem.containerElement);
    }
}

// Event Listeners
elements.uploadButton.onclick = handleUpload;
elements.fileInput.addEventListener('change', handleFileSelection);