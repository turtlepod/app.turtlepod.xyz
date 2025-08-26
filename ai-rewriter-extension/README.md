# AI Rewriter Browser Extension

A powerful browser extension that allows you to rewrite selected text or textarea content using the latest AI models including **GPT-4o**, **GPT-4o-mini**, and **Google Gemini**.

## Features

- **Multi-AI Provider Support**: Choose between OpenAI and Google Gemini
- **Latest OpenAI Models**:
  - **GPT-4o** - Most capable model (latest)
  - **GPT-4o-mini** - Fast and cost-effective (recommended)
  - **GPT-4 Turbo** - Previous generation
  - **GPT-3.5 Turbo** - Legacy model
- **Advanced Configuration**: Control temperature, max tokens, and response behavior
- **Context Menu Integration**: Right-click on selected text to rewrite
- **Custom Instructions**: Provide specific directions for how AI should rewrite your text
- **Cross-Platform**: Works on any website with text selection or input fields

## Installation

1. Download or clone this repository
2. Open Chrome/Edge and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder
5. The extension icon will appear in your toolbar

## Setup

1. Click the extension icon to open settings
2. Choose your preferred AI provider (OpenAI or Gemini)
3. Enter your API key:
   - **OpenAI**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - **Gemini**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
4. Configure OpenAI settings (if using OpenAI):
   - **Model**: Choose the AI model based on your needs
   - **Temperature**: Control creativity (0 = focused, 2 = creative)
   - **Max Tokens**: Set maximum response length
5. (Optional) Add custom AI direction instructions
6. Click "Save Settings"

## Usage

### Method 1: Context Menu
1. Select any text on a webpage
2. Right-click and choose "Rewrite with AI"
3. The AI will rewrite your text according to your settings

### Method 2: Text Input Fields
1. Click inside any text input or textarea
2. Right-click and choose "Rewrite with AI"
3. The AI will rewrite the content in the field

## OpenAI API Models

| Model | Description | Use Case |
|-------|-------------|----------|
| **GPT-4o** | Most capable model, latest features | Complex tasks, highest quality |
| **GPT-4o-mini** | Fast, cost-effective, great quality | Daily use, balanced performance |
| **GPT-4 Turbo** | Previous generation, still powerful | Legacy compatibility |
| **GPT-3.5 Turbo** | Fastest, most affordable | Simple rewrites, budget-conscious |

## Configuration Options

### Temperature
- **0.0**: Very focused and deterministic
- **0.7**: Balanced (default)
- **1.0**: More creative
- **2.0**: Maximum creativity

### Max Tokens
- **100-500**: Short responses
- **1000**: Standard responses (default)
- **2000-4000**: Long, detailed responses

## API Requirements

### OpenAI
- API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- Account with available credits
- Supports latest models including GPT-4o

### Google Gemini
- API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Uses Gemini 2.0 Flash model

## Troubleshooting

### Common Issues

1. **"API Key not found"**: Make sure you've entered your API key in the extension settings
2. **"Rate limit exceeded"**: Wait a moment and try again, or check your API quota
3. **"Invalid API key"**: Verify your API key is correct and has sufficient credits
4. **"Service unavailable"**: The AI service may be temporarily down, try again later

### Error Messages

The extension now provides more helpful error messages:
- **401**: Invalid API key - check your key in settings
- **429**: Rate limit exceeded - wait and try again
- **500**: Service unavailable - try again later
- **Insufficient quota**: Check your OpenAI account billing

## Development

This extension is built with:
- **Manifest V3** for modern Chrome extensions
- **Service Worker** for background processing
- **Content Scripts** for webpage integration
- **Chrome Storage API** for settings persistence

## Future Updates

- **GPT-5 Support**: Will be added when officially released by OpenAI
- **Function Calling**: Enhanced AI capabilities
- **Streaming Responses**: Real-time text generation
- **More AI Providers**: Claude, Cohere, and others

## License

This project is open source and available under the MIT License.

## Support

For issues or feature requests, please open an issue on the GitHub repository.