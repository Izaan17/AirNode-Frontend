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
        const listItem = createFileItem(file);
        elements.fileList.appendChild(listItem);
    });
}

function createFileItem(file) {
    // Create list item, container, file link, and delete button elements
    const listItem = document.createElement('li');
    const itemContainer = document.createElement('div');
    const fileLink = document.createElement('a');
    const deleteButton = document.createElement('button');

    // Set list item and container styling
    listItem.setAttribute('style', 'margin: 15px 0; list-style-type: none;');
    itemContainer.setAttribute('style', 'display: flex; align-items: center; justify-content: space-between; padding: 10px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;');

    // Set file link attributes and styling
    fileLink.href = `${API_URL}/download/${file}`;
    fileLink.download = file;
    fileLink.textContent = file;
    fileLink.setAttribute('aria-label', `Download ${file}`);
    fileLink.setAttribute('style', 'text-decoration: none; color: #333; font-weight: bold;');

    // Set delete button attributes and styling
    deleteButton.textContent = 'Delete';
    deleteButton.setAttribute('aria-label', `Delete ${file}`);
    deleteButton.setAttribute('style', 'background-color: rgb(220, 61, 61); color: #fff; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;');
    deleteButton.addEventListener('click', () => { deleteFile(file, listItem); });

    // Append elements to the container and list item
    itemContainer.appendChild(fileLink);
    itemContainer.appendChild(deleteButton);
    listItem.appendChild(itemContainer);

    return listItem;
}

async function deleteFile(filename, listItem) {
    const response = await askPrompt('Delete File', `Are you sure you want to delete '${filename}'?`);

    // If the user canceled, stop here
    if (!response) {
        return;
    }

    try {
        // Proceed with deletion if user confirmed
        const result = await airService.deleteFile(filename, DELETE_TIMEOUT);
        listItem.remove();
        notifier.notify(result.message, 'success');
    } catch (error) {
        if (error.message === 'Deleting file timed out') {
            notifier.notify('Deleting file timed out. Please try again or check your connection.', 'error');
        } else {
            notifier.notify('Error deleting file: ' + error.message, 'error');
        }
    }
}

function askPrompt(title, prompt) {
    const promptFrame = document.createElement('div');
    const overlay = document.createElement('div');
    const titleText = document.createElement('h4');
    const promptText = document.createElement('p');
    const confirmButton = document.createElement('button');
    const cancelButton = document.createElement('button');

    // Set up content
    titleText.textContent = title;
    promptText.textContent = prompt;
    confirmButton.textContent = 'Confirm';
    cancelButton.textContent = 'Cancel';

    // Append elements to prompt frame
    promptFrame.appendChild(titleText);
    promptFrame.appendChild(promptText);
    promptFrame.appendChild(cancelButton);
    promptFrame.appendChild(confirmButton);

    // Set up classes for styling
    promptFrame.classList.add('prompt-frame');
    overlay.classList.add('overlay');

    // Append prompt and overlay to body
    document.body.appendChild(overlay);
    document.body.appendChild(promptFrame);

    // Button event listeners
    return new Promise((resolve) => {
        confirmButton.onclick = function () {
            resolve(true);
            cleanup();
        };

        cancelButton.onclick = function () {
            resolve(false);
            cleanup();
        };

        // Remove prompt and overlay
        function cleanup() {
            document.body.removeChild(promptFrame);
            document.body.removeChild(overlay);
        }
    });
}

window.onload = fetchFiles;