// This script runs on every page to interact with the DOM.
console.log('AI Rewriter content script loaded on:', window.location.href);

// Function to get selected text
function getSelectedText() {
    return window.getSelection().toString();
}

// Function to get text from active textarea/input
function getActiveTextareaContent() {
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'TEXTAREA' || (activeElement.tagName === 'INPUT' && activeElement.type === 'text'))) {
        return activeElement.value;
    }
    return null;
}

// Global variables to store the active element and original text
let currentActiveElement = null;
let currentOriginalText = '';

// Function to replace selected text or textarea content
function replaceText(newText) {
    if (currentActiveElement && (currentActiveElement.tagName === 'TEXTAREA' || (currentActiveElement.tagName === 'INPUT' && currentActiveElement.type === 'text'))) {
        // If an input/textarea was active, replace its content
        currentActiveElement.value = newText;
    } else {
        // Otherwise, try to replace selected text
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            // Check if the range still contains the original text to avoid unintended replacements
            if (range.toString() === currentOriginalText) {
                range.deleteContents();
                range.insertNode(document.createTextNode(newText));
            } else {
                // If selection changed, try to find and replace the original text
                const bodyText = document.body.innerText;
                const index = bodyText.indexOf(currentOriginalText);
                if (index !== -1) {
                    const newRange = document.createRange();
                    newRange.setStart(document.body, 0);
                    newRange.setEnd(document.body, 0); // Reset to start
                    // Find the text node containing the original text
                    let node = document.body;
                    let found = false;
                    const walk = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
                    while(node = walk.nextNode()) {
                        const nodeIndex = node.textContent.indexOf(currentOriginalText);
                        if (nodeIndex !== -1) {
                            newRange.setStart(node, nodeIndex);
                            newRange.setEnd(node, nodeIndex + currentOriginalText.length);
                            found = true;
                            break;
                        }
                    }
                    if (found) {
                        newRange.deleteContents();
                        newRange.insertNode(document.createTextNode(newText));
                    }
                }
            }
        }
    }
}

// --- Modal UI and Logic ---
function createModal() {
    console.log('createModal called');
    // Check if modal already exists
    if (document.getElementById('ai-rewriter-modal-overlay')) {
        console.log('Modal already exists, returning');
        return;
    }

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'ai-rewriter-modal-overlay';

    // Set inline styles to ensure visibility
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.75);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const modalContent = document.createElement('div');

    // Set inline styles for modal content
    modalContent.style.cssText = `
        background-color: white;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    `;

    modalContent.innerHTML = `
        <h2 style="font-size: 24px; font-weight: 600; margin-bottom: 16px; color: #1e293b;">Review Rewritten Text</h2>
        <div style="margin-bottom: 16px; flex-grow: 1; overflow-y: auto;">
            <p style="font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">Original Text:</p>
            <div id="originalTextDisplay" style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; color: #1e293b; font-size: 14px; margin-bottom: 12px; border: 1px solid #d1d5db; white-space: pre-wrap;"></div>
            <p style="font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">Rewritten Text: <span id="copy-notice" style="color: #059669; font-size: 12px; font-weight: normal; margin-left: 8px; opacity: 0;"></span></p>
            <textarea id="rewrittenTextDisplay" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; color: #1e293b; font-size: 14px; resize: vertical; min-height: 100px; box-sizing: border-box;"></textarea>
        </div>
        <div id="modal-message" style="color: #dc2626; font-size: 14px; margin-bottom: 8px;"></div>
        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px;">
            <button id="copyRewrite" style="padding: 8px 16px; background-color: #3b82f6; color: white; border-radius: 6px; border: none; cursor: pointer; font-size: 14px;">Copy</button>
            <button id="closeRewrite" style="padding: 8px 16px; background-color: #e5e7eb; color: #374151; border-radius: 6px; border: none; cursor: pointer; font-size: 14px;">Close</button>
        </div>
    `;

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    console.log('Modal created and appended to body');
    console.log('Modal in DOM:', document.body.contains(modalOverlay));
    console.log('Modal overlay dimensions:', modalOverlay.offsetWidth, 'x', modalOverlay.offsetHeight);
    console.log('Modal content dimensions:', modalContent.offsetWidth, 'x', modalContent.offsetHeight);

    // Add event listeners
    const copyButton = document.getElementById('copyRewrite');
    const closeButton = document.getElementById('closeRewrite');

    copyButton.addEventListener('click', () => {
        console.log('Copy button clicked');
        const rewrittenText = document.getElementById('rewrittenTextDisplay').value;
        navigator.clipboard.writeText(rewrittenText).then(() => {
            console.log('Text copied to clipboard');
            // Show a brief success message next to the label
            const copyNotice = document.getElementById('copy-notice');
            if (copyNotice) {
                copyNotice.textContent = '[text copied]';
                copyNotice.style.opacity = '1';
                setTimeout(() => {
                    copyNotice.style.opacity = '0';
                }, 2000);
            }
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            const copyNotice = document.getElementById('copy-notice');
            if (copyNotice) {
                copyNotice.textContent = '[copy failed]';
                copyNotice.style.color = '#dc2626';
                copyNotice.style.opacity = '1';
                setTimeout(() => {
                    copyNotice.style.opacity = '0';
                }, 2000);
            }
        });
    });

    closeButton.addEventListener('click', () => {
        console.log('Close button clicked');
        hideModal();
    });

    // Add hover effects
    copyButton.addEventListener('mouseenter', () => {
        copyButton.style.backgroundColor = '#2563eb';
    });
    copyButton.addEventListener('mouseleave', () => {
        copyButton.style.backgroundColor = '#3b82f6';
    });

    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.backgroundColor = '#d1d5db';
    });
    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.backgroundColor = '#e5e7eb';
    });

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.style.display === 'flex') {
            hideModal();
        }
    });
}

