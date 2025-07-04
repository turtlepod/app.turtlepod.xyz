// popup.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('Popup DOM loaded');

    // Test if chrome API is available
    if (typeof chrome === 'undefined' || !chrome.storage) {
        console.error('Chrome storage API not available');
        showStatus('Chrome storage API not available. Please reload the extension.', 'error');
        return;
    }

    const apiKeyInput = document.getElementById('apiKeyInput');
    const aiDirectionInput = document.getElementById('aiDirectionInput');
    const saveSettingsButton = document.getElementById('saveSettings');
    const statusMessage = document.getElementById('statusMessage');

    if (!apiKeyInput || !aiDirectionInput || !saveSettingsButton || !statusMessage) {
        console.error('Required elements not found:', { apiKeyInput, aiDirectionInput, saveSettingsButton, statusMessage });
        return;
    }

    // Load settings from storage
    chrome.storage.sync.get(['geminiApiKey', 'aiDirection'], (data) => {
        console.log('Storage data:', data);
        if (chrome.runtime.lastError) {
            console.error('Storage error:', chrome.runtime.lastError);
            showStatus('Error loading settings: ' + chrome.runtime.lastError.message, 'error');
            return;
        }

        if (data.geminiApiKey) {
            apiKeyInput.value = data.geminiApiKey;
        }

        if (data.aiDirection) {
            aiDirectionInput.value = data.aiDirection;
        }

        if (data.geminiApiKey) {
            showStatus('Settings loaded successfully', 'success');
        } else {
            showStatus('No API key found. Please enter your Gemini API key.', 'info');
        }
    });

    // Save settings to storage
    saveSettingsButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        const aiDirection = aiDirectionInput.value.trim();

        if (!apiKey) {
            showStatus('Please enter an API Key.', 'error');
            return;
        }

        const settings = {
            'geminiApiKey': apiKey
        };

        // Only save AI direction if it's not empty
        if (aiDirection) {
            settings['aiDirection'] = aiDirection;
        }

        chrome.storage.sync.set(settings, () => {
            if (chrome.runtime.lastError) {
                console.error('Storage error:', chrome.runtime.lastError);
                showStatus('Error saving settings: ' + chrome.runtime.lastError.message, 'error');
                return;
            }

            showStatus('Settings saved successfully!', 'success');
        });
    });

    // Helper function to show status messages
    function showStatus(message, type = 'info') {
        statusMessage.textContent = message;
        statusMessage.className = 'status-message';

        switch (type) {
            case 'success':
                statusMessage.classList.add('status-success');
                break;
            case 'error':
                statusMessage.classList.add('status-error');
                break;
            default:
                statusMessage.classList.add('status-info');
        }
    }

    // Add keyboard support for both inputs
    apiKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveSettingsButton.click();
        }
    });

    aiDirectionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            saveSettingsButton.click();
        }
    });

    // Test function to verify popup is working
    console.log('Popup initialization complete');
    showStatus('Popup loaded successfully. Ready to configure settings.', 'info');
});