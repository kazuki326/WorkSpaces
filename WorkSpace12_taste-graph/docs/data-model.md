# テイストグラフ データモデル設計

## 概要

テイストグラフ機能で使用するデータモデル、評価軸の定義、スコアリングロジック、およびマッチングアルゴリズムについて記載します。

---

## 1. 味の評価軸

### 1.1 評価軸一覧

テイストグラフでは、ビールの味わいを5つの軸で評価します。

| 軸名 | 英名 | 説明 |
|------|------|------|
| 酸味 | sour | 酸っぱさ。サワービールやヴァイツェン系で高い値 |
| 甘み | sweet | モルト由来の甘さ。ボックやスタウトで高い値 |
| 苦み | bitter | ホップ由来の苦さ。IPAやピルスナーで高い値 |
| コク | body | 飲みごたえ、ボディ感。アルコール度数と相関 |
| 香り | aroma | 芳香の強さ。ヴァイツェンやIPAで高い値 |

### 1.2 スコア定義

各軸は0-5の数値で評価されます。

```
0: なし / 感じない
1: 非常に弱い
2: 弱い
3: 中程度
4: 強い
5: 非常に強い
```

### 1.3 スコア解釈ガイド

#### 酸味 (sour)
| スコア | 解釈 | 該当スタイル例 |
|--------|------|----------------|
| 0-1 | 酸味がほとんどない | ピルスナー、ラガー |
| 2 | わずかに酸味がある | ヴァイツェン |
| 3 | 爽やかな酸味 | ベルリナーヴァイセ（軽め） |
| 4-5 | 強い酸味 | ゴーゼ、サワーエール |

#### 甘み (sweet)
| スコア | 解釈 | 該当スタイル例 |
|--------|------|----------------|
| 0-1 | ドライ、甘みなし | ピルスナー |
| 2 | ほんのり甘い | ヘレス、ペールエール |
| 3 | 適度な甘み | アンバーエール |
| 4-5 | 明確な甘み | ボック、スタウト、ドッペルボック |

#### 苦み (bitter)
| スコア | 解釈 | 該当スタイル例 |
|--------|------|----------------|
| 0-1 | 苦みがほとんどない | ヴァイツェン、ゴーゼ |
| 2 | 穏やかな苦み | ヘレス、ケルシュ |
| 3 | バランスの取れた苦み | ペールエール、アンバー |
| 4 | しっかりした苦み | ピルスナー、IPA（軽め） |
| 5 | 非常に強い苦み | ダブルIPA、インペリアルIPA |

#### コク (body)
| スコア | 解釈 | 該当スタイル例 |
|--------|------|----------------|
| 0-1 | 非常にライト | ライトラガー |
| 2 | ライト | ピルスナー、ヴァイツェン |
| 3 | ミディアム | ペールエール、アンバー |
| 4 | フルボディ | スタウト、ボック |
| 5 | 非常に重厚 | インペリアルスタウト、バーレーワイン |

#### 香り (aroma)
| スコア | 解釈 | 該当スタイル例 |
|--------|------|----------------|
| 0-1 | 香りが弱い | ライトラガー |
| 2 | 穏やかな香り | ピルスナー、ヘレス |
| 3 | 中程度の香り | ペールエール |
| 4 | 華やかな香り | IPA、ヴァイツェン |
| 5 | 非常に芳醇 | ダブルIPA、ベルジャンエール |

---

## 2. データモデル

### 2.1 ユーザー味プロファイル (TasteProfile)

ユーザーの好みを保存するデータ構造です。

```typescript
interface TasteProfile {
  sour: number;    // 0-5 (0.5刻み)
  sweet: number;   // 0-5 (0.5刻み)
  bitter: number;  // 0-5 (0.5刻み)
  body: number;    // 0-5 (0.5刻み)
  aroma: number;   // 0-5 (0.5刻み)
}
```

