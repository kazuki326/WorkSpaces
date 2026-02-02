#!/usr/bin/env node
/**
 * workspace.json から README.md を同期するスクリプト
 *
 * 使用方法:
 *   node scripts/sync-readme.js              # 全ワークスペースを同期
 *   node scripts/sync-readme.js WorkSpace6   # 特定のワークスペースのみ同期
 */

const fs = require('fs');
const path = require('path');

// ステータスの表示用マッピング
const STATUS_MAP = {
  'planning': { label: 'Planning', emoji: '📝' },
  'design': { label: 'Design', emoji: '🎨' },
  'development': { label: 'Development', emoji: '🔧' },
  'in-progress': { label: 'In Progress', emoji: '🔧' },
  'testing': { label: 'Testing', emoji: '🧪' },
  'review': { label: 'Review', emoji: '👀' },
  'completed': { label: 'Completed', emoji: '✅' },
  'on-hold': { label: 'On Hold', emoji: '⏸️' },
  'draft': { label: 'Draft', emoji: '📄' }
};

// 優先度の表示用マッピング
const PRIORITY_MAP = {
  'high': { label: 'High', emoji: '🔴' },
  'medium': { label: 'Medium', emoji: '🟡' },
  'low': { label: 'Low', emoji: '🟢' }
};

// 自動生成セクションの開始・終了マーカー
const AUTO_START = '<!-- AUTO-GENERATED-START -->';
const AUTO_END = '<!-- AUTO-GENERATED-END -->';

/**
 * workspace.json から自動生成部分のみを生成
 */
function generateAutoSection(data) {
  const status = STATUS_MAP[data.status] || { label: data.status, emoji: '❓' };
  const priority = PRIORITY_MAP[data.priority] || { label: data.priority, emoji: '❓' };

  // マイルストーンの生成
  const milestones = (data.milestones || []).map(m => {
    const checkbox = m.completed ? '[x]' : '[ ]';
    const date = m.completed
      ? `(${m.completedDate})`
      : m.dueDate ? `(期限: ${m.dueDate})` : '';
    return `- ${checkbox} ${m.name} ${date}`;
  }).join('\n');

  // プロトタイプテーブルの生成
  const prototypeStatusMap = {
    'ready': '✅ Ready',
    'wip': '🔧 WIP',
    'draft': '📄 Draft',
    'in-progress': '🔧 In Progress',
    'deprecated': '⚠️ Deprecated',
    'archived': '📦 Archived'
  };
  const prototypes = (data.prototypes || []).map(p => {
    const statusIcon = prototypeStatusMap[p.status] || p.status;
    return `| [${p.name}](./${p.file}) | ${p.version || '-'} | ${statusIcon} | ${p.description || '-'} |`;
  }).join('\n');

  // 関連リンクの生成
  const links = [];
  if (data.links?.miro) links.push(`- [Miroボード](${data.links.miro})`);
  if (data.links?.figma) links.push(`- [Figmaデザイン](${data.links.figma})`);
  if (data.links?.docs) links.push(`- [ドキュメント](${data.links.docs})`);
  if (data.prototypes?.length > 0) {
    links.push(`- [プロトタイプを見る](./${data.prototypes[0].file})`);
  }
  (data.links?.other || []).forEach(link => {
    links.push(`- [${link.name}](${link.url})`);
  });

  // チームメンバーの表示
  let team = '未定';
  if (Array.isArray(data.team) && data.team.length > 0) {
    team = data.team.join(', ');
  } else if (typeof data.team === 'string' && data.team) {
    team = data.team;
  }

  // タグの表示
  const tags = (data.tags || []).map(t => `\`${t}\``).join(' ');

  // 自動生成セクション
  return `## 📊 進捗状況

| 項目 | 内容 |
|------|------|
| **ステータス** | ${status.label} ${status.emoji} |
| **進捗率** | ${data.progress}% |
| **優先度** | ${priority.label} ${priority.emoji} |
| **担当者** | ${team} |
| **作成日** | ${data.createdDate || '-'} |
| **最終更新** | ${data.lastUpdated || '-'} |

${tags ? `**タグ**: ${tags}\n` : ''}
### マイルストーン

${milestones || '- マイルストーンは設定されていません'}

## 🔗 関連リンク

${links.length > 0 ? links.join('\n') : '- リンクは設定されていません'}

${data.prototypes?.length > 0 ? `## 🎨 プロトタイプ

| プロトタイプ | バージョン | ステータス | 説明 |
|------------|-----------|----------|------|
${prototypes}
` : ''}`;
}

/**
 * 新規README用のテンプレート（マーカー付き）
 */
