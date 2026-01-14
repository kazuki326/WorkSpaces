# おすすめ商品セクション 実装ガイド

## 概要

bier.jpトップページの「おすすめ商品」セクションを実装するための技術ガイドです。3つのデザイン案それぞれのHTML/CSS構造、レスポンシブ対応、アクセシビリティについて解説します。

---

## 共通事項

### 使用技術

- **HTML5**: セマンティックなマークアップ
- **Tailwind CSS**: ユーティリティファーストのCSS（CDN版）
- **JavaScript**: インタラクション（必要に応じて）

### CDN読み込み

```html
<script src="https://cdn.tailwindcss.com"></script>
```

### 画像パス

```
https://bier.jp/images/beeroriginal/[商品コード].jpg
```

---

## デザインA: シンプルグリッド

### HTML構造

```html
<div class="p-6 bg-gradient-to-b from-gray-100 to-white">
    <h1 class="text-3xl font-bold text-center mb-8">おすすめ商品</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        <!-- 商品カード -->
        <article class="bg-white shadow-lg rounded-2xl overflow-hidden">
            <img
                class="w-full object-contain h-48 bg-white p-2"
                src="https://bier.jp/images/beeroriginal/nx-002.jpg"
                alt="ヴァイエンシュテファン ヘフェヴァイスビア"
            >
            <div class="p-4 space-y-2">
                <h2 class="text-xl font-bold text-yellow-600">
                    ヴァイエンシュテファン ヘフェヴァイスビア
                </h2>
                <div class="text-sm text-gray-500">銘柄: ヴァイエンシュテファン</div>
                <div class="text-sm text-gray-500">在庫: 25本</div>
                <div class="text-sm text-gray-500">アルコール度数: 5.4%</div>
                <p class="text-sm text-gray-600">バナナのような香りとスパイスの風味。</p>
            </div>
        </article>
        <!-- 他の商品カードを同様に追加 -->
    </div>
</div>
```

### レスポンシブブレークポイント

| 画面サイズ | カラム数 | Tailwindクラス |
|-----------|---------|---------------|
| モバイル（< 640px） | 1列 | `grid-cols-1` |
| タブレット（640px - 767px） | 2列 | `sm:grid-cols-2` |
| デスクトップ（768px以上） | 3列 | `md:grid-cols-3` |

### CSSカスタマイズ（オプション）

```css
/* カスタムシャドウ */
.product-card {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* 画像のアスペクト比固定 */
.product-image {
    aspect-ratio: 4/3;
    object-fit: contain;
}
```

---

## デザインB: ホバー詳細表示

### HTML構造

```html
<div class="p-6 bg-gray-50">
    <h1 class="text-3xl font-bold text-center mb-8">おすすめ商品</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        <!-- 商品カード（ホバーエフェクト付き） -->
        <article class="bg-white shadow-lg rounded-2xl overflow-hidden
                        transform hover:scale-105 transition-transform duration-300
                        group relative">
            <!-- 商品画像 -->
            <img
                class="w-full h-56 object-cover"
                src="https://bier.jp/images/beeroriginal/nx-002.jpg"
                alt="ヴァイエンシュテファン ヘフェヴァイスビア"
            >

            <!-- 商品情報（通常表示） -->
            <div class="p-5 flex flex-col justify-between h-full space-y-2">
                <h2 class="text-2xl font-bold text-gray-800">
                    ヴァイエンシュテファン ヘフェヴァイスビア
                </h2>
                <div class="flex flex-wrap text-sm text-gray-500 gap-2">
                    <span class="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                        カテゴリ: ヴァイツェン
                    </span>
                    <span>価格: ¥780</span>
                    <span>在庫: 25本</span>
                </div>
                <p class="text-gray-600 text-sm leading-relaxed mt-2 line-clamp-3">
                    バナナのような香りとスパイスの風味。
                </p>
                <button class="mt-4 w-fit bg-yellow-500 hover:bg-yellow-600
                               text-white font-medium py-2 px-5 rounded-full
                               shadow-md transition">
                    詳細を見る
                </button>
            </div>

            <!-- ホバー時のオーバーレイ -->
            <div class="absolute inset-0 bg-white bg-opacity-95
                        opacity-0 group-hover:opacity-100
                        transition-opacity duration-500
                        p-5 flex flex-col justify-center">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">詳細情報</h3>
                <ul class="text-sm text-gray-600 space-y-1">
                    <li>アルコール度数: 5.4%</li>
                    <li>原産国: ドイツ</li>
                    <li>容量: 500ml</li>
                    <li>醸造所: ヴァイエンシュテファン</li>
                    <li>特徴: バナナ香、クローブ、クリーミー</li>
                </ul>
            </div>
        </article>
    </div>
</div>
```

### ホバーエフェクトの仕組み

1. **親要素に`group`クラス**: 子要素のホバー状態を制御
2. **オーバーレイの初期状態**: `opacity-0`で非表示
3. **ホバー時**: `group-hover:opacity-100`で表示
4. **トランジション**: `transition-opacity duration-500`でスムーズな切り替え

### タッチデバイス対応（JavaScript）

```javascript
// タップで詳細表示を切り替え
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', function(e) {
        // モバイルの場合のみ
        if (window.matchMedia('(max-width: 768px)').matches) {
            this.classList.toggle('show-details');
        }
    });
});
```

```css
/* タップ時のスタイル */
@media (max-width: 768px) {
    .product-card.show-details .overlay {
        opacity: 1;
    }
}
```

---

## デザインC: 横長カード

### HTML構造