**ストレージ形式** (LocalStorage):
```json
{
  "sour": "3",
  "sweet": "2.5",
  "bitter": "4",
  "body": "3",
  "aroma": "3.5"
}
```

**キー**: `myTaste`

### 2.2 ビールデータ (Beer)

ビールの基本情報と味覚スコアを含むデータ構造です。

```typescript
interface Beer {
  name: string;
  酸味: number;  // 0-5
  甘み: number;  // 0-5
  苦み: number;  // 0-5
  コク: number;  // 0-5
  香り: number;  // 0-5
}
```

### 2.3 ビールスペック (BeerSpec)

味グラフ自動生成で使用する入力データ構造です。

```typescript
interface BeerSpec {
  name: string;           // ビール名
  style: string;          // ビアスタイル (例: "IPA", "Stout")
  abv: number;            // アルコール度数 (%)
  ibu: number;            // 苦味指数
  malt: string;           // モルト種類 (例: "caramel", "munich")
  fermentation: string;   // 発酵方法 (例: "ale", "lager")
  note: string;           // 特徴メモ (例: "banana, fruit")
}
```

---

## 3. スコアリングアルゴリズム

### 3.1 概要

味グラフ自動生成機能では、ビールのスペック情報から味覚スコアを推測します。

### 3.2 苦味スコア計算

IBU（International Bitterness Units）を基準にスコアを算出します。

```javascript
function calculateBitterness(ibu) {
  if (ibu < 15) return 1;
  if (ibu < 30) return 2;
  if (ibu < 50) return 3;
  if (ibu < 70) return 4;
  return 5;
}
```

**IBU-スコア対応表**:
| IBU範囲 | スコア |
|---------|--------|
| 0-14 | 1 |
| 15-29 | 2 |
| 30-49 | 3 |
| 50-69 | 4 |
| 70+ | 5 |

### 3.3 甘味スコア計算

モルト種類、アルコール度数、スタイルから算出します。

```javascript
function calculateSweetness(abv, malt, style) {
  let sweetness = 2;  // ベーススコア

  // モルト加算
  if (malt.includes("caramel") || malt.includes("munich")) {
    sweetness = 3;
  }

  // ABV加算
  if (abv > 8) {
    sweetness += 1;
  }

  // スタイル加算
  if (style.includes("bock") || style.includes("stout")) {
    sweetness = Math.max(sweetness, 4);
  }

  return Math.min(Math.max(sweetness, 0), 5);
}
```

### 3.4 コクスコア計算

アルコール度数（ABV）を基準にスコアを算出します。

```javascript
function calculateBody(abv) {
  if (abv < 4.5) return 1;
  if (abv < 6) return 2;
  if (abv < 7.5) return 3;
  if (abv < 9) return 4;
  return 5;
}
```

**ABV-スコア対応表**:
| ABV範囲 | スコア |
|---------|--------|
| 0-4.4% | 1 |
| 4.5-5.9% | 2 |
| 6.0-7.4% | 3 |
| 7.5-8.9% | 4 |
| 9.0%+ | 5 |

### 3.5 香りスコア計算

発酵方法、スタイル、特徴メモから累積的に算出します。

```javascript
function calculateAroma(fermentation, style, note) {
  let aroma = 1;  // ベーススコア

  // 発酵方法
  if (fermentation.includes("ale")) {
    aroma += 1;
  }

  // スタイル・特徴
  if (style.includes("weizen") || style.includes("ipa") ||
      note.includes("banana") || note.includes("fruit")) {
    aroma += 1;
  }

  // 特殊香り
  if (note.includes("barrel") || note.includes("wild")) {
    aroma += 1;
  }

  return Math.min(Math.max(aroma, 0), 5);
}
```

### 3.6 酸味スコア計算

スタイルと特徴メモを基準に算出します。

