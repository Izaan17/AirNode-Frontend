export class AirService {
    constructor(baseURL, defaultTimeout = 30000) {
        this.baseURL = baseURL;
        this.defaultTimeout = defaultTimeout;
    }
    
    uploadFile(file, onProgress, timeout = this.defaultTimeout) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('No file provided!'));
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            const xhr = new XMLHttpRequest();

            xhr.open('POST', `${this.baseURL}/upload`, true);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable && onProgress) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    onProgress(percentComplete);
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const result = JSON.parse(xhr.responseText);
                    resolve(result);
                } else {
                    reject(new Error(`Error uploading file: ${xhr.statusText}`));
                }
            };

            xhr.onerror = () => {
                reject(new Error('Unknown error occurred. Server response not recieved.'));
            };

            xhr.ontimeout = () => {
                reject(new Error('Upload timed out'));
            };

            xhr.timeout = timeout;

            xhr.send(formData);
        });
    }

    async fetchFiles(timeout = this.defaultTimeout) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(`${this.baseURL}/files`, {
                signal: controller.signal
            });
            clearTimeout(id);
            
            if (!response.ok) {
                throw new Error('Failed to fetch files: ' + response.statusText);
            }
            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Fetching files timed out');
            }
            throw error;
        }
    }

    async deleteFile(filename, timeout = this.defaultTimeout) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const encodedFilename = encodeURIComponent(filename);
            const response = await fetch(`${this.baseURL}/delete/${encodedFilename}`, {
                method: 'DELETE',
                signal: controller.signal
            });
            clearTimeout(id);

            if (!response.ok) {
                throw new Error('Failed to delete file: ' + response.statusText);
            }
            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Deleting file timed out');
            }
            throw error;
        }
    }

    async download(filename, timeout = this.defaultTimeout) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
    
        try {
            const encodedFilename = encodeURIComponent(filename);
            const response = await fetch(`${this.baseURL}/download/${encodedFilename}`, {
                method: 'GET',
                signal: controller.signal
            });
            clearTimeout(id);
    
            if (!response.ok) {
                throw new Error('Failed to download file: ' + response.statusText);
            }
    
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;  // Use original filename for download
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Downloading file timed out');
            }
            throw error;
        }
    }
}