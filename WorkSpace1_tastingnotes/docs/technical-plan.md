# 技術的実装プラン

CSVファイル内の議論に基づき、テイスティングノート機能を実現するための技術的な選択肢と実装案をまとめる。

## 1. データ保存・バックエンド

ユーザーが入力したテイスティングノートを保存するためのバックエンド処理。

### APIエンドポイント案

Node.js (Express) を使用したAPIサーバーの実装例。

```javascript
// POST /api/tasting-notes
// 新しいテイスティングノートを保存する
app.post('/api/tasting-notes', async (req, res) => {
  const { userId, beerId, taste, aroma, comment } = req.body;

  // テイスティングノートをデータベースに保存
  const note = new TastingNote({ userId, beerId, taste, aroma, comment });
  await note.save();

  res.status(200).json({ message: "投稿が保存されました" });
});
```

### データベース設計案

評価の平均値を算出するためのSQLクエリ例。`reviews` テーブルに各ユーザーの評価を保存する想定。

```sql
-- 特定のビールの平均評価とレビュー数を取得する
SELECT 
    beer_id,
    AVG(taste_score) AS average_taste,
    AVG(aroma_score) AS average_aroma,
    COUNT(*) AS review_count
FROM reviews
WHERE beer_id = ?
GROUP BY beer_id;
```

## 2. 入力インターフェースの実装方法

ユーザーがノートを入力するためのUIをどう提供するか、いくつかの方法が検討されている。

### 方法1: Googleスプレッドシート + LINE Bot (簡易版)

- **概要**: LINE Botに特定の形式でテキストを送信すると、GAS (Google Apps Script) がWebhook経由で受け取り、Googleスプレッドシートに内容を追記する。
- **メリット**: 最も手軽に始められる。
- **デメリット**: UIの自由度が低く、ユーザー体験はリッチではない。画像投稿などの処理が煩雑になる。

### 方法2: LIFF (LINE Front-end Framework) アプリ

- **概要**: LINEのトーク画面上で動作するWebアプリケーション（LIFFアプリ）として入力フォームを開発する。ReactやVue.jsなどでリッチなUIを構築可能。
- **メリット**: UI/UXの自由度が高い。スライダーや画像アップローダーなど、複雑なフォームも実現できる。
- **デメリット**: Webアプリ開発の知識が必要になる。
- **推奨**: 柔軟性とユーザー体験を考慮すると、この方法が本命と想定される。

### 方法3: チャットボットとの対話形式

- **概要**: 「ビールの名前は？」「味の評価は？」のように、チャットボットが質問を投げかけ、ユーザーがそれに答える形でデータを記録していく。
- **メリット**: 会話形式で楽しく入力できる。ゲーム性を持たせやすい。
- **デメリット**: 複数の項目を入力する場合、何度もやり取りが発生し、手間がかかる可能性がある。Dialogflowなどの自然言語処理サービスの知識が必要。

## 3. 拡張機能

### バーコードスキャナー

- **目的**: ビンのバーコードを読み取ることで、ビール名を自動入力し、ユーザーの手間を省く。
- **実装**: [QuaggaJS](https://serratus.github.io/quaggaJS/) などのライブラリを使い、LIFFアプリ内にスキャナ機能を実装する。

```html
<!-- QuaggaJSを使ったバーコードスキャナーのサンプル -->
<div id="scanner-container">
    <video id="video-preview"></video>
</div>
<script src="https://serratus.github.io/quaggaJS/dist/quagga.min.js"></script>
<script>
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#video-preview'),
        },
        decoder: {
            readers: ["ean_reader", "upc_reader"]
        }
    }, (err) => {
        if (err) { console.error(err); return; }
        Quagga.start();
    });

    Quagga.onDetected((result) => {
        const code = result.codeResult.code;
        // codeを元に商品情報をAPIで検索
    });
</script>
```
