// ===================================
// Markdown Loader for WorkSpaces
// ===================================

(function() {
    'use strict';

    const loadedDocs = new Map();

    async function loadMarkdown(docPath, contentElement) {
        // キャッシュチェック
        if (loadedDocs.has(docPath)) {
            contentElement.innerHTML = loadedDocs.get(docPath);
            contentElement.classList.remove('loading');
            return;
        }

        try {
            const response = await fetch(docPath);
            if (!response.ok) throw new Error('Failed to load');

            const markdown = await response.text();
            const html = marked.parse(markdown);
            const wrappedHtml = `<div class="markdown-body">${html}</div>`;

            loadedDocs.set(docPath, wrappedHtml);
            contentElement.innerHTML = wrappedHtml;
            contentElement.classList.remove('loading');
        } catch (error) {
            contentElement.innerHTML = `<p style="color: var(--color-danger);">ドキュメントの読み込みに失敗しました。</p>`;
            contentElement.classList.remove('loading');
        }
    }

    function initDocToggles() {
        document.querySelectorAll('.doc-toggle').forEach(toggle => {
            toggle.addEventListener('toggle', function() {
                if (this.open) {
                    const docPath = this.dataset.doc;
                    const contentElement = this.querySelector('.doc-toggle-content');
                    if (contentElement && contentElement.classList.contains('loading')) {
                        loadMarkdown(docPath, contentElement);
                    }
                }
            });
        });
    }

    // DOMContentLoaded で初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDocToggles);
    } else {
        initDocToggles();
    }
})();
