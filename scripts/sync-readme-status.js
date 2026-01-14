#!/usr/bin/env node
/**
 * workspace.json の status を README.md の表に同期するスクリプト
 *
 * 使い方: node scripts/sync-readme-status.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const README_PATH = path.join(ROOT_DIR, 'README.md');

// ステータスと絵文字のマッピング
const STATUS_EMOJI = {
  'planning': '📋',
  'in-progress': '🔄',
  'testing': '🧪',
  'completed': '✅'
};

// WorkSpaceディレクトリを取得
function getWorkspaceDirs() {
  return fs.readdirSync(ROOT_DIR)
    .filter(name => name.startsWith('WorkSpace') && fs.statSync(path.join(ROOT_DIR, name)).isDirectory())
    .sort((a, b) => {
      const numA = parseInt(a.match(/WorkSpace(\d+)/)?.[1] || '0');
      const numB = parseInt(b.match(/WorkSpace(\d+)/)?.[1] || '0');
      return numA - numB;
    });
}

// workspace.json からステータスを取得
function getWorkspaceStatus(dirName) {
  const jsonPath = path.join(ROOT_DIR, dirName, 'workspace.json');
  if (!fs.existsSync(jsonPath)) {
    return null;
  }
  try {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    return {
      name: data.name,
      description: data.description,
      status: data.status,
      emoji: STATUS_EMOJI[data.status] || '📋'
    };
  } catch (e) {
    console.error(`Error reading ${jsonPath}:`, e.message);
    return null;
  }
}

// README.md を更新
function updateReadme(workspaces) {
  let readme = fs.readFileSync(README_PATH, 'utf8');
  const lines = readme.split('\n');
  let updated = false;

  const EMOJIS = ['📋', '🔄', '🧪', '✅'];

  // 各行をチェックして更新
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 表の行かチェック (| 1 | ... | 📋 | の形式)
    const match = line.match(/^\|\s*(\d+)\s*\|/);
    if (!match) continue;

    const wsNum = match[1];
    const ws = workspaces.find(w => w.num === wsNum);
    if (!ws || !ws.info) continue;

    // 現在の絵文字を探す
    let currentEmoji = null;
    for (const emoji of EMOJIS) {
      if (line.includes(emoji)) {
        currentEmoji = emoji;
        break;
      }
    }

    if (currentEmoji && currentEmoji !== ws.info.emoji) {
      lines[i] = line.replace(currentEmoji, ws.info.emoji);
      updated = true;
      console.log(`  Updated: WorkSpace${wsNum}: ${currentEmoji} → ${ws.info.emoji}`);
    }
  }

  if (updated) {
    fs.writeFileSync(README_PATH, lines.join('\n'), 'utf8');
    console.log('\nREADME.md updated successfully!');
  } else {
    console.log('\nNo changes needed (already in sync).');
  }
}

// メイン処理
function main() {
  console.log('Syncing workspace status to README.md...\n');

  const dirs = getWorkspaceDirs();
  const workspaces = dirs.map(dir => {
    const num = dir.match(/WorkSpace(\d+)/)?.[1];
    const info = getWorkspaceStatus(dir);
    console.log(`WorkSpace${num}: ${info?.status || 'not found'} → ${info?.emoji || '-'}`);
    return { dir, num, info };
  });

  console.log('');
  updateReadme(workspaces);
}

main();
