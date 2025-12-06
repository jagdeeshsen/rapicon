
// showMessage.js - Universal Message Notification System with Dialogs

/**
 * Display a message notification on the page
 * @param {string} message - The message text to display
 * @param {string} type - Type of message: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in milliseconds (0 = manual close only)
 * @param {Object} options - Additional options
 */
function showMessage(message, type = 'info', duration = 4000, options = {}) {
  // Default options
  const config = {
    position: options.position || 'top-right', // top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
    closable: options.closable !== false, // Show close button
    icon: options.icon !== false, // Show icon
    animation: options.animation || 'slide', // slide, fade, bounce
    ...options
  };

  // Create container if it doesn't exist
  let container = document.getElementById('message-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'message-container';
    container.className = `message-container ${config.position}`;
    document.body.appendChild(container);
    injectStyles();
  }

  // Create message element
  const messageEl = document.createElement('div');
  messageEl.className = `message message-${type} message-${config.animation}`;

  // Icon SVGs
  const icons = {
    success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
    error: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>',
    warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
    info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>'
  };

  // Build message HTML
  messageEl.innerHTML = `
    ${config.icon ? `<span class="message-icon">${icons[type]}</span>` : ''}
    <span class="message-text">${message}</span>
    ${config.closable ? '<button class="message-close" aria-label="Close">&times;</button>' : ''}
  `;

  // Add to container
  container.appendChild(messageEl);

  // Trigger animation
  setTimeout(() => messageEl.classList.add('show'), 10);

  // Close function
  const closeMessage = () => {
    messageEl.classList.remove('show');
    messageEl.classList.add('hiding');
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);
      }
    }, 300);
  };

  // Close button handler
  if (config.closable) {
    const closeBtn = messageEl.querySelector('.message-close');
    closeBtn.addEventListener('click', closeMessage);
  }

  // Auto close
  if (duration > 0) {
    setTimeout(closeMessage, duration);
  }

  // Return close function for manual closing
  return closeMessage;
}

/**
 * Show a confirm dialog
 * @param {string} message - The message to display
 * @param {Object} options - Dialog options
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false if cancelled
 */
showMessage.confirm = function(message, options = {}) {
  return new Promise((resolve) => {
    injectStyles();

    const config = {
      title: options.title || 'Confirm',
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancel',
      confirmClass: options.confirmClass || 'confirm',
      type: options.type || 'warning', // success, error, warning, info
      ...options
    };

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'message-overlay';

    // Create dialog
    const dialog = document.createElement('div');
    dialog.className = 'message-dialog message-dialog-confirm';

    const iconSvgs = {
      success: '<svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
      error: '<svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>',
      warning: '<svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
      info: '<svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>'
    };

    dialog.innerHTML = `
      <div class="message-dialog-icon message-dialog-icon-${config.type}">
        ${iconSvgs[config.type]}
      </div>
      <div class="message-dialog-title">${config.title}</div>
      <div class="message-dialog-content">${message}</div>
      <div class="message-dialog-buttons">
        <button class="message-btn message-btn-cancel">${config.cancelText}</button>
        <button class="message-btn message-btn-${config.confirmClass}">${config.confirmText}</button>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Trigger animation
    setTimeout(() => {
      overlay.classList.add('show');
      dialog.classList.add('show');
    }, 10);

    const close = (result) => {
      overlay.classList.remove('show');
      dialog.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(overlay);
        resolve(result);
      }, 300);
    };

    // Button handlers
    const cancelBtn = dialog.querySelector('.message-btn-cancel');
    const confirmBtn = dialog.querySelector(`.message-btn-${config.confirmClass}`);

    cancelBtn.addEventListener('click', () => close(false));
    confirmBtn.addEventListener('click', () => close(true));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(false);
    });

    // Keyboard support
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', handleKeyPress);
        close(false);
      } else if (e.key === 'Enter') {
        document.removeEventListener('keydown', handleKeyPress);
        close(true);
      }
    };
    document.addEventListener('keydown', handleKeyPress);

    // Focus confirm button
    confirmBtn.focus();
  });
};

/**
 * Show an alert dialog
 * @param {string} message - The message to display
 * @param {Object} options - Dialog options
 * @returns {Promise<void>} - Resolves when user clicks OK
 */
showMessage.alert = function(message, options = {}) {
  return new Promise((resolve) => {
    injectStyles();

    const config = {
      title: options.title || 'Alert',
      confirmText: options.confirmText || 'OK',
      type: options.type || 'info', // success, error, warning, info
      ...options
    };

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'message-overlay';

    // Create dialog
    const dialog = document.createElement('div');
    dialog.className = 'message-dialog message-dialog-alert';

    const iconSvgs = {
      success: '<svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
      error: '<svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>',
      warning: '<svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
      info: '<svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>'
    };

    dialog.innerHTML = `
      <div class="message-dialog-icon message-dialog-icon-${config.type}">
        ${iconSvgs[config.type]}
      </div>
      <div class="message-dialog-title">${config.title}</div>
      <div class="message-dialog-content">${message}</div>
      <div class="message-dialog-buttons">
        <button class="message-btn message-btn-confirm">${config.confirmText}</button>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Trigger animation
    setTimeout(() => {
      overlay.classList.add('show');
      dialog.classList.add('show');
    }, 10);

    const close = () => {
      overlay.classList.remove('show');
      dialog.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(overlay);
        resolve();
      }, 300);
    };

    // Button handler
    const confirmBtn = dialog.querySelector('.message-btn-confirm');
    confirmBtn.addEventListener('click', close);

    // Click overlay to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    // Keyboard support
    const handleKeyPress = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        document.removeEventListener('keydown', handleKeyPress);
        close();
      }
    };
    document.addEventListener('keydown', handleKeyPress);

    // Focus confirm button
    confirmBtn.focus();
  });
};

