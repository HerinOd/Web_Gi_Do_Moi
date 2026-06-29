/* =========================================================
   Toast & Confirm – Hệ thống thông báo hiện đại
   Thay thế toàn bộ alert() và confirm() trong dự án
   ========================================================= */
(function () {
    const css = `
        #toast-container {
            position: fixed;
            top: 76px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
            max-width: 360px;
            width: calc(100% - 40px);
        }
        .toast {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            background: #1d2839;
            border: 1px solid #324056;
            border-radius: 12px;
            padding: 14px 16px 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.65);
            pointer-events: all;
            position: relative;
            overflow: hidden;
            animation: toastIn 0.32s cubic-bezier(0.4,0,0.2,1) both;
        }
        .toast.out { animation: toastOut 0.28s cubic-bezier(0.4,0,0.2,1) forwards; }
        @keyframes toastIn {
            from { opacity:0; transform: translateX(24px) scale(0.96); }
            to   { opacity:1; transform: translateX(0) scale(1); }
        }
        @keyframes toastOut {
            from { opacity:1; transform: translateX(0) scale(1); max-height:120px; margin:0; }
            to   { opacity:0; transform: translateX(24px) scale(0.96); max-height:0; padding:0; margin:-10px 0 0; }
        }
        .toast-icon { font-size:20px; line-height:1; flex-shrink:0; margin-top:1px; }
        .toast-body { flex:1; min-width:0; }
        .toast-title { font-weight:600; font-size:14px; color:#eceff3; margin-bottom:3px; }
        .toast-msg   { font-size:13px; color:#9aa7bc; line-height:1.5; word-break:break-word; }
        .toast-close {
            background:none; border:none; color:#5e6e86; cursor:pointer;
            font-size:15px; line-height:1; padding:0; flex-shrink:0;
            transition:color 0.2s; margin-top:1px;
        }
        .toast-close:hover { color:#eceff3; }
        .toast-success { border-left:3px solid #3ddc84; }
        .toast-error   { border-left:3px solid #ff5e6c; }
        .toast-warning { border-left:3px solid #f0a500; }
        .toast-info    { border-left:3px solid #5b9bd5; }
        .toast-bar {
            position:absolute; bottom:0; left:0; height:2px; border-radius:0 0 12px 12px;
            transition: width linear;
        }
        .toast-success .toast-bar { background:#3ddc84; }
        .toast-error   .toast-bar { background:#ff5e6c; }
        .toast-warning .toast-bar { background:#f0a500; }
        .toast-info    .toast-bar { background:#5b9bd5; }

        /* Confirm modal */
        .confirm-overlay {
            position:fixed; inset:0;
            background:rgba(0,0,0,0.72);
            backdrop-filter:blur(5px);
            -webkit-backdrop-filter:blur(5px);
            z-index:10000;
            display:flex; align-items:center; justify-content:center;
            padding:20px;
            animation:overlayIn 0.22s ease both;
        }
        @keyframes overlayIn { from{opacity:0} to{opacity:1} }
        .confirm-card {
            background:#1d2839;
            border:1px solid #324056;
            border-radius:18px;
            padding:32px 30px 28px;
            max-width:400px; width:100%;
            box-shadow:0 20px 60px rgba(0,0,0,0.7);
            animation:cardIn 0.28s cubic-bezier(0.4,0,0.2,1) both;
        }
        @keyframes cardIn {
            from { opacity:0; transform:scale(0.93) translateY(12px); }
            to   { opacity:1; transform:scale(1) translateY(0); }
        }
        .confirm-icon  { font-size:42px; display:block; margin-bottom:16px; }
        .confirm-title { font-size:17px; font-weight:700; color:#eceff3; margin-bottom:8px; }
        .confirm-msg   { font-size:14px; color:#9aa7bc; line-height:1.65; margin-bottom:26px; }
        .confirm-actions { display:flex; gap:10px; justify-content:flex-end; }
        .confirm-btn {
            padding:10px 22px; border:none; border-radius:9px;
            font-family:inherit; font-size:14px; font-weight:600;
            cursor:pointer; transition:all 0.2s;
        }
        .confirm-cancel { background:#273347; color:#9aa7bc; }
        .confirm-cancel:hover { background:#2f3d54; color:#eceff3; }
        .confirm-ok-danger  { background:#ff5e6c; color:#fff; }
        .confirm-ok-danger:hover  { background:#ff3b50; box-shadow:0 4px 18px rgba(255, 94, 108,0.35); }
        .confirm-ok-warning { background:#f0a500; color:#121a28; }
        .confirm-ok-warning:hover { background:#d99200; }

        @media (max-width:480px) {
            #toast-container { top:70px; right:12px; left:12px; width:auto; }
            .confirm-card { padding:24px 20px 20px; }
            .confirm-actions { flex-direction:column-reverse; }
            .confirm-btn { width:100%; text-align:center; }
        }
    `;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);

    const META = {
        success: { icon: '✅', title: 'Thành công' },
        error:   { icon: '❌', title: 'Lỗi' },
        warning: { icon: '⚠️', title: 'Lưu ý' },
        info:    { icon: 'ℹ️', title: 'Thông báo' },
    };

    window.showToast = function (message, type, duration) {
        type = type || 'info';
        duration = duration || 4000;
        const m = META[type] || META.info;

        const el = document.createElement('div');
        el.className = 'toast toast-' + type;
        el.innerHTML =
            '<span class="toast-icon">' + m.icon + '</span>' +
            '<div class="toast-body">' +
                '<div class="toast-title">' + m.title + '</div>' +
                '<div class="toast-msg">' + message + '</div>' +
            '</div>' +
            '<button class="toast-close">✕</button>' +
            '<div class="toast-bar" style="width:100%"></div>';

        container.appendChild(el);

        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                var bar = el.querySelector('.toast-bar');
                if (bar) { bar.style.transitionDuration = duration + 'ms'; bar.style.width = '0'; }
            });
        });

        function dismiss() {
            el.classList.add('out');
            el.addEventListener('animationend', function () { el.remove(); }, { once: true });
        }

        var timer = setTimeout(dismiss, duration);

        el.querySelector('.toast-close').addEventListener('click', function (e) {
            e.stopPropagation(); clearTimeout(timer); dismiss();
        });
    };

    window.showConfirm = function (message, options) {
        options = options || {};
        var title       = options.title       || 'Xác nhận';
        var icon        = options.icon        || '⚠️';
        var confirmText = options.confirmText || 'Xác nhận';
        var cancelText  = options.cancelText  || 'Hủy';
        var btnClass    = options.type === 'warning' ? 'confirm-ok-warning' : 'confirm-ok-danger';

        return new Promise(function (resolve) {
            var overlay = document.createElement('div');
            overlay.className = 'confirm-overlay';
            overlay.innerHTML =
                '<div class="confirm-card">' +
                    '<span class="confirm-icon">' + icon + '</span>' +
                    '<div class="confirm-title">' + title + '</div>' +
                    '<div class="confirm-msg">' + message + '</div>' +
                    '<div class="confirm-actions">' +
                        '<button class="confirm-btn confirm-cancel">' + cancelText + '</button>' +
                        '<button class="confirm-btn ' + btnClass + '">' + confirmText + '</button>' +
                    '</div>' +
                '</div>';

            document.body.appendChild(overlay);

            function close(result) {
                overlay.style.transition = 'opacity 0.2s';
                overlay.style.opacity = '0';
                setTimeout(function () { overlay.remove(); }, 220);
                resolve(result);
            }

            overlay.querySelector('.confirm-cancel').addEventListener('click', function () { close(false); });
            overlay.querySelector('.' + btnClass).addEventListener('click', function () { close(true); });
            overlay.addEventListener('click', function (e) { if (e.target === overlay) close(false); });
        });
    };
})();