function showModal(originalText, rewrittenText) {
    console.log('showModal called with:', { originalTextLength: originalText.length, rewrittenTextLength: rewrittenText.length });
    createModal(); // Ensure modal exists
    const modalOverlay = document.getElementById('ai-rewriter-modal-overlay');
    console.log('Modal overlay found:', !!modalOverlay);

    if (!modalOverlay) {
        console.error('Modal overlay not found!');
        return;
    }

    const originalTextDisplay = document.getElementById('originalTextDisplay');
    const rewrittenTextDisplay = document.getElementById('rewrittenTextDisplay');
    const modalMessage = document.getElementById('modal-message');

    console.log('Modal elements found:', { originalTextDisplay: !!originalTextDisplay, rewrittenTextDisplay: !!rewrittenTextDisplay, modalMessage: !!modalMessage });

    if (originalTextDisplay) originalTextDisplay.textContent = originalText;
    if (rewrittenTextDisplay) rewrittenTextDisplay.value = rewrittenText;
    if (modalMessage) modalMessage.textContent = ''; // Clear previous messages

    modalOverlay.style.display = 'flex'; // Show the modal
    console.log('Modal display style set to flex');
    console.log('Modal overlay computed style:', window.getComputedStyle(modalOverlay).display);
    console.log('Modal overlay visibility:', window.getComputedStyle(modalOverlay).visibility);
    console.log('Modal overlay opacity:', window.getComputedStyle(modalOverlay).opacity);
    console.log('Modal overlay z-index:', window.getComputedStyle(modalOverlay).zIndex);
    console.log('Modal should now be visible');
}

function hideModal() {
    const modalOverlay = document.getElementById('ai-rewriter-modal-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none'; // Hide the modal
    }
}

function displayMessageInModal(message) {
    console.log('displayMessageInModal called with:', message);
    createModal(); // Ensure modal exists
    const modalOverlay = document.getElementById('ai-rewriter-modal-overlay');
    console.log('Modal overlay found for message:', !!modalOverlay);

    if (!modalOverlay) {
        console.error('Modal overlay not found for message display!');
        return;
    }

    const originalTextDisplay = document.getElementById('originalTextDisplay');
    const rewrittenTextDisplay = document.getElementById('rewrittenTextDisplay');
    const modalMessage = document.getElementById('modal-message');

    if (originalTextDisplay) originalTextDisplay.textContent = ''; // Clear content
    if (rewrittenTextDisplay) rewrittenTextDisplay.value = ''; // Clear content
    if (modalMessage) modalMessage.textContent = message;

    modalOverlay.style.display = 'flex'; // Show the modal with message
    console.log('Message modal should now be visible');
}


// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Content script received message:', request);
    console.log('Sender:', sender);

    if (request.action === 'rewriteText') {
        console.log('Processing rewriteText action');
        const selected = getSelectedText();
        const activeTextarea = getActiveTextareaContent();
        let textToRewrite = '';

        console.log('Selected text:', selected ? selected.substring(0, 50) + '...' : 'none');
        console.log('Active textarea content:', activeTextarea ? activeTextarea.substring(0, 50) + '...' : 'none');

        if (selected) {
            textToRewrite = selected;
            currentActiveElement = null; // No specific active element for selection
            console.log('Using selected text');
        } else if (activeTextarea !== null) {
            textToRewrite = activeTextarea;
            currentActiveElement = document.activeElement; // Store the active element
            console.log('Using active textarea content');
        }

        currentOriginalText = textToRewrite; // Store the original text
        console.log('Text to rewrite length:', textToRewrite.length);

        if (textToRewrite) {
            console.log('Sending success response with text');
            // Send the text back to the background script for rewriting
            sendResponse({ success: true, text: textToRewrite });
        } else {
            console.log('Sending error response - no text found');
            sendResponse({ success: false, message: 'No text selected or no active textarea/input found.' });
        }
    } else if (request.action === 'displayRewrittenText') {
        console.log('Processing displayRewrittenText action');
        console.log('Original text length:', request.originalText.length);
        console.log('Rewritten text length:', request.rewrittenText.length);

        // Display the rewritten text in the modal
        showModal(request.originalText, request.rewrittenText);
        sendResponse({ success: true });
    } else if (request.action === 'displayMessage') {
        console.log('Processing displayMessage action:', request.message);
        // Display error/status messages in the modal
        displayMessageInModal(request.message);
        sendResponse({ success: true });
    }
    // Return true to indicate that sendResponse will be called asynchronously
    return true;
});