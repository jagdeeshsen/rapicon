(function () {

    "use strict";

    if (window.AIArchitectWidgetLoaded) {
        return;
    }

    window.AIArchitectWidgetLoaded = true;

    const API_URL = "/api/chat/chatbot";
    const SESSION_URL = "/api/chat/session";
    const SESSION_STORAGE_KEY = "rapicon_ai_session_id";
    const PENDING_DOWNLOAD_KEY = "rapicon_pending_download";
    const PENDING_UPLOAD_KEY = "rapicon_pending_upload";

    // NEW: auth + upload endpoints
    const TOKEN_KEY = "user_token";
    const LOGIN_URL = "/otp-login.html";
    const UPLOAD_URL = "/api/ai/design";

    let sessionId = null;
    let currentImageBlob = null;
    let currentImageUrl = null;
    let currentBqPdfBlob = null;
    let currentBqPdfUrl = null;
    let selectedFile = null;
    let isRestoring = false;
    const imagePreviewUrls = new Set();
    const pdfPreviewUrls = new Set();

    try {
        sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
    } catch (error) {
        console.warn("RAPICON: localStorage unavailable.", error);
    }

    // --------------------------------------------------
    // CSS
    // --------------------------------------------------

    const style = document.createElement("style");

    style.textContent = `

        #ai-architect-button {
            position: fixed;
            right: 28px;
            bottom: 28px;
            width: 62px;
            height: 62px;
            border-radius: 50%;
            border: 2px solid #132b45;
            background: #132b45;
            color: white;
            font-size: 26px;
            cursor: pointer;
            box-shadow: 0 8px 30px rgba(0,0,0,.25);
            z-index: 999999;
        }

        #ai-architect-widget {
            position: fixed;
            right: 28px;
            bottom: 100px;
            width: 390px;
            max-width: calc(100vw - 32px);
            height: 650px;
            max-height: calc(100vh - 130px);
            background: white;
            border-radius: 18px;
            box-shadow: 0 20px 60px rgba(0,0,0,.25);
            overflow: hidden;
            display: none;
            flex-direction: column;
            z-index: 999998;
            font-family: Arial, Helvetica, sans-serif;
        }

        .architect-header {
            background: #132b45;
            color: white;
            padding: 14px 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
        }

        .architect-header-left {
            min-width: 0;
        }

        .architect-title {
            font-size: 16px;
            font-weight: 700;
        }

        .architect-header-actions {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
        }

        .architect-new-chat {
            border: 1px solid rgba(255,255,255,.38);
            background: transparent;
            color: white;
            border-radius: 8px;
            padding: 7px 9px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
        }

        .architect-new-chat:hover {
            background: rgba(255,255,255,.12);
        }

        .architect-close {
            background: transparent;
            border: none;
            color: white;
            font-size: 22px;
            cursor: pointer;
            line-height: 1;
            padding: 4px 6px;
        }

        .architect-chat {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            background: #f6f7f9;
        }

        .architect-message {
            margin-bottom: 12px;
            padding: 11px 13px;
            border-radius: 13px;
            max-width: 86%;
            line-height: 1.45;
            font-size: 14px;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
        }

        .architect-ai {
            background: white;
            border: 1px solid #e3e6ea;
        }

        .architect-user {
            background: #132b45;
            color: white;
            margin-left: auto;
        }

        .architect-image-card {
            background: white;
            padding: 8px;
            border-radius: 12px;
            margin-bottom: 12px;
            border: 1px solid #e2e5e8;
        }

        .architect-image-card img {
            width: 100%;
            display: block;
            border-radius: 8px;
            cursor: pointer;
        }

        .architect-preview-btn {
            background: #e9edf2;
            color: #132b45;
        }

        .architect-preview-modal {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,.82);
            display: none;
            align-items: center;
            justify-content: center;
            padding: 20px;
            z-index: 1000001;
        }

        .architect-preview-modal.open {
            display: flex;
        }

        .architect-preview-image {
            max-width: 95vw;
            max-height: 90vh;
            object-fit: contain;
            border-radius: 10px;
            background: white;
        }

        .architect-preview-pdf {
            width: min(1000px, 95vw);
            height: min(90vh, 850px);
            border: none;
            border-radius: 10px;
            background: white;
        }

        .architect-preview-close {
            position: absolute;
            top: 16px;
            right: 20px;
            width: 44px;
            height: 44px;
            border: none;
            border-radius: 50%;
            background: white;
            color: #132b45;
            font-size: 26px;
            cursor: pointer;
        }

        .architect-actions {
            display: flex;
            gap: 8px;
            margin-top: 9px;
        }

        .architect-action {
            flex: 1;
            border: none;
            padding: 10px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
        }

        .architect-action:disabled {
            opacity: .55;
            cursor: not-allowed;
        }

        .download-btn {
            background: #132b45;
            color: white;
        }

        .update-btn {
            background: #e9edf2;
            color: #132b45;
        }

        .architect-input-area {
            border-top: 1px solid #ddd;
            padding: 10px;
            background: white;
        }

        .architect-status {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 8px;
            min-height: 18px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .architect-status[hidden] {
            display: none;
        }

        .architect-status-spinner {
            width: 12px;
            height: 12px;
            border: 2px solid #d8dee6;
            border-top-color: #132b45;
            border-radius: 50%;
            animation: architect-status-spin .8s linear infinite;
            flex: 0 0 12px;
        }

        .architect-status-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        @keyframes architect-status-spin {
            to {
                transform: rotate(360deg);
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .architect-status-spinner {
                animation: none;
            }
        }

        .architect-file-preview {
            display: none;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            margin-bottom: 8px;
            padding: 8px 10px;
            border: 1px solid #d9dee4;
            background: #f7f9fb;
            border-radius: 9px;
            font-size: 12px;
        }

        .architect-file-name {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .architect-file-remove {
            border: none;
            background: transparent;
            color: #6b7280;
            cursor: pointer;
            font-size: 16px;
            line-height: 1;
            padding: 2px 5px;
        }

        .architect-input-row {
            display: flex;
            align-items: flex-end;
            gap: 6px;
        }

        .architect-tool-btn {
            width: 42px;
            height: 42px;
            flex: 0 0 42px;
            border: 1px solid #ccd2d8;
            border-radius: 10px;
            background: white;
            color: #132b45;
            cursor: pointer;
            font-size: 18px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        .architect-tool-btn:hover {
            background: #f1f3f5;
        }

        .architect-tool-btn:disabled,
        .architect-send:disabled {
            opacity: .55;
            cursor: not-allowed;
        }

        .architect-input {
            flex: 1;
            min-width: 0;
            resize: none;
            border: 1px solid #ccd2d8;
            border-radius: 10px;
            padding: 11px;
            font-size: 14px;
            outline: none;
            min-height: 42px;
        }

        .architect-input:focus {
            border-color: #132b45;
        }

        .architect-send {
            width: 48px;
            height: 42px;
            flex: 0 0 48px;
            border: none;
            border-radius: 10px;
            background: #132b45;
            color: white;
            cursor: pointer;
            font-size: 18px;
        }

        .architect-boq-card {
            background: white;
            padding: 10px;
            border-radius: 12px;
            margin-bottom: 12px;
            border: 1px solid #e2e5e8;
        }

        .architect-boq-title {
            font-size: 13px;
            font-weight: 700;
            color: #132b45;
            margin-bottom: 8px;
        }

        .architect-boq-preview {
            width: 100%;
            height: 260px;
            border: 1px solid #d9dee4;
            border-radius: 8px;
            background: #f7f9fb;
        }

        @media (max-width: 768px) {

        #ai-architect-widget {
            right: 8px;
            left: 8px;
            bottom: 76px;

            width: auto;
            max-width: none;

            height: min(
                650px,
                calc(100dvh - 90px)
            );

            max-height: calc(100dvh - 90px);

            border-radius: 14px;
        }

        #ai-architect-widget.ai-keyboard-open {
            top: 8px;
            bottom: 8px;

            height: calc(100dvh - 16px);
            max-height: calc(100dvh - 16px);

            border-radius: 12px;
        }

        #ai-architect-button {
            right: 16px;
            bottom: 16px;
        }

        .architect-header {
            flex-shrink: 0;
            min-height: 52px;
        }

        .architect-chat {
            flex: 1 1 auto;
            min-height: 0;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
        }

        .architect-input-area {
            flex-shrink: 0;
        }

        .architect-input {
            font-size: 16px;
        }

        .architect-new-chat {
            padding: 7px 8px;
        }
    }
    `;

    document.head.appendChild(style);


    // --------------------------------------------------
    // FLOATING BUTTON
    // --------------------------------------------------

    const button = document.createElement("button");

    button.id = "ai-architect-button";
    button.type = "button";
    button.innerHTML = "🏠";
    button.setAttribute("aria-label", "Open AI Architect");

    document.body.appendChild(button);

    // --------------------------------------------------
    // WIDGET
    // --------------------------------------------------

    const widget = document.createElement("div");

    widget.id = "ai-architect-widget";

    widget.innerHTML = `

        <div class="architect-header">

            <div class="architect-header-left">
                <div class="architect-title">
                    AI Architect
                </div>
            </div>

            <div class="architect-header-actions">

                <button
                    class="architect-new-chat"
                    id="architect-new-chat"
                    type="button"
                >
                    + New Chat
                </button>

                <button
                    class="architect-close"
                    id="architect-close"
                    type="button"
                    aria-label="Close"
                >
                    ×
                </button>

            </div>

        </div>

        <div
            class="architect-chat"
            id="architect-chat"
        >
        </div>

        <div class="architect-input-area">

            <div
                class="architect-status"
                id="architect-status"
                aria-live="polite"
                hidden
            >
                <span
                    class="architect-status-spinner"
                    aria-hidden="true"
                ></span>
                <span
                    class="architect-status-text"
                    id="architect-status-text"
                ></span>
            </div>

            <div
                class="architect-file-preview"
                id="architect-file-preview"
            >
                <span
                    class="architect-file-name"
                    id="architect-file-name"
                ></span>

                <button
                    class="architect-file-remove"
                    id="architect-file-remove"
                    type="button"
                    aria-label="Remove attachment"
                >
                    ×
                </button>
            </div>

            <div class="architect-input-row">

                <button
                    id="architect-camera"
                    class="architect-tool-btn"
                    type="button"
                    title="Take photo"
                    aria-label="Take photo"
                >
                    📷
                </button>

                <button
                    id="architect-attachment"
                    class="architect-tool-btn"
                    type="button"
                    title="Attach image or PDF"
                    aria-label="Attach image or PDF"
                >
                    📎
                </button>

                <input
                    type="file"
                    id="architect-camera-input"
                    accept="image/*"
                    capture="environment"
                    hidden
                />

                <input
                    type="file"
                    id="architect-file-input"
                    accept="image/png,image/jpeg,image/webp,.pdf"
                    hidden
                />

                <textarea
                    id="architect-input"
                    class="architect-input"
                    rows="4"
                    placeholder="Describe your architecture requirements..plot size 30X40 3bhk 3 floors and 1 parking."
                ></textarea>

                <button
                    id="architect-send"
                    class="architect-send"
                    type="button"
                >
                    ➤
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(widget);

    // --------------------------------------------------
    // MOBILE KEYBOARD / VIEWPORT
    // --------------------------------------------------

    (function setupResponsiveViewport() {

        const root = document.documentElement;

        function updateViewport() {

            const vv = window.visualViewport;

        if (!vv) {
            return;
        }

        const visibleHeight = vv.height;
        const viewportTop = vv.offsetTop;

        const keyboardOpen =
            window.innerWidth <= 768 &&
            (window.innerHeight - visibleHeight) > 120;

        root.style.setProperty(
            "--ai-visible-height",
            `${visibleHeight}px`
        );

        root.style.setProperty(
            "--ai-viewport-top",
            `${viewportTop}px`
        );

        widget.classList.toggle(
            "ai-keyboard-open",
            keyboardOpen
        );
    }

    updateViewport();

    if (window.visualViewport) {

        window.visualViewport.addEventListener(
            "resize",
            updateViewport
        );

        window.visualViewport.addEventListener(
            "scroll",
            updateViewport
        );
    }

    window.addEventListener(
        "resize",
        updateViewport
    );

})();

    // --------------------------------------------------
    // ELEMENTS
    // --------------------------------------------------

    const chat = document.getElementById("architect-chat");
    const input = document.getElementById("architect-input");
    const send = document.getElementById("architect-send");
    const status = document.getElementById("architect-status");
    const close = document.getElementById("architect-close");
    const newChat = document.getElementById("architect-new-chat");

    const cameraButton = document.getElementById("architect-camera");
    const attachmentButton = document.getElementById("architect-attachment");
    const cameraInput = document.getElementById("architect-camera-input");
    const fileInput = document.getElementById("architect-file-input");

    const filePreview = document.getElementById("architect-file-preview");
    const fileName = document.getElementById("architect-file-name");
    const fileRemove = document.getElementById("architect-file-remove");

    const DEFAULT_PLACEHOLDER =
        "Describe your architecture requirements..plot size 30X40 3bhk 3 floors and 1 parking.";

    const UPDATE_PLACEHOLDER =
        "What would you like to change?";

    const GREETING_MESSAGE =
        "Hey! I'm your AI Architect — ready to turn your plot into a plan.\n\nShare your plot size, BHK requirements, and floor count, and I'll generate your design in minutes.";

    // Rendered through addMessage() rather than hardcoded HTML so it's
    // guaranteed to look identical to every other message in the chat.
    addMessage(GREETING_MESSAGE, "ai");

    const statusText =
        document.getElementById("architect-status-text");

    let statusTimer = null;

    const PLAN_STATUS_STEPS = [
        "Understanding your requirements...",
        "Planning the spaces...",
        "Sketching your floor plan...",
        "Generating your plan...",
        "Finalizing your design..."
    ];

    const ATTACHMENT_STATUS_STEPS = [
        "Reading your attachment...",
        "Understanding the site and requirements...",
        "Preparing your architectural plan...",
        "Generating your plan...",
        "Finalizing your design..."
    ];

    const BOQ_STATUS_STEPS = [
        "Understanding your project details...",
        "Preparing quantities...",
        "Calculating the preliminary BOQ...",
        "Creating your BOQ PDF...",
        "Finalizing the document..."
    ];

    function startStatusAnimation(steps) {
        stopStatusAnimation();

        const safeSteps =
            Array.isArray(steps) && steps.length
                ? steps
                : ["Generating your plan..."];

        let index = 0;

        status.hidden = false;
        statusText.textContent = safeSteps[index];

        statusTimer = window.setInterval(() => {
            if (index < safeSteps.length - 1) {
                index += 1;
                statusText.textContent = safeSteps[index];
            }
        }, 2200);
    }

    function stopStatusAnimation() {
        if (statusTimer !== null) {
            window.clearInterval(statusTimer);
            statusTimer = null;
        }

        status.hidden = true;
        statusText.textContent = "";
    }

    // --------------------------------------------------
    // AUTH HELPERS
    // --------------------------------------------------

    function getToken() {
        try {
            return localStorage.getItem(TOKEN_KEY);
        } catch (error) {
            console.warn("RAPICON: localStorage unavailable.", error);
            return null;
        }
    }

    function redirectToLogin() {
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = `${LOGIN_URL}?redirect=${returnUrl}`;
    }

    // Remembers which file the user tried to download before being sent
    // to log in, so it can be auto-downloaded once they're back.
    function savePendingDownload(type) {
        try {
            sessionStorage.setItem(PENDING_DOWNLOAD_KEY, type);
        } catch (error) {
            console.warn("RAPICON: Could not save pending download.", error);
        }
    }

    function takePendingDownload() {
        try {
            const type = sessionStorage.getItem(PENDING_DOWNLOAD_KEY);
            sessionStorage.removeItem(PENDING_DOWNLOAD_KEY);
            return type;
        } catch (error) {
            return null;
        }
    }

    // Remembers that a generated file's upload failed (most likely
    // because the user wasn't logged in yet), so it can be retried
    // automatically once they come back authenticated.
    function savePendingUpload(type) {
        try {
            sessionStorage.setItem(PENDING_UPLOAD_KEY, type);
        } catch (error) {
            console.warn("RAPICON: Could not save pending upload.", error);
        }
    }

    function takePendingUpload() {
        try {
            const type = sessionStorage.getItem(PENDING_UPLOAD_KEY);
            sessionStorage.removeItem(PENDING_UPLOAD_KEY);
            return type;
        } catch (error) {
            return null;
        }
    }

    function clearPendingUpload() {
        try {
            sessionStorage.removeItem(PENDING_UPLOAD_KEY);
        } catch (error) {
            // Ignore.
        }
    }

    function triggerDownload(url, filename) {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    // Returns true if the user is logged in. If not, optionally remembers
    // which file they were trying to download, then redirects to login
    // and returns false so the caller can bail out.
    function requireAuth(pendingDownloadType) {
        const token = getToken();
        const userId = getStoredUserId();

        if (!token || !userId) {
            if (pendingDownloadType) {
                savePendingDownload(pendingDownloadType);
            }
            redirectToLogin();
            return false;
        }

        return true;
    }

    // --------------------------------------------------
    // UPLOAD GENERATED FILE TO SERVER / S3
    // --------------------------------------------------

    // Pulls the fields the backend DTO expects (userId, sessionId, files)
    // out of storage. userId is only present once the user has logged in.
    function getStoredUserId() {
        try {
            return localStorage.getItem("user_id") || "";
        } catch (error) {
            console.warn("RAPICON: Could not read user id.", error);
            return "";
        }
    }

    // Uploads a generated image/PDF blob to the backend, which is
    // responsible for pushing it to S3 and saving a record against
    // the current chat session. Throws on failure so callers can
    // decide how to handle it (e.g. still allow local download).
    async function uploadGeneratedFile(blob, fileName) {

        if (!blob) {
            return null;
        }

        const token = getToken();
        const userId = getStoredUserId();

        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("sessionId", sessionId || "");
        formData.append("files", blob, fileName);

        const headers = {};
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(UPLOAD_URL, {
            method: "POST",
            headers,
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`);
        }

        return response.json();
    }

    // Fires an upload automatically whenever a file is generated, no
    // click required, and regardless of whether the user is logged in.
    // This never redirects to login itself — that gate only applies to
    // the Download button, per requireAuth().
    function autoUploadGeneratedFile(blob, fileName, type) {
        uploadGeneratedFile(blob, fileName)
            .then(() => {
                // Succeeded — nothing left to retry.
                clearPendingUpload();
            })
            .catch((error) => {
                console.error("RAPICON: Auto-upload failed.", error);
                // Most likely cause: the user wasn't logged in yet.
                // Remember to retry once they come back authenticated.
                if (type) {
                    savePendingUpload(type);
                }
            });
    }

    // --------------------------------------------------
    // STORAGE HELPERS
    // --------------------------------------------------

    function saveSessionId(id) {
        if (!id) {
            return;
        }

        sessionId = id;

        try {
            localStorage.setItem(
                SESSION_STORAGE_KEY,
                id
            );
        } catch (error) {
            console.warn("RAPICON: Could not save session ID.", error);
        }
    }

    function clearSessionId() {
        sessionId = null;

        try {
            localStorage.removeItem(
                SESSION_STORAGE_KEY
            );
        } catch (error) {
            console.warn("RAPICON: Could not clear session ID.", error);
        }
    }

    // --------------------------------------------------
    // OPEN / CLOSE
    // --------------------------------------------------

    function setWidgetOpen(isOpen) {
        widget.style.display = isOpen ? "flex" : "none";

        if (isOpen) {
            button.innerHTML = "×";
            button.setAttribute("aria-label", "Close AI Architect");
            if (window.innerWidth > 768){
                input.onfocus();
            }
        } else {
            button.innerHTML = "🏠";
            button.setAttribute("aria-label", "Open AI Architect");
        }
    }

    button.addEventListener("click", function () {
        const isOpen = widget.style.display === "flex";
        setWidgetOpen(!isOpen);
    });

    close.addEventListener("click", function () {
        setWidgetOpen(false);
    });

    // --------------------------------------------------
    // ADD MESSAGE
    // --------------------------------------------------

    function addMessage(text, type) {

        if (!text) {
            return;
        }

        const message = document.createElement("div");

        message.className =
            "architect-message " +
            (type === "user"
                ? "architect-user"
                : "architect-ai");

        message.textContent = text;

        chat.appendChild(message);

        chat.scrollTop = chat.scrollHeight;
    }

    // --------------------------------------------------
    // FILE SELECTION / PREVIEW
    // --------------------------------------------------

    function setSelectedFile(file) {

        selectedFile = file || null;

        if (!selectedFile) {
            filePreview.style.display = "none";
            fileName.textContent = "";
            cameraInput.value = "";
            fileInput.value = "";
            return;
        }

        fileName.textContent =
            `📎 ${selectedFile.name}`;

        filePreview.style.display = "flex";
    }

    function clearSelectedFile() {
        selectedFile = null;
        cameraInput.value = "";
        fileInput.value = "";
        filePreview.style.display = "none";
        fileName.textContent = "";
    }

    cameraButton.addEventListener("click", function () {
        if (!send.disabled) {
            cameraInput.click();
        }
    });

    attachmentButton.addEventListener("click", function () {
        if (!send.disabled) {
            fileInput.click();
        }
    });

    cameraInput.addEventListener("change", function () {
        if (cameraInput.files && cameraInput.files.length > 0) {
            setSelectedFile(cameraInput.files[0]);
        }
    });

    fileInput.addEventListener("change", function () {
        if (fileInput.files && fileInput.files.length > 0) {
            setSelectedFile(fileInput.files[0]);
        }
    });

    fileRemove.addEventListener("click", function () {
        clearSelectedFile();
    });

    // --------------------------------------------------
    // RESTORE SESSION
    // --------------------------------------------------

    async function restoreSession() {

        if (!sessionId || isRestoring) {
            return;
        }

        isRestoring = true;

        try {

            status.hidden = false;
            statusText.textContent = "Restoring your previous chat...";

            const response = await fetch(
                `${SESSION_URL}/${encodeURIComponent(sessionId)}`
            );

            if (!response.ok) {

                clearSessionId();

                stopStatusAnimation();

                return;
            }

            const data = await response.json();

            chat.innerHTML = "";

            for (const message of data.messages || []) {

                if (!message || !message.content) {
                    continue;
                }

                addMessage(
                    message.content,
                    message.role === "user"
                        ? "user"
                        : "ai"
                );
            }

            if (data.last_output_type === "boq" && data.last_boq_pdf) {

                displayGeneratedBOQ(
                    data.last_boq_pdf,
                    true
                );

            } else if (data.last_image) {

                displayGeneratedImage(
                    data.last_image,
                    true
                );
            }

            if (!data.messages || data.messages.length === 0) {

                addMessage(
                    GREETING_MESSAGE,
                    "ai"
                );
            }

            stopStatusAnimation();

        } catch (error) {

            console.error(
                "RAPICON session restore error:",
                error
            );

            stopStatusAnimation();

        } finally {
            isRestoring = false;
        }
    }

    // --------------------------------------------------
    // SEND MESSAGE
    // --------------------------------------------------

    async function sendMessage() {

        const message = input.value.trim();
        const hasFile = Boolean(selectedFile);

        if (!message && !hasFile) {
            return;
        }

        if (send.disabled) {
            return;
        }

        addMessage(
            message || `📎 ${selectedFile.name}`,
            "user"
        );

        input.value = "";

        startStatusAnimation(
            hasFile
                ? ATTACHMENT_STATUS_STEPS
                : PLAN_STATUS_STEPS
        );

        send.disabled = true;
        cameraButton.disabled = true;
        attachmentButton.disabled = true;
        newChat.disabled = true;

        try {

            const formData = new FormData();

            if (sessionId) {
                formData.append(
                    "session_id",
                    sessionId
                );
            }

            formData.append(
                "message",
                message
            );

            if (selectedFile) {
                formData.append(
                    "file",
                    selectedFile,
                    selectedFile.name
                );
            }

            const response = await fetch(
                API_URL,
                {
                    method: "POST",
                    body: formData
                }
            );

            if (!response.ok) {

                let serverMessage =
                    `Server error: ${response.status}`;

                try {
                    const errorData =
                        await response.json();

                    if (errorData.detail) {
                        serverMessage =
                            typeof errorData.detail === "string"
                                ? errorData.detail
                                : serverMessage;
                    }
                } catch (_) {
                    // Ignore non-JSON error response.
                }

                throw new Error(serverMessage);
            }

            const data = await response.json();

            saveSessionId(data.session_id);

            // BOQ is a PDF workflow, not an image workflow.
            if (data.type === "boq") {

                startStatusAnimation(BOQ_STATUS_STEPS);

                if (data.message) {
                    addMessage(
                        data.message,
                        "ai"
                    );
                }

                if (data.pdf) {
                    displayGeneratedBOQ(data.pdf);
                }

                stopStatusAnimation();
                clearSelectedFile();
                input.placeholder = DEFAULT_PLACEHOLDER;
                return;
            }

            // Construction-only scope response.
            // Do not continue into image generation handling.
            if (data.type === "invalid") {

                addMessage(
                    data.message ||
                        "Invalid request. I can only help with construction and architecture-related topics.",
                    "ai"
                );

                stopStatusAnimation();
                clearSelectedFile();
                input.placeholder = DEFAULT_PLACEHOLDER;
                return;
            }

            if (data.type === "message") {

                addMessage(
                    data.message,
                    "ai"
                );

                stopStatusAnimation();
                clearSelectedFile();
                return;
            }

            if (data.type === "image") {

                if (data.message) {
                    addMessage(
                        data.message,
                        "ai"
                    );
                }

                if (data.image) {
                    displayGeneratedImage(
                        data.image
                    );
                }

                stopStatusAnimation();
                clearSelectedFile();
                input.placeholder = DEFAULT_PLACEHOLDER;
            }

        } catch (error) {

            console.error(
                "RAPICON AI error:",
                error
            );

            addMessage(
                error.message ||
                    "Sorry, something went wrong while processing the plan.",
                "ai"
            );

            stopStatusAnimation();

        } finally {

            send.disabled = false;
            cameraButton.disabled = false;
            attachmentButton.disabled = false;
            newChat.disabled = false;
            input.focus();
        }
    }

    // --------------------------------------------------
    // FULL PREVIEW HELPERS
    // --------------------------------------------------

    function openPreview(contentType, source) {

        const modal = document.createElement("div");
        modal.className = "architect-preview-modal";

        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "architect-preview-close";
        closeButton.setAttribute("aria-label", "Close preview");
        closeButton.textContent = "×";

        if (contentType === "image") {
            const preview = document.createElement("img");
            preview.className = "architect-preview-image";
            preview.src = source;
            preview.alt = "Full-size architectural plan preview";
            modal.appendChild(preview);
        } else {
            const preview = document.createElement("iframe");
            preview.className = "architect-preview-pdf";
            preview.src = source;
            preview.title = "Full-size BOQ PDF preview";
            modal.appendChild(preview);
        }

        modal.appendChild(closeButton);
        document.body.appendChild(modal);

        requestAnimationFrame(() => modal.classList.add("open"));

        function closePreview() {
            modal.remove();
        }

        closeButton.addEventListener("click", closePreview);
        modal.addEventListener("click", function (event) {
            if (event.target === modal) closePreview();
        });

        const keyHandler = function (event) {
            if (event.key === "Escape") {
                closePreview();
                document.removeEventListener("keydown", keyHandler);
            }
        };
        document.addEventListener("keydown", keyHandler);
    }

    // --------------------------------------------------
    // DISPLAY BOQ PDF
    // --------------------------------------------------

    function normalizeBase64Pdf(base64) {

        if (typeof base64 !== "string") {
            return null;
        }

        const cleaned = base64.trim();

        if (!cleaned) {
            return null;
        }

        if (cleaned.startsWith("data:application/pdf")) {
            return cleaned;
        }

        return `data:application/pdf;base64,${cleaned}`;
    }

    function displayGeneratedBOQ(base64, isRestore) {

        const pdfData = normalizeBase64Pdf(base64);

        if (!pdfData) {
            return;
        }

        let binaryString;

        try {
            binaryString = atob(
                pdfData.split(",", 2)[1]
            );
        } catch (error) {
            console.error(
                "RAPICON: Invalid BOQ PDF data.",
                error
            );
            return;
        }

        const len = binaryString.length;
        const bytes = new Uint8Array(len);

        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob(
            [bytes],
            { type: "application/pdf" }
        );

        // Keep this PDF instance independent. Do not revoke an older
        // preview URL just because a newer PDF was generated.
        const pdfUrl = URL.createObjectURL(blob);
        pdfPreviewUrls.add(pdfUrl);

        currentBqPdfBlob = blob;
        currentBqPdfUrl = pdfUrl;

        // Upload happens the moment the file is freshly generated, not
        // when we're just redisplaying it from a restored session.
        if (!isRestore) {
            autoUploadGeneratedFile(blob, "rapicon-preliminary-boq.pdf", "boq");
        }

        const card = document.createElement("div");
        card.className = "architect-boq-card";

        const title = document.createElement("div");
        title.className = "architect-boq-title";
        title.textContent = "📄 Preliminary BOQ PDF";

        const preview = document.createElement("iframe");
        preview.className = "architect-boq-preview";
        preview.src = pdfUrl;
        preview.title = "Generated BOQ PDF";

        const actions = document.createElement("div");
        actions.className = "architect-actions";

        const viewPreview = document.createElement("button");
        viewPreview.type = "button";
        viewPreview.className =
            "architect-action architect-preview-btn";
        viewPreview.textContent = "View PDF";

        viewPreview.addEventListener("click", function () {
            openPreview("pdf", pdfUrl);
        });

        const download = document.createElement("button");
        download.type = "button";
        download.className = "architect-action download-btn";
        download.textContent = "Download BOQ PDF";

        download.addEventListener("click", function () {

            if (!requireAuth("boq")) {
                return;
            }

            triggerDownload(pdfUrl, "rapicon-preliminary-boq.pdf");
        });

        actions.appendChild(viewPreview);
        actions.appendChild(download);
        card.appendChild(title);
        card.appendChild(preview);
        card.appendChild(actions);
        chat.appendChild(card);
        chat.scrollTop = chat.scrollHeight;
    }

    // --------------------------------------------------
    // DISPLAY IMAGE
    // --------------------------------------------------

    function normalizeBase64Image(base64) {

        if (typeof base64 !== "string") {
            return null;
        }

        const cleaned = base64.trim();

        if (!cleaned) {
            return null;
        }

        if (cleaned.startsWith("data:image/")) {
            return cleaned;
        }

        return `data:image/png;base64,${cleaned}`;
    }

    function displayGeneratedImage(base64, isRestore) {

        const imageData =
            normalizeBase64Image(base64);

        if (!imageData) {
            return;
        }

        let binaryString;

        try {
            binaryString = atob(
                imageData.split(",", 2)[1]
            );
        } catch (error) {
            console.error(
                "RAPICON: Invalid generated image data.",
                error
            );
            return;
        }

        const len = binaryString.length;
        const bytes = new Uint8Array(len);

        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob(
            [bytes],
            { type: "image/png" }
        );

        // Every image card owns its own Blob URL. This prevents a
        // newly generated image from invalidating older visible images.
        const imageUrl = URL.createObjectURL(blob);
        imagePreviewUrls.add(imageUrl);

        // Keep the newest image for the Update workflow/download state.
        currentImageBlob = blob;
        currentImageUrl = imageUrl;

        // Upload happens the moment the file is freshly generated, not
        // when we're just redisplaying it from a restored session.
        if (!isRestore) {
            autoUploadGeneratedFile(blob, "ai-architecture-plan.png", "image");
        }

        const card =
            document.createElement("div");

        card.className =
            "architect-image-card";

        const image =
            document.createElement("img");

        image.src = imageUrl;
        image.alt =
            "Generated architectural floor plan";
        image.loading = "lazy";
        image.title = "Click to preview";

        const actions =
            document.createElement("div");

        actions.className =
            "architect-actions";

        const viewPreview =
            document.createElement("button");

        viewPreview.type = "button";
        viewPreview.className =
            "architect-action architect-preview-btn";
        viewPreview.textContent = "Preview";

        const openThisImagePreview = function () {
            openPreview("image", imageUrl);
        };

        viewPreview.addEventListener(
            "click",
            openThisImagePreview
        );

        image.addEventListener(
            "click",
            openThisImagePreview
        );

        const download =
            document.createElement("button");

        download.type = "button";
        download.className =
            "architect-action download-btn";
        download.textContent = "Download";

        const update =
            document.createElement("button");

        update.type = "button";
        update.className =
            "architect-action update-btn";
        update.textContent = "Update";

        download.addEventListener(
            "click",
            function () {

                if (!requireAuth("image")) {
                    return;
                }

                triggerDownload(imageUrl, "ai-architecture-plan.png");
            }
        );

        update.addEventListener(
            "click",
            function () {

                input.placeholder =
                    UPDATE_PLACEHOLDER;

                input.focus();
            }
        );

        actions.appendChild(viewPreview);
        actions.appendChild(download);
        actions.appendChild(update);

        card.appendChild(image);
        card.appendChild(actions);

        chat.appendChild(card);

        chat.scrollTop =
            chat.scrollHeight;
    }

    // --------------------------------------------------
    // NEW CHAT
    // --------------------------------------------------

    function startNewChat() {

        if (send.disabled) {
            return;
        }

        clearSessionId();

        // New Chat removes the current conversation, so revoke all
        // object URLs created by its image/PDF cards.
        imagePreviewUrls.forEach((url) => {
            URL.revokeObjectURL(url);
        });
        imagePreviewUrls.clear();

        pdfPreviewUrls.forEach((url) => {
            URL.revokeObjectURL(url);
        });
        pdfPreviewUrls.clear();

        currentImageUrl = null;
        currentImageBlob = null;
        currentBqPdfUrl = null;
        currentBqPdfBlob = null;

        clearSelectedFile();

        chat.innerHTML = "";

        input.value = "";
        input.placeholder = DEFAULT_PLACEHOLDER;
        stopStatusAnimation();

        addMessage(
            GREETING_MESSAGE,
            "ai"
        );

        input.focus();
    }

    newChat.addEventListener(
        "click",
        startNewChat
    );

    // --------------------------------------------------
    // SEND BUTTON
    // --------------------------------------------------

    send.addEventListener(
        "click",
        sendMessage
    );

    // --------------------------------------------------
    // ENTER TO SEND
    // --------------------------------------------------

    input.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();
            }
        }
    );

    // --------------------------------------------------
    // RESTORE ON INITIAL LOAD
    // --------------------------------------------------

    restoreSession().then(function () {

        const token = getToken();
        const userId = getStoredUserId();
        const isLoggedIn = Boolean(token && userId);

        // Retry a generated file's upload if it failed earlier (most
        // likely because the user wasn't logged in at generation time).
        const pendingUploadType = takePendingUpload();

        if (pendingUploadType && isLoggedIn) {

            if (pendingUploadType === "image" && currentImageBlob) {
                autoUploadGeneratedFile(
                    currentImageBlob,
                    "ai-architecture-plan.png",
                    "image"
                );
            } else if (pendingUploadType === "boq" && currentBqPdfBlob) {
                autoUploadGeneratedFile(
                    currentBqPdfBlob,
                    "rapicon-preliminary-boq.pdf",
                    "boq"
                );
            } else {
                // The matching blob wasn't restored this time around —
                // keep the flag so it can be retried again later.
                savePendingUpload(pendingUploadType);
            }

        } else if (pendingUploadType) {
            // Still not logged in — keep the flag for next time.
            savePendingUpload(pendingUploadType);
        }

        const pendingType = takePendingDownload();

        if (!pendingType) {
            return;
        }

        // The user may have just returned from the login redirect. If
        // they're logged in now and the file they wanted is loaded
        // (either freshly restored or already in memory), download it
        // immediately without requiring another click.
        if (!requireAuth()) {
            // Still not logged in for some reason — keep the flag so
            // this can be retried the next time they do log in.
            savePendingDownload(pendingType);
            return;
        }

        if (pendingType === "image" && currentImageUrl) {
            triggerDownload(currentImageUrl, "ai-architecture-plan.png");
        } else if (pendingType === "boq" && currentBqPdfUrl) {
            triggerDownload(currentBqPdfUrl, "rapicon-preliminary-boq.pdf");
        }
    });

    // --------------------------------------------------
    // PUBLIC API (for auto-open + external button triggers)
    // --------------------------------------------------

    window.AIArchitectWidget = {
        open: function () { setWidgetOpen(true); },
        close: function () { setWidgetOpen(false); },
        toggle: function () {
            const isOpen = widget.style.display === "flex";
            setWidgetOpen(!isOpen);
        }
    };

})();