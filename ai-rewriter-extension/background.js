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

    chrome.storage.sync.get(['aiProvider', 'geminiApiKey', 'chatgptApiKey', 'aiDirection', 'openaiModel', 'openaiTemperature', 'openaiMaxTokens'], async (data) => {
        console.log('Storage data retrieved:', {
            provider: data.aiProvider,
            hasGeminiKey: !!data.geminiApiKey,
            hasChatGptKey: !!data.chatgptApiKey,
            hasDirection: !!data.aiDirection,
            openaiModel: data.openaiModel,
            openaiTemperature: data.openaiTemperature,
            openaiMaxTokens: data.openaiMaxTokens
        });

        const aiProvider = data.aiProvider || 'gemini';
        const geminiApiKey = data.geminiApiKey;
        const chatgptApiKey = data.chatgptApiKey;
        const aiDirection = data.aiDirection;

        // OpenAI specific settings with defaults
        const openaiModel = data.openaiModel || 'gpt-4o-mini';
        const openaiTemperature = data.openaiTemperature || 0.7;
        const openaiMaxTokens = data.openaiMaxTokens || 1000;

        // Get the appropriate API key for the selected provider
        const apiKey = aiProvider === 'gemini' ? geminiApiKey : chatgptApiKey;
        const providerName = aiProvider === 'gemini' ? 'Gemini' : 'ChatGPT';

        if (!apiKey) {
            console.error(`${providerName} API Key not found. Please set it in the extension popup.`);
            // Send a message to the content script to notify the user
            chrome.tabs.sendMessage(tabId, {
                action: 'displayMessage',
                message: `${providerName} API Key not found. Please set it in the extension popup.`
            });
            return;
        }

        // Build the prompt based on whether AI direction is provided
        let prompt;
        if (aiDirection && aiDirection.trim()) {
            prompt = `Rewrite the following text according to these instructions: "${aiDirection.trim()}"\n\nText to rewrite:\n"${text}"\n\nOnly respond with the results text. Do not use quotes around the rewritten text.`;
        } else {
            prompt = `Rewrite the following text to make it more clear, concise, and engaging:\n\n"${text}"\n\nOnly respond with the results text. Do not use quotes around the rewritten text.`;
        }

        console.log('Using prompt:', prompt);

        try {
            let rewrittenText;

            if (aiProvider === 'gemini') {
                // Use Gemini API
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
                    throw new Error(`Gemini API error: ${response.status} - ${errorData.error.message || response.statusText}`);
                }

                const result = await response.json();

                if (result.candidates && result.candidates.length > 0 &&
                    result.candidates[0].content && result.candidates[0].content.parts &&
                    result.candidates[0].content.parts.length > 0) {
                    rewrittenText = result.candidates[0].content.parts[0].text;
                } else {
                    throw new Error('Unexpected Gemini API response structure');
                }
            } else {
                // Use OpenAI API with latest models and enhanced configuration
                const payload = {
                    model: openaiModel,
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    max_tokens: openaiMaxTokens,
                    temperature: openaiTemperature,
                    // Add modern API features
                    response_format: { type: "text" },
                    // Enable function calling for future enhancements
                    tools: null,
                    tool_choice: null
                };

                console.log('OpenAI API payload:', payload);

                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                        'OpenAI-Beta': 'assistants=v2' // Enable latest features
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    let errorMessage = `OpenAI API error: ${response.status}`;

                    if (errorData.error) {
                        if (errorData.error.message) {
                            errorMessage += ` - ${errorData.error.message}`;
                        }
                        if (errorData.error.type) {
                            errorMessage += ` (${errorData.error.type})`;
                        }
                        if (errorData.error.code) {
                            errorMessage += ` [Code: ${errorData.error.code}]`;
                        }
                    } else {
                        errorMessage += ` - ${response.statusText}`;
                    }

                    throw new Error(errorMessage);
                }

                const result = await response.json();

                if (result.choices && result.choices.length > 0 &&
                    result.choices[0].message && result.choices[0].message.content) {
                    rewrittenText = result.choices[0].message.content;

                    // Log usage information if available
                    if (result.usage) {
                        console.log('OpenAI API usage:', {
                            prompt_tokens: result.usage.prompt_tokens,
                            completion_tokens: result.usage.completion_tokens,
                            total_tokens: result.usage.total_tokens,
                            model: result.model
                        });
                    }
                } else {
                    throw new Error('Unexpected OpenAI API response structure');
                }
            }

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
        } catch (error) {
            console.error('Error rewriting text with AI:', error);

            // Provide more helpful error messages
            let userMessage = `Error rewriting text: ${error.message}`;

            if (error.message.includes('401')) {
                userMessage = 'Invalid API key. Please check your OpenAI API key in the extension settings.';
            } else if (error.message.includes('429')) {
                userMessage = 'Rate limit exceeded. Please wait a moment and try again.';
            } else if (error.message.includes('500')) {
                userMessage = 'OpenAI service temporarily unavailable. Please try again later.';
            } else if (error.message.includes('insufficient_quota')) {
                userMessage = 'API quota exceeded. Please check your OpenAI account billing.';
            }

            chrome.tabs.sendMessage(tabId, {
                action: 'displayMessage',
                message: userMessage
            });
        }
    });
}