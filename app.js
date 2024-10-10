import { Notifier } from "./modules/Notifier.js";
import { AirService } from "./modules/AirService.js";

const API_URL = 'http://192.168.1.197:5500/api';
const UPLOAD_TIMEOUT = 60000; // 1 minute
const elements = {
    fileInput: document.getElementById('file-input'),
    fileNameEntry: document.getElementById('file-name-entry'),
    uploadButton: document.getElementById('upload-button'),
    imagePreview: document.getElementById('image-preview'),
    pdfPreview: document.getElementById('pdf-preview'),
    textPreview: document.getElementById('text-preview'),
    videoPreview: document.getElementById('video-preview'),
    fileNameLabel: document.getElementById('file-name-label'),
    progressBar: document.getElementById('progress-bar'),
    progressContainer: document.getElementById('progress-container'),
    notificationContainer: document.getElementById('notification-container'),
    removeFileButton: document.getElementById('clear-file-button'),
};
const notifier = new Notifier(elements.notificationContainer);
const airService = new AirService(API_URL);

// File Upload Functions
async function handleUpload() {
    const file = elements.fileInput.files[0];
    if (!file) {
        notifier.notify('No file selected!', notifier.error);
        return;
    }
    const newFileName = getNewFileName(file);
    const newFile = new File([file], newFileName, { type: file.type });

    showProgressBar();

    try {
        const result = await airService.uploadFile(newFile, updateProgressBar, UPLOAD_TIMEOUT);
        notifier.notify('Upload successful: ' + result.message, notifier.success);
    } catch (error) {
        if (error.message === 'Upload timed out') {
            notifier.notify('Upload timed out. Please try again or check your connection.', 'error');
        } else {
            notifier.notify('Upload failed: ' + error.message, notifier.error);
        }
    } finally {
        hideProgressBar();
    }
}

function showProgressBar() {
    elements.progressContainer.style.display = 'block';
    elements.progressBar.style.width = '0%';
}

function hideProgressBar() {
    elements.progressContainer.style.display = 'none';
}

function updateProgressBar(percentage) {
    elements.progressBar.style.width = percentage + '%';
    elements.progressBar.textContent = Math.round(percentage) + '%';
}

function getNewFileName(file) {
    const originalExtension = file.name.split('.').pop();
    return elements.fileNameEntry.value ?
        `${elements.fileNameEntry.value}.${originalExtension}` :
        file.name;
}

// File Preview Functions
function handleFileSelection() {
    const file = elements.fileInput.files[0];
    resetPreviews();

    if (file) {
        updateFileNameLabel(file);
        updateFileNameEntry(file);
        previewFile(file);
        elements.removeFileButton.removeAttribute('disabled');
        elements.removeFileButton.style.display = 'inline';
    } else {
        resetFileNameInfo();
    }
}

function resetPreviews() {
    ['imagePreview', 'pdfPreview', 'textPreview', 'videoPreview'].forEach(id => {
        elements[id].style.display = 'none';
    });
}

function updateFileNameLabel(file) {
    elements.fileNameLabel.innerHTML = `Selected File: <strong>${file.name}</strong>`;
}

function updateFileNameEntry(file) {
    const originalExtension = file.name.split('.').pop();
    elements.fileNameEntry.value = file.name.slice(0, -(originalExtension.length + 1));
    elements.fileNameEntry.removeAttribute('readonly');
}

function resetFileNameInfo() {
    elements.fileNameLabel.textContent = 'No file currently uploaded';
    elements.fileNameEntry.value = '';
    elements.fileNameEntry.setAttribute('readonly', true);
}

function previewFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => handleFileLoad(e.target.result, file.type);

    if (file.type.startsWith('image/') || file.type === 'application/pdf') 
        reader.readAsDataURL(file);

    else if (file.type === 'text/plain') 
        reader.readAsText(file);

    else if (file.type.startsWith('video/'))
        handleVideoPreview(file);
}

function handleFileLoad(result, fileType) {
    const previewMap = {
        'image/': { element: 'imagePreview', message: 'Image preview loaded' },
        'application/pdf': { element: 'pdfPreview', message: 'PDF preview loaded' },
        'text/plain': { element: 'textPreview', message: 'Text preview loaded' },
        'video/': { element: 'videoPreview', message: 'Video preview loaded' }
    };

    for (const [type, { element, message }] of Object.entries(previewMap)) {
        if (fileType.startsWith(type)) {
            elements[element].src = result;
            elements[element].style.display = 'block';
            if (type === 'text/plain') elements[element].textContent = result;
            notifier.notify(message, notifier.info);
            return;
        }
    }

    notifier.notify('Unsupported file type. Please upload an image, PDF, text file, or video.', notifier.error);
}

function handleVideoPreview(file) {
    elements.videoPreview.src = URL.createObjectURL(file);
    elements.videoPreview.style.display = 'block';
}

function removeFile() {
    resetPreviews();
    resetFileNameInfo();
    hideProgressBar();
    elements.fileInput.value = '';
    elements.removeFileButton.style.display = 'none';
}

// Event Listeners
elements.uploadButton.onclick = handleUpload;
elements.removeFileButton.onclick = removeFile;
elements.fileInput.addEventListener('change', handleFileSelection);