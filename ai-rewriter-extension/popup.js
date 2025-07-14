// popup.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('Popup DOM loaded');

    // Test if chrome API is available
    if (typeof chrome === 'undefined' || !chrome.storage) {
        console.error('Chrome storage API not available');
        showStatus('Chrome storage API not available. Please reload the extension.', 'error');
        return;
    }

    const aiProviderSelect = document.getElementById('aiProviderSelect');
    const geminiApiKeyInput = document.getElementById('geminiApiKeyInput');
    const chatgptApiKeyInput = document.getElementById('chatgptApiKeyInput');
    const geminiApiKeyGroup = document.getElementById('geminiApiKeyGroup');
    const chatgptApiKeyGroup = document.getElementById('chatgptApiKeyGroup');
    const aiDirectionInput = document.getElementById('aiDirectionInput');
    const saveSettingsButton = document.getElementById('saveSettings');
    const statusMessage = document.getElementById('statusMessage');

    if (!aiProviderSelect || !geminiApiKeyInput || !chatgptApiKeyInput || !aiDirectionInput || !saveSettingsButton || !statusMessage) {
        console.error('Required elements not found:', { aiProviderSelect, geminiApiKeyInput, chatgptApiKeyInput, aiDirectionInput, saveSettingsButton, statusMessage });
        return;
    }

    // Load settings from storage
    chrome.storage.sync.get(['aiProvider', 'geminiApiKey', 'chatgptApiKey', 'aiDirection'], (data) => {
        console.log('Storage data:', data);
        if (chrome.runtime.lastError) {
            console.error('Storage error:', chrome.runtime.lastError);
            showStatus('Error loading settings: ' + chrome.runtime.lastError.message, 'error');
            return;
        }

        // Set AI provider
        if (data.aiProvider) {
            aiProviderSelect.value = data.aiProvider;
            toggleApiKeyInputs(data.aiProvider);
        }

        // Set API keys
        if (data.geminiApiKey) {
            geminiApiKeyInput.value = data.geminiApiKey;
        }
        if (data.chatgptApiKey) {
            chatgptApiKeyInput.value = data.chatgptApiKey;
        }

        if (data.aiDirection) {
            aiDirectionInput.value = data.aiDirection;
        }

        const currentProvider = aiProviderSelect.value;
        const hasApiKey = currentProvider === 'gemini' ? data.geminiApiKey : data.chatgptApiKey;

        if (hasApiKey) {
            showStatus('Settings loaded successfully', 'success');
        } else {
            showStatus(`No API key found. Please enter your ${currentProvider === 'gemini' ? 'Gemini' : 'ChatGPT'} API key.`, 'info');
        }
    });

    // Handle provider selection change
    aiProviderSelect.addEventListener('change', () => {
        const selectedProvider = aiProviderSelect.value;
        toggleApiKeyInputs(selectedProvider);

        // Check if the selected provider has an API key
        const apiKey = selectedProvider === 'gemini' ? geminiApiKeyInput.value : chatgptApiKeyInput.value;
        if (apiKey) {
            showStatus(`${selectedProvider === 'gemini' ? 'Gemini' : 'ChatGPT'} API key found.`, 'success');
        } else {
            showStatus(`Please enter your ${selectedProvider === 'gemini' ? 'Gemini' : 'ChatGPT'} API key.`, 'info');
        }
    });

    // Function to toggle API key input visibility
    function toggleApiKeyInputs(provider) {
        if (provider === 'gemini') {
            geminiApiKeyGroup.style.display = 'block';
            chatgptApiKeyGroup.style.display = 'none';
        } else {
            geminiApiKeyGroup.style.display = 'none';
            chatgptApiKeyGroup.style.display = 'block';
        }
    }

    // Save settings to storage
    saveSettingsButton.addEventListener('click', () => {
        const selectedProvider = aiProviderSelect.value;
        const geminiApiKey = geminiApiKeyInput.value.trim();
        const chatgptApiKey = chatgptApiKeyInput.value.trim();
        const aiDirection = aiDirectionInput.value.trim();

        // Check if the selected provider has an API key
        const requiredApiKey = selectedProvider === 'gemini' ? geminiApiKey : chatgptApiKey;
        if (!requiredApiKey) {
            showStatus(`Please enter your ${selectedProvider === 'gemini' ? 'Gemini' : 'ChatGPT'} API Key.`, 'error');
            return;
        }

        const settings = {
            'aiProvider': selectedProvider
        };

        // Save both API keys (user might switch between providers)
        if (geminiApiKey) {
            settings['geminiApiKey'] = geminiApiKey;
        }
        if (chatgptApiKey) {
            settings['chatgptApiKey'] = chatgptApiKey;
        }

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

    // Add keyboard support for inputs
    geminiApiKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveSettingsButton.click();
        }
    });

    chatgptApiKeyInput.addEventListener('keypress', (e) => {
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