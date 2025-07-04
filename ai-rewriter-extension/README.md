# AI Rewriter Extension

A Chrome extension that uses Google's Gemini AI to rewrite selected text or textarea content.

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension icon should appear in your toolbar

## Setup

1. Click the extension icon to open the popup
2. Enter your Gemini API key (get one from [Google AI Studio](https://makersuite.google.com/app/apikey))
3. Click "Save API Key"

## Usage

1. Select text on any webpage, or click in a textarea/input field
2. Right-click and select "Rewrite with AI" from the context menu
3. Review the rewritten text in the modal that appears
4. Click "Accept" to replace the original text, or "Cancel" to keep it unchanged

## Troubleshooting

### Popup Not Working

If the popup doesn't open or work properly:

1. **Check the console**: Right-click the extension icon and select "Inspect popup" to see any error messages
2. **Reload the extension**: Go to `chrome://extensions/`, find the extension, and click the reload button
3. **Check permissions**: Make sure the extension has the necessary permissions
4. **Clear browser cache**: Sometimes cached files can cause issues

### Common Issues

- **"Chrome storage API not available"**: Reload the extension
- **"API Key not found"**: Make sure you've saved your Gemini API key in the popup
- **Context menu not appearing**: Make sure you have text selected or are focused on a text input

## Files

- `manifest.json` - Extension configuration
- `popup.html` - Popup interface for API key management
- `popup.js` - Popup functionality
- `background.js` - Service worker for API calls and context menu
- `content.js` - Content script for DOM interaction
- `icons/` - Extension icons

## Development

To modify the extension:

1. Make your changes to the files
2. Go to `chrome://extensions/`
3. Click the reload button on the extension
4. Test your changes

The extension will automatically reload when you make changes to the files.