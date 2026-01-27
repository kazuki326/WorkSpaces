"use strict";

/**
 * Bier.jp WorkSpaces - UIユーティリティ
 * トースト通知、確認ダイアログ、フォームバリデーションなど
 */

// ===================================
// トースト通知
// ===================================

const Toast = {
    container: null,

    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },

    show(options) {
        this.init();

        const { type = 'info', title, message, duration = 5000 } = options;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = `
            <i class="toast__icon fas ${icons[type]}"></i>
            <div class="toast__content">
                ${title ? `<div class="toast__title">${title}</div>` : ''}
                ${message ? `<div class="toast__message">${message}</div>` : ''}
            </div>
            <button class="toast__close" aria-label="閉じる">&times;</button>
        `;

        // 閉じるボタン
        toast.querySelector('.toast__close').addEventListener('click', () => {
            this.dismiss(toast);
        });

        this.container.appendChild(toast);

        // 自動で消える
        if (duration > 0) {
            setTimeout(() => this.dismiss(toast), duration);
        }

        return toast;
    },

    dismiss(toast) {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    },

    success(title, message) {
        return this.show({ type: 'success', title, message });
    },

    error(title, message) {
        return this.show({ type: 'error', title, message });
    },

    warning(title, message) {
        return this.show({ type: 'warning', title, message });
    },

    info(title, message) {
        return this.show({ type: 'info', title, message });
    }
};

// ===================================
// 確認ダイアログ
// ===================================

const Dialog = {
    show(options) {
        const {
            type = 'info',
            title = '確認',
            message,
            confirmText = 'OK',
            cancelText = 'キャンセル',
            onConfirm,
            onCancel,
            showCancel = true
        } = options;

        const icons = {
            success: 'fa-check-circle',
            danger: 'fa-exclamation-triangle',
            warning: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };

        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        overlay.innerHTML = `
            <div class="dialog">
                <div class="dialog__header">
                    <div class="dialog__icon dialog__icon--${type}">
                        <i class="fas ${icons[type]}"></i>
                    </div>
                    <h3 class="dialog__title">${title}</h3>
                </div>
                <div class="dialog__body">${message}</div>
                <div class="dialog__footer">
                    ${showCancel ? `<button class="btn btn-secondary dialog__cancel">${cancelText}</button>` : ''}
                    <button class="btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'} dialog__confirm">${confirmText}</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // アニメーション
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });

        const close = (confirmed) => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
            if (confirmed && onConfirm) onConfirm();
            if (!confirmed && onCancel) onCancel();
        };

        // イベントリスナー
        overlay.querySelector('.dialog__confirm').addEventListener('click', () => close(true));

        if (showCancel) {
            overlay.querySelector('.dialog__cancel').addEventListener('click', () => close(false));
        }

        // オーバーレイクリックで閉じる
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close(false);
        });

        // Escキーで閉じる
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                close(false);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        return overlay;
    },

    confirm(message, onConfirm) {
        return this.show({
            type: 'warning',
            title: '確認',
            message,
            onConfirm
        });
    },

    alert(message, title = 'お知らせ') {
        return this.show({
            type: 'info',
            title,
            message,
            showCancel: false,
            confirmText: 'OK'
        });
    },

    danger(message, onConfirm) {
        return this.show({
            type: 'danger',
            title: '警告',
            message,
            confirmText: '削除する',
            onConfirm
        });
    }
};

// ===================================
// フォームバリデーション
// ===================================

const FormValidator = {
    validate(input, rules) {
        const value = input.value.trim();
        const errors = [];

        if (rules.required && !value) {
            errors.push('この項目は必須です');
        }

        if (rules.minLength && value.length < rules.minLength) {
            errors.push(`${rules.minLength}文字以上で入力してください`);
        }

        if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(`${rules.maxLength}文字以内で入力してください`);
        }

        if (rules.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push('有効なメールアドレスを入力してください');
        }

        if (rules.pattern && value && !rules.pattern.test(value)) {
            errors.push(rules.patternMessage || 'フォーマットが正しくありません');
        }

        return errors;
    },

    setValidState(inputGroup, isValid, message = '') {
        inputGroup.classList.remove('is-valid', 'is-invalid');
        inputGroup.classList.add(isValid ? 'is-valid' : 'is-invalid');

        const feedback = inputGroup.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.textContent = message;
        }
    },

    clearValidation(inputGroup) {
        inputGroup.classList.remove('is-valid', 'is-invalid');
    }
};

// ===================================
// スケルトンローディング
// ===================================

const Skeleton = {
    create(type = 'text', count = 3) {
        const container = document.createElement('div');

        if (type === 'card') {
            container.className = 'skeleton-card';
            container.innerHTML = `
                <div class="skeleton skeleton-image"></div>
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
            `;
        } else if (type === 'list') {
            for (let i = 0; i < count; i++) {
                container.innerHTML += `
                    <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                        <div class="skeleton skeleton-avatar"></div>
                        <div style="flex: 1;">
                            <div class="skeleton skeleton-text" style="width: 40%;"></div>
                            <div class="skeleton skeleton-text"></div>
                        </div>
                    </div>
                `;
            }
        } else {
            for (let i = 0; i < count; i++) {
                const width = i === count - 1 ? '60%' : '100%';
                container.innerHTML += `<div class="skeleton skeleton-text" style="width: ${width};"></div>`;
            }
        }

        return container;
    },

    show(element, type = 'text') {
        element.dataset.originalContent = element.innerHTML;
        element.innerHTML = '';
        element.appendChild(this.create(type));
    },

    hide(element) {
        if (element.dataset.originalContent !== undefined) {
            element.innerHTML = element.dataset.originalContent;
            delete element.dataset.originalContent;
        }
    }
};

// ===================================
// グローバルに公開
// ===================================

window.Toast = Toast;
window.Dialog = Dialog;
window.FormValidator = FormValidator;
window.Skeleton = Skeleton;