function generateNewReadme(data) {
  const autoSection = generateAutoSection(data);

  return `# ${data.id.replace('workspace-', 'WorkSpace')}: ${data.name}

## 📋 概要

${data.description}

${AUTO_START}
<!-- この部分は workspace.json から自動生成されます。手動で編集しないでください -->
${autoSection}
${AUTO_END}

## 🎯 目的・背景

<!-- ここに目的や背景を記述してください -->

### 解決する課題
-

### 期待される効果
-

## 🛠️ 技術スタック

<!-- 使用技術を記述してください -->

## 📝 主要機能

<!-- 主要機能を記述してください -->

${data.notes ? `## 📝 メモ

${data.notes}
` : ''}
---

**[← ダッシュボードに戻る](../index.html)**
`;
}

/**
 * 既存のREADMEの自動生成部分のみを更新
 */
function updateReadme(existingContent, data) {
  const autoSection = generateAutoSection(data);
  const newAutoBlock = `${AUTO_START}\n<!-- この部分は workspace.json から自動生成されます。手動で編集しないでください -->\n${autoSection}\n${AUTO_END}`;

  // マーカーが存在する場合は、その部分のみを置換
  if (existingContent.includes(AUTO_START) && existingContent.includes(AUTO_END)) {
    const regex = new RegExp(`${AUTO_START}[\\s\\S]*?${AUTO_END}`, 'g');
    return existingContent.replace(regex, newAutoBlock);
  }

  // マーカーがない場合は、「## 進捗状況」または「## 📊 進捗状況」セクションを探して置換を試みる
  // それも見つからない場合は既存のREADMEを保持し、警告を出す
  return null;
}

/**
 * workspace.json からREADME.md を生成（後方互換性のため残す）
 */
function generateReadme(workspacePath, data) {
  return generateNewReadme(data);
}

/**
 * 指定されたワークスペースのREADME を同期
 */
function syncWorkspace(workspacePath) {
  const jsonPath = path.join(workspacePath, 'workspace.json');
  const readmePath = path.join(workspacePath, 'README.md');
  const workspaceName = path.basename(workspacePath);

  if (!fs.existsSync(jsonPath)) {
    console.log(`  ⏭️  スキップ: ${workspaceName} (workspace.json なし)`);
    return false;
  }

  try {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    // 既存のREADMEを確認
    let currentReadme = '';
    let newReadme = '';

    if (fs.existsSync(readmePath)) {
      currentReadme = fs.readFileSync(readmePath, 'utf-8');

      // マーカーが存在する場合は、自動生成部分のみを更新
      if (currentReadme.includes(AUTO_START) && currentReadme.includes(AUTO_END)) {
        newReadme = updateReadme(currentReadme, data);
      } else {
        // マーカーがない既存のREADMEがある場合
        console.log(`  ⚠️  手動確認が必要: ${workspaceName}`);
        console.log(`      → README.md にマーカーがありません。`);
        console.log(`      → 以下のマーカーで自動生成部分を囲んでください:`);
        console.log(`         ${AUTO_START}`);
        console.log(`         ${AUTO_END}`);
        return false;
      }
    } else {
      // READMEが存在しない場合は新規作成
      newReadme = generateNewReadme(data);
    }

    // 変更がない場合
    if (currentReadme === newReadme) {
      console.log(`  ✓ 変更なし: ${workspaceName}`);
      return false;
    }

    fs.writeFileSync(readmePath, newReadme, 'utf-8');
    console.log(`  ✅ 更新完了: ${workspaceName}`);
    return true;
  } catch (error) {
    console.error(`  ❌ エラー: ${workspaceName} - ${error.message}`);
    return false;
  }
}

/**
 * 既存のREADMEにマーカーを追加（マイグレーション）
 */