/**
 * Show a prompt dialog
 * @param {string} message - The message to display
 * @param {Object} options - Dialog options
 * @returns {Promise<string|null>} - Resolves to input value if confirmed, null if cancelled
 */
showMessage.prompt = function(message, options = {}) {
  return new Promise((resolve) => {
    injectStyles();

    const config = {
      title: options.title || 'Input Required',
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancel',
      placeholder: options.placeholder || '',
      defaultValue: options.defaultValue || '',
      inputType: options.inputType || 'text', // text, email, password, number, etc.
      required: options.required !== false,
      ...options
    };

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'message-overlay';

    // Create dialog
    const dialog = document.createElement('div');
    dialog.className = 'message-dialog message-dialog-prompt';

    dialog.innerHTML = `
      <div class="message-dialog-title">${config.title}</div>
      <div class="message-dialog-content">${message}</div>
      <input
        type="${config.inputType}"
        class="message-input"
        placeholder="${config.placeholder}"
        value="${config.defaultValue}"
        ${config.required ? 'required' : ''}
      />
      <div class="message-dialog-buttons">
        <button class="message-btn message-btn-cancel">${config.cancelText}</button>
        <button class="message-btn message-btn-confirm">${config.confirmText}</button>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Trigger animation
    setTimeout(() => {
      overlay.classList.add('show');
      dialog.classList.add('show');
    }, 10);

    const input = dialog.querySelector('.message-input');
    const cancelBtn = dialog.querySelector('.message-btn-cancel');
    const confirmBtn = dialog.querySelector('.message-btn-confirm');

    const close = (result) => {
      overlay.classList.remove('show');
      dialog.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(overlay);
        resolve(result);
      }, 300);
    };

    const handleConfirm = () => {
      const value = input.value.trim();
      if (config.required && !value) {
        input.classList.add('error');
        input.focus();
        return;
      }
      close(value);
    };

    // Button handlers
    cancelBtn.addEventListener('click', () => close(null));
    confirmBtn.addEventListener('click', handleConfirm);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(null);
    });

    // Input handlers
    input.addEventListener('input', () => {
      input.classList.remove('error');
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleConfirm();
      }
    });

    // Keyboard support
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', handleKeyPress);
        close(null);
      }
    };
    document.addEventListener('keydown', handleKeyPress);

    // Focus input
    setTimeout(() => input.focus(), 100);
  });
};

// Inject CSS styles
function injectStyles() {
  if (document.getElementById('message-styles')) return;

  const style = document.createElement('style');
  style.id = 'message-styles';
  style.textContent = `
    .message-container {
      position: fixed;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
      pointer-events: none;
    }

    .message-container.top-right {
      top: 20px;
      right: 20px;
    }

    .message-container.top-left {
      top: 20px;
      left: 20px;
    }

    .message-container.bottom-right {
      bottom: 20px;
      right: 20px;
    }

    .message-container.bottom-left {
      bottom: 20px;
      left: 20px;
    }

    .message-container.top-center {
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
    }

    .message-container.bottom-center {
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
    }

    .message {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      pointer-events: auto;
      min-width: 280px;
      opacity: 0;
      transition: all 0.3s ease;
    }

    .message-slide {
      transform: translateX(100%);
    }

    .message-fade {
      transform: scale(0.9);
    }

    .message-bounce {
      transform: scale(0.5);
    }

    .message.show {
      opacity: 1;
      transform: translateX(0) scale(1);
    }

    .message.hiding {
      opacity: 0;
      transform: translateX(100%) scale(0.8);
    }

    .message-success {
      background: #10b981;
      color: white;
    }

    .message-error {
      background: #ef4444;
      color: white;
    }

    .message-warning {
      background: #f59e0b;
      color: white;
    }

    .message-info {
      background: #3b82f6;
      color: white;
    }

    .message-icon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }

    .message-text {
      flex: 1;
      word-break: break-word;
    }

    .message-close {
      flex-shrink: 0;
      background: transparent;
      border: none;
      color: white;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 0.2s;
      opacity: 0.8;
    }

    .message-close:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.2);
    }

    /* Dialog Styles */
    .message-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s ease;
      padding: 20px;
    }

    .message-overlay.show {
      opacity: 1;
    }

    .message-dialog {
      background: white;
      border-radius: 12px;
      padding: 24px;
      max-width: 450px;
      width: 100%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      opacity: 0;
      transform: scale(0.9);
      transition: all 0.3s ease;
    }

    .message-dialog.show {
      opacity: 1;
      transform: scale(1);
    }

    .message-dialog-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }

    .message-dialog-icon-success {
      background: #d1fae5;
      color: #10b981;
    }

    .message-dialog-icon-error {
      background: #fee2e2;
      color: #ef4444;
    }

    .message-dialog-icon-warning {
      background: #fef3c7;
      color: #f59e0b;
    }

    .message-dialog-icon-info {
      background: #dbeafe;
      color: #3b82f6;
    }

    .message-dialog-title {
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 12px;
      text-align: center;
    }

    .message-dialog-content {
      font-size: 14px;
      color: #6b7280;
      line-height: 1.6;
      margin-bottom: 20px;
      text-align: center;
    }

    .message-input {
      width: 100%;
      padding: 10px 14px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      margin-bottom: 20px;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }

    .message-input:focus {
      outline: none;
      border-color: #3b82f6;
    }

    .message-input.error {
      border-color: #ef4444;
      animation: shake 0.3s;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
    }

    .message-dialog-buttons {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .message-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }

    .message-btn-cancel {
      background: #f3f4f6;
      color: #6b7280;
    }

    .message-btn-cancel:hover {
      background: #e5e7eb;
    }

    .message-btn-confirm {
      background: #3b82f6;
      color: white;
    }

    .message-btn-confirm:hover {
      background: #2563eb;
    }

    .message-btn-danger {
      background: #ef4444;
      color: white;
    }

    .message-btn-danger:hover {
      background: #dc2626;
    }

    .message-btn-success {
      background: #10b981;
      color: white;
    }

    .message-btn-success:hover {
      background: #059669;
    }

    @media (max-width: 480px) {
      .message-container {
        left: 10px !important;
        right: 10px !important;
        max-width: none;
        transform: none !important;
      }

      .message {
        min-width: auto;
      }

      .message-dialog {
        padding: 20px;
        max-width: 100%;
      }

      .message-dialog-buttons {
        flex-direction: column-reverse;
      }

      .message-btn {
        width: 100%;
      }
    }
  `;

  document.head.appendChild(style);
}

// Convenience methods
showMessage.success = (msg, duration, options) => showMessage(msg, 'success', duration, options);
showMessage.error = (msg, duration, options) => showMessage(msg, 'error', duration, options);
showMessage.warning = (msg, duration, options) => showMessage(msg, 'warning', duration, options);
showMessage.info = (msg, duration, options) => showMessage(msg, 'info', duration, options);

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = showMessage;
}

// Make globally available
if (typeof window !== 'undefined') {
  window.showMessage = showMessage;
}

/*
USAGE EXAMPLES:

// ========== ALERT DIALOG ==========
// Basic alert
await showMessage.alert('Welcome to our website!');

// Success alert
await showMessage.alert('Your profile has been updated successfully!', {
  title: 'Success',
  type: 'success'
});

// Error alert
await showMessage.alert('An error occurred while processing your request.', {
  title: 'Error',
  type: 'error'
});

// Warning alert
await showMessage.alert('Your session will expire in 5 minutes.', {
  title: 'Warning',
  type: 'warning'
});

// Custom button text
await showMessage.alert('Please read the terms and conditions.', {
  title: 'Important',
  confirmText: 'I Understand',
  type: 'info'
});

// Alert then do something
showMessage.alert('Data saved successfully!', { type: 'success' })
  .then(() => {
    console.log('User clicked OK');
    window.location.href = '/dashboard';
  });

// ========== NOTIFICATIONS ==========
// Basic usage
showMessage('Operation completed successfully!', 'success');
showMessage('An error occurred', 'error');

// Using convenience methods
showMessage.success('Profile updated!');
showMessage.error('Failed to save changes');

// ========== CONFIRM DIALOG ==========
// Basic confirm
showMessage.confirm('Are you sure you want to delete this item?')
  .then(result => {
    if (result) {
      console.log('User confirmed');
      showMessage.success('Item deleted!');
    } else {
      console.log('User cancelled');
    }
  });

// Async/await style
async function deleteItem() {
  const confirmed = await showMessage.confirm(
    'This action cannot be undone. Continue?',
    {
      title: 'Delete Item',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'error',
      confirmClass: 'danger'
    }
  );

  if (confirmed) {
    // Delete the item
    showMessage.success('Item deleted successfully');
  }
}

// Different confirm types
await showMessage.confirm('Save changes?', {
  title: 'Unsaved Changes',
  confirmText: 'Save',
  type: 'warning'
});

await showMessage.confirm('Ready to proceed?', {
  title: 'Confirm Action',
  confirmText: 'Yes, proceed',
  cancelText: 'Not yet',
  type: 'info'
});

// ========== PROMPT DIALOG ==========
// Basic prompt
showMessage.prompt('Please enter your name:')
  .then(name => {
    if (name) {
      showMessage.success(`Hello, ${name}!`);
    } else {
      console.log('User cancelled');
    }
  });

// Async/await style with validation
async function getUserEmail() {
  const email = await showMessage.prompt(
    'Enter your email address:',
    {
      title: 'Email Required',
      placeholder: 'your@email.com',
      inputType: 'email',
      required: true,
      confirmText: 'Submit'
    }
  );

  if (email) {
    console.log('Email:', email);
    showMessage.success('Email saved!');
  }
}

// Prompt with default value
const username = await showMessage.prompt(
  'Update your username:',
  {
    defaultValue: 'CurrentUser123',
    placeholder: 'Enter new username'
  }
);

// Number input
const age = await showMessage.prompt(
  'How old are you?',
  {
    title: 'Age Verification',
    inputType: 'number',
    placeholder: '18'
  }
);

// Password input
const password = await showMessage.prompt(
  'Enter your password:',
  {
    title: 'Authentication',
    inputType: 'password',
    placeholder: 'Password'
  }
);

// ========== REAL-WORLD EXAMPLES ==========

// Show alert after form submission
document.getElementById('contactForm').onsubmit = async function(e) {
  e.preventDefault();

  // Submit form logic here...

  await showMessage.alert('Thank you! Your message has been sent.', {
    title: 'Message Sent',
    type: 'success'
  });

  // Redirect after user clicks OK
  window.location.href = '/';
};

// Error handling with alert
try {
  const response = await fetch('/api/data');
  if (!response.ok) throw new Error('Failed to load');
} catch (error) {
  await showMessage.alert('Could not connect to server. Please try again later.', {
    title: 'Connection Error',
    type: 'error'
  });
}

// Show terms before proceeding
async function showTerms() {
  await showMessage.alert(
    'By continuing, you agree to our Terms of Service and Privacy Policy.',
    {
      title: 'Terms & Conditions',
      confirmText: 'I Agree',
      type: 'info'
    }
  );
  // Continue with registration...
}

// Delete confirmation

document.getElementById('deleteBtn').onclick = async () => {
  const confirmed = await showMessage.confirm(
    'Are you sure you want to delete this item? This cannot be undone.',
    {
      title: 'Confirm Deletion',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'error',
      confirmClass: 'danger'
    }
  );

  if (confirmed) {
    // Perform delete
    showMessage.success('Item deleted successfully');
  }
};

// Form submission with confirmation
document.getElementById('submitForm').onclick = async () => {
  const notes = await showMessage.prompt(
    'Add any additional notes (optional):',
    {
      title: 'Submit Form',
      placeholder: 'Enter notes...',
      required: false
    }
  );

  // User didn't cancel (notes can be empty string)
  if (notes !== null) {
    // Submit form with notes
    showMessage.success('Form submitted successfully!');
  }
};

// Logout confirmation
async function logout() {
  const confirmed = await showMessage.confirm(
    'Are you sure you want to log out?',
    {
      title: 'Logout',
      confirmText: 'Logout',
      type: 'warning'
    }
  );

  if (confirmed) {
    // Perform logout
    window.location.href = '/logout';
  }
}
*/