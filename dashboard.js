// ===================================
// Bier.jp WorkSpaces Dashboard
// ===================================

(function() {
    'use strict';

    // 状態管理
    let workspaces = [];
    let currentFilter = 'all';
    let searchQuery = '';

    // ステータスの日本語表示
    const STATUS_LABELS = {
        'planning': '計画中',
        'in-progress': '進行中',
        'testing': 'テスト中',
        'completed': '完了',
        'on-hold': '保留中'
    };

    // 優先度の日本語表示
    const PRIORITY_LABELS = {
        'low': '低',
        'medium': '中',
        'high': '高',
        'critical': '緊急'
    };

    // ===================================
    // データ読み込み
    // ===================================

    async function loadWorkspaces() {
        const loading = document.getElementById('loading');
        loading.classList.remove('hidden');

        // workspaces.json から動的にディレクトリ一覧を取得
        let workspaceDirs = [];
        try {
            const listResponse = await fetch('./workspaces.json');
            if (listResponse.ok) {
                const listData = await listResponse.json();
                workspaceDirs = listData.workspaces || [];
            }
        } catch (error) {
            console.error('Failed to load workspaces.json:', error);
        }

        const promises = workspaceDirs.map(async (dir) => {
            try {
                const response = await fetch(`./${dir}/workspace.json`);
                if (!response.ok) {
                    console.warn(`Failed to load ${dir}/workspace.json`);
                    return null;
                }
                const data = await response.json();
                data.directory = dir;
                return data;
            } catch (error) {
                console.error(`Error loading ${dir}:`, error);
                return null;
            }
        });

        const results = await Promise.all(promises);
        workspaces = results.filter(ws => ws !== null);

        loading.classList.add('hidden');
        updateStatistics();
        render();
    }

    // ===================================
    // 統計更新
    // ===================================

    function updateStatistics() {
        document.getElementById('totalWorkspaces').textContent = workspaces.length;

        const inProgress = workspaces.filter(ws => ws.status === 'in-progress').length;
        document.getElementById('inProgressCount').textContent = inProgress;

        const totalPrototypes = workspaces.reduce((sum, ws) =>
            sum + (ws.prototypes ? ws.prototypes.length : 0), 0
        );
        document.getElementById('totalPrototypes').textContent = totalPrototypes;
    }

    // ===================================
    // フィルタリング・検索
    // ===================================

    function getFilteredWorkspaces() {
        return workspaces.filter(ws => {
            // ステータスフィルター
            if (currentFilter !== 'all' && ws.status !== currentFilter) {
                return false;
            }

            // 検索クエリ
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesName = ws.name.toLowerCase().includes(query);
                const matchesDesc = ws.description.toLowerCase().includes(query);
                const matchesTags = ws.tags && ws.tags.some(tag =>
                    tag.toLowerCase().includes(query)
                );
                return matchesName || matchesDesc || matchesTags;
            }

            return true;
        });
    }

    // ===================================
    // サムネイル生成（iframe プレビュー）
    // ===================================

    function getThumbnailHTML(ws) {
        // 最初のプロトタイプのパスを取得
        const firstPrototype = ws.prototypes && ws.prototypes.length > 0 ? ws.prototypes[0] : null;

        if (firstPrototype && firstPrototype.file) {
            const iframeSrc = `./${ws.directory}/${firstPrototype.file}`;
            const iframeId = `iframe-${ws.id}`;
            return `
                <div class="workspace-thumbnail">
                    <div class="workspace-thumbnail-iframe-wrapper">
                        <iframe id="${iframeId}"
                                src="${iframeSrc}"
                                loading="lazy"
                                sandbox="allow-same-origin"
                                onload="this.parentElement.nextElementSibling.classList.add('loaded')"></iframe>
                    </div>
                    <div class="workspace-thumbnail-loading">
                        <div class="mini-spinner"></div>
                    </div>
                </div>
            `;
        }

        // プロトタイプがない場合はプレースホルダー
        return `
            <div class="workspace-thumbnail">
                <div class="workspace-thumbnail-placeholder">
                    <svg viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <span>プロトタイプなし</span>
                </div>
            </div>
        `;
    }

    // ===================================
    // グリッドビュー
    // ===================================

    function renderGridView() {
        const container = document.getElementById('gridView');
        const filtered = getFilteredWorkspaces();

        if (filtered.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 2rem;">該当するWorkSpaceが見つかりません</p>';
            return;
        }

        container.innerHTML = filtered.map(ws => {
            const wsNumber = ws.id.replace('workspace-', '');
            return `
            <div class="workspace-card fade-in" onclick="navigateTo('${ws.directory}')">
                ${getThumbnailHTML(ws)}
                <div class="workspace-card-header">
                    <div class="workspace-title">WS${wsNumber}: ${ws.name}</div>
                    <div class="workspace-description">${ws.description}</div>
                </div>
                <div class="workspace-card-body">
                    <div class="workspace-meta">
                        <span class="badge badge-status ${ws.status}">${STATUS_LABELS[ws.status] || ws.status}</span>
                        <span class="badge badge-priority ${ws.priority}">${PRIORITY_LABELS[ws.priority] || ws.priority}</span>
                    </div>
                    <div class="progress-section">
                        <div class="progress-label">
                            <span>進捗</span>
                            <span><strong>${ws.progress}%</strong></span>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar" style="width: ${ws.progress}%"></div>
                        </div>
                    </div>
                    ${ws.tags && ws.tags.length > 0 ? `
                        <div class="tags-section">
                            ${ws.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                            ${ws.tags.length > 3 ? `<span class="tag">+${ws.tags.length - 3}</span>` : ''}
                        </div>
                    ` : ''}
                </div>
                <div class="workspace-footer">
                    ${ws.prototypes && ws.prototypes.length > 0 ? `
                        <div class="prototype-count">${ws.prototypes.length} プロトタイプ</div>
                    ` : '<div></div>'}
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); navigateTo('${ws.directory}')">詳細を見る →</button>
                </div>
            </div>
            `;
        }).join('');
    }

    // ===================================
    // 描画
    // ===================================

    function render() {
        renderGridView();
    }

    // ===================================
    // ナビゲーション
    // ===================================

    function navigateTo(directory) {
        window.location.href = `./${directory}/index.html`;
    }

    // グローバルスコープに公開（onclick属性から呼び出せるように）
    window.navigateTo = navigateTo;

    // ===================================
    // イベントリスナー
    // ===================================

    function setupEventListeners() {
        // フィルターボタン
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                render();
            });
        });

        // 検索ボックス
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            render();
        });
    }

    // ===================================
    // 初期化
    // ===================================

    function init() {
        setupEventListeners();
        loadWorkspaces();
    }

    // DOMContentLoadedで初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
