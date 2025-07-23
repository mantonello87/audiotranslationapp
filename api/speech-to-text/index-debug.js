const sdk = require("microsoft-cognitiveservices-speech-sdk");
const { v4: uuidv4 } = require('uuid');

module.exports = async function (context, req) {
    context.log('Speech-to-text function triggered');

    // CORS headers
    context.res = {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        }
    };

    // Handle preflight requests
    if (req.method === "OPTIONS") {
        context.res.status = 200;
        return;
    }

    try {
        // Get Azure Speech Service configuration from environment variables
        const speechKey = process.env.AZURE_SPEECH_KEY;
        const speechRegion = process.env.AZURE_SPEECH_REGION;

        context.log(`Speech Key exists: ${!!speechKey}`);
        context.log(`Speech Region: ${speechRegion}`);

        if (!speechKey || !speechRegion) {
            context.log('Missing Azure Speech Service configuration');
            context.res.status = 500;
            context.res.body = { 
                error: "Azure Speech Service configuration missing",
                details: "Server configuration error - please contact administrator",
                debug: {
                    hasKey: !!speechKey,
                    hasRegion: !!speechRegion
                }
            };
            return;
        }

        // Validate request
        if (!req.body || !req.body.audioData) {
            context.log('Missing audio data in request');
            context.res.status = 400;
            context.res.body = { 
                error: "Missing audio data",
                details: "Please provide audio data in the request body"
            };
            return;
        }

        context.log('Processing audio data...');

        // Convert base64 audio data to buffer
        const audioBuffer = Buffer.from(req.body.audioData, 'base64');
        
        // Log audio buffer info for debugging
        context.log(`Audio buffer size: ${audioBuffer.length} bytes`);
        context.log(`Audio format: ${req.body.format || 'unknown'}`);
        
        // Check if audio buffer is valid
        if (audioBuffer.length === 0) {
            context.res.status = 400;
            context.res.body = {
                success: false,
                error: "Empty audio data",
                details: "The provided audio data is empty"
            };
            return;
        }

        // Configure Azure Speech SDK
        const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
        speechConfig.speechRecognitionLanguage = "en-US";
        
        // Enable detailed logging
        speechConfig.setProperty(sdk.PropertyId.Speech_LogFilename, "speech_sdk.log");
        
        let recognitionResult = null;
        let errors = [];

        // Method 1: Try with 16kHz WAV format (most common)
        try {
            context.log('Attempting Method 1: 16kHz WAV format...');
            
            const audioFormat1 = sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1);
            const pushStream1 = sdk.AudioInputStream.createPushStream(audioFormat1);
            
            pushStream1.write(audioBuffer);
            pushStream1.close();
            
            const audioConfig1 = sdk.AudioConfig.fromStreamInput(pushStream1);
            const recognizer1 = new sdk.SpeechRecognizer(speechConfig, audioConfig1);
            
            recognitionResult = await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Recognition timeout after 30 seconds'));
                }, 30000);
                
                recognizer1.recognizeOnceAsync(
                    (result) => {
                        clearTimeout(timeout);
                        recognizer1.close();
                        context.log(`Method 1 result: ${result.reason}, Text: "${result.text}"`);
                        resolve(result);
                    },
                    (error) => {
                        clearTimeout(timeout);
                        recognizer1.close();
                        context.log(`Method 1 error: ${error}`);
                        reject(new Error(`Method 1 failed: ${error}`));
                    }
                );
            });
            
            if (recognitionResult.reason === sdk.ResultReason.RecognizedSpeech && recognitionResult.text.trim().length > 0) {
                context.log('Method 1 successful!');
            } else {
                throw new Error(`Method 1 no speech: ${recognitionResult.reason}`);
            }
            
        } catch (error1) {
            errors.push(`Method 1 (16kHz WAV): ${error1.message}`);
            context.log(`Method 1 failed: ${error1.message}`);
            
            // Method 2: Try with 8kHz format
            try {
                context.log('Attempting Method 2: 8kHz WAV format...');
                
                const audioFormat2 = sdk.AudioStreamFormat.getWaveFormatPCM(8000, 16, 1);
                const pushStream2 = sdk.AudioInputStream.createPushStream(audioFormat2);
                
                pushStream2.write(audioBuffer);
                pushStream2.close();
                
                const audioConfig2 = sdk.AudioConfig.fromStreamInput(pushStream2);
                const recognizer2 = new sdk.SpeechRecognizer(speechConfig, audioConfig2);
                
                recognitionResult = await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Recognition timeout after 30 seconds'));
                    }, 30000);
                    
                    recognizer2.recognizeOnceAsync(
                        (result) => {
                            clearTimeout(timeout);
                            recognizer2.close();
                            context.log(`Method 2 result: ${result.reason}, Text: "${result.text}"`);
                            resolve(result);
                        },
                        (error) => {
                            clearTimeout(timeout);
                            recognizer2.close();
                            context.log(`Method 2 error: ${error}`);
                            reject(new Error(`Method 2 failed: ${error}`));
                        }
                    );
                });
                
                if (recognitionResult.reason === sdk.ResultReason.RecognizedSpeech && recognitionResult.text.trim().length > 0) {
                    context.log('Method 2 successful!');
                } else {
                    throw new Error(`Method 2 no speech: ${recognitionResult.reason}`);
                }
                
            } catch (error2) {
                errors.push(`Method 2 (8kHz WAV): ${error2.message}`);
                context.log(`Method 2 failed: ${error2.message}`);
                
                // Method 3: Try with default format and no specific configuration
                try {
                    context.log('Attempting Method 3: Default format...');
                    
                    const pushStream3 = sdk.AudioInputStream.createPushStream();
                    pushStream3.write(audioBuffer);
                    pushStream3.close();
                    
                    const audioConfig3 = sdk.AudioConfig.fromStreamInput(pushStream3);
                    const recognizer3 = new sdk.SpeechRecognizer(speechConfig, audioConfig3);
                    
                    recognitionResult = await new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            reject(new Error('Recognition timeout after 30 seconds'));
                        }, 30000);
                        
                        recognizer3.recognizeOnceAsync(
                            (result) => {
                                clearTimeout(timeout);
                                recognizer3.close();
                                context.log(`Method 3 result: ${result.reason}, Text: "${result.text}"`);
                                resolve(result);
                            },
                            (error) => {
                                clearTimeout(timeout);
                                recognizer3.close();
                                context.log(`Method 3 error: ${error}`);
                                reject(new Error(`Method 3 failed: ${error}`));
                            }
                        );
                    });
                    
                    if (recognitionResult.reason === sdk.ResultReason.RecognizedSpeech && recognitionResult.text.trim().length > 0) {
                        context.log('Method 3 successful!');
                    } else {
                        throw new Error(`Method 3 no speech: ${recognitionResult.reason}`);
                    }
                    
                } catch (error3) {
                    errors.push(`Method 3 (Default): ${error3.message}`);
                    context.log(`Method 3 failed: ${error3.message}`);
                    
                    // All methods failed
                    throw new Error('All recognition methods failed');
                }
            }
        }

        // Process successful result
        if (recognitionResult && recognitionResult.reason === sdk.ResultReason.RecognizedSpeech) {
            const recognizedText = recognitionResult.text.trim();
            context.log(`Successfully recognized text: "${recognizedText}"`);
            
            if (recognizedText.length === 0) {
                context.res.status = 400;
                context.res.body = {
                    success: false,
                    error: "Empty recognition result",
                    details: "Speech was detected but no text was recognized",
                    debug: {
                        reason: recognitionResult.reason,
                        rawText: recognitionResult.text,
                        attempts: errors
                    }
                };
                return;
            }
            
            context.res.status = 200;
            context.res.body = {
                success: true,
                text: recognizedText,
                confidence: recognitionResult.properties ? recognitionResult.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult) : null,
                debug: {
                    reason: recognitionResult.reason,
                    attempts: errors.length,
                    audioSize: audioBuffer.length
                }
            };
            
        } else {
            // No speech detected
            context.log(`No speech detected. Reason: ${recognitionResult?.reason}`);
            context.res.status = 400;
            context.res.body = {
                success: false,
                error: "No speech detected",
                details: "Could not detect any speech in the provided audio file",
                debug: {
                    reason: recognitionResult?.reason,
                    noMatchReason: recognitionResult?.noMatchReason,
                    errorDetails: recognitionResult?.errorDetails,
                    attempts: errors,
                    audioSize: audioBuffer.length,
                    audioFormat: req.body.format
                },
                troubleshooting: {
                    suggestions: [
                        "Ensure the audio contains clear English speech",
                        "Check that the audio is not muted or too quiet",
                        "Try reducing background noise",
                        "Verify the audio file is not corrupted",
                        "Use WAV format if possible",
                        "Try the audio-converter.html tool to convert your file"
                    ],
                    technicalInfo: {
                        allMethodsFailed: errors.length === 3,
                        azureConfigured: !!speechKey && !!speechRegion,
                        audioDataReceived: audioBuffer.length > 0
                    }
                }
            };
        }

    } catch (error) {
        context.log.error('Speech-to-text critical error:', error);
        context.res.status = 500;
        context.res.body = {
            success: false,
            error: "Internal server error",
            details: error.message,
            debug: {
                stack: error.stack,
                azureConfigured: !!(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION)
            }
        };
    }
};
