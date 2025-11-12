"use strict";

document.addEventListener('DOMContentLoaded', () => {
    // Function to create and show the modal
    const showModal = (url, title) => {
        // 1. Create modal elements
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        const content = document.createElement('div');
        content.className = 'modal-content';

        const header = document.createElement('div');
        header.className = 'modal-header';

        const modalTitle = document.createElement('h2');
        modalTitle.className = 'modal-title';
        modalTitle.textContent = title || 'Preview';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close-btn';
        closeBtn.innerHTML = '&times;';

        const body = document.createElement('div');
        body.className = 'modal-body';

        const iframe = document.createElement('iframe');
        iframe.src = url;

        // 2. Assemble modal
        header.appendChild(modalTitle);
        header.appendChild(closeBtn);
        body.appendChild(iframe);
        content.appendChild(header);
        content.appendChild(body);
        overlay.appendChild(content);
        document.body.appendChild(overlay);

        // 3. Add closing event listeners
        const closeModal = () => {
            overlay.classList.remove('active');
            // Remove after transition ends
            overlay.addEventListener('transitionend', () => {
                document.body.removeChild(overlay);
            }, { once: true });
        };

        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
            }
        });

        // 4. Show the modal with a slight delay for the transition to work
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);
    };

    // Find all links that should open in a modal
    const modalLinks = document.querySelectorAll('a.modal-link');

    modalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const url = link.getAttribute('href');
            const title = link.textContent.trim();
            showModal(url, title);
        });
    });
});
