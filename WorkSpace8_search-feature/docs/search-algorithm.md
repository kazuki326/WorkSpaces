# 検索アルゴリズム設計書

## 概要

本ドキュメントでは、bier.jp検索機能で使用する各種検索アルゴリズムのマッチングロジックとスコアリング方法について定義します。

---

## 1. 詳細検索アルゴリズム

### 1.1 マッチングロジック

#### 基本方針

詳細検索では、ユーザーが選択した条件（香り、味、アルコール度数）と商品データを照合し、マッチ度に応じてスコアリングを行います。

#### 条件のAND/OR論理

```
検索結果 = (香り条件 OR マッチ) AND (味条件 OR マッチ) AND (アルコール度数条件マッチ)
```

- **同一カテゴリ内（香り内、味内）**: OR条件（いずれかに該当すればマッチ）
- **異なるカテゴリ間**: AND条件（すべてのカテゴリでマッチが必要）

### 1.2 スコアリング方法

#### 総合スコア計算式

```
総合スコア = (香りスコア × 0.35) + (味スコア × 0.35) + (アルコールスコア × 0.30)
```

#### 香り・味のスコア計算

```javascript
// 選択された条件と商品属性のマッチ率を計算
function calculateAttributeScore(selectedConditions, productAttributes) {
    if (selectedConditions.length === 0) {
        return 1.0; // 条件未選択は満点扱い
    }

    let matchCount = 0;
    for (const condition of selectedConditions) {
        if (productAttributes.includes(condition)) {
            matchCount++;
        }
    }

    // マッチ率 = マッチした条件数 / 選択した条件数
    return matchCount / selectedConditions.length;
}
```

#### アルコール度数のスコア計算

```javascript
function calculateAlcoholScore(minAlcohol, maxAlcohol, productAlcohol) {
    // 条件未設定の場合は満点
    if (minAlcohol === null && maxAlcohol === null) {
        return 1.0;
    }

    // 範囲内完全一致
    if (productAlcohol >= minAlcohol && productAlcohol <= maxAlcohol) {
        return 1.0;
    }

    // 範囲外の場合、距離に応じてスコア減点
    const distance = Math.min(
        Math.abs(productAlcohol - minAlcohol),
        Math.abs(productAlcohol - maxAlcohol)
    );

    // 1%につき0.2減点（最低0）
    return Math.max(0, 1.0 - (distance * 0.2));
}
```

### 1.3 検索結果のソート

1. **一次ソート**: 総合スコア降順
2. **二次ソート**: 商品人気度（販売数、レビュー数）降順
3. **三次ソート**: 新着順（登録日時降順）

### 1.4 フィルタリング閾値

| 閾値 | 値 | 説明 |
|------|-----|------|
| 最低表示スコア | 0.3 | これ未満の商品は結果から除外 |
| 推奨表示スコア | 0.7 | これ以上の商品を優先表示 |
| 完全一致スコア | 1.0 | すべての条件に完全一致 |

---

## 2. ラベル画像検索アルゴリズム

### 2.1 画像認識フロー

```
入力画像 → 前処理 → 特徴抽出 → 類似度計算 → 結果ランキング
```

### 2.2 前処理

1. **リサイズ**: 224x224px（モデル入力サイズ）
2. **正規化**: RGB値を0-1の範囲に正規化
3. **ノイズ除去**: ガウシアンブラーによる軽度のノイズ除去

### 2.3 特徴抽出

#### 使用モデル（想定）

- **CNN（畳み込みニューラルネットワーク）**: ResNet50, EfficientNet等
- **出力**: 2048次元の特徴ベクトル

#### 特徴ベクトル生成

```python
def extract_features(image):
    # 前処理
    processed_image = preprocess(image)

    # CNNモデルで特徴抽出（最終層の直前）
    features = model.predict(processed_image)

    # L2正規化
    normalized_features = features / np.linalg.norm(features)

    return normalized_features
```

### 2.4 類似度計算

#### コサイン類似度

```python
def cosine_similarity(vector_a, vector_b):
    dot_product = np.dot(vector_a, vector_b)
    norm_a = np.linalg.norm(vector_a)
    norm_b = np.linalg.norm(vector_b)

    return dot_product / (norm_a * norm_b)
```

