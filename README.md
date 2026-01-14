# bier.jp WorkSpaces

日本のビールECサイト「bier.jp」の機能開発とプロトタイプ管理を行うプロジェクトポートフォリオシステムです。

## 概要

このリポジトリは、bier.jpに関連する12の異なる機能開発プロジェクト（WorkSpace）を一元管理し、各プロジェクトの進捗状況、プロトタイプ、ドキュメントを集約しています。

### 主な機能

- **インタラクティブダッシュボード**: グリッド、カンバン、リスト形式での表示
- **リアルタイム検索**: WorkSpace名、説明、タグでの検索
- **進捗管理**: 各プロジェクトの進行状況を可視化
- **プロトタイプギャラリー**: 各機能のデモを一覧表示

## クイックスタート

### ローカルで実行

```bash
# リポジトリのクローン
git clone <repository-url>
cd WorkSpaces

# ローカルサーバーを起動
python3 -m http.server 8000

# ブラウザで開く
open http://localhost:8000
```

または、`index.html`を直接ブラウザで開いてください。

### 開発者向けドキュメント

開発に参加する方は、以下のドキュメントをご覧ください：

- **[開発者ガイド (DEVELOPER.md)](./DEVELOPER.md)** - セットアップ、開発フロー、コーディング規約
- **[テンプレート (.templates/)](./.templates/)** - 新しいWorkSpace作成用のテンプレート

## WorkSpaces

現在、以下の12のプロジェクトが進行中です：

| # | WorkSpace | 概要 | ステータス |
| :---: | :--- | :--- | :---: |
| 1 | [テイスティングノート](./WorkSpace1_tastingnotes/) | 購入者がテイスティングノートを記録し、その平均を商品の口コミとして掲載する機能 | 🔄 |
| 2 | [公式LINE](./WorkSpace2_official-line/) | 公式LINEアカウントの構築 | 🔄 |
| 3 | [LINE注文](./WorkSpace3_line-ordering/) | LINE上で商品を注文できる機能 | 🔄 |
| 4 | [商品詳細ページ](./WorkSpace4_product-detail-page/) | 商品詳細ページの整理 | 📋 |
| 5 | [特集ページ](./WorkSpace5_feature-page/) | 特集ページの作成 | 📋 |
| 6 | [ビール比較](./WorkSpace6_beer-comparison/) | ビールの比較機能 | 🧪 |
| 7 | [動画コンテンツ](./WorkSpace7_video-content/) | 動画コンテンツの企画・整理 | 📋 |
| 8 | [検索機能](./WorkSpace8_search-feature/) | 検索機能 | 🔄 |
| 9 | [画像検索](./WorkSpace9_image-search/) | 画像検索機能 | 📋 |
| 10 | [マイページ](./WorkSpace10_my-page/) | マイページ機能 | 🔄 |
| 11 | [おすすめ商品](./WorkSpace11_recommended-products/) | おすすめ商品機能 | 📋 |
| 12 | [味グラフ](./WorkSpace12_taste-graph/) | 味のグラフ表示機能 | 📋 |

**凡例**: 📋 Planning / 🔄 In Progress / 🧪 Testing / ✅ Completed

## 技術スタック

- **HTML5/CSS3** - セマンティックマークアップとモダンCSS
- **Vanilla JavaScript (ES6+)** - フレームワーク不要のシンプルな構成
- **Chart.js** - データ可視化
- **GitHub Pages** - 静的サイトホスティング

## プロジェクト構造

```
WorkSpaces/
├── index.html              # メインダッシュボード
├── dashboard.js            # ダッシュボードロジック
├── design-system.css       # デザインシステム
├── prototypes.html         # プロトタイプギャラリー
├── WorkSpace[1-12]_*/      # 各プロジェクトディレクトリ
├── .templates/             # テンプレートファイル
└── DEVELOPER.md            # 開発者向けドキュメント
```

詳細は [DEVELOPER.md](./DEVELOPER.md) をご覧ください。

## 貢献

プロジェクトへの貢献を歓迎します！

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add: 素晴らしい機能を追加'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

詳細は [DEVELOPER.md](./DEVELOPER.md) の開発ワークフローをご覧ください。

## ライセンス

このプロジェクトのライセンス情報については、LICENSEファイルを参照してください。
