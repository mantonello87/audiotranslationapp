# Azure Services Setup Guide

This guide will walk you through setting up Azure Cognitive Services for your audio translator application.

## 🔧 Required Azure Services

You need to create **2 Azure services**:
1. **Azure Speech Service** (for speech-to-text and text-to-speech)
2. **Azure Translator** (for text translation)

---

## 📋 Step 1: Create Azure Speech Service

### 1.1 Create the Service
1. Go to [Azure Portal](https://portal.azure.com)
2. Click **"Create a resource"**
3. Search for **"Speech"** and select **"Speech"**
4. Click **"Create"**

### 1.2 Configure Speech Service
- **Subscription**: Choose your Azure subscription
- **Resource Group**: Create new or use existing (e.g., "audio-translator-rg")
- **Region**: Choose a region close to you (e.g., "East US", "West Europe")
- **Name**: Give it a unique name (e.g., "audio-translator-speech")
- **Pricing Tier**: 
  - **Free (F0)**: 5 hours/month free for testing
  - **Standard (S0)**: Pay-per-use for production

### 1.3 Get Your Keys
1. After creation, go to your Speech resource
2. In the left menu, click **"Keys and Endpoint"**
3. Copy **Key 1** and **Region**

---

## 📋 Step 2: Create Azure Translator Service

### 2.1 Create the Service
1. In Azure Portal, click **"Create a resource"**
2. Search for **"Translator"** and select **"Translator"**
3. Click **"Create"**

### 2.2 Configure Translator Service
- **Subscription**: Choose your Azure subscription
- **Resource Group**: Use the same as Speech Service
- **Region**: Choose **"Global"** or same region as Speech Service
- **Name**: Give it a unique name (e.g., "audio-translator-text")
- **Pricing Tier**:
  - **Free (F0)**: 2M characters/month free for testing
  - **Standard (S1-S4)**: Pay-per-use for production

### 2.3 Get Your Keys
1. After creation, go to your Translator resource
2. In the left menu, click **"Keys and Endpoint"**
3. Copy **Key 1** and **Location/Region**

---

## 🔑 Step 3: Configure Your Application

Now you need to add your keys to the application. You have two options:

### Option A: Direct Configuration (For Testing)

1. Open `script.js` in your code editor
2. Find this section around line 9:

```javascript
this.azureConfig = {
    speechKey: 'YOUR_SPEECH_KEY',
    speechRegion: 'eastus',
    translatorKey: 'YOUR_TRANSLATOR_KEY',
    translatorRegion: 'global'
};
```

3. Replace the values with your actual keys:

```javascript
this.azureConfig = {
    speechKey: 'your_actual_speech_key_here',
    speechRegion: 'eastus', // or your chosen region
    translatorKey: 'your_actual_translator_key_here',
    translatorRegion: 'global' // or your chosen region
};
```

4. **Disable demo mode** by changing this line:
```javascript
this.demoMode = false; // Change from true to false
```

### Option B: Environment Variables (For Production)

For production deployment, it's better to use environment variables:

1. In your Azure Static Web App configuration, add these environment variables:
   - `AZURE_SPEECH_KEY` = your speech service key
   - `AZURE_SPEECH_REGION` = your speech service region
   - `AZURE_TRANSLATOR_KEY` = your translator service key
   - `AZURE_TRANSLATOR_REGION` = your translator service region

2. Update `script.js` to use environment variables:
```javascript
this.azureConfig = {
    speechKey: window.AZURE_SPEECH_KEY || 'YOUR_SPEECH_KEY',
    speechRegion: window.AZURE_SPEECH_REGION || 'eastus',
    translatorKey: window.AZURE_TRANSLATOR_KEY || 'YOUR_TRANSLATOR_KEY',
    translatorRegion: window.AZURE_TRANSLATOR_REGION || 'global'
};
```

---

## 🧪 Step 4: Test Your Configuration

1. **Save your changes** to `script.js`
2. **Refresh your browser** at http://localhost:3000
3. **Upload an audio file** - the "DEMO MODE" badge should disappear
4. **Click "Translate to French"** - it should now use real Azure services

---

## 💰 Pricing Information

### Speech Service Pricing (per hour of audio):
- **Free Tier**: 5 hours/month free
- **Standard**: ~$1.00/hour

### Translator Pricing (per million characters):
- **Free Tier**: 2M characters/month free
- **Standard**: ~$10/million characters

### Cost Estimation:
- **1-minute audio file**: ~150-250 words = ~1,000 characters
- **Translation cost**: ~$0.01 per minute of audio
- **Speech synthesis**: ~$4/million characters

---

## 🔒 Security Best Practices

### For Development:
✅ Use the direct configuration method  
✅ Don't commit keys to public repositories  
✅ Use `.gitignore` to exclude sensitive files

### For Production:
✅ Use environment variables  
✅ Enable CORS only for your domain  
✅ Consider using Azure Managed Identity  
✅ Monitor usage in Azure Portal

---

## 🚨 Troubleshooting

### Common Issues:

**Error: "Invalid subscription key"**
- Double-check you copied the correct key
- Ensure you're using Key 1, not the endpoint URL

**Error: "Region mismatch"**
- Verify the region matches your resource location
- Use exact region names (e.g., "eastus", not "East US")

**Error: "Quota exceeded"**
- Check your Azure portal for usage limits
- Consider upgrading to paid tier

**CORS Errors:**
- Ensure your Azure services allow your domain
- Check browser console for specific CORS messages

---

## 📞 Support

- **Azure Documentation**: [Azure Cognitive Services](https://docs.microsoft.com/azure/cognitive-services/)
- **Speech SDK Documentation**: [Speech SDK](https://docs.microsoft.com/azure/cognitive-services/speech-service/)
- **Translator Documentation**: [Translator](https://docs.microsoft.com/azure/cognitive-services/translator/)

---

**Ready to configure your keys? Follow the steps above and your app will be powered by real Azure AI services!** 🚀
