# ビール比較機能 - 実装ガイド

## 1. 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フロントエンド | HTML5, CSS3, Vanilla JavaScript |
| 状態管理 | sessionStorage |
| API通信 | Fetch API |
| CORSプロキシ | cors-anywhere.herokuapp.com |

## 2. ファイル構成

```
WorkSpace6_beer-comparison/
├── index.html          # メインHTML
├── script.js           # JavaScript処理
├── README.md           # プロジェクト概要
├── workspace.json      # ワークスペース設定
└── docs/
    ├── feature-specification.md  # 機能仕様書
    └── implementation-guide.md   # 本ドキュメント
```

## 3. データ構造

### 3.1 チェックボックス属性

```html
<input class="checks" type="checkbox"
    name="商品名"
    value="https://bier.jp/itemdetail/商品ID"
    src="https://bier.jp/images/beeroriginal/画像ファイル名.jpg"
    onchange="inputChange(this)">
```

| 属性 | 用途 |
|------|------|
| name | 商品名（セッションストレージのキー） |
| value | 商品ページURL |
| src | 商品画像URL |
| class="checks" | 選択状態のカウント用 |

### 3.2 セッションストレージ構造

```javascript
// キー: 商品名
// 値: JSONオブジェクト
{
  "url": "https://bier.jp/itemdetail/Fx006i",
  "img": "https://bier.jp/images/beeroriginal/fx-006.jpg"
}
```

### 3.3 選択商品オブジェクト

```javascript
{
  name: "商品名",
  url: "https://bier.jp/itemdetail/商品ID",
  img: "https://bier.jp/images/beeroriginal/画像ファイル名.jpg",
  price: "1,234",
  description: "商品説明文",
  numInBox: 1,      // セット商品の場合は本数
  capacity: "500ml"
}
```

## 4. API設計

### 4.1 商品詳細API

**エンドポイント:**
```
GET https://bier.jp/index.cgi?t=itemdetail&id={productId}&output=json
```

**レスポンス例:**
```json
{
  "data": {
    "Price": "1,234",
    "Description": "商品の説明文<br>改行付き",
    "NumInBox": 6
  }
}
```

**注意事項:**
- CORSポリシーにより直接アクセス不可
- プロキシサーバー経由でアクセスする
- レスポンスに不正な末尾カンマが含まれる場合がある

### 4.2 プロキシサーバー経由のアクセス

```javascript
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
const apiUrl = `https://bier.jp/index.cgi?t=itemdetail&id=${productId}&output=json`;
const response = await fetch(proxyUrl + apiUrl);
```

### 4.3 容量データの取得（スクレイピング）

商品ページHTMLから容量を抽出:

```javascript
async function fetchProductCapacity(url) {
  const response = await fetch(proxyUrl + url);
  const text = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/html");

  // 仕様テーブルから「容量」行を探す
  const specRows = doc.querySelectorAll('tr');
  specRows.forEach(row => {
    const cells = row.querySelectorAll('td.spec_column');
    if (cells[0].textContent.trim() === "容量") {
      return cells[1].textContent.replace(":", "").trim();
    }
  });
}
```

## 5. 主要関数の解説

### 5.1 inputChange(e)
チェックボックスの変更イベントハンドラ

```javascript
function inputChange(e) {
  if (e.checked) {
    // 1. 選択上限チェック
    if (!limitedCheck()) {
      e.checked = false;
      return;
    }
    // 2. セッションストレージに保存
    sessionStorage.setItem(item, JSON.stringify(data));
    // 3. 比較リストにDOM追加
    compareList.appendChild(child_div);
  } else {
    // チェック解除時の処理
    sessionStorage.removeItem(item);
    document.getElementById(item).remove();
  }
}
```

### 5.2 limitedCheck()
選択上限（4商品）のチェック

```javascript
function limitedCheck() {
  const el = document.getElementsByClassName("checks");
  let count = 0;
  for (let i = 0; i < el.length; i++) {
    if (el[i].checked) count++;
  }
  if (count > 4) {
    alert("5つ以上の同時比較はできません。");
    return false;
  }
  return true;
}
```

### 5.3 compareAll()
比較実行処理（非同期）

```javascript
async function compareAll() {
  // 1. ボタン状態変更（ローディング表示）
  compareBtn.textContent = "データ取得中...";
  compareBtn.disabled = true;

  // 2. 選択商品のデータ取得（並列実行）
  for (const checkbox of checks) {
    if (checkbox.checked) {
      const [productData, capacity] = await Promise.all([
        fetchProductData(productId),
        fetchProductCapacity(storedData.url)
      ]);
      selectedItems.push({...});
    }
  }

  // 3. 比較表のDOM生成
  selectedItems.forEach((item) => {
    const row = document.createElement("tr");
    // 各セルを追加...
    tbody.appendChild(row);
  });

  // 4. ボタン状態復元
  compareBtn.textContent = "商品の比較をする";
  compareBtn.disabled = false;
}
```

### 5.4 cleanDescription(raw)
説明文の整形処理

```javascript
function cleanDescription(raw) {
  // 1. 最初の2つの<br>までを抽出
  // 2. <br>を改行文字に変換
  // 3. その他のHTMLタグを除去
  // 4. 連続改行を1回に制限
  return text.trim();
}
```

## 6. イベントフロー

```
[ページ読み込み]
    ↓
