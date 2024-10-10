document.addEventListener("DOMContentLoaded", () => {
    // Fetch the sidebar HTML and inject it into the `.app` container
    fetch('sidebar.html')
        .then(response => response.text())
        .then(html => {
            document.querySelector('.app').insertAdjacentHTML('afterbegin', html);

            // Set the active link based on the current URL
            const menuItems = document.querySelectorAll('.menu-item');
            menuItems.forEach(item => {
                if (item.href === window.location.href) {
                    item.classList.add('is-active');
                }
            });
        })
        .catch(error => console.error('Error loading sidebar:', error));
});