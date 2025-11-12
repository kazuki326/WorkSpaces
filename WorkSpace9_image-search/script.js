"use strict";

document.getElementById('imageSearchForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const fileInput = document.getElementById('beerImage');
    const searchResultsDiv = document.getElementById('searchResults');

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function(e) {
            // Display loading message
            searchResultsDiv.innerHTML = '<p>画像を分析中... 類似のビールを検索しています。</p>';

            const imageUrl = e.target.result; // The uploaded image data URL

            // Simulate API call and processing delay
            setTimeout(() => {
                // Fetch the template
                fetch('templates/search-result.html')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.text();
                    })
                    .then(template => {
                        // Replace placeholder with the actual uploaded image URL
                        const finalHtml = template.replace('{{UPLOADED_IMAGE_URL}}', imageUrl);
                        // Display the result
                        searchResultsDiv.innerHTML = finalHtml;
                    })
                    .catch(error => {
                        searchResultsDiv.innerHTML = `<h2>Error</h2><p>結果テンプレートの読み込みに失敗しました: ${error}</p>`;
                        console.error('There has been a problem with your fetch operation:', error);
                    });
            }, 3000); // Simulate 3 seconds delay
        };

        reader.readAsDataURL(file); // Read the uploaded file as a data URL
    } else {
        searchResultsDiv.innerHTML = '<p style="color: red;">画像をアップロードしてください。</p>';
    }
});