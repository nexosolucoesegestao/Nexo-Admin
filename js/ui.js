// ============================================================
// NEXO Intelligence Admin — UI Helpers
// ============================================================
// Toasts, loading states, modais de confirmação, formatações.
// ============================================================

window.NEXO = window.NEXO || {};

window.NEXO.ui = (() => {

    // ── Toast ────────────────────────────────────────────────

    function toast(message, type = 'info', duration = 3500) {
        // type: 'success' | 'error' | 'warning' | 'info'
        const container = document.getElementById('toast-container') || _createToastContainer();

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        const el = document.createElement('div');
        el.className = `toast toast-${type}`;
        el.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
        `;

        container.appendChild(el);

        // Animate in
        requestAnimationFrame(() => el.classList.add('toast-visible'));

        // Auto dismiss
        setTimeout(() => {
            el.classList.remove('toast-visible');
            el.addEventListener('transitionend', () => el.remove());
        }, duration);
    }

    function _createToastContainer() {
        const c = document.createElement('div');
        c.id = 'toast-container';
        document.body.appendChild(c);
        return c;
    }

    // ── Loading ──────────────────────────────────────────────

    function showLoading(target, text = 'Carregando...') {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (!el) return;
        el.dataset.originalContent = el.innerHTML;
        el.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <span>${text}</span>
            </div>
        `;
        el.classList.add('is-loading');
    }

    function hideLoading(target) {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (!el) return;
        if (el.dataset.originalContent) {
            el.innerHTML = el.dataset.originalContent;
            delete el.dataset.originalContent;
        }
        el.classList.remove('is-loading');
    }

    // ── Button Loading ───────────────────────────────────────

    function btnLoading(btn, loading = true, text = '') {
        if (loading) {
            btn.disabled = true;
            btn.dataset.originalText = btn.textContent;
            btn.innerHTML = `<span class="spinner-sm"></span> ${text || 'Aguarde...'}`;
        } else {
            btn.disabled = false;
            btn.textContent = btn.dataset.originalText || 'OK';
        }
    }

    // ── Modal de Confirmação ─────────────────────────────────

    function confirm(title, message, onConfirm, opts = {}) {
        const {
            confirmText = 'Confirmar',
            cancelText = 'Cancelar',
            type = 'danger' // 'danger' | 'warning' | 'info'
        } = opts;

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-ghost" id="modal-cancel">${cancelText}</button>
                    <button class="btn btn-${type}" id="modal-confirm">${confirmText}</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('modal-visible'));

        const close = () => {
            overlay.classList.remove('modal-visible');
            overlay.addEventListener('transitionend', () => overlay.remove());
        };

        overlay.querySelector('#modal-cancel').onclick = close;
        overlay.querySelector('#modal-confirm').onclick = () => {
            close();
            if (onConfirm) onConfirm();
        };
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });
    }

    // ── Formatação ───────────────────────────────────────────

    function formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    }

    function formatDateTime(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    function formatPhone(phone) {
        if (!phone) return '—';
        const clean = phone.replace(/\D/g, '');
        if (clean.length === 11) {
            return `(${clean.slice(0,2)}) ${clean.slice(2,7)}-${clean.slice(7)}`;
        }
        return phone;
    }

    // ── Debounce (para buscas) ───────────────────────────────

    function debounce(fn, delay = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    }

    // ── Escape HTML ──────────────────────────────────────────

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    return {
        toast,
        showLoading,
        hideLoading,
        btnLoading,
        confirm,
        formatDate,
        formatDateTime,
        formatPhone,
        debounce,
        escapeHtml
    };

})();
