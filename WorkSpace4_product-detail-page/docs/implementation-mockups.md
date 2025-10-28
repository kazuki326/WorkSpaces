# 実装モックアップとテンプレート案

CSVファイルで提案された、新しい商品詳細ページの具体的なレイアウト案と実装テンプレートを以下にまとめる。

## 1. タブUIデザイン案

情報を「基本情報」「原料・製造」「料理マッチング」のタブに分けて表示するレイアウト。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>ビール商品詳細（タブUI）</title>
  <style>
    .container { max-width: 1000px; margin: auto; display: flex; box-shadow: 0 6px 20px rgba(0,0,0,0.1); border-radius: 16px; overflow: hidden; }
    .image-section { flex: 1; background: #faf3e0; display: flex; align-items: center; justify-content: center; padding: 30px; }
    .image-section img { max-width: 100%; max-height: 500px; }
    .info-section { flex: 2; padding: 30px; }
    .tabs { display: flex; border-bottom: 2px solid #eee; margin-bottom: 20px; }
    .tab-button { flex: 1; padding: 12px; cursor: pointer; background: none; border: none; font-size: 16px; border-bottom: 3px solid transparent; }
    .tab-button.active { border-bottom: 3px solid #0077cc; font-weight: bold; color: #0077cc; }
    .tab-content { display: none; }
    .tab-content.active { display: block; }
  </style>
</head>
<body>
  <div class="container">
    <div class="image-section">
      <img src="https://placehold.jp/200x400.png?text=Beer" alt="ビール画像">
    </div>
    <div class="info-section">
      <h1>バイエルンヴァイツェン</h1>
      <div class="tabs">
        <button class="tab-button active" data-tab="basic">基本情報</button>
        <button class="tab-button" data-tab="details">原料・製造</button>
        <button class="tab-button" data-tab="pairing">料理マッチング</button>
      </div>
      <div class="tab-content active" id="basic">...</div>
      <div class="tab-content" id="details">...</div>
      <div class="tab-content" id="pairing">...</div>
    </div>
  </div>
  <script>
    const buttons = document.querySelectorAll(".tab-button");
    const contents = document.querySelectorAll(".tab-content");
    buttons.forEach(button => {
      button.addEventListener("click", () => {
        buttons.forEach(btn => btn.classList.remove("active"));
        contents.forEach(content => content.classList.remove("active"));
        button.classList.add("active");
        document.getElementById(button.dataset.tab).classList.add("active");
      });
    });
  </script>
</body>
</html>
```

## 2. セクションUI + キャッチコピー案

情報を縦長のセクションに分け、キャッチコピーを強調するレイアウト。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>商品詳細（セクションUI）</title>
  <style>
    .product-header { display: flex; align-items: center; gap: 30px; }
    .product-header img { width: 280px; border-radius: 12px; }
    .product-name { font-size: 28px; font-weight: bold; }
    .catchcopy { font-size: 22px; font-weight: bold; color: #d48806; margin-bottom: 20px; }
    .section { margin-top: 30px; }
    .section h2 { font-size: 20px; border-left: 5px solid #d48806; padding-left: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="product-header">
      <img src="https://placehold.jp/280x400.png?text=Beer" alt="ビール画像">
      <div class="product-info">
        <div class="product-name">ヴァイエンシュテファン ヘフェヴァイスビア</div>
        <div class="catchcopy">「世界最古の醸造所が贈る、究極の小麦ビール」</div>
        <div class="product-details">
          アルコール度数：5.4%<br>
          容量：500ml<br>
        </div>
      </div>
    </div>
    <div class="section">
      <h2>商品説明</h2>
      <p>...</p>
    </div>
    <div class="section">
      <h2>料理との相性</h2>
      <p>...</p>
    </div>
  </div>
</body>
</html>
```

## 3. データ分離型テンプレート案

HTMLの構造は固定の「ひな形」とし、商品データをJavaScriptのオブジェクトとして定義。スクリプトでHTMLにデータを流し込むことで、ページの量産とメンテナンスを容易にする。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <title>商品詳細ページ（テンプレート）</title>
</head>
<body>
  <div class="product-card">
    <div class="product-header">
      <img id="product-image" src="" alt="商品画像">
      <div>
        <h1 id="product-name"></h1>
        <p class="catch" id="product-catch"></p>
      </div>
    </div>
    <div class="info">
      <p><strong>スタイル:</strong> <span id="product-style"></span></p>
      <p><strong>アルコール度数:</strong> <span id="product-abv"></span></p>
    </div>
    <div class="price-box">
      <p><strong>価格:</strong> <span id="product-price"></span></p>
      <a href="#" class="btn-buy">カートに入れる</a>
    </div>
    <div class="section">
      <h2>商品説明</h2>
      <p id="product-description"></p>
    </div>
    <div class="section">
      <h2>料理とのペアリング</h2>
      <ul id="product-pairing"></ul>
    </div>
  </div>

  <script>
    // ▼この部分の商品データだけを入れ替えれば、ページが完成する▼
    const productData = {
      name: "ホフブロイ・オクトーバーフェストビア",
      catch: "ミュンヘンの祭典を彩る芳醇な味わい",
      image: "https://example.com/hofbrau.jpg",
      style: "メルツェン / オクトーバーフェストビア",
      abv: "6.3%",
      price: "700円（税込）",
      description: "ホフブロイ醸造所が誇るオクトーバーフェスト限定ビール。麦芽の甘みとしっかりしたボディが特徴です。",
      pairing: [
        "ヴァイスヴルスト＋プレッツェル",
        "シュヴァイネハクセ（豚すね肉のロースト）",
        "とんかつ"
      ]
    };

    // データをHTMLに反映させる処理
    document.getElementById("product-name").textContent = productData.name;
    document.getElementById("product-catch").textContent = productData.catch;
    // ...以下、すべてのデータを反映させる
  </script>
</body>
</html>
```
