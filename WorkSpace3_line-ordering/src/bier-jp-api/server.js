// このファイルは、bier.jpサーバーサイドで実装される「買い物かご追加API」の概念実証（PoC）用コードです。
// MiroボードにあったChatGPTの提案（Express.js）を参考にしています。

const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// 静的ファイルを配信するためのミドルウェア
// 実際のbier.jpの環境に合わせて調整が必要です
app.use(express.static(path.join(__dirname, 'public')));

/**
 * 買い物かご追加エンドポイント
 * GETリクエストで商品情報を受け取り、localStorageに商品を追加するページを返す
 */
app.get('/api/add-to-cart', (req, res) => {
    const itemJson = req.query.item;

    if (!itemJson) {
        return res.status(400).send('商品情報が指定されていません。');
    }

    try {
        // 適切なHTMLを生成して返す
        const htmlResponse = `
        <!DOCTYPE html>
        <html lang="ja">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>商品追加</title>
            <script>
                document.addEventListener('DOMContentLoaded', function() {
                    try {
                        const newItem = ${JSON.stringify(JSON.parse(itemJson))};
                        // bier.jpが使用しているlocalStorageのキーを'cart'と仮定
                        let cart = JSON.parse(localStorage.getItem('cart')) || [];
                        
                        // TODO: 数量の処理、既存商品のチェックなど、
                        // bier.jpの実際のカート仕様に合わせたロジックを実装
                        cart.push(newItem);
                        
                        localStorage.setItem('cart', JSON.stringify(cart));
                        
                        document.getElementById('message').innerText = '「' + newItem.name + '」を買い物かごに追加しました。';
                    } catch (e) {
                        document.getElementById('message').innerText = 'エラー: 商品の追加に失敗しました。';
                        console.error('Cart Error:', e);
                    }
                });
            </script>
            <style>
                body { font-family: sans-serif; text-align: center; padding: 40px; }
                a { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
            </style>
        </head>
        <body>
            <h1 id="message">...</h1>
            <a href="/basket_view.html">買い物かごを見る</a>
        </body>
        </html>
        `;
        res.send(htmlResponse);

    } catch (e) {
        res.status(400).send('不正な商品情報フォーマットです。');
    }
});

app.listen(port, () => {
    console.log(`bier.jp API (PoC) listening at http://localhost:${port}`);
});
