export class Notifier {
    constructor(parentContainer) {
        this.parentContainer = parentContainer;
        this.notifications = [];
        this.info = 'info';
        this.error = 'error';
        this.success = 'success';
    };

    notify(message, type = this.info, duration = 5000) {
        const notification = {message, type, timestamp: new Date()};
        this.notifications.push(notification);

        this.#render(notification, duration);
    };
    
    #render(notification, duration) {
        // Create the notification element
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification ${notification.type}`;
        notificationElement.innerHTML = `[<strong>${notification.type.toUpperCase()}</strong>] ${notification.message}`;
    
        // Append it to the DOM
        this.parentContainer.appendChild(notificationElement);
    
        // Set a timeout to trigger the fade-out after the specified duration
        setTimeout(() => {
            notificationElement.classList.add('fade-out');
            
            // Set another timeout to remove the notification after fade-out completes
            setTimeout(() => {
                this.parentContainer.removeChild(notificationElement);
            }, 300); // Match this to the CSS transition time
        }, duration);
    };

    getAllNotifications() {
        return this.notifications;
    };

    clear() {
        this.notifications = [];
    }
}