class AudioTranslator {
    constructor() {
        this.selectedFile = null;
        
        // API endpoints - these will be automatically configured for your Static Web App
        this.apiConfig = {
            speechToTextEndpoint: '/api/speech-to-text',
            translateEndpoint: '/api/translate',
            textToSpeechEndpoint: '/api/text-to-speech'
        };
        
        // Production mode - using server-side API
        this.demoMode = false;
        
        this.initializeElements();
        this.bindEvents();
        this.validateConfiguration();
        
        // Add error handling for debugging
        window.addEventListener('error', (e) => {
            console.error('JavaScript error:', e.error);
            this.showError(`JavaScript error: ${e.message}`);
        });
        
        console.log('AudioTranslator constructor completed - using server-side API');
    }

    initializeElements() {
        // File upload elements
        this.uploadArea = document.getElementById('uploadArea');
        this.audioFileInput = document.getElementById('audioFile');
        this.browseBtn = document.querySelector('label[for="audioFile"]');
        this.fileInfo = document.getElementById('fileInfo');
        this.fileName = document.getElementById('fileName');
        this.fileSize = document.getElementById('fileSize');
        this.removeFileBtn = document.getElementById('removeFile');

        // Action elements
        this.translateBtn = document.getElementById('translateBtn');

        // Progress elements
        this.progressSection = document.getElementById('progressSection');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');

        // Results elements
        this.resultsSection = document.getElementById('resultsSection');
        this.originalText = document.getElementById('originalText');
        this.translatedText = document.getElementById('translatedText');
        this.frenchAudio = document.getElementById('frenchAudio');
        this.downloadBtn = document.getElementById('downloadBtn');

        // Error elements
        this.errorSection = document.getElementById('errorSection');
        this.errorText = document.getElementById('errorText');

        // Debug: Check if critical elements are found
        console.log('Element check:', {
            uploadArea: !!this.uploadArea,
            audioFileInput: !!this.audioFileInput,
            browseBtn: !!this.browseBtn,
            translateBtn: !!this.translateBtn,
            fileInfo: !!this.fileInfo,
            fileName: !!this.fileName,
            fileSize: !!this.fileSize
        });
        
        if (!this.audioFileInput) {
            console.error('Audio file input not found - check HTML element with id="audioFile"');
        }
        if (!this.browseBtn) {
            console.error('Browse button not found - check HTML label with for="audioFile"');
        }
        if (!this.uploadArea) {
            console.error('Upload area not found - check HTML element with id="uploadArea"');
        }
    }