DOMContentLoaded
    ↓
セッションストレージから復元
    ↓
[チェックボックス操作]
    ↓
inputChange() → limitedCheck()
    ↓
セッションストレージ更新
    ↓
比較リスト更新
    ↓
[比較ボタンクリック]
    ↓
compareAll()
    ↓
fetchProductData() + fetchProductCapacity() (並列)
    ↓
比較表DOM生成・表示
```

## 7. エラーハンドリング

### 7.1 API取得エラー

```javascript
try {
  const response = await fetch(proxyUrl + apiUrl);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
} catch (error) {
  console.error(`Error fetching product data for ${productId}:`, error);
  return null;
}
```

### 7.2 不正なJSON対応

```javascript
// 末尾カンマの除去
const correctedText = text.replace(/,}/g, '}').replace(/,]/g, ']');
const data = JSON.parse(correctedText);
```

### 7.3 空レスポンス対応

```javascript
if (!text) {
  console.warn(`Response for ${productId} is empty.`);
  return null;
}
```

## 8. スタイリング

主要なCSSクラス:

| クラス名 | 用途 |
|----------|------|
| .compare_result | 比較表のコンテナ |
| .compare_container | 下部の選択商品一覧 |
| .compare_list | 選択商品のリスト表示 |
| .compared_item | 個々の選択商品 |
| .product-list | チェックボックス一覧 |

## 9. 本番環境への移行時の注意点

### 9.1 CORSプロキシの代替

本番環境では、以下のいずれかを検討:

1. **自社プロキシサーバー**:
   - Node.js/Expressでプロキシを構築
   - 適切なCORSヘッダーを設定

2. **サーバーサイドAPI**:
   - バックエンドでデータを取得しフロントに返す
   - セキュリティ向上、レート制限の管理が可能

3. **BFF (Backend for Frontend)**:
   - 専用のAPIゲートウェイを構築

### 9.2 推奨アーキテクチャ

```
[ブラウザ] → [BFF API] → [bier.jp API]
              ↓
           [キャッシュ]
```

### 9.3 パフォーマンス最適化

- 商品データのキャッシュ（Redis等）
- 画像の遅延読み込み
- 比較表のバーチャルスクロール（大量商品対応時）

## 10. テスト観点

| カテゴリ | テスト項目 |
|----------|-----------|
| 機能テスト | 商品選択・解除、上限チェック、比較表示 |
| 境界値テスト | 0商品、1商品、4商品、5商品選択時 |
| エラーテスト | API取得失敗、ネットワークエラー |
| 互換性テスト | Chrome, Firefox, Safari, Edge |
| レスポンシブテスト | デスクトップ、タブレット、モバイル |
