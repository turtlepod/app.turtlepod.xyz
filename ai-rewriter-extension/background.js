// This is the service worker for the extension.
// It handles API calls and communication between popup and content scripts.

// Create a context menu item
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "rewriteWithAI",
        title: "Rewrite with AI",
        contexts: ["selection", "editable"] // Show for selected text and editable elements
    });
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.log('Context menu clicked:', info.menuItemId);
    console.log('Tab info:', { id: tab.id, url: tab.url });

    if (info.menuItemId === "rewriteWithAI") {
        console.log('Sending rewriteText message to content script...');

        // Send a message to the content script to get the text
        chrome.tabs.sendMessage(tab.id, { action: 'rewriteText' }, (response) => {
            console.log('Response from content script:', response);
            console.log('Chrome runtime error:', chrome.runtime.lastError);

            if (chrome.runtime.lastError) {
                console.error('Error sending message to content script:', chrome.runtime.lastError);
                return;
            }

            if (response && response.success && response.text) {
                console.log('Text received, calling rewriteTextWithAI with:', response.text.substring(0, 50) + '...');
                rewriteTextWithAI(response.text, tab.id);
            } else if (response && response.message) {
                console.error('Error from content script:', response.message);
                // Send an error message to the content script to display to the user
                chrome.tabs.sendMessage(tab.id, {
                    action: 'displayMessage',
                    message: response.message
                });
            } else {
                console.error('No text to rewrite or content script failed to respond.');
                chrome.tabs.sendMessage(tab.id, {
                    action: 'displayMessage',
                    message: 'Could not get text to rewrite. Please select text or focus on a text input.'
                });
            }
        });
    }
});

async function rewriteTextWithAI(text, tabId) {
    console.log('rewriteTextWithAI called with text length:', text.length);
    console.log('Tab ID:', tabId);

    chrome.storage.sync.get(['geminiApiKey', 'aiDirection'], async (data) => {
        console.log('Storage data retrieved:', { hasApiKey: !!data.geminiApiKey, hasDirection: !!data.aiDirection });

        const apiKey = data.geminiApiKey;
        const aiDirection = data.aiDirection;

        if (!apiKey) {
            console.error('Gemini API Key not found. Please set it in the extension popup.');
            // Send a message to the content script to notify the user
            chrome.tabs.sendMessage(tabId, {
                action: 'displayMessage',
                message: 'Gemini API Key not found. Please set it in the extension popup.'
            });
            return;
        }

        // Build the prompt based on whether AI direction is provided
        let prompt;
        if (aiDirection && aiDirection.trim()) {
            prompt = `Rewrite the following text according to these instructions: "${aiDirection.trim()}"\n\nText to rewrite:\n"${text}"`;
        } else {
            prompt = `Rewrite the following text to make it more clear, concise, and engaging:\n\n"${text}"`;
        }

        console.log('Using prompt:', prompt);

        try {
            let chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });
            const payload = { contents: chatHistory };
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API error: ${response.status} - ${errorData.error.message || response.statusText}`);
            }

            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const rewrittenText = result.candidates[0].content.parts[0].text;
                console.log('API response successful, sending rewritten text to content script');
                console.log('Rewritten text length:', rewrittenText.length);

                // Send the rewritten text back to the content script to display in modal
                chrome.tabs.sendMessage(tabId, {
                    action: 'displayRewrittenText',
                    originalText: text,
                    rewrittenText: rewrittenText
                }, (response) => {
                    console.log('Response from displayRewrittenText:', response);
                    if (chrome.runtime.lastError) {
                        console.error('Error sending displayRewrittenText:', chrome.runtime.lastError);
                    }
                });
            } else {
                console.error('Unexpected API response structure:', result);
                chrome.tabs.sendMessage(tabId, {
                    action: 'displayMessage',
                    message: 'Failed to rewrite text: Unexpected API response.'
                });
            }
        } catch (error) {
            console.error('Error rewriting text with AI:', error);
            chrome.tabs.sendMessage(tabId, {
                action: 'displayMessage',
                message: `Error rewriting text: ${error.message}`
            });
        }
    });
}