    bindEvents() {
        // File upload events
        this.uploadArea.addEventListener('click', (e) => {
            if (e.target === this.browseBtn || this.browseBtn.contains(e.target)) {
                return;
            }
            this.audioFileInput.click();
        });
        
        this.browseBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.audioFileInput.click();
            }
        });
        
        this.audioFileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.removeFileBtn.addEventListener('click', () => this.removeFile());

        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        // Action events
        this.translateBtn.addEventListener('click', () => this.translateAudio());
        this.downloadBtn.addEventListener('click', () => this.downloadFrenchAudio());
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        console.log('handleFileSelect called:', e);
        console.log('Files:', e.target.files);
        
        const file = e.target.files[0];
        if (file) {
            console.log('File selected:', file.name, file.type, file.size);
            this.processFile(file);
        } else {
            console.log('No file selected');
        }
    }

    processFile(file) {
        console.log('Processing file:', file.name, file.type, file.size);
        
        // Validate file type
        const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/mpeg', 'audio/mp4', 'audio/x-m4a'];
        const fileExtension = file.name.toLowerCase().split('.').pop();
        const allowedExtensions = ['mp3', 'wav', 'm4a'];

        if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
            this.showError('Please select a valid audio file (MP3, WAV, or M4A).');
            return;
        }

        // Validate file size (25MB limit)
        const maxSize = 25 * 1024 * 1024; // 25MB in bytes
        if (file.size > maxSize) {
            this.showError('File size must be less than 25MB.');
            return;
        }

        console.log('File validation passed');
        this.selectedFile = file;
        this.displayFileInfo(file);
        this.hideError();
        this.validateConfiguration();
    }

    displayFileInfo(file) {
        console.log('Displaying file info for:', file.name);
        this.fileName.textContent = file.name;
        this.fileSize.textContent = this.formatFileSize(file.size);
        this.uploadArea.style.display = 'none';
        this.fileInfo.style.display = 'block';
        console.log('File info displayed');
    }

    removeFile() {
        this.selectedFile = null;
        this.audioFileInput.value = '';
        this.uploadArea.style.display = 'block';
        this.fileInfo.style.display = 'none';
        this.hideResults();
        this.hideError();
        this.validateConfiguration();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    validateConfiguration() {
        // Always valid since we're using server-side API
        const isValid = !!this.selectedFile;
        
        console.log('Configuration validation:', {
            selectedFile: !!this.selectedFile,
            isValid
        });
        
        this.translateBtn.disabled = !isValid;
    }

    async translateAudio() {
        if (!this.selectedFile) {
            this.showError('Please select an audio file first.');
            return;
        }

        try {
            this.showProgress('Initializing...', 0);
            this.hideError();
            this.hideResults();

            // Use server-side API
            await this.runAPITranslation();

        } catch (error) {
            console.error('Translation error:', error);
            this.hideProgress();
            this.showError(error.message || 'An error occurred during translation. Please try again.');
        }
    }

    async runAPITranslation() {
        // Step 1: Convert speech to text using API (with mono conversion)
        this.updateProgress('Processing audio and converting speech to text...', 25);
        const englishText = await this.callSpeechToTextAPI();

        if (!englishText || englishText.trim() === '') {
            throw new Error('No speech was detected in the audio file. Please ensure the audio contains clear English speech.');
        }

        // Step 2: Translate text using API
        this.updateProgress('Translating text to French...', 50);
        const frenchText = await this.callTranslateAPI(englishText);

        // Step 3: Convert translated text to speech using API
        this.updateProgress('Converting French text to speech...', 75);
        const frenchAudioBlob = await this.callTextToSpeechAPI(frenchText);

        // Step 4: Display results
        this.updateProgress('Finalizing...', 100);
        this.displayResults(englishText, frenchText, frenchAudioBlob);
        
        setTimeout(() => {
            this.hideProgress();
            this.showResults();
        }, 500);
    }

    async callSpeechToTextAPI() {
        try {
            // Convert audio to mono first (this fixes most recognition failures!)
            let audioFile = this.selectedFile;
            try {
                console.log('Converting audio to mono for better recognition...');
                audioFile = await this.convertToMono(this.selectedFile);
                console.log('✅ Audio converted to mono successfully');
            } catch (conversionError) {
                console.warn('⚠️ Mono conversion failed, using original:', conversionError.message);
                // Continue with original file if conversion fails
            }
            
            // Convert file to base64
            const audioBase64 = await this.fileToBase64(audioFile);
            
            const response = await fetch(this.apiConfig.speechToTextEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    audioData: audioBase64,
                    format: audioFile.type || 'audio/wav'
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.details || `Speech recognition failed (${response.status})`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.details || result.error || 'Speech recognition failed');
            }

            console.log('Speech-to-text successful:', result.text);
            return result.text;

        } catch (error) {
            console.error('Speech-to-text API error:', error);
            throw new Error(`Speech recognition failed: ${error.message}`);
        }
    }

    async callTranslateAPI(text) {
        try {
            const response = await fetch(this.apiConfig.translateEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    from: 'en',
                    to: 'fr'
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.details || `Translation failed (${response.status})`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.details || result.error || 'Translation failed');
            }

            console.log('Translation successful:', result.translatedText);
            return result.translatedText;

        } catch (error) {
            console.error('Translation API error:', error);
            throw new Error(`Translation failed: ${error.message}`);
        }
    }

    async callTextToSpeechAPI(text) {
        try {
            const response = await fetch(this.apiConfig.textToSpeechEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    language: 'fr-FR',
                    voice: 'fr-FR-DeniseNeural'
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.details || `Text-to-speech failed (${response.status})`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.details || result.error || 'Text-to-speech failed');
            }

            // Convert base64 audio back to blob
            const audioData = atob(result.audioData);
            const audioArray = new Uint8Array(audioData.length);
            for (let i = 0; i < audioData.length; i++) {
                audioArray[i] = audioData.charCodeAt(i);
            }
            
            const audioBlob = new Blob([audioArray], { type: 'audio/wav' });
            console.log('Text-to-speech successful, audio blob size:', audioBlob.size);
            return audioBlob;

        } catch (error) {
            console.error('Text-to-speech API error:', error);
            throw new Error(`Text-to-speech failed: ${error.message}`);
        }
    }

    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Remove data URL prefix (e.g., "data:audio/wav;base64,")
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    displayResults(originalText, translatedText, audioBlob) {
        this.originalText.textContent = originalText;
        this.translatedText.textContent = translatedText;

        // Handle audio blob
        if (audioBlob && audioBlob.size > 0) {
            // Create audio URL and set up audio element
            const audioUrl = URL.createObjectURL(audioBlob);
            this.frenchAudio.src = audioUrl;
            
            // Store the blob for download
            this.frenchAudioBlob = audioBlob;
            
            // Ensure audio player is visible
            this.frenchAudio.style.display = 'block';
        } else {
            this.showError('No audio was generated. Please try again.');
        }
    }

    downloadFrenchAudio() {
        if (!this.frenchAudioBlob) {
            this.showError('No French audio available for download.');
            return;
        }

        const url = URL.createObjectURL(this.frenchAudioBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `french_translation_${Date.now()}.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showProgress(text, percentage) {
        this.progressText.textContent = text;
        this.progressFill.style.width = percentage + '%';
        this.progressSection.style.display = 'block';
    }

    updateProgress(text, percentage) {
        this.progressText.textContent = text;
        this.progressFill.style.width = percentage + '%';
    }

    hideProgress() {
        this.progressSection.style.display = 'none';
    }

    showResults() {
        this.resultsSection.style.display = 'block';
    }

    hideResults() {
        this.resultsSection.style.display = 'none';
    }

    showError(message) {
        this.errorText.textContent = message;
        this.errorSection.style.display = 'block';
    }

    hideError() {
        this.errorSection.style.display = 'none';
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Convert audio file to mono format for better Azure Speech recognition
    async convertToMono(file) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Read and decode the audio file
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // If already mono, return as-is
        if (audioBuffer.numberOfChannels === 1) {
            console.log('Audio is already mono, no conversion needed');
            return file;
        }
        
        console.log(`Converting stereo audio (${audioBuffer.numberOfChannels} channels) to mono...`);
        
        // Convert to mono by mixing channels
        const length = audioBuffer.length;
        const sampleRate = 16000; // Optimal for Azure Speech
        const numberOfChannels = 1; // Mono
        
        // Create offline context for processing
        const offlineContext = new OfflineAudioContext(numberOfChannels, Math.floor(length * sampleRate / audioBuffer.sampleRate), sampleRate);
        
        // Create buffer source
        const source = offlineContext.createBufferSource();
        source.buffer = audioBuffer;
        
        // Create channel merger to mix stereo to mono
        if (audioBuffer.numberOfChannels > 1) {
            const merger = offlineContext.createChannelMerger(1);
            const splitter = offlineContext.createChannelSplitter(audioBuffer.numberOfChannels);
            
            source.connect(splitter);
            
            // Mix all channels to mono
            for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
                const gainNode = offlineContext.createGain();
                gainNode.gain.value = 1 / audioBuffer.numberOfChannels; // Equal mix
                splitter.connect(gainNode, i);
                gainNode.connect(merger, 0, 0);
            }
            
            merger.connect(offlineContext.destination);
        } else {
            source.connect(offlineContext.destination);
        }
        
        source.start();
        
        // Render the audio
        const renderedBuffer = await offlineContext.startRendering();
        
        // Convert to WAV blob
        return this.audioBufferToWav(renderedBuffer);
    }

    // Convert AudioBuffer to WAV blob (mono, 16kHz, 16-bit)
    audioBufferToWav(buffer) {
        const length = buffer.length;
        const arrayBuffer = new ArrayBuffer(44 + length * 2);
        const view = new DataView(arrayBuffer);

        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true); // PCM
        view.setUint16(22, 1, true); // Mono
        view.setUint32(24, buffer.sampleRate, true);
        view.setUint32(28, buffer.sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * 2, true);

        // Convert float samples to 16-bit PCM
        const channelData = buffer.getChannelData(0);
        let offset = 44;
        for (let i = 0; i < length; i++) {
            const sample = Math.max(-1, Math.min(1, channelData[i]));
            view.setInt16(offset, sample * 0x7FFF, true);
            offset += 2;
        }

        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing AudioTranslator...');
    try {
        const app = new AudioTranslator();
        console.log('AudioTranslator initialized successfully');
        
        // Make app globally available for debugging
        window.audioTranslatorApp = app;
    } catch (error) {
        console.error('Failed to initialize AudioTranslator:', error);
    }
});
