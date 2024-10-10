import { AirService } from "./modules/AirService.js";
import { Notifier } from "./modules/Notifier.js";

const API_URL = 'http://192.168.1.197:5500/api';
const FETCH_TIMEOUT = 10000; // 10 seconds
const DELETE_TIMEOUT = 10000; // 10 seconds
const elements = {
    fileList: document.getElementById('fileList'),
    notificationContainer: document.getElementById('notification-container')
}
const notifier = new Notifier(elements.notificationContainer);
const airService = new AirService(API_URL);

// File Management Functions
async function fetchFiles() {
    try {
        const files = await airService.fetchFiles(FETCH_TIMEOUT);
        updateFileList(files);
    } catch (error) {
        if (error.message === 'Fetching files timed out') {
            notifier.notify('Fetching files timed out. Please try again or check your connection.', 'error');
        } else {
            notifier.notify('Error fetching files: ' + error.message, 'error');
        }
    }
}

function updateFileList(files) {
    // Clear the file list content
    elements.fileList.innerHTML = '';

    // Check if 'files' is a valid array
    if (!Array.isArray(files) || files.length === 0) {
        elements.fileList.innerHTML = '<li style="margin-top: 20px;">No files available</li>';
        return;
    }

    // Populate file list with new entries
    files.forEach(file => {
        // Create list item and file link elements
        const listItem = document.createElement('li');
        const fileLink = document.createElement('a');
        const deleteButton = document.createElement('button');

        // Set list item styling
        listItem.setAttribute('style', 'margin: 20px 0px');

        // Set file link attributes
        fileLink.href = `${API_URL}/download/${file}`;
        fileLink.download = file;
        fileLink.textContent = file;
        fileLink.setAttribute('aria-label', `Download ${file}`);

        // Set delete button attributes and event
        deleteButton.textContent = 'Delete';
        deleteButton.setAttribute('aria-label', `Delete ${file}`);
        deleteButton.setAttribute('style', 'margin-left: 20px; background-color: rgb(220, 61, 61);');
        deleteButton.addEventListener('click', () =>
            { 
                deleteFile(file);
                listItem.remove();
            });

        // Append elements to list item and list
        listItem.appendChild(fileLink);
        listItem.appendChild(deleteButton);
        elements.fileList.appendChild(listItem);
    });
}

async function deleteFile(filename) {
    try {
        const result = await airService.deleteFile(filename, DELETE_TIMEOUT);
        notifier.notify(result.message, 'success');
    } catch (error) {
        if (error.message === 'Deleting file timed out') {
            notifier.notify('Deleting file timed out. Please try again or check your connection.', 'error');
        } else {
            notifier.notify('Error deleting file: ' + error.message, notifier.error);
        }
    }
}

window.onload = fetchFiles;