#### 類似度閾値

| 閾値 | 値 | 判定 |
|------|-----|------|
| 完全一致 | >= 0.95 | 同一商品と判定 |
| 高類似 | >= 0.80 | 同一シリーズ・類似デザイン |
| 中類似 | >= 0.60 | 関連商品として表示 |
| 低類似 | < 0.60 | 結果から除外 |

### 2.5 検索最適化

#### インデックス構造

- **ベクトルDB**: 近似最近傍探索（ANN）アルゴリズム使用
- **アルゴリズム**: HNSW（Hierarchical Navigable Small World）
- **検索時間**: O(log N)

---

## 3. フードペアリング検索アルゴリズム

### 3.1 ペアリングロジック

#### ルールベースマッチング

```javascript
const pairingRules = {
    // 料理カテゴリ → 推奨ビールスタイル（優先度順）
    'ピザ': ['ピルスナー', 'ラガー', 'ペールエール'],
    '寿司': ['ホワイトエール', 'ピルスナー', 'セゾン'],
    'ステーキ': ['スタウト', 'ポーター', 'IPA'],
    'カレー': ['IPA', 'ペールエール', 'ベルジャンエール'],
    'チーズ': ['ペールエール', 'ベルジャンエール', 'スタウト'],
    'ハンバーガー': ['ラガー', 'ペールエール', 'アンバーエール']
};
```

### 3.2 スコアリング方法

#### ペアリングスコア

```javascript
function calculatePairingScore(food, beerStyle) {
    const recommendations = pairingRules[food];

    if (!recommendations) {
        return 0;
    }

    const index = recommendations.indexOf(beerStyle);

    if (index === -1) {
        return 0;
    }

    // 優先度が高いほど高スコア
    // 1位: 1.0, 2位: 0.8, 3位: 0.6
    return 1.0 - (index * 0.2);
}
```

### 3.3 拡張ペアリング属性

将来的な拡張として、以下の属性を考慮したマッチングを実装予定。

#### 料理属性

| 属性 | 値の例 |
|------|--------|
| 味の濃さ | 淡白、中程度、濃厚 |
| 調理法 | 生、焼き、揚げ、煮込み |
| 主な味わい | 塩味、甘味、酸味、辛味、旨味 |
| 脂肪分 | 少、中、多 |

#### ビール属性

| 属性 | 値の例 |
|------|--------|
| IBU（苦味） | 0-100+ |
| SRM（色） | 1-40+ |
| ボディ | ライト、ミディアム、フル |
| フレーバープロファイル | モルティ、ホッピー、フルーティ等 |

#### 拡張マッチングロジック

```javascript
function advancedPairingScore(foodAttributes, beerAttributes) {
    let score = 0;

    // 味の濃さとボディのマッチング
    if (foodAttributes.richness === beerAttributes.body) {
        score += 0.3;
    }

    // 脂肪分と苦味のバランス
    if (foodAttributes.fatContent === 'high' && beerAttributes.ibu > 40) {
        score += 0.2;
    }

    // 調理法とフレーバーの相性
    if (foodAttributes.cookingMethod === 'grilled' &&
        beerAttributes.flavor.includes('smoky')) {
        score += 0.2;
    }

    // その他の相性ルール...

    return score;
}
```

---

## 4. パフォーマンス要件

### 4.1 レスポンス時間目標

| 検索タイプ | 目標時間 | 最大許容時間 |
|-----------|---------|-------------|
| 詳細検索 | < 200ms | 500ms |
| ラベル画像検索 | < 1s | 3s |
| フードペアリング | < 50ms | 100ms |

### 4.2 キャッシュ戦略

- **検索結果キャッシュ**: 同一条件の検索結果を5分間キャッシュ
- **画像特徴量キャッシュ**: 抽出済み特徴量をRedisに保存
- **ペアリングルール**: アプリケーション起動時にメモリにロード

---

## 5. 今後の改善予定

1. **機械学習モデルの導入**: ユーザー行動データを学習し、パーソナライズされたスコアリング
2. **A/Bテスト基盤**: 異なるアルゴリズムの効果測定
3. **リアルタイム学習**: ユーザーフィードバックに基づくスコア調整
4. **マルチモーダル検索**: テキスト+画像の複合検索
