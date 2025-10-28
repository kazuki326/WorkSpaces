# `bier.jp` 買い物かご追加API 設計書

## 1. 背景と目的

LINEのチャットボットから`bier.jp`の買い物かごにシームレスに商品を追加するために、専用のAPIエンドポイントを`bier.jp`のサーバー上に設ける。

`bier.jp`の既存の買い物かご機能は`localStorage`に依存している。しかし、セキュリティ上の制約（同一オリジンポリシー）により、外部ドメイン（LINEのWebViewやGoogle Apps Script）から直接クライアントの`localStorage`を操作することはできない。

この問題を解決するため、`bier.jp`自身のドメインにAPIを設置し、そのAPIが`localStorage`への追加処理を行うためのページを返す、というアプローチを取る。

## 2. エンドポイント仕様

- **URL**: `https://bier.jp/api/add-to-cart`
- **HTTPメソッド**: `GET`
- **説明**: 指定された商品IDを`localStorage`に保存するためのJavaScriptを含むHTMLページを返す。

## 3. リクエスト

クエリパラメータとして、追加したい商品の情報を渡す。

- **パラメータ**: `item` (仮)
- **形式**: JSON文字列をURLエンコードしたもの
- **JSON構造案**:
  ```json
  {
    "id": "Ex101i",
    "name": "ヴァイツェン",
    "image": "weizen.jpg",
    "box": "1",
    "bottle": "0"
  }
  ```
  *Miroの`<form>`の分析から、`id`, `box`, `bottle`などがキーになると推測される。`bier.jp`の既存のカート追加ロジックを詳細に解析し、必要なキーを確定させる必要がある。*

- **リクエストURL例**:
  `https://bier.jp/api/add-to-cart?item=%7B%22id%22%3A%22Ex101i%22%2C...%7D`

## 4. サーバーサイド処理 (API側)

1.  `GET`リクエストで`item`パラメータを受け取る。
2.  パラメータがない、または形式が不正な場合はエラーページを返す。
3.  受け取ったJSON文字列を埋め込んだHTMLページを生成する。
4.  このHTMLページには、ページが読み込まれた際に`localStorage`の買い物かご配列（例: `cartHistory`）に新しい商品オブジェクトを追加するJavaScriptコードを含める。
5.  処理完了後、ユーザーに「商品を追加しました」というメッセージを表示し、`bier.jp`の買い物かごページへのリンクや、「買い物を続ける」ためにLINEに戻るためのボタンなどを表示する。

## 5. クライアントサイド処理 (返されるHTMLページ内)

```html
<!DOCTYPE html>
<html>
<head>
    <title>商品追加</title>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            try {
                // URLから渡された商品データを取得 (サーバー側でテンプレートに埋め込む)
                const newItem = <!--- ここにサーバーサイドでitemのJSONを展開 --->;

                // localStorageから現在のカート情報を取得
                let cart = JSON.parse(localStorage.getItem('cartHistory')) || [];

                // カートに新しい商品を追加
                cart.push(newItem);

                // localStorageに保存
                localStorage.setItem('cartHistory', JSON.stringify(cart));

                // ユーザーへの通知
                document.getElementById('message').innerText = '「' + newItem.name + '」を買い物かごに追加しました。';

            } catch (e) {
                document.getElementById('message').innerText = 'エラーが発生しました。';
                console.error('Failed to add item to cart:', e);
            }
        });
    </script>
</head>
<body>
    <h1 id="message">処理中...</h1>
    <a href="https://bier.jp/basket_view.html">買い物かごを見る</a>
    <br>
    <!-- LINEに戻るリンクなどをここに設置 -->
</body>
</html>
```

## 6. TODO / 確認事項

- [ ] `bier.jp`の既存カート追加ロジックを正確に把握し、APIが受け取るべきパラメータ（`id`, `box`, `bottle`等）を確定させる。
- [ ] `localStorage`で使用されているキー名（`itemhistory`? `cartHistory`?）を特定する。
- [ ] APIのセキュリティ対策（不正なリクエストの防止）を検討する。
