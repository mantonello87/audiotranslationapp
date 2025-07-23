# English to French Audio Translator

A static web application that translates English audio files to French using Azure Cognitive Services (Speech-to-Text, Translator, and Text-to-Speech).

## Features

- 🎵 **Audio Upload**: Drag & drop or browse to upload English audio files (MP3, WAV, M4A)
- 🗣️ **Speech Recognition**: Convert English speech to text using Azure Speech Services
- 🌐 **Translation**: Translate English text to French using Azure Translator
- 🔊 **Speech Synthesis**: Generate French audio from translated text
- 📥 **Download**: Download the translated French audio file
- 📱 **Responsive**: Works on desktop and mobile devices

## Prerequisites

You'll need to set up Azure Cognitive Services:

### 1. Azure Speech Service
1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new "Speech Service" resource
3. Note the **Key** and **Region**

### 2. Azure Translator Service
1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new "Translator" resource
3. Note the **Key** and **Region** (or use "global")

## Setup

1. **Clone or download** this repository
2. **Open** `index.html` in a web browser
3. **Enter your Azure service credentials** in the configuration section:
   - Azure Speech Service Key
   - Azure Speech Region (e.g., "eastus", "westus2")
   - Azure Translator Key
   - Azure Translator Region (e.g., "global", "eastus")

## Usage

1. **Configure Azure Services**: Enter your Azure Speech and Translator service keys and regions
2. **Upload Audio**: Drag and drop an English audio file or click to browse
3. **Translate**: Click the "Translate Audio" button
4. **Download**: Once processing is complete, listen to the French audio and download it

## Supported Audio Formats

- MP3
- WAV
- M4A
- Maximum file size: 25MB

## Deployment to Azure Static Web Apps

This application is designed to be deployed as an Azure Static Web App:

### Using Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new "Static Web App" resource
3. Connect to your GitHub repository
4. Set build details:
   - App location: `/`
   - Output location: `/`
5. Deploy

### Using Azure CLI

```bash
# Install Azure Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Login to Azure
az login

# Create static web app
az staticwebapp create \
  --name "audio-translator-app" \
  --resource-group "your-resource-group" \
  --source "https://github.com/yourusername/your-repo" \
  --location "Central US" \
  --branch "main"
```

## File Structure

```
translatorapp-new/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # JavaScript application logic
└── README.md          # This file
```

## Security Notes

- **API Keys**: This is a client-side application, so API keys are visible to users. For production use, consider:
  - Using Azure Managed Identity
  - Implementing a backend API to proxy requests
  - Using Azure Key Vault for secret management
- **CORS**: Ensure your Azure services allow cross-origin requests from your domain

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Troubleshooting

### Common Issues

1. **"Speech SDK not loaded"**: Refresh the page and ensure internet connectivity
2. **"No speech detected"**: Ensure audio file contains clear English speech
3. **"Translation failed"**: Check your Azure Translator key and region
4. **"Speech synthesis error"**: Verify your Azure Speech Service key and region

### Audio Issues

- Ensure audio quality is good (clear speech, minimal background noise)
- Try shorter audio files if experiencing timeouts
- Supported sample rates: 8kHz, 16kHz, 24kHz, 48kHz

## Cost Considerations

Azure Cognitive Services usage incurs costs:

- **Speech Service**: ~$1 per hour of audio processed
- **Translator**: ~$10 per million characters
- **Text-to-Speech**: ~$4 per million characters

Monitor usage in the Azure Portal to track costs.

## License

MIT License - feel free to use and modify for your projects.

## Support

For issues related to:
- **Azure Services**: Check [Azure Documentation](https://docs.microsoft.com/azure/)
- **Speech SDK**: See [Azure Speech SDK Documentation](https://docs.microsoft.com/azure/cognitive-services/speech-service/)
- **Application bugs**: Open an issue in this repository