```javascript
function calculateSourness(style, note) {
  // サワースタイル
  if (style.includes("berliner") || style.includes("gose") ||
      style.includes("sour")) {
    return 4;
  }

  // フルーツ・乳酸発酵
  if (note.includes("fruit") || note.includes("lactic")) {
    return 3;
  }

  // ヴァイツェン系
  if (style.includes("weizen")) {
    return 2;
  }

  return 1;  // デフォルト
}
```

---

## 4. マッチングアルゴリズム

### 4.1 概要

ビールマッチング機能では、ユーザーの好みと各ビールの味覚プロファイルとの類似度を計算し、最も近いビールを提案します。

### 4.2 ユークリッド距離

5次元空間における2点間の距離を計算します。

**数式**:
```
distance = sqrt((a1-b1)^2 + (a2-b2)^2 + (a3-b3)^2 + (a4-b4)^2 + (a5-b5)^2)
```

**実装**:
```javascript
function calculateDistance(userPref, beer) {
  return Math.sqrt(
    Math.pow(beer.酸味 - userPref.酸味, 2) +
    Math.pow(beer.甘み - userPref.甘み, 2) +
    Math.pow(beer.苦み - userPref.苦み, 2) +
    Math.pow(beer.コク - userPref.コク, 2) +
    Math.pow(beer.香り - userPref.香り, 2)
  );
}
```

### 4.3 マッチング処理フロー

```
1. ユーザーの味覚プロファイルを取得
2. データベース内の全ビールをループ
3. 各ビールとのユークリッド距離を計算
4. 最小距離のビールを特定
5. 結果を返却
```

**実装例**:
```javascript
function findBestMatch(userPreferences, beers) {
  let bestMatch = null;
  let minDistance = Infinity;

  beers.forEach(beer => {
    const distance = calculateDistance(userPreferences, beer);
    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = beer;
    }
  });

  return { beer: bestMatch, distance: minDistance };
}
```

### 4.4 距離スコアの解釈

| 距離 | 解釈 |
|------|------|
| 0 | 完全一致 |
| 0.1-1.0 | 非常に近い |
| 1.1-2.0 | 近い |
| 2.1-3.0 | やや近い |
| 3.1-4.0 | 違いがある |
| 4.0+ | 大きく異なる |

---

## 5. 将来の拡張

### 5.1 重み付きマッチング

特定の軸を重視したマッチングが可能になります。

```javascript
function weightedDistance(userPref, beer, weights) {
  return Math.sqrt(
    weights.酸味 * Math.pow(beer.酸味 - userPref.酸味, 2) +
    weights.甘み * Math.pow(beer.甘み - userPref.甘み, 2) +
    weights.苦み * Math.pow(beer.苦み - userPref.苦み, 2) +
    weights.コク * Math.pow(beer.コク - userPref.コク, 2) +
    weights.香り * Math.pow(beer.香り - userPref.香り, 2)
  );
}
```

### 5.2 コサイン類似度

味の強さよりもバランスを重視するマッチング手法です。

```javascript
function cosineSimilarity(a, b) {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
```

### 5.3 機械学習ベースの推測

実際のユーザー評価データを学習させることで、スペックから味覚スコアへの変換精度を向上させます。

- **入力**: ビールスペック（ABV, IBU, スタイル等）
- **出力**: 5軸の味覚スコア
- **手法**: 回帰モデル、ニューラルネットワーク

---

## 6. データ検証ルール

### 6.1 入力値バリデーション

| フィールド | ルール |
|------------|--------|
| 味覚スコア | 0以上5以下の数値 |
| ABV | 0以上20以下の数値（%） |
| IBU | 0以上120以下の整数 |
| スタイル | 空文字可、最大50文字 |
| モルト | 空文字可、最大100文字 |
| 特徴メモ | 空文字可、最大200文字 |

### 6.2 スコア範囲制約

全ての味覚スコアは0-5の範囲に収める必要があります。

```javascript
function clampScore(score) {
  return Math.min(Math.max(score, 0), 5);
}
```
