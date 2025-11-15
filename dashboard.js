// ===================================
// Bier.jp WorkSpaces Dashboard
// ===================================

(function() {
    'use strict';

    // 状態管理
    let workspaces = [];
    let currentView = 'grid';
    let currentFilter = 'all';
    let searchQuery = '';

    // WorkSpace一覧（静的定義）
    const WORKSPACE_DIRS = [
        'WorkSpace1_tastingnotes',
        'WorkSpace2_official-line',
        'WorkSpace3_line-ordering',
        'WorkSpace4_product-detail-page',
        'WorkSpace5_feature-page',
        'WorkSpace6_beer-comparison',
        'WorkSpace7_video-content',
        'WorkSpace8_search-feature',
        'WorkSpace9_image-search',
        'WorkSpace10_my-page',
        'WorkSpace11_recommended-products',
        'WorkSpace12_taste-graph'
    ];

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

        const promises = WORKSPACE_DIRS.map(async (dir) => {
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
        renderCurrentView();
    }

    // ===================================
    // 統計更新
    // ===================================

    function updateStatistics() {
        document.getElementById('totalWorkspaces').textContent = workspaces.length;

        const inProgress = workspaces.filter(ws => ws.status === 'in-progress').length;
        document.getElementById('inProgressCount').textContent = inProgress;

        const avgProgress = Math.round(
            workspaces.reduce((sum, ws) => sum + ws.progress, 0) / workspaces.length
        );
        document.getElementById('avgProgress').textContent = `${avgProgress}%`;

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
                            ${ws.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="workspace-footer">
                    ${ws.prototypes && ws.prototypes.length > 0 ? `
                        <div class="prototype-count">🎨 ${ws.prototypes.length} プロトタイプ</div>
                    ` : '<div></div>'}
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); navigateTo('${ws.directory}')">詳細を見る →</button>
                </div>
            </div>
            `;
        }).join('');
    }

    // ===================================
    // カンバンビュー
    // ===================================

    function renderKanbanView() {
        const container = document.getElementById('kanbanView');
        const filtered = getFilteredWorkspaces();

        const columns = {
            'planning': [],
            'in-progress': [],
            'testing': [],
            'completed': []
        };

        filtered.forEach(ws => {
            if (columns[ws.status]) {
                columns[ws.status].push(ws);
            }
        });

        container.innerHTML = Object.entries(columns).map(([status, items]) => `
            <div class="kanban-column">
                <div class="kanban-header">
                    <div class="kanban-title">${STATUS_LABELS[status]}</div>
                    <div class="kanban-count">${items.length}</div>
                </div>
                <div class="kanban-cards">
                    ${items.map(ws => {
                        const wsNumber = ws.id.replace('workspace-', '');
                        return `
                        <div class="kanban-card">
                            <div style="font-weight: 600; margin-bottom: 0.5rem;">WS${wsNumber}: ${ws.name}</div>
                            <div style="font-size: 0.875rem; color: #6c757d; margin-bottom: 0.75rem;">${ws.description}</div>
                            <div class="progress-container" style="margin-bottom: 0.5rem;">
                                <div class="progress-bar" style="width: ${ws.progress}%"></div>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; margin-bottom: 0.75rem;">
                                <span class="badge badge-priority ${ws.priority}">${PRIORITY_LABELS[ws.priority]}</span>
                                <span style="color: #6c757d;">${ws.progress}%</span>
                            </div>
                            <button class="btn btn-primary btn-sm" onclick="navigateTo('${ws.directory}')" style="width: 100%;">詳細を見る →</button>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `).join('');
    }

    // ===================================
    // リストビュー
    // ===================================

    function renderListView() {
        const container = document.getElementById('listView');
        const filtered = getFilteredWorkspaces();

        if (filtered.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 2rem;">該当するWorkSpaceが見つかりません</p>';
            return;
        }

        container.innerHTML = filtered.map(ws => {
            const wsNumber = ws.id.replace('workspace-', '');
            return `
            <div class="list-item">
                <div class="list-item-main">
                    <div style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">WS${wsNumber}: ${ws.name}</div>
                    <div style="color: #6c757d; margin-bottom: 0.75rem;">${ws.description}</div>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
                        <span class="badge badge-status ${ws.status}">${STATUS_LABELS[ws.status]}</span>
                        <span class="badge badge-priority ${ws.priority}">${PRIORITY_LABELS[ws.priority]}</span>
                        <button class="btn btn-primary btn-sm" onclick="navigateTo('${ws.directory}')">詳細を見る →</button>
                    </div>
                </div>
                <div class="list-item-side">
                    <div style="text-align: center; min-width: 80px;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: #007bff;">${ws.progress}%</div>
                        <div style="font-size: 0.75rem; color: #6c757d;">進捗</div>
                    </div>
                    ${ws.prototypes && ws.prototypes.length > 0 ? `
                        <div style="text-align: center; min-width: 80px;">
                            <div style="font-size: 1.5rem; font-weight: 700; color: #17a2b8;">${ws.prototypes.length}</div>
                            <div style="font-size: 0.75rem; color: #6c757d;">プロトタイプ</div>
                        </div>
                    ` : ''}
                </div>
            </div>
            `;
        }).join('');
    }

    // ===================================
    // ビュー切り替え
    // ===================================

    function renderCurrentView() {
        // すべてのビューを非表示
        document.getElementById('gridView').classList.remove('active');
        document.getElementById('kanbanView').classList.remove('active');
        document.getElementById('listView').classList.remove('active');

        // 現在のビューを表示
        switch (currentView) {
            case 'grid':
                document.getElementById('gridView').classList.add('active');
                renderGridView();
                break;
            case 'kanban':
                document.getElementById('kanbanView').classList.add('active');
                renderKanbanView();
                break;
            case 'list':
                document.getElementById('listView').classList.add('active');
                renderListView();
                break;
        }
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
        // ビュー切り替えボタン
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentView = btn.dataset.view;
                renderCurrentView();
            });
        });

        // フィルターボタン
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                renderCurrentView();
            });
        });

        // 検索ボックス
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderCurrentView();
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
