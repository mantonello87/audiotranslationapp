# English to French Audio Translator

A modern web application that translates English audio files to French using Azure AI services. Built with HTML5, CSS3, JavaScript, and Azure Functions.

## ✨ Features

- **Server-Side Processing**: Azure keys are stored securely on the server
- **Audio Upload**: Drag & drop or browse MP3, WAV, M4A files (up to 25MB)
- **Speech Recognition**: Converts English audio to text using Azure Speech Service
- **Translation**: Translates English text to French using Azure Translator
- **Speech Synthesis**: Generates French audio from translated text
- **Download**: Download the translated French audio file
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Architecture

### Client-Side (Static Web App)
- **Frontend**: Pure HTML5/CSS3/JavaScript
- **No Azure Keys**: All sensitive data handled server-side
- **API Calls**: Communicates with Azure Functions backend

### Server-Side (Azure Functions)
- **Speech-to-Text API**: `/api/speech-to-text`
- **Translation API**: `/api/translate`
- **Text-to-Speech API**: `/api/text-to-speech`
- **Secure**: Azure keys stored as environment variables

## 🚀 Deployment

### Azure Static Web App + Functions

1. **Create Azure Services**:
   - Azure Speech Service
   - Azure Translator Service
   - Azure Static Web App

2. **Configure Environment Variables** in Azure Portal:
   ```
   AZURE_SPEECH_KEY=your_speech_service_key
   AZURE_SPEECH_REGION=your_speech_region
   AZURE_TRANSLATOR_KEY=your_translator_service_key
   AZURE_TRANSLATOR_REGION=your_translator_region
   ```

3. **Deploy**:
   - Connect your GitHub repository
   - Build settings:
     - App location: `/`
     - API location: `/api`
     - Output location: `/`

### Environment Variables

Set these in Azure Portal > Static Web Apps > Configuration:

| Variable | Description | Example |
|----------|-------------|---------|
| `AZURE_SPEECH_KEY` | Azure Speech Service subscription key | `1234567890abcdef1234567890abcdef` |
| `AZURE_SPEECH_REGION` | Azure Speech Service region | `eastus` |
| `AZURE_TRANSLATOR_KEY` | Azure Translator subscription key | `abcdef1234567890abcdef1234567890` |
| `AZURE_TRANSLATOR_REGION` | Azure Translator region | `eastus` |

## 📁 Project Structure

```
├── index.html              # Main application page
├── styles.css              # Application styling
├── script.js               # Client-side JavaScript
├── staticwebapp.config.json # Static Web App configuration
├── api/                    # Azure Functions
│   ├── host.json           # Functions runtime configuration
│   ├── package.json        # Node.js dependencies
│   ├── speech-to-text/     # Speech recognition function
│   ├── translate/          # Translation function
│   └── text-to-speech/     # Speech synthesis function
└── environment-variables.md # Environment variables reference
```

## 🔧 Local Development

1. **Install Azure Functions Core Tools**:
   ```bash
   npm install -g azure-functions-core-tools@4
   ```

2. **Install Dependencies**:
   ```bash
   cd api
   npm install
   ```

3. **Set Local Environment Variables** (create `api/local.settings.json`):
   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "AzureWebJobsStorage": "",
       "FUNCTIONS_WORKER_RUNTIME": "node",
       "AZURE_SPEECH_KEY": "your_speech_key",
       "AZURE_SPEECH_REGION": "your_region",
       "AZURE_TRANSLATOR_KEY": "your_translator_key",
       "AZURE_TRANSLATOR_REGION": "your_region"
     }
   }
   ```

4. **Start Local Development**:
   ```bash
   # Terminal 1: Start Functions
   cd api
   func start

   # Terminal 2: Serve static files
   cd ..
   python -m http.server 3000
   ```

5. **Open**: http://localhost:3000

## 🔒 Security Features

- **Server-Side Keys**: Azure credentials never exposed to client
- **CORS Protection**: Configured for your domain only
- **Input Validation**: File type and size restrictions
- **Error Handling**: Secure error messages without sensitive data

## 🎯 API Endpoints

### POST /api/speech-to-text
Converts audio to text.

**Request**:
```json
{
  "audioData": "base64_encoded_audio",
  "format": "audio/wav"
}
```

**Response**:
```json
{
  "success": true,
  "text": "Hello, this is the recognized speech."
}
```

### POST /api/translate
Translates text between languages.

**Request**:
```json
{
  "text": "Hello world",
  "from": "en",
  "to": "fr"
}
```

**Response**:
```json
{
  "success": true,
  "originalText": "Hello world",
  "translatedText": "Bonjour le monde",
  "fromLanguage": "en",
  "toLanguage": "fr"
}
```

### POST /api/text-to-speech
Converts text to speech audio.

**Request**:
```json
{
  "text": "Bonjour le monde",
  "language": "fr-FR",
  "voice": "fr-FR-DeniseNeural"
}
```

**Response**:
```json
{
  "success": true,
  "audioData": "base64_encoded_wav_audio",
  "format": "wav"
}
```

## 🐛 Troubleshooting

### Common Issues

1. **API Calls Failing**:
   - Check environment variables are set in Azure Portal
   - Verify Azure service keys are valid
   - Check Azure service regions match

2. **CORS Errors**:
   - Ensure `staticwebapp.config.json` is properly configured
   - Check API routes are accessible

3. **Audio Processing Errors**:
   - Verify file format is supported (MP3, WAV, M4A)
   - Check file size is under 25MB
   - Ensure audio contains clear English speech

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🔗 Related Services

- [Azure Speech Service](https://azure.microsoft.com/en-us/services/cognitive-services/speech-services/)
- [Azure Translator](https://azure.microsoft.com/en-us/services/cognitive-services/translator/)
- [Azure Static Web Apps](https://azure.microsoft.com/en-us/services/app-service/static/)
