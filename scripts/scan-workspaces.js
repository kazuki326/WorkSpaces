#!/usr/bin/env node
/**
 * WorkSpaceディレクトリをスキャンして workspaces.json を生成
 *
 * 使い方: node scripts/scan-workspaces.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT_DIR, 'workspaces.json');

function getWorkspaceDirs() {
  return fs.readdirSync(ROOT_DIR)
    .filter(name => {
      if (!name.startsWith('WorkSpace')) return false;
      const fullPath = path.join(ROOT_DIR, name);
      if (!fs.statSync(fullPath).isDirectory()) return false;
      // workspace.json が存在するかチェック
      return fs.existsSync(path.join(fullPath, 'workspace.json'));
    })
    .sort((a, b) => {
      const numA = parseInt(a.match(/WorkSpace(\d+)/)?.[1] || '0');
      const numB = parseInt(b.match(/WorkSpace(\d+)/)?.[1] || '0');
      return numA - numB;
    });
}

function main() {
  console.log('Scanning WorkSpace directories...\n');

  const dirs = getWorkspaceDirs();

  console.log(`Found ${dirs.length} WorkSpaces:`);
  dirs.forEach(dir => console.log(`  - ${dir}`));

  // JSON出力
  const output = {
    generated: new Date().toISOString(),
    count: dirs.length,
    workspaces: dirs
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');
  console.log(`\nGenerated: workspaces.json`);
}

main();