```html
<div class="p-6 bg-gray-50">
    <h1 class="text-3xl font-bold text-center mb-8">おすすめ商品</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 横長カード -->
        <article class="flex flex-col md:flex-row bg-white shadow-xl rounded-2xl
                        overflow-hidden hover:shadow-2xl transition-shadow duration-300">
            <!-- 商品画像 -->
            <img
                class="w-full md:w-48 h-48 object-cover"
                src="https://bier.jp/images/beeroriginal/nx-002.jpg"
                alt="ヴァイエンシュテファン ヘフェヴァイスビア"
            >

            <!-- 商品情報 -->
            <div class="p-4 flex flex-col justify-between">
                <div>
                    <h2 class="text-xl font-semibold text-gray-800">
                        ヴァイエンシュテファン ヘフェヴァイスビア
                    </h2>
                    <p class="text-sm text-gray-500 mt-1">カテゴリ: ヴァイツェン</p>
                    <p class="text-sm text-gray-500">価格: ¥780</p>
                    <p class="text-sm text-gray-500">在庫: 25本</p>
                    <p class="mt-2 text-gray-600 text-sm leading-snug line-clamp-3">
                        バナナのような香りとスパイスの風味。
                    </p>
                </div>
                <button class="mt-4 bg-yellow-500 hover:bg-yellow-600
                               text-white text-sm font-bold py-2 px-4
                               rounded-xl self-start transition">
                    詳細を見る
                </button>
            </div>
        </article>
    </div>
</div>
```

### レスポンシブ動作

| 画面サイズ | カード方向 | カラム数 |
|-----------|----------|---------|
| モバイル（< 768px） | 縦方向（画像上、情報下） | 1列 |
| デスクトップ（768px以上） | 横方向（画像左、情報右） | 2列 |

---

## アクセシビリティ対応

### 基本対応

```html
<!-- 画像のalt属性 -->
<img alt="ヴァイエンシュテファン ヘフェヴァイスビア" ...>

<!-- セマンティックな構造 -->
<article> <!-- カード全体 -->
<h2> <!-- 商品名 -->

<!-- ボタンのアクセシブルな名前 -->
<button aria-label="ヴァイエンシュテファン ヘフェヴァイスビアの詳細を見る">
    詳細を見る
</button>
```

### キーボードナビゲーション

```html
<!-- フォーカス可能な要素 -->
<article tabindex="0" role="article" aria-labelledby="product-1-title">
    <h2 id="product-1-title">商品名</h2>
    ...
</article>
```

```css
/* フォーカススタイル */
.product-card:focus {
    outline: 2px solid #f59e0b; /* yellow-500 */
    outline-offset: 2px;
}

/* フォーカス時にオーバーレイ表示（デザインB） */
.product-card:focus .overlay {
    opacity: 1;
}
```

### スクリーンリーダー対応

```html
<!-- 在庫情報のaria-label -->
<span aria-label="在庫数25本">在庫: 25本</span>

<!-- 価格情報 -->
<span aria-label="価格780円">¥780</span>

<!-- ホバーオーバーレイの読み上げ対応 -->
<div class="overlay" aria-hidden="true" aria-describedby="product-1-details">
    <div id="product-1-details">
        <!-- 詳細情報 -->
    </div>
</div>
```

### 色のコントラスト

| 要素 | 前景色 | 背景色 | コントラスト比 |
|------|--------|--------|---------------|
| 商品名（デザインA） | yellow-600 | white | 4.5:1以上 |
| 説明文 | gray-600 | white | 7:1以上 |
| CTAボタン | white | yellow-500 | 3:1以上 |

---

## パフォーマンス最適化

### 画像の遅延読み込み

```html
<img
    loading="lazy"
    src="https://bier.jp/images/beeroriginal/nx-002.jpg"
    alt="..."
>
```

### 画像の最適化

```html
<!-- レスポンシブ画像 -->
<picture>
    <source
        srcset="images/nx-002-small.webp"
        media="(max-width: 640px)"
        type="image/webp"
    >
    <source
        srcset="images/nx-002.webp"
        type="image/webp"
    >
    <img
        src="images/nx-002.jpg"
        alt="ヴァイエンシュテファン ヘフェヴァイスビア"
    >
</picture>
```

### CSSの最適化

```css
/* will-changeでアニメーションを最適化 */
.product-card {
    will-change: transform;
}

/* GPU加速を有効化 */
.product-card {
    transform: translateZ(0);
}
```

---

## テスト項目

### 機能テスト

- [ ] 商品カードが正しく表示される
- [ ] ホバーエフェクトが動作する（デザインB）
- [ ] CTAボタンがクリック可能
- [ ] リンクが正しい遷移先に導く

### レスポンシブテスト

- [ ] モバイル（320px - 639px）
- [ ] タブレット（640px - 767px）
- [ ] デスクトップ（768px以上）

### アクセシビリティテスト

- [ ] キーボードのみで操作可能
- [ ] スクリーンリーダーで正しく読み上げられる
- [ ] 色のコントラストがWCAG 2.1基準を満たす

### ブラウザ互換性

- [ ] Chrome（最新版）
- [ ] Firefox（最新版）
- [ ] Safari（最新版）
- [ ] Edge（最新版）

---

## トラブルシューティング

### よくある問題と解決策

#### 1. ホバーエフェクトが動作しない

```css
/* 親要素にgroupクラスがあるか確認 */
.parent-element.group:hover .child-element {
    opacity: 1;
}
```

#### 2. 画像が正しく表示されない

```html
<!-- object-fitを確認 -->
<img class="object-cover" ...>  <!-- 切り取り -->
<img class="object-contain" ...>  <!-- 全体表示 -->
```

#### 3. グリッドレイアウトが崩れる

```css
/* gapの確認 */
.grid {
    gap: 2rem; /* 32px */
}

/* カードの最小幅を設定 */
.product-card {
    min-width: 280px;
}
```

---

## 改訂履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|----------|
| 2024-11-15 | 1.0 | 初版作成 |