function migrateWorkspace(workspacePath) {
  const jsonPath = path.join(workspacePath, 'workspace.json');
  const readmePath = path.join(workspacePath, 'README.md');
  const workspaceName = path.basename(workspacePath);

  if (!fs.existsSync(jsonPath) || !fs.existsSync(readmePath)) {
    console.log(`  ⏭️  スキップ: ${workspaceName}`);
    return false;
  }

  try {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    let readme = fs.readFileSync(readmePath, 'utf-8');

    // 既にマーカーがある場合はスキップ
    if (readme.includes(AUTO_START)) {
      console.log(`  ✓ マーカー済み: ${workspaceName}`);
      return false;
    }

    // 進捗状況セクションを探す（複数のパターンに対応）
    const patterns = [
      /^(## 📊 進捗状況[\s\S]*?)(?=^## [^#]|\n---|\n\*\*\[←|$)/m,
      /^(## 進捗状況[\s\S]*?)(?=^## [^#]|\n---|\n\*\*\[←|$)/m,
    ];

    let matched = false;
    for (const pattern of patterns) {
      const match = readme.match(pattern);
      if (match) {
        // 進捗セクションからプロトタイプセクションまでを探す
        const startIndex = readme.indexOf(match[0]);

        // プロトタイプセクションの終わりを探す
        let endPatterns = [
          /^## 🎯/m,
          /^## 目的/m,
          /^## 🛠️/m,
          /^## 技術/m,
          /^## 📝 主要機能/m,
          /^## 📂/m,
          /^## 🚀/m,
          /\n---\n/,
        ];

        // 進捗セクション以降のテキストを取得
        const afterProgress = readme.substring(startIndex);

        // 自動生成すべき範囲を特定（進捗状況〜プロトタイプまで）
        let autoEndIndex = afterProgress.length;
        for (const endPattern of endPatterns) {
          const endMatch = afterProgress.match(endPattern);
          if (endMatch && endMatch.index > 0) {
            autoEndIndex = Math.min(autoEndIndex, endMatch.index);
          }
        }

        // 自動生成部分を抽出
        const autoContent = afterProgress.substring(0, autoEndIndex).trim();

        // 新しい自動生成セクションを生成
        const newAutoSection = generateAutoSection(data);
        const newAutoBlock = `${AUTO_START}\n<!-- この部分は workspace.json から自動生成されます。手動で編集しないでください -->\n${newAutoSection}\n${AUTO_END}`;

        // 置換
        readme = readme.substring(0, startIndex) + newAutoBlock + '\n\n' + readme.substring(startIndex + autoEndIndex);
        matched = true;
        break;
      }
    }

    if (!matched) {
      console.log(`  ⚠️  進捗セクションが見つかりません: ${workspaceName}`);
      return false;
    }

    fs.writeFileSync(readmePath, readme, 'utf-8');
    console.log(`  ✅ マイグレーション完了: ${workspaceName}`);
    return true;
  } catch (error) {
    console.error(`  ❌ エラー: ${workspaceName} - ${error.message}`);
    return false;
  }
}

/**
 * 全ワークスペースをマイグレーション
 */
function migrateAll(rootDir) {
  const workspaces = fs.readdirSync(rootDir)
    .filter(name => name.startsWith('WorkSpace'))
    .map(name => path.join(rootDir, name))
    .filter(p => fs.statSync(p).isDirectory());

  console.log(`\n📂 ${workspaces.length} 個のワークスペースを検出\n`);

  let migrated = 0;
  workspaces.forEach(ws => {
    if (migrateWorkspace(ws)) {
      migrated++;
    }
  });

  console.log(`\n✨ 完了: ${migrated} 個のREADMEをマイグレーションしました\n`);
  return migrated;
}

/**
 * 全ワークスペースを同期
 */
function syncAll(rootDir) {
  const workspaces = fs.readdirSync(rootDir)
    .filter(name => name.startsWith('WorkSpace'))
    .map(name => path.join(rootDir, name))
    .filter(p => fs.statSync(p).isDirectory());

  console.log(`\n📂 ${workspaces.length} 個のワークスペースを検出\n`);

  let updated = 0;
  workspaces.forEach(ws => {
    if (syncWorkspace(ws)) {
      updated++;
    }
  });

  console.log(`\n✨ 完了: ${updated} 個のREADMEを更新しました\n`);
  return updated;
}

/**
 * ヘルプメッセージを表示
 */
function showHelp() {
  console.log(`
使用方法:
  node scripts/sync-readme.js [オプション] [ワークスペース名...]

オプション:
  --migrate    既存のREADMEにマーカーを追加（初回のみ実行）
  --help, -h   このヘルプを表示

例:
  node scripts/sync-readme.js                  # 全ワークスペースを同期
  node scripts/sync-readme.js WorkSpace6       # 特定のワークスペースのみ同期
  node scripts/sync-readme.js --migrate        # 全ワークスペースをマイグレーション
`);
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);
  const rootDir = path.resolve(__dirname, '..');

  // ヘルプオプション
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  // マイグレーションオプション
  if (args.includes('--migrate')) {
    console.log('🔄 README マイグレーションスクリプト');
    console.log('====================================');
    console.log('既存のREADMEにマーカーを追加します。\n');
    migrateAll(rootDir);
    return;
  }

  console.log('🔄 README 同期スクリプト');
  console.log('========================\n');

  const workspaceArgs = args.filter(arg => !arg.startsWith('--'));

  if (workspaceArgs.length > 0) {
    // 特定のワークスペースのみ同期
    workspaceArgs.forEach(arg => {
      const workspacePath = path.join(rootDir, arg);
      if (fs.existsSync(workspacePath)) {
        syncWorkspace(workspacePath);
      } else {
        // ワークスペース名のパターンマッチを試みる
        const matches = fs.readdirSync(rootDir)
          .filter(name => name.toLowerCase().includes(arg.toLowerCase()))
          .map(name => path.join(rootDir, name));

        if (matches.length > 0) {
          matches.forEach(ws => syncWorkspace(ws));
        } else {
          console.log(`  ❌ ワークスペースが見つかりません: ${arg}`);
        }
      }
    });
  } else {
    // 全ワークスペースを同期
    syncAll(rootDir);
  }
}

// エクスポート（他のスクリプトから使用可能に）
module.exports = { syncWorkspace, syncAll, generateReadme };

// 直接実行時
if (require.main === module) {
  main();
}
