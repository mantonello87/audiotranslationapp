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
        this.browseBtn = document.querySelector('label[for="audioFile"]'); // Updated to select the label
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
        // File upload events - simplified since we're using a label now
        this.uploadArea.addEventListener('click', (e) => {
            // Don't trigger file input if clicking on the label, let it handle itself
            if (e.target === this.browseBtn || this.browseBtn.contains(e.target)) {
                return;
            }
            // Trigger file input for upload area clicks
            this.audioFileInput.click();
        });
        
        // The label will automatically trigger the file input, but add handler for keyboard access
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
        console.log('Processing file:', file.name, file.type, file.size); // Debug log
        
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

        console.log('File validation passed'); // Debug log
        this.selectedFile = file;
        this.displayFileInfo(file);
        this.hideError();
        this.validateConfiguration();
    }

    displayFileInfo(file) {
        console.log('Displaying file info for:', file.name); // Debug log
        this.fileName.textContent = file.name;
        this.fileSize.textContent = this.formatFileSize(file.size);
        this.uploadArea.style.display = 'none';
        this.fileInfo.style.display = 'block';
        console.log('File info displayed'); // Debug log
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
        // Step 1: Convert speech to text using API
        this.updateProgress('Converting speech to text...', 25);
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
            // Convert file to base64
            const audioBase64 = await this.fileToBase64(this.selectedFile);
            
            const response = await fetch(this.apiConfig.speechToTextEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    audioData: audioBase64,
                    format: this.selectedFile.type
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

    async runRealTranslation() {
        // Initialize Azure Speech SDK
        await this.initializeSpeechConfig();
        
        // Step 1: Convert speech to text
        this.updateProgress('Converting speech to text...', 25);
        let englishText;
        
        try {
            // Try continuous recognition first
            englishText = await this.speechToText();
        } catch (error) {
            console.log('Continuous recognition failed, trying single-shot recognition:', error.message);
            this.updateProgress('Retrying speech recognition...', 25);
            
            try {
                englishText = await this.speechToTextSingleShot();
            } catch (singleShotError) {
                console.log('Single-shot recognition also failed, trying Web Audio API approach:', singleShotError.message);
                this.updateProgress('Trying alternative audio processing...', 25);
                
                try {
                    englishText = await this.speechToTextWithWebAudio();
                } catch (webAudioError) {
                    console.log('Web Audio API failed, trying direct file approach:', webAudioError.message);
                    this.updateProgress('Trying direct file processing...', 25);
                    
                    try {
                        englishText = await this.speechToTextDirect();
                    } catch (directError) {
                        console.error('All recognition methods failed:', directError.message);
                        throw new Error(`Speech recognition failed: ${directError.message}`);
                    }
                }
            }
        }

        if (!englishText || englishText.trim() === '') {
            throw new Error('No speech was detected in the audio file. Please ensure the audio contains clear English speech.');
        }

        // Step 2: Translate text
        this.updateProgress('Translating text to French...', 50);
        const frenchText = await this.translateText(englishText);

        // Step 3: Convert translated text to speech
        this.updateProgress('Converting French text to speech...', 75);
        const frenchAudioBlob = await this.textToSpeech(frenchText);

        // Step 4: Display results
        this.updateProgress('Finalizing...', 100);
        this.displayResults(englishText, frenchText, frenchAudioBlob);
        
        setTimeout(() => {
            this.hideProgress();
            this.showResults();
        }, 500);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async initializeSpeechConfig() {
        const speechKey = this.azureConfig.speechKey;
        const speechRegion = this.azureConfig.speechRegion;

        if (!speechKey || speechKey === 'YOUR_SPEECH_KEY') {
            throw new Error('Azure Speech Service key is not configured.');
        }

        if (!speechRegion) {
            throw new Error('Azure Speech Service region is not configured.');
        }

        // Check if Speech SDK is loaded, wait if necessary
        const sdkAvailable = typeof SpeechSDK !== 'undefined' || 
                           typeof Microsoft !== 'undefined' || 
                           typeof window.SpeechSDK !== 'undefined' ||
                           typeof window.Microsoft !== 'undefined';
        
        if (!sdkAvailable) {
            console.log('Waiting for Azure Speech SDK to load...');
            await this.waitForSpeechSDK();
        }

        // Normalize SDK reference
        if (typeof SpeechSDK === 'undefined' && typeof Microsoft !== 'undefined') {
            window.SpeechSDK = Microsoft.CognitiveServices.Speech;
        }

        if (typeof SpeechSDK === 'undefined') {
            throw new Error('Azure Speech SDK is not loaded. Please refresh the page and try again.');
        }

        console.log('Initializing Azure Speech SDK configuration...');
        this.speechConfig = SpeechSDK.SpeechConfig.fromSubscription(speechKey, speechRegion);
        this.speechConfig.speechRecognitionLanguage = 'en-US';
        this.speechConfig.speechSynthesisLanguage = 'fr-FR';
        this.speechConfig.speechSynthesisVoiceName = 'fr-FR-DeniseNeural';
        console.log('Azure Speech SDK configuration completed');
    }

    async waitForSpeechSDK(maxWaitTime = 15000) {
        const startTime = Date.now();
        while ((Date.now() - startTime) < maxWaitTime) {
            const sdkAvailable = typeof SpeechSDK !== 'undefined' || 
                               typeof Microsoft !== 'undefined' || 
                               typeof window.SpeechSDK !== 'undefined' ||
                               typeof window.Microsoft !== 'undefined';
            
            if (sdkAvailable) {
                // Normalize SDK reference
                if (typeof SpeechSDK === 'undefined' && typeof Microsoft !== 'undefined') {
                    window.SpeechSDK = Microsoft.CognitiveServices.Speech;
                }
                break;
            }
            await this.delay(200);
        }
    }

    async speechToText() {
        return new Promise((resolve, reject) => {
            console.log('Starting speech-to-text conversion...');
            console.log('File details:', {
                name: this.selectedFile.name,
                type: this.selectedFile.type,
                size: this.selectedFile.size
            });

            // Set a timeout to prevent hanging
            const timeout = setTimeout(() => {
                console.error('Speech recognition timed out after 60 seconds');
                if (recognizer) {
                    recognizer.stopContinuousRecognitionAsync();
                }
                reject(new Error('Speech recognition timed out. The audio file may be too long or contain no speech.'));
            }, 60000); // 60 second timeout

            let recognizer;

            try {
                // Use AudioConfig.fromStreamInput instead of fromWavFileInput for better compatibility
                const audioConfig = SpeechSDK.AudioConfig.fromStreamInput(
                    SpeechSDK.AudioInputStream.createPushStream()
                );
                
                // Create a push stream and feed the file data
                const pushStream = SpeechSDK.AudioInputStream.createPushStream();
                
                // Read the file as array buffer
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const arrayBuffer = reader.result;
                        const audioData = new Uint8Array(arrayBuffer);
                        
                        // Push the audio data to the stream
                        pushStream.write(audioData);
                        pushStream.close();
                        
                        // Create recognizer with the stream
                        const streamAudioConfig = SpeechSDK.AudioConfig.fromStreamInput(pushStream);
                        recognizer = new SpeechSDK.SpeechRecognizer(this.speechConfig, streamAudioConfig);

                        let recognizedText = '';
                        let hasRecognizedSpeech = false;

                        recognizer.recognizing = (s, e) => {
                            console.log(`RECOGNIZING: Text=${e.result.text}`);
                        };

                        recognizer.recognized = (s, e) => {
                            console.log(`RECOGNIZED event - Reason: ${e.result.reason}`);
                            if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
                                recognizedText += e.result.text + ' ';
                                hasRecognizedSpeech = true;
                                console.log(`RECOGNIZED: Text=${e.result.text}`);
                            } else if (e.result.reason === SpeechSDK.ResultReason.NoMatch) {
                                console.log('NOMATCH: Speech could not be recognized.');
                            }
                        };

                        recognizer.canceled = (s, e) => {
                            console.log(`CANCELED: Reason=${e.reason}`);
                            clearTimeout(timeout);
                            
                            if (e.reason === SpeechSDK.CancellationReason.Error) {
                                console.error(`Speech recognition error: ${e.errorDetails}`);
                                reject(new Error(`Speech recognition error: ${e.errorDetails}`));
                            } else {
                                console.log('Speech recognition was canceled for a non-error reason');
                                recognizer.stopContinuousRecognitionAsync();
                            }
                        };

                        recognizer.sessionStopped = (s, e) => {
                            console.log('Session stopped event.');
                            clearTimeout(timeout);
                            recognizer.stopContinuousRecognitionAsync();
                            
                            const finalText = recognizedText.trim();
                            console.log(`Final recognized text: "${finalText}"`);
                            console.log(`Has recognized speech: ${hasRecognizedSpeech}`);
                            
                            if (!hasRecognizedSpeech || finalText === '') {
                                reject(new Error('No speech was detected in the audio file. Please ensure the audio contains clear English speech and try again.'));
                            } else {
                                resolve(finalText);
                            }
                        };

                        recognizer.sessionStarted = (s, e) => {
                            console.log('Speech recognition session started.');
                        };

                        console.log('Starting continuous recognition...');
                        recognizer.startContinuousRecognitionAsync(
                            () => {
                                console.log('Recognition started successfully');
                            },
                            (error) => {
                                console.error('Failed to start recognition:', error);
                                clearTimeout(timeout);
                                reject(new Error(`Failed to start speech recognition: ${error}`));
                            }
                        );

                    } catch (streamError) {
                        console.error('Error processing audio stream:', streamError);
                        clearTimeout(timeout);
                        reject(new Error(`Audio stream processing failed: ${streamError.message}`));
                    }
                };

                reader.onerror = () => {
                    console.error('Error reading file:', reader.error);
                    clearTimeout(timeout);
                    reject(new Error('Failed to read audio file'));
                };

                reader.readAsArrayBuffer(this.selectedFile);

            } catch (error) {
                console.error('Error setting up speech recognition:', error);
                clearTimeout(timeout);
                reject(new Error(`Speech recognition setup failed: ${error.message}`));
            }
        });
    }

    async speechToTextSingleShot() {
        return new Promise((resolve, reject) => {
            console.log('Starting single-shot speech recognition...');
            
            // Set a timeout to prevent hanging
            const timeout = setTimeout(() => {
                console.error('Single-shot recognition timed out after 30 seconds');
                reject(new Error('Speech recognition timed out. Please try with a shorter audio file.'));
            }, 30000); // 30 second timeout for single-shot

            try {
                // Create a push stream and feed the file data
                const pushStream = SpeechSDK.AudioInputStream.createPushStream();
                
                // Read the file as array buffer
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const arrayBuffer = reader.result;
                        const audioData = new Uint8Array(arrayBuffer);
                        
                        // Push the audio data to the stream
                        pushStream.write(audioData);
                        pushStream.close();
                        
                        // Create recognizer with the stream
                        const audioConfig = SpeechSDK.AudioConfig.fromStreamInput(pushStream);
                        const recognizer = new SpeechSDK.SpeechRecognizer(this.speechConfig, audioConfig);

                        recognizer.recognizeOnceAsync(
                            (result) => {
                                clearTimeout(timeout);
                                console.log('Single-shot recognition result:', result);
                                
                                if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
                                    const text = result.text.trim();
                                    console.log(`Single-shot recognized text: "${text}"`);
                                    if (text) {
                                        resolve(text);
                                    } else {
                                        reject(new Error('No speech detected in the audio file.'));
                                    }
                                } else if (result.reason === SpeechSDK.ResultReason.NoMatch) {
                                    reject(new Error('No speech could be recognized in the audio file.'));
                                } else {
                                    reject(new Error(`Speech recognition failed: ${result.errorDetails || 'Unknown error'}`));
                                }
                            },
                            (error) => {
                                clearTimeout(timeout);
                                console.error('Single-shot recognition error:', error);
                                reject(new Error(`Speech recognition failed: ${error}`));
                            }
                        );

                    } catch (streamError) {
                        console.error('Error processing audio stream:', streamError);
                        clearTimeout(timeout);
                        reject(new Error(`Audio stream processing failed: ${streamError.message}`));
                    }
                };

                reader.onerror = () => {
                    console.error('Error reading file:', reader.error);
                    clearTimeout(timeout);
                    reject(new Error('Failed to read audio file'));
                };

                reader.readAsArrayBuffer(this.selectedFile);

            } catch (error) {
                clearTimeout(timeout);
                console.error('Error setting up single-shot recognition:', error);
                reject(new Error(`Speech recognition setup failed: ${error.message}`));
            }
        });
    }

    async speechToTextWithWebAudio() {
        return new Promise(async (resolve, reject) => {
            console.log('Starting Web Audio API speech recognition...');
            
            try {
                // Convert audio using Web Audio API first
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const arrayBuffer = await this.readFileAsArrayBuffer(this.selectedFile);
                
                console.log('Decoding audio data...');
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                
                console.log('Audio decoded successfully:', {
                    sampleRate: audioBuffer.sampleRate,
                    channels: audioBuffer.numberOfChannels,
                    duration: audioBuffer.duration
                });
                
                // Convert to WAV format that Azure likes
                const wavBlob = await this.audioBufferToWav(audioBuffer);
                console.log('Converted to WAV blob:', wavBlob.size, 'bytes');
                
                // Create push stream with the converted audio
                const pushStream = SpeechSDK.AudioInputStream.createPushStream();
                const wavArrayBuffer = await this.readBlobAsArrayBuffer(wavBlob);
                const audioData = new Uint8Array(wavArrayBuffer);
                
                pushStream.write(audioData);
                pushStream.close();
                
                // Create recognizer
                const audioConfig = SpeechSDK.AudioConfig.fromStreamInput(pushStream);
                const recognizer = new SpeechSDK.SpeechRecognizer(this.speechConfig, audioConfig);
                
                // Set timeout
                const timeout = setTimeout(() => {
                    console.error('Web Audio recognition timed out');
                    recognizer.stopContinuousRecognitionAsync();
                    reject(new Error('Speech recognition timed out'));
                }, 60000);
                
                let recognizedText = '';
                let hasRecognizedSpeech = false;
                
                recognizer.recognized = (s, e) => {
                    if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
                        recognizedText += e.result.text + ' ';
                        hasRecognizedSpeech = true;
                        console.log(`Web Audio RECOGNIZED: ${e.result.text}`);
                    }
                };
                
                recognizer.canceled = (s, e) => {
                    clearTimeout(timeout);
                    if (e.reason === SpeechSDK.CancellationReason.Error) {
                        reject(new Error(`Web Audio recognition error: ${e.errorDetails}`));
                    }
                };
                
                recognizer.sessionStopped = (s, e) => {
                    clearTimeout(timeout);
                    recognizer.stopContinuousRecognitionAsync();
                    
                    const finalText = recognizedText.trim();
                    if (!hasRecognizedSpeech || finalText === '') {
                        reject(new Error('No speech detected after audio conversion. The audio may not contain clear speech or may be in an unsupported format.'));
                    } else {
                        resolve(finalText);
                    }
                };
                
                recognizer.startContinuousRecognitionAsync();
                
            } catch (error) {
                console.error('Web Audio processing error:', error);
                reject(new Error(`Audio processing failed: ${error.message}`));
            }
        });
    }

    async readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(file);
        });
    }

    async readBlobAsArrayBuffer(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(blob);
        });
    }

    async audioBufferToWav(audioBuffer) {
        // Convert AudioBuffer to WAV format optimized for Azure Speech Service
        console.log('Converting audio buffer to WAV:', {
            originalSampleRate: audioBuffer.sampleRate,
            originalChannels: audioBuffer.numberOfChannels,
            duration: audioBuffer.duration
        });
        
        // Azure Speech Service prefers 16kHz mono for best results
        const targetSampleRate = 16000;
        const numberOfChannels = 1; // Force mono for better recognition
        const format = 1; // PCM
        const bitDepth = 16;
        
        // Resample and convert to mono if needed
        let processedBuffer = audioBuffer;
        if (audioBuffer.sampleRate !== targetSampleRate || audioBuffer.numberOfChannels !== 1) {
            processedBuffer = await this.resampleAndConvertToMono(audioBuffer, targetSampleRate);
        }
        
        const channelData = processedBuffer.getChannelData(0); // Use first channel (mono)
        const length = channelData.length;
        
        console.log('Processed audio:', {
            sampleRate: targetSampleRate,
            channels: numberOfChannels,
            samples: length,
            durationSeconds: length / targetSampleRate
        });
        
        // Calculate sizes
        const blockAlign = numberOfChannels * bitDepth / 8;
        const byteRate = targetSampleRate * blockAlign;
        const dataSize = length * blockAlign;
        const fileSize = 36 + dataSize;
        
        const arrayBuffer = new ArrayBuffer(44 + dataSize);
        const view = new DataView(arrayBuffer);
        
        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, fileSize, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true); // fmt chunk size
        view.setUint16(20, format, true); // PCM format
        view.setUint16(22, numberOfChannels, true); // mono
        view.setUint32(24, targetSampleRate, true); // sample rate
        view.setUint32(28, byteRate, true); // byte rate
        view.setUint16(32, blockAlign, true); // block align
        view.setUint16(34, bitDepth, true); // bits per sample
        writeString(36, 'data');
        view.setUint32(40, dataSize, true);
        
        // Audio data - convert float samples to 16-bit PCM
        let offset = 44;
        for (let i = 0; i < length; i++) {
            // Clamp and convert to 16-bit signed integer
            const sample = Math.max(-1, Math.min(1, channelData[i]));
            const pcmSample = Math.round(sample * 32767);
            view.setInt16(offset, pcmSample, true);
            offset += 2;
        }
        
        console.log('WAV conversion completed:', {
            totalSize: arrayBuffer.byteLength,
            headerSize: 44,
            dataSize: dataSize
        });
        
        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }

    async speechToTextDirect() {
        return new Promise((resolve, reject) => {
            console.log('Starting direct file speech recognition...');
            console.log('Attempting to use file directly without conversion:', {
                name: this.selectedFile.name,
                type: this.selectedFile.type,
                size: this.selectedFile.size
            });
            
            // Set timeout
            const timeout = setTimeout(() => {
                console.error('Direct file recognition timed out');
                reject(new Error('Direct file recognition timed out'));
            }, 45000);
            
            try {
                // Try using the file as-is with different audio config approaches
                const reader = new FileReader();
                
                reader.onload = () => {
                    try {
                        const arrayBuffer = reader.result;
                        
                        // Method 1: Try with fromWavFileInput if it's a WAV file
                        if (this.selectedFile.name.toLowerCase().endsWith('.wav')) {
                            console.log('Attempting WAV file direct input...');
                            
                            // Create a File object from the array buffer for WAV input
                            const wavFile = new File([arrayBuffer], this.selectedFile.name, { 
                                type: 'audio/wav' 
                            });
                            
                            try {
                                const audioConfig = SpeechSDK.AudioConfig.fromWavFileInput(wavFile);
                                const recognizer = new SpeechSDK.SpeechRecognizer(this.speechConfig, audioConfig);
                                
                                this.setupDirectRecognizer(recognizer, timeout, resolve, reject);
                                return;
                            } catch (wavError) {
                                console.log('WAV direct input failed, trying push stream:', wavError);
                            }
                        }
                        
                        // Method 2: Push stream with minimal processing
                        console.log('Using push stream with minimal processing...');
                        const pushStream = SpeechSDK.AudioInputStream.createPushStream();
                        
                        // For WAV files, try to skip the header if it's causing issues
                        let audioData;
                        if (this.selectedFile.name.toLowerCase().endsWith('.wav')) {
                            // Try to find the data chunk and skip header
                            const uint8Array = new Uint8Array(arrayBuffer);
                            const dataIndex = this.findWavDataChunk(uint8Array);
                            if (dataIndex > 0) {
                                console.log(`Found WAV data chunk at byte ${dataIndex}, skipping header`);
                                audioData = uint8Array.slice(dataIndex + 8); // Skip "data" + size
                            } else {
                                console.log('Could not find WAV data chunk, using full file');
                                audioData = uint8Array;
                            }
                        } else {
                            audioData = new Uint8Array(arrayBuffer);
                        }
                        
                        pushStream.write(audioData);
                        pushStream.close();
                        
                        const audioConfig = SpeechSDK.AudioConfig.fromStreamInput(pushStream);
                        const recognizer = new SpeechSDK.SpeechRecognizer(this.speechConfig, audioConfig);
                        
                        this.setupDirectRecognizer(recognizer, timeout, resolve, reject);
                        
                    } catch (error) {
                        clearTimeout(timeout);
                        console.error('Direct processing setup error:', error);
                        reject(new Error(`Direct file processing failed: ${error.message}`));
                    }
                };
                
                reader.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error('Failed to read file for direct processing'));
                };
                
                reader.readAsArrayBuffer(this.selectedFile);
                
            } catch (error) {
                clearTimeout(timeout);
                console.error('Direct recognition setup failed:', error);
                reject(new Error(`Direct recognition setup failed: ${error.message}`));
            }
        });
    }

    setupDirectRecognizer(recognizer, timeout, resolve, reject) {
        let recognizedText = '';
        let hasRecognizedSpeech = false;
        
        recognizer.recognized = (s, e) => {
            if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
                recognizedText += e.result.text + ' ';
                hasRecognizedSpeech = true;
                console.log(`Direct RECOGNIZED: ${e.result.text}`);
            }
        };
        
        recognizer.canceled = (s, e) => {
            clearTimeout(timeout);
            if (e.reason === SpeechSDK.CancellationReason.Error) {
                console.error('Direct recognition error:', e.errorDetails);
                reject(new Error(`Direct recognition error: ${e.errorDetails}`));
            } else {
                recognizer.stopContinuousRecognitionAsync();
            }
        };
        
        recognizer.sessionStopped = (s, e) => {
            clearTimeout(timeout);
            recognizer.stopContinuousRecognitionAsync();
            
            const finalText = recognizedText.trim();
            if (!hasRecognizedSpeech || finalText === '') {
                reject(new Error('No speech detected in direct file processing. The audio file may not contain recognizable speech.'));
            } else {
                resolve(finalText);
            }
        };
        
        console.log('Starting direct recognition...');
        recognizer.startContinuousRecognitionAsync(
            () => console.log('Direct recognition started'),
            (error) => {
                clearTimeout(timeout);
                reject(new Error(`Direct recognition start failed: ${error}`));
            }
        );
    }

    findWavDataChunk(uint8Array) {
        // Look for "data" chunk in WAV file
        for (let i = 0; i < uint8Array.length - 4; i++) {
            if (uint8Array[i] === 0x64 && // 'd'
                uint8Array[i + 1] === 0x61 && // 'a'
                uint8Array[i + 2] === 0x74 && // 't'
                uint8Array[i + 3] === 0x61) { // 'a'
                return i;
            }
        }
        return -1;
    }

    async resampleAndConvertToMono(audioBuffer, targetSampleRate) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create an offline context for resampling
        const offlineContext = new OfflineAudioContext(
            1, // mono output
            Math.ceil(audioBuffer.duration * targetSampleRate),
            targetSampleRate
        );
        
        // Create a buffer source
        const source = offlineContext.createBufferSource();
        source.buffer = audioBuffer;
        
        // If stereo, create a channel merger to convert to mono
        if (audioBuffer.numberOfChannels > 1) {
            const merger = offlineContext.createChannelMerger(1);
            const splitter = offlineContext.createChannelSplitter(audioBuffer.numberOfChannels);
            
            source.connect(splitter);
            
            // Mix all channels to mono (simple average)
            for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
                splitter.connect(merger, i, 0);
            }
            
            merger.connect(offlineContext.destination);
        } else {
            source.connect(offlineContext.destination);
        }
        
        source.start(0);
        
        try {
            const renderedBuffer = await offlineContext.startRendering();
            console.log('Audio resampled:', {
                originalRate: audioBuffer.sampleRate,
                newRate: renderedBuffer.sampleRate,
                originalChannels: audioBuffer.numberOfChannels,
                newChannels: renderedBuffer.numberOfChannels
            });
            return renderedBuffer;
        } catch (error) {
            console.error('Resampling failed:', error);
            throw new Error(`Audio resampling failed: ${error.message}`);
        }
    }

    async translateText(text) {
        const translatorKey = this.azureConfig.translatorKey;
        const translatorRegion = this.azureConfig.translatorRegion;

        console.log('Translation request details:', {
            textLength: text.length,
            hasKey: !!translatorKey,
            keyPrefix: translatorKey ? translatorKey.substring(0, 8) + '...' : 'missing',
            region: translatorRegion
        });

        if (!translatorKey || translatorKey === 'YOUR_TRANSLATOR_KEY') {
            throw new Error('Azure Translator key is not configured.');
        }

        const headers = {
            'Ocp-Apim-Subscription-Key': translatorKey,
            'Content-Type': 'application/json',
            'X-ClientTraceId': this.generateUUID()
        };

        // Add region header if not global
        if (translatorRegion && translatorRegion.toLowerCase() !== 'global') {
            headers['Ocp-Apim-Subscription-Region'] = translatorRegion;
            console.log('Added region header:', translatorRegion);
        }

        console.log('Making translation request to:', `${this.translatorEndpoint}/translate?api-version=3.0&from=en&to=fr`);
        console.log('Request headers:', Object.keys(headers));

        try {
            const response = await fetch(
                `${this.translatorEndpoint}/translate?api-version=3.0&from=en&to=fr`,
                {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify([{ text: text }])
                }
            );

            console.log('Translation response status:', response.status);
            console.log('Translation response headers:', [...response.headers.entries()]);

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('Translation error response:', errorData);
                
                // Provide more specific error messages
                if (response.status === 401) {
                    throw new Error('Authentication failed: Please verify your Azure Translator key and region are correct. Check the Azure portal to ensure the service is active.');
                } else if (response.status === 403) {
                    throw new Error('Access forbidden: Your Azure Translator service may not be properly configured or may have exceeded quota limits.');
                } else if (response.status === 429) {
                    throw new Error('Rate limit exceeded: Too many requests. Please wait a moment and try again.');
                } else {
                    throw new Error(`Translation failed (${response.status}): ${errorData?.error?.message || response.statusText}`);
                }
            }

            const result = await response.json();
            console.log('Translation successful:', result);
            return result[0].translations[0].text;
            
        } catch (fetchError) {
            console.error('Translation fetch error:', fetchError);
            throw new Error(`Translation request failed: ${fetchError.message}`);
        }
    }

    async textToSpeech(text) {
        return new Promise((resolve, reject) => {
            const synthesizer = new SpeechSDK.SpeechSynthesizer(this.speechConfig);

            synthesizer.speakTextAsync(
                text,
                (result) => {
                    if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
                        const audioBlob = new Blob([result.audioData], { type: 'audio/wav' });
                        resolve(audioBlob);
                    } else {
                        reject(new Error(`Speech synthesis failed: ${result.errorDetails}`));
                    }
                    synthesizer.close();
                },
                (error) => {
                    reject(new Error(`Speech synthesis error: ${error}`));
                    synthesizer.close();
                }
            );
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
