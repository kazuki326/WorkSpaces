# デザイン案とモックアップ

CSVファイルに添付されていたHTML/CSS/JavaScriptのコードは、機能の具体的なデザインイメージを掴むためのモックアップとしてここに保存する。

## 1. テイスティングノート入力フォーム

ユーザーがテイスティング結果を入力する画面のサンプル。

### デザイン案A: シンプルなフォーム

基本的なHTMLで構成された入力フォーム。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>個人テイスティングノート</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; }
        .container { max-width: 800px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); }
        .note-form label { font-weight: bold; }
        .note-form input, .note-form textarea { width: 100%; padding: 10px; margin-top: 5px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 5px; }
        .note-form button { background-color: #28a745; color: #fff; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer; }
        .photo-preview { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
        .photo-preview img { width: 100px; height: 100px; object-fit: cover; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>新しいテイスティングノートを追加</h2>
        <form class="note-form">
            <label for="beer-name">ビール名:</label>
            <input type="text" id="beer-name" placeholder="ビールの名前を入力">
            
            <label for="taste-score">味の評価 (1-5):</label>
            <input type="number" id="taste-score" min="1" max="5">
            
            <label for="aroma-score">香りの評価 (1-5):</label>
            <input type="number" id="aroma-score" min="1" max="5">
            
            <label for="bitterness-score">苦味の評価 (1-5):</label>
            <input type="number" id="bitterness-score" min="1" max="5">
            
            <label for="note">コメント:</label>
            <textarea id="note" rows="4" placeholder="テイスティングの感想を記入"></textarea>
            
            <label for="photo-upload">写真をアップロード:</label>
            <input type="file" id="photo-upload" accept="image/*" multiple>
            <div class="photo-preview" id="photo-preview"></div>
            
            <button type="submit">保存</button>
        </form>
    </div>
    <script>
        document.getElementById('photo-upload').addEventListener('change', function(event) {
            let preview = document.getElementById('photo-preview');
            preview.innerHTML = '';
            Array.from(event.target.files).forEach(file => {
                let img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                preview.appendChild(img);
            });
        });
    </script>
</body>
</html>
```

### デザイン案B: スライダー形式の評価

評価項目を直感的に入力できるスライダーUI。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>ビール評価スライダー</title>
    <style>
        .slider-container { background-color: #fff; padding: 20px; margin-bottom: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); }
        .slider-item { margin-bottom: 20px; }
        label { display: block; font-size: 16px; margin-bottom: 10px; }
        input[type="range"] { width: 100%; }
    </style>
</head>
<body>
    <div class="slider-container">
        <h2>あなたの評価</h2>
        <div class="slider-item">
            <label for="taste-slider">味（甘口 ↔ 辛口）</label>
            <input type="range" id="taste-slider" min="0" max="10" value="5">
        </div>
        <div class="slider-item">
            <label for="bitterness-slider">苦味（弱い ↔ 強い）</label>
            <input type="range" id="bitterness-slider" min="0" max="10" value="5">
        </div>
        <div class="slider-item">
            <label for="aroma-slider">香り（弱い ↔ 強い）</label>
            <input type="range" id="aroma-slider" min="0" max="10" value="5">
        </div>
    </div>
</body>
</html>
```

## 2. Myビール図鑑（コレクションページ）

ユーザーが記録したビールを一覧表示する「図鑑」ページのサンプル。

### デザイン案A: コミカルな図鑑風

手書き感のあるフォントや装飾で、集める楽しさを演出するデザイン。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Myビール図鑑</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Yusei+Magic&display=swap');
    body { font-family: 'Yusei Magic', cursive; background: linear-gradient(to bottom, #fff8e7, #ffeabf); }
    header { background: #ffb700; color: #fff; text-align: center; padding: 30px 10px; font-size: 36px; text-shadow: 2px 2px #b36b00; border-bottom: 8px dotted #ff8c00; }
    .zukan-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 25px; padding: 20px; }
    .beer-card { background-color: #fff1c1; border-radius: 20px; box-shadow: 6px 6px 0px #e09b1f; text-align: center; padding: 15px; border: 4px dashed #fcbf49; transition: transform 0.3s ease; }
    .beer-card:hover { transform: scale(1.05) rotate(-2deg); }
    .beer-card img { width: 100px; height: 100px; object-fit: contain; margin-bottom: 10px; }
    .beer-card.unknown { background-color: #eee; border: 4px dashed #ccc; box-shadow: 6px 6px 0px #aaa; }
    .beer-card.unknown img { opacity: 0.3; }
  </style>
</head>
<body>
  <header>Myビール図鑑</header>
  <div class="zukan-grid">
    <div class="beer-card">
      <img src="beer1.png" alt="ヴァイエンステファン">
      <h3>ヴァイエンステファン</h3>
      <p>香り：★★★★☆<br>苦味：★★★☆☆</p>
    </div>
    <div class="beer-card unknown">
      <img src="question.png" alt="？？？">
      <h3>？？？</h3>
      <p>飲んだビールを記録しよう！</p>
    </div>
  </div>
</body>
</html>
```

### デザイン案B: ポップアップ表示

図鑑のカードをクリックすると、詳細なテイスティングノートがポップアップで表示されるデザイン。レーダーチャートも表示する。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>ビール図鑑</title>
  <style>
    .card { background-color: #ffe082; border: 3px dashed #ff8f00; border-radius: 15px; padding: 20px; text-align: center; cursor: pointer; }
    .note-popup { display: none; position: fixed; top: 10%; left: 50%; transform: translateX(-50%); width: 90%; max-width: 600px; background-image: url('https://cdn.pixabay.com/photo/2016/05/25/08/35/map-1417234_1280.jpg'); border: 5px double #6d4c41; padding: 20px; z-index: 1000; }
    .chart-container { margin-top: 20px; background-color: rgba(255, 255, 255, 0.9); padding: 10px; border-radius: 10px; }
    .close-btn { position: absolute; top: 10px; right: 15px; cursor: pointer; }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <div class="card" onclick="openNote()">...</div>
  <div class="note-popup" id="notePopup">
    <button class="close-btn" onclick="closeNote()">閉じる</button>
    <h2>シュナイダー・ヴァイセのテイスティングノート</h2>
    <div class="chart-container">
      <canvas id="tasteChart"></canvas>
    </div>
  </div>
  <script>
    function openNote() { 
        document.getElementById('notePopup').style.display = 'block';
        const ctx = document.getElementById('tasteChart').getContext('2d');
        new Chart(ctx, {
            type: 'radar',
            data: { labels: ['甘さ', '香り', '苦味', 'コク', 'キレ'], datasets: [{ data: [4.5, 4.8, 3.2, 4.7, 3.9] }] },
            options: { scale: { ticks: { beginAtZero: true, max: 5 } } }
        });
    }
    function closeNote() { document.getElementById('notePopup').style.display = 'none'; }
  </script>
</body>
</html>
```
