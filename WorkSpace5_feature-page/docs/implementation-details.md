# 実装詳細

## 1. トップページへの導線

トップページには、現在開催中の特集への入り口として、目を引くバナーをカルーセル（スライダー）形式で表示する。

- **技術**: [Swiper.js](https://swiperjs.com/) などのライブラリを使用する。
- **機能**: 複数の特集バナーが自動で切り替わる。ユーザーが手動で左右にスワイプすることも可能。

### カルーセルモックアップ

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>ドイツビール特集バナー</title>
  <!-- SwiperのCSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"/>
  <style>
    .swiper {
      width: 100%;
      max-width: 1200px;
      height: 400px;
      margin: 20px auto;
      border-radius: 12px;
    }
    .swiper-slide img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  </style>
</head>
<body>

  <div class="swiper">
    <div class="swiper-wrapper">
      <!-- 各スライドは特集ページへのリンクを持つ -->
      <a href="./feature_oktoberfest.html" class="swiper-slide">
        <img src="./images/banner_oktoberfest.png" alt="オクトーバーフェスト特集">
      </a>
      <a href="./feature_beerstyle.html" class="swiper-slide">
        <img src="./images/banner_beerstyle.png" alt="ビアスタイル特集">
      </a>
      <a href="./feature_foodpairing.html" class="swiper-slide">
        <img src="./images/banner_foodpairing.png" alt="料理ペアリング特集">
      </a>
    </div>
    <div class="swiper-pagination"></div>
    <div class="swiper-button-prev"></div>
    <div class="swiper-button-next"></div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
  <script>
    const swiper = new Swiper('.swiper', {
      loop: true,
      autoplay: { delay: 4000 },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });
  </script>

</body>
</html>
```

**補足**: バナー画像は、CodePen AssetsやImgurのような画像ホスティングサービスにアップロードしてURLを取得するか、プロジェクト内の画像ディレクトリ（例: `/images`）に配置して相対パスで指定する必要がある。

## 2. ページ遷移

1.  **トップページ**: ユーザーがカルーセル内の特集バナーをクリックする。
2.  **特集ページ**: バナーに対応した特集ページ（例: `feature_oktoberfest.html`）に遷移する。このページには、特集に該当する商品が一覧で表示される。
3.  **商品詳細ページ**: ユーザーが特集ページ内の商品をクリックすると、既存の通常の商品詳細ページに遷移する。

## 3. 運用ルールと効果測定

| 項目 | 内容 |
| :--- | :--- |
| **更新頻度** | 月1回（定例）＋ 季節ごとの大型入れ替え |
| **更新日** | 毎月1日 or 15日など、社内で日付を固定 |
| **制作工数** | バナー画像1枚＋テキスト修正で、1時間以内の作業を目安とする |
| **効果測定** | **CTR**（クリック率）、**PV**（特集ページへの遷移数）を計測する |
| **次回更新の判断基準** | CTRが一定の割合（例: 2%）を下回ったら、バナーやテーマの差し替えを検討する |

