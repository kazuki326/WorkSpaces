"use strict";

document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.sidebar li');
    const contentDisplay = document.getElementById('content-display');

    // アクティブタブを更新する関数
    const setActiveTab = (contentKey) => {
        tabs.forEach(tab => {
            if (tab.getAttribute('data-content') === contentKey) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    };

    // コンテンツを読み込む関数
    const loadContent = (contentKey) => {
        const filePath = `sections/${contentKey}.html`;

        // ローディング表示
        contentDisplay.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> 読み込み中...</div>';

        // アクティブタブを更新
        setActiveTab(contentKey);

        // URLハッシュを更新
        history.replaceState(null, '', `#${contentKey}`);

        fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error('コンテンツが見つかりませんでした');
                }
                return response.text();
            })
            .then(html => {
                contentDisplay.innerHTML = html;
                // テイスティングノートの場合、スライダーを初期化
                if (contentKey === 'tasting-notes') {
                    initializeTastingNoteSliders();
                }
            })
            .catch(error => {
                contentDisplay.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        <h2>読み込みエラー</h2>
                        <p>申し訳ありません。コンテンツの読み込みに失敗しました。</p>
                        <button onclick="location.reload()">ページを再読み込み</button>
                    </div>`;
                console.error('Fetch error:', error);
            });
    };

    // テイスティングノートのスライダー初期化
    const initializeTastingNoteSliders = () => {
        const sliders = [
            { id: 'sweetness1', valueId: 'sweetnessValue1' },
            { id: 'body1', valueId: 'bodyValue1' },
            { id: 'sweetness2', valueId: 'sweetnessValue2' },
            { id: 'body2', valueId: 'bodyValue2' }
        ];

        sliders.forEach(sliderInfo => {
            const sliderElement = document.getElementById(sliderInfo.id);
            const valueElement = document.getElementById(sliderInfo.valueId);
            if (sliderElement && valueElement) {
                valueElement.textContent = sliderElement.value;
                // スライダーをインタラクティブに
                sliderElement.addEventListener('input', () => {
                    valueElement.textContent = sliderElement.value;
                });
            }
        });
    };

    // キーボードナビゲーション対応
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const contentKey = tab.getAttribute('data-content');
            if (contentKey) {
                loadContent(contentKey);
            }
        });

        // Enterキーでも選択可能に
        tab.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const contentKey = tab.getAttribute('data-content');
                if (contentKey) {
                    loadContent(contentKey);
                }
            }
        });
    });

    // URLハッシュから初期コンテンツを決定
    const hash = window.location.hash.slice(1);
    const validSections = ['dashboard', 'tasting-notes', 'purchase-activity', 'engagement', 'account-management', 'support'];
    const initialContent = validSections.includes(hash) ? hash : 'dashboard';
    loadContent(initialContent);

    // ブラウザの戻る/進むボタン対応
    window.addEventListener('hashchange', () => {
        const newHash = window.location.hash.slice(1);
        if (validSections.includes(newHash)) {
            loadContent(newHash);
        }
    });
});