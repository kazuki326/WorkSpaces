# 開発者ガイド

このドキュメントは、bier.jp WorkSpacesプロジェクトに参加する開発者向けのガイドです。

## 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [技術スタック](#技術スタック)
3. [環境セットアップ](#環境セットアップ)
4. [プロジェクト構造](#プロジェクト構造)
5. [開発ワークフロー](#開発ワークフロー)
6. [新しいWorkSpaceの作成](#新しいworkspaceの作成)
7. [コーディング規約](#コーディング規約)
8. [デザインシステム](#デザインシステム)
9. [デプロイ](#デプロイ)
10. [トラブルシューティング](#トラブルシューティング)

---

## プロジェクト概要

bier.jp WorkSpacesは、日本のビールECサイト「bier.jp」の機能開発とプロトタイプ管理を行うプロジェクトポートフォリオシステムです。

### 主な機能

- **複数の表示モード**: グリッド、カンバン、リスト形式での表示
- **検索・フィルタリング**: リアルタイム検索とステータスフィルター
- **進捗管理**: 各WorkSpaceの進捗状況をトラッキング
- **プロトタイプギャラリー**: 各機能のプロトタイプを一覧表示

### 現在のWorkSpace一覧

プロジェクトは12のWorkSpaceで構成されています：

1. **テイスティングノート** - ユーザーレビュー機能
2. **公式LINE** - LINEアカウント構築
3. **LINE注文** - LINE経由の注文機能
4. **商品詳細ページ** - 商品ページの改善
5. **特集ページ** - キャンペーンページ作成
6. **ビール比較** - 比較ツール
7. **動画コンテンツ** - 動画企画
8. **検索機能** - サイト内検索
9. **画像検索** - ビジュアル検索
10. **マイページ** - ユーザーページ
11. **おすすめ商品** - レコメンド機能
12. **味グラフ** - 味覚可視化

---

## 技術スタック

### フロントエンド

- **HTML5** - セマンティックなマークアップ
- **CSS3** - カスタムデザインシステム
- **Vanilla JavaScript (ES6+)** - フレームワーク不要のピュアJS
- **Chart.js** - データ可視化（レーダーチャート等）

### ビルド・デプロイ

- **GitHub Pages** - 静的サイトホスティング
- **GitHub Actions** - 自動デプロイ
- **ビルドツール不要** - そのまま動作する静的サイト

### 開発ツール

- Git - バージョン管理
- 任意のテキストエディタ（VS Code推奨）
- モダンブラウザ（Chrome, Firefox, Safari, Edge）

---

## 環境セットアップ

### 必要な環境

- **Git** 2.0以上
- **モダンブラウザ**（Chrome 90+, Firefox 88+, Safari 14+, Edge 90+）
- **ローカルWebサーバー**（オプション）

### セットアップ手順

1. **リポジトリのクローン**

```bash
git clone <repository-url>
cd WorkSpaces
```

2. **ブラウザで開く**

最もシンプルな方法：
```bash
# index.htmlをブラウザで直接開く
open index.html
```

ローカルサーバーを使用する場合（推奨）：
```bash
# Python 3の場合
python3 -m http.server 8000

# Python 2の場合
python -m SimpleHTTPServer 8000

# Node.jsのhttp-serverを使用する場合
npx http-server -p 8000
```

ブラウザで `http://localhost:8000` にアクセス

3. **開発ブランチの作成**

```bash
# 新機能開発用のブランチを作成
git checkout -b feature/your-feature-name

# または、Claudeによる開発の場合
git checkout -b claude/your-feature-name-<session-id>
```

---

## プロジェクト構造

```
WorkSpaces/
│
├── index.html                    # メインダッシュボード
├── dashboard.js                  # ダッシュボードロジック（358行）
├── design-system.css             # デザインシステム（374行）
├── common_style.css              # 共通スタイル（848行）
├── modal.js                      # モーダルコンポーネント（72行）
├── workspace-nav.js              # ナビゲーションユーティリティ（45行）
├── prototypes.html               # プロトタイプギャラリー
│
├── .templates/                   # テンプレートファイル
│   ├── workspace.json            # WorkSpace設定のテンプレート
│   ├── workspace-schema.json     # JSONスキーマ
│   └── README.md                 # WorkSpace用READMEテンプレート
│
├── WorkSpace1_tastingnotes/      # 各WorkSpaceディレクトリ
│   ├── workspace.json            # メタデータ設定
│   ├── index.html                # WorkSpaceサマリーページ
│   ├── README.md                 # ドキュメント
│   ├── preview/                  # プロトタイプHTML
│   └── docs/                     # 詳細ドキュメント
│
├── WorkSpace2_official-line/
├── WorkSpace3_line-ordering/
│   ... (他のWorkSpace)
│
├── .github/
│   └── workflows/
│       └── deploy-pages.yml      # GitHub Pagesデプロイ設定
│
└── README.md                     # プロジェクト概要
```

### 主要ファイルの役割

| ファイル | 役割 | 重要度 |
|---------|------|-------|
| `index.html` | ダッシュボードのエントリーポイント | ★★★ |
| `dashboard.js` | 状態管理・レンダリングロジック | ★★★ |
| `design-system.css` | CSS変数、コンポーネントスタイル | ★★★ |
| `common_style.css` | 全WorkSpace共通のスタイル | ★★ |
| `workspace.json` | 各WorkSpaceの設定ファイル | ★★★ |
| `modal.js` | 再利用可能なモーダル機能 | ★ |
| `workspace-nav.js` | ページ間ナビゲーション | ★ |

---

## 開発ワークフロー

### 1. 機能開発の流れ

```
課題の特定 → ブランチ作成 → 開発 → テスト → コミット → プッシュ → レビュー → マージ
```

### 2. ブランチ戦略

- `main` - 本番環境（GitHub Pagesにデプロイ）
- `feature/*` - 新機能開発
- `fix/*` - バグ修正
- `claude/*` - AI支援開発（Claudeが使用）

### 3. コミットメッセージ規約

明確で説明的なコミットメッセージを使用してください：

```
良い例：
- "Add: テイスティングノートのレーダーチャート機能を追加"
- "Fix: ダッシュボードの検索フィルターが動作しない問題を修正"
- "Update: デザインシステムのカラーパレットを更新"
- "Docs: DEVELOPER.mdに環境セットアップ手順を追加"

悪い例：
- "update"
- "fix bug"
- "changes"
```

### 4. テスト手順

手動テストチェックリスト：

- [ ] すべてのブラウザで表示確認（Chrome, Firefox, Safari, Edge）
- [ ] レスポンシブデザインの確認（モバイル、タブレット、デスクトップ）
- [ ] 検索・フィルタリング機能の動作確認
- [ ] ナビゲーションの動作確認
- [ ] JavaScriptコンソールにエラーがないことを確認
- [ ] 各WorkSpaceページが正しくロードされることを確認

---

## 新しいWorkSpaceの作成

### ステップ1: ディレクトリ構造の作成

```bash
# 新しいWorkSpaceディレクトリを作成
mkdir WorkSpace13_new-feature

cd WorkSpace13_new-feature

# 必要なサブディレクトリを作成
mkdir preview docs
```

### ステップ2: workspace.jsonの作成

`.templates/workspace.json` をコピーして編集：

```bash
cp ../.templates/workspace.json ./workspace.json
```

`workspace.json` の例：

```json
{
  "id": 13,
  "name": "新機能名",
  "description": "新機能の簡潔な説明",
  "status": "Planning",
  "progress": 0,
  "priority": "Medium",
  "team": [],
  "tags": ["新機能", "開発中"],
  "links": {
    "miro": "",
    "figma": "",
    "docs": ""
  },
  "prototypes": [
    {
      "name": "初期プロトタイプ",
      "version": "v0.1",
      "path": "preview/prototype-v0.1.html",
      "description": "初期コンセプトのプロトタイプ"
    }
  ],
  "milestones": [
    {
      "name": "要件定義完了",
      "status": "In Progress",
      "dueDate": "2025-12-31"
    }
  ],
  "dependencies": [],
  "notes": "開発メモや注意事項"
}
```

### ステップ3: README.mdの作成

`.templates/README.md` をコピーして編集：

```bash
cp ../.templates/README.md ./README.md
```

### ステップ4: index.htmlの作成

WorkSpace専用のサマリーページを作成：

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WorkSpace13 - 新機能名</title>
    <link rel="stylesheet" href="../design-system.css">
    <link rel="stylesheet" href="../common_style.css">
</head>
<body>
    <div class="container">
        <h1>WorkSpace13: 新機能名</h1>
        <p>機能の説明をここに記載</p>
        <!-- コンテンツを追加 -->
    </div>
</body>
</html>
```

### ステップ5: ダッシュボードに登録

`dashboard.js` は自動的に `workspace.json` を読み込みますが、手動で確認が必要な場合もあります。

### ステップ6: ルートREADME.mdを更新

`README.md` のWorkSpaceテーブルに新しいWorkSpaceを追加：

```markdown
| [WorkSpace13_new-feature](./WorkSpace13_new-feature/) | 新機能の説明 |
```

---

## コーディング規約

### HTML

- セマンティックなHTML5タグを使用（`<header>`, `<main>`, `<section>`, `<article>`等）
- 適切な`alt`属性を画像に設定
- アクセシビリティを考慮（ARIA属性、適切な見出しレベル）

```html
<!-- 良い例 -->
<article class="workspace-card">
  <header>
    <h2>WorkSpace タイトル</h2>
  </header>
  <section class="workspace-content">
    <!-- コンテンツ -->
  </section>
</article>

<!-- 悪い例 -->
<div class="card">
  <div class="title">WorkSpace タイトル</div>
  <div class="content">
    <!-- コンテンツ -->
  </div>
</div>
```

### CSS

- デザインシステムのCSS変数を使用
- BEM命名規則を推奨（Block__Element--Modifier）
- モバイルファーストのレスポンシブデザイン

```css
/* 良い例 - CSS変数を使用 */
.workspace-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
}

/* 悪い例 - ハードコードされた値 */
.card {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
}
```

### JavaScript

- ES6+の機能を積極的に使用
- `const`と`let`を使用（`var`は使わない）
- アロー関数を活用
- 明確な関数名と変数名
- コメントで複雑なロジックを説明

```javascript
// 良い例
const filterWorkspaces = (workspaces, status) => {
  return workspaces.filter(ws => ws.status === status);
};

// 悪い例
var filter = function(arr, s) {
  var result = [];
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].status == s) {
      result.push(arr[i]);
    }
  }
  return result;
};
```

### ファイル命名規則

- ケバブケース（kebab-case）を使用: `workspace-nav.js`, `design-system.css`
- 意味のある名前を付ける
- WorkSpaceディレクトリ: `WorkSpace[番号]_[機能名]`

---

## デザインシステム

### カラーパレット

`design-system.css`で定義されているCSS変数：

```css
/* プライマリカラー */
--primary-color: #2563eb;
--primary-hover: #1d4ed8;

/* ステータスカラー */
--status-planning: #94a3b8;
--status-in-progress: #3b82f6;
--status-testing: #f59e0b;
--status-completed: #10b981;

/* 優先度カラー */
--priority-low: #94a3b8;
--priority-medium: #3b82f6;
--priority-high: #f59e0b;
--priority-critical: #ef4444;
```

### コンポーネント

利用可能なコンポーネント：

#### バッジ

```html
<span class="badge badge-status-planning">Planning</span>
<span class="badge badge-status-in-progress">In Progress</span>
<span class="badge badge-status-testing">Testing</span>
<span class="badge badge-status-completed">Completed</span>
```

#### ボタン

```html
<button class="btn btn-primary">プライマリボタン</button>
<button class="btn btn-secondary">セカンダリボタン</button>
```

#### 進捗バー

```html
<div class="progress">
  <div class="progress-bar" style="width: 65%">65%</div>
</div>
```

#### カード

```html
<div class="workspace-card">
  <div class="workspace-card-header">
    <h3>タイトル</h3>
  </div>
  <div class="workspace-card-body">
    コンテンツ
  </div>
</div>
```

### アニメーション

```css
/* フェードイン */
.fade-in { animation: fadeIn 0.3s ease-in; }

/* パルス */
.pulse { animation: pulse 2s infinite; }

/* シマー（ローディング） */
.shimmer { animation: shimmer 2s infinite; }
```

---

## デプロイ

### GitHub Pagesへの自動デプロイ

プロジェクトは GitHub Actions を使用して自動的にデプロイされます。

#### デプロイトリガー

- `main`ブランチへのプッシュ
- 手動でのワークフロー実行

#### デプロイフロー

1. コードを`main`ブランチにマージ
2. GitHub Actionsが自動実行（`.github/workflows/deploy-pages.yml`）
3. 静的ファイルがGitHub Pagesにデプロイ
4. 数分後に公開URLで確認可能

#### 手動デプロイ

GitHubリポジトリで：

1. "Actions"タブに移動
2. "pages build and deployment"ワークフローを選択
3. "Run workflow"をクリック

### ローカルでのビルド確認

ビルドステップは不要ですが、デプロイ前に確認：

```bash
# ローカルサーバーで動作確認
python3 -m http.server 8000

# ブラウザで http://localhost:8000 を開く
# すべてのページとリンクが正しく動作するか確認
```

---

## トラブルシューティング

### よくある問題と解決方法

#### 1. ダッシュボードにWorkSpaceが表示されない

**原因**: `workspace.json`の形式エラー

**解決方法**:
```bash
# JSONの構文チェック
cat WorkSpace1_tastingnotes/workspace.json | python3 -m json.tool

# エラーがある場合は修正
# 特に以下をチェック：
# - カンマの抜け
# - クォーテーションの不一致
# - ブラケットの閉じ忘れ
```

#### 2. CSSが適用されない

**原因**: ファイルパスの間違い

**解決方法**:
```html
<!-- 相対パスを確認 -->
<!-- WorkSpace内のHTMLファイルの場合 -->
<link rel="stylesheet" href="../design-system.css">
<link rel="stylesheet" href="../common_style.css">

<!-- ルートのHTMLファイルの場合 -->
<link rel="stylesheet" href="./design-system.css">
<link rel="stylesheet" href="./common_style.css">
```

#### 3. JavaScriptエラー

**原因**: スクリプトの読み込み順序またはパスの問題

**解決方法**:
```html
<!-- スクリプトをbody閉じタグの直前に配置 -->
<body>
  <!-- コンテンツ -->

  <script src="./dashboard.js"></script>
  <script src="./modal.js"></script>
</body>
```

ブラウザのDevToolsでコンソールを確認：
- Chrome: `F12` → Consoleタブ
- Firefox: `F12` → コンソールタブ

#### 4. GitHubへのプッシュが失敗する（403エラー）

**原因**: ブランチ名が規約に違反

**解決方法**:
```bash
# Claudeによる開発の場合、ブランチ名は以下の形式である必要があります：
# claude/[feature-name]-[session-id]

# 正しいブランチ名の例
git checkout -b claude/create-developer-guide-01XKcnvgkWxNtDjUGhMeoaXh

# プッシュ時は -u オプションを使用
git push -u origin claude/create-developer-guide-01XKcnvgkWxNtDjUGhMeoaXh
```

#### 5. ネットワークエラーでプッシュ/フェッチが失敗

**解決方法**: 指数バックオフでリトライ

```bash
# 手動でリトライ（2秒、4秒、8秒、16秒の間隔）
git push -u origin your-branch-name
# 失敗した場合、2秒待って再実行
sleep 2 && git push -u origin your-branch-name
# さらに失敗した場合、4秒待って再実行
sleep 4 && git push -u origin your-branch-name
```

#### 6. プロトタイプページが正しく表示されない

**原因**: Chart.jsなどの外部ライブラリが読み込めていない

**解決方法**:
```html
<!-- CDNから読み込み -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

<!-- ネットワーク接続を確認 -->
<!-- ブラウザのNetworkタブでリソースの読み込みステータスを確認 -->
```

---

## よくある質問（FAQ）

### Q1: 新しいWorkSpaceを追加したら、ダッシュボードに自動的に表示されますか？

**A**: はい、`workspace.json`が正しく配置されていれば、`dashboard.js`が自動的に読み込みます。ただし、ファイル名が`workspace.json`であり、正しいJSON形式である必要があります。

### Q2: デザインシステムのカラーを変更したい場合は？

**A**: `design-system.css`のCSS変数を編集してください。すべてのページに自動的に反映されます。

```css
/* design-system.cssで編集 */
:root {
  --primary-color: #新しい色;
}
```

### Q3: プロトタイプはどこに配置すればいいですか？

**A**: 各WorkSpaceの`preview/`ディレクトリに配置してください。`workspace.json`のprototypes配列にパスを登録することで、プロトタイプギャラリーに表示されます。

### Q4: モバイル対応は必要ですか？

**A**: はい、すべてのページはレスポンシブデザインである必要があります。`common_style.css`にメディアクエリが用意されているので、それを活用してください。

### Q5: 他の開発者の作業と競合した場合は？

**A**: 以下の手順でマージコンフリクトを解決してください：

```bash
# 最新のmainブランチを取得
git fetch origin main

# 現在のブランチにマージ
git merge origin/main

# コンフリクトがある場合、手動で解決
# 解決後、コミット
git add .
git commit -m "Merge: Resolve conflicts with main branch"
```

### Q6: パフォーマンスの最適化は必要ですか？

**A**: 基本的にはシンプルな静的サイトなので、大きな最適化は不要です。ただし、以下の点に注意してください：

- 画像は適切なサイズに圧縮
- 不要なJavaScriptライブラリは使用しない
- CSSは共通化して再利用

---

## 参考リソース

### 内部ドキュメント

- [README.md](./README.md) - プロジェクト概要
- [.templates/README.md](./.templates/README.md) - WorkSpace用テンプレート
- [.templates/workspace-schema.json](./.templates/workspace-schema.json) - JSONスキーマ

### 外部リソース

- [MDN Web Docs](https://developer.mozilla.org/) - HTML/CSS/JavaScript リファレンス
- [Chart.js Documentation](https://www.chartjs.org/docs/) - チャートライブラリ
- [GitHub Pages Documentation](https://docs.github.com/ja/pages) - デプロイ関連

---

## 貢献者

このプロジェクトに貢献していただき、ありがとうございます！

新しい機能の提案やバグ報告は、GitHubのIssuesで受け付けています。

---

## ライセンス

プロジェクトのライセンス情報は、リポジトリのルートにあるLICENSEファイルを参照してください。

---

**最終更新**: 2025-11-15
**バージョン**: 1.0.0
