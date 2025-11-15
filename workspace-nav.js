/**
 * Workspace Navigation
 * Adds a breadcrumb navigation to return to the dashboard
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    function init() {
        // Check if we're already on the dashboard
        if (window.location.pathname.endsWith('/index.html') && !window.location.pathname.includes('WorkSpace')) {
            return; // Don't add nav on dashboard
        }

        // Create breadcrumb navigation
        const nav = document.createElement('nav');
        nav.className = 'breadcrumb';

        const container = document.createElement('div');
        container.className = 'container';

        const link = document.createElement('a');
        link.href = '../index.html';
        link.textContent = 'ダッシュボードに戻る';

        container.appendChild(link);
        nav.appendChild(container);

        // Insert after header or at the beginning of body
        const header = document.querySelector('header');
        if (header && header.nextSibling) {
            header.parentNode.insertBefore(nav, header.nextSibling);
        } else {
            document.body.insertBefore(nav, document.body.firstChild);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
