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

        if (!speechKey || !speechRegion) {
            context.res.status = 500;
            context.res.body = { 
                error: "Azure Speech Service configuration missing",
                details: "Server configuration error - please contact administrator"
            };
            return;
        }

        // Validate request
        if (!req.body || !req.body.audioData) {
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
        
        // Configure Azure Speech SDK
        const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
        speechConfig.speechRecognitionLanguage = "en-US";
        
        // Try multiple recognition methods for better compatibility
        let recognitionResult = null;
        let lastError = null;

        // Method 1: Try with default audio format (works best for WAV)
        try {
            context.log('Attempting recognition with default format...');
            const audioFormat1 = sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1);
            const pushStream1 = sdk.AudioInputStream.createPushStream(audioFormat1);
            pushStream1.write(audioBuffer);
            pushStream1.close();
            
            const audioConfig1 = sdk.AudioConfig.fromStreamInput(pushStream1);
            const recognizer1 = new sdk.SpeechRecognizer(speechConfig, audioConfig1);
            
            recognitionResult = await new Promise((resolve, reject) => {
                recognizer1.recognizeOnceAsync(
                    (result) => {
                        recognizer1.close();
                        resolve(result);
                    },
                    (error) => {
                        recognizer1.close();
                        reject(error);
                    }
                );
            });
            
            if (recognitionResult.reason === sdk.ResultReason.RecognizedSpeech) {
                context.log('Success with default format');
            } else {
                throw new Error('No speech detected with default format');
            }
            
        } catch (error1) {
            context.log('Default format failed:', error1.message);
            lastError = error1;
            
            // Method 2: Try with compressed audio format (for MP3/M4A)
            try {
                context.log('Attempting recognition with compressed format...');
                const audioFormat2 = sdk.AudioStreamFormat.getCompressedFormat(
                    sdk.AudioStreamContainerFormat.MP3
                );
                const pushStream2 = sdk.AudioInputStream.createPushStream(audioFormat2);
                pushStream2.write(audioBuffer);
                pushStream2.close();
                
                const audioConfig2 = sdk.AudioConfig.fromStreamInput(pushStream2);
                const recognizer2 = new sdk.SpeechRecognizer(speechConfig, audioConfig2);
                
                recognitionResult = await new Promise((resolve, reject) => {
                    recognizer2.recognizeOnceAsync(
                        (result) => {
                            recognizer2.close();
                            resolve(result);
                        },
                        (error) => {
                            recognizer2.close();
                            reject(error);
                        }
                    );
                });
                
                if (recognitionResult.reason === sdk.ResultReason.RecognizedSpeech) {
                    context.log('Success with compressed format');
                } else {
                    throw new Error('No speech detected with compressed format');
                }
                
            } catch (error2) {
                context.log('Compressed format failed:', error2.message);
                
                // Method 3: Try with different sample rates
                try {
                    context.log('Attempting recognition with alternative sample rate...');
                    const audioFormat3 = sdk.AudioStreamFormat.getWaveFormatPCM(8000, 16, 1);
                    const pushStream3 = sdk.AudioInputStream.createPushStream(audioFormat3);
                    pushStream3.write(audioBuffer);
                    pushStream3.close();
                    
                    const audioConfig3 = sdk.AudioConfig.fromStreamInput(pushStream3);
                    const recognizer3 = new sdk.SpeechRecognizer(speechConfig, audioConfig3);
                    
                    recognitionResult = await new Promise((resolve, reject) => {
                        recognizer3.recognizeOnceAsync(
                            (result) => {
                                recognizer3.close();
                                resolve(result);
                            },
                            (error) => {
                                recognizer3.close();
                                reject(error);
                            }
                        );
                    });
                    
                    if (recognitionResult.reason === sdk.ResultReason.RecognizedSpeech) {
                        context.log('Success with alternative sample rate');
                    } else {
                        throw new Error('No speech detected with any format');
                    }
                    
                } catch (error3) {
                    context.log('All recognition methods failed');
                    throw new Error('Could not process audio with any supported format');
                }
            }
        }

        // Process result
        if (recognitionResult && recognitionResult.reason === sdk.ResultReason.RecognizedSpeech) {
            context.log(`Recognized text: ${recognitionResult.text}`);
            context.res.status = 200;
            context.res.body = {
                success: true,
                text: recognitionResult.text,
                confidence: recognitionResult.properties ? recognitionResult.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult) : null
            };
        } else if (recognitionResult && recognitionResult.reason === sdk.ResultReason.NoMatch) {
            context.log(`No speech detected. Reason: ${recognitionResult.reason}, NoMatchReason: ${recognitionResult.noMatchReason}`);
            context.res.status = 400;
            context.res.body = {
                success: false,
                error: "No speech detected",
                details: "Could not detect any speech in the provided audio file. Please ensure the audio contains clear English speech.",
                troubleshooting: {
                    suggestions: [
                        "Check that the audio file contains clear speech",
                        "Ensure the audio is in English",
                        "Try reducing background noise",
                        "Check audio quality and volume",
                        "Supported formats: WAV (recommended), MP3, M4A",
                        "Try converting your audio to WAV format",
                        "Ensure audio is not muted or too quiet"
                    ]
                }
            };
        } else {
            context.log(`Speech recognition failed. Reason: ${recognitionResult?.reason}, Error: ${recognitionResult?.errorDetails}`);
            context.res.status = 500;
            context.res.body = {
                success: false,
                error: "Speech recognition failed",
                details: recognitionResult?.errorDetails || "Unknown error occurred during speech recognition",
                reason: recognitionResult?.reason
            };
        }

    } catch (error) {
        context.log.error('Speech-to-text error:', error);
        context.res.status = 500;
        context.res.body = {
            success: false,
            error: "Internal server error",
            details: error.message
        };
    }
};
