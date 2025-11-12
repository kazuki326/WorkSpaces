"use strict";

document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.sidebar li');
    const contentDisplay = document.getElementById('content-display');

    const loadContent = (contentKey) => {
        const filePath = `sections/${contentKey}.html`;
        fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(html => {
                contentDisplay.innerHTML = html;
                // After loading, check if we need to run any specific scripts
                if (contentKey === 'tasting-note') {
                    initializeTastingNoteSliders();
                }
            })
            .catch(error => {
                contentDisplay.innerHTML = `<h2>Error</h2><p>コンテンツの読み込みに失敗しました: ${error}</p>`;
                console.error('There has been a problem with your fetch operation:', error);
            });
    };

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
                // If you want the sliders to be interactive in the future,
                // you would add an event listener here.
                // sliderElement.addEventListener('input', () => {
                //     valueElement.textContent = sliderElement.value;
                // });
            }
        });
    };

    // Set initial content to dashboard
    loadContent('dashboard');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const contentKey = tab.getAttribute('data-content');
            if (contentKey) {
                loadContent(contentKey);
            }
        });
    });
});