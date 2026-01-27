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
  'testing': { label: 'Testing', emoji: '🧪' },
  'review': { label: 'Review', emoji: '👀' },
  'completed': { label: 'Completed', emoji: '✅' },
  'on-hold': { label: 'On Hold', emoji: '⏸️' }
};

// 優先度の表示用マッピング
const PRIORITY_MAP = {
  'high': { label: 'High', emoji: '🔴' },
  'medium': { label: 'Medium', emoji: '🟡' },
  'low': { label: 'Low', emoji: '🟢' }
};

/**
 * workspace.json からREADME.md を生成
 */
function generateReadme(workspacePath, data) {
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
  const prototypes = (data.prototypes || []).map(p => {
    const statusIcon = p.status === 'ready' ? '✅ Ready' :
                       p.status === 'wip' ? '🔧 WIP' :
                       p.status === 'deprecated' ? '⚠️ Deprecated' : p.status;
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
  const team = Array.isArray(data.team) ? data.team.join(', ') : data.team || '未定';

  // タグの表示
  const tags = (data.tags || []).map(t => `\`${t}\``).join(' ');

  // README テンプレート
  const readme = `# ${data.id.replace('workspace-', 'WorkSpace')}: ${data.name}

<!-- このファイルは workspace.json から自動生成されています -->
<!-- 編集する場合は workspace.json を更新してください -->

## 概要

${data.description}

## 進捗状況

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

## 関連リンク

${links.length > 0 ? links.join('\n') : '- リンクは設定されていません'}

${data.prototypes?.length > 0 ? `## プロトタイプ

| プロトタイプ | バージョン | ステータス | 説明 |
|------------|-----------|----------|------|
${prototypes}
` : ''}
${data.notes ? `## メモ

${data.notes}
` : ''}
---

**[← ダッシュボードに戻る](../index.html)**
`;

  return readme;
}

/**
 * 指定されたワークスペースのREADME を同期
 */
function syncWorkspace(workspacePath) {
  const jsonPath = path.join(workspacePath, 'workspace.json');
  const readmePath = path.join(workspacePath, 'README.md');

  if (!fs.existsSync(jsonPath)) {
    console.log(`  ⏭️  スキップ: ${path.basename(workspacePath)} (workspace.json なし)`);
    return false;
  }

  try {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const readme = generateReadme(workspacePath, data);

    // 既存のREADMEと比較
    let currentReadme = '';
    if (fs.existsSync(readmePath)) {
      currentReadme = fs.readFileSync(readmePath, 'utf-8');
    }

    if (currentReadme === readme) {
      console.log(`  ✓ 変更なし: ${path.basename(workspacePath)}`);
      return false;
    }

    fs.writeFileSync(readmePath, readme, 'utf-8');
    console.log(`  ✅ 更新完了: ${path.basename(workspacePath)}`);
    return true;
  } catch (error) {
    console.error(`  ❌ エラー: ${path.basename(workspacePath)} - ${error.message}`);
    return false;
  }
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
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);
  const rootDir = path.resolve(__dirname, '..');

  console.log('🔄 README 同期スクリプト');
  console.log('========================\n');

  if (args.length > 0) {
    // 特定のワークスペースのみ同期
    args.forEach(arg => {
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
