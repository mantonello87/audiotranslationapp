const { BlobServiceClient } = require("@azure/storage-blob");
const sdk = require("microsoft-cognitiveservices-speech-sdk");

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
        
        // Configure Azure Speech SDK
        const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
        speechConfig.speechRecognitionLanguage = "en-US";

        // Create audio config from buffer
        const pushStream = sdk.AudioInputStream.createPushStream();
        pushStream.write(audioBuffer);
        pushStream.close();

        const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
        const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

        // Perform speech recognition
        const result = await new Promise((resolve, reject) => {
            recognizer.recognizeOnceAsync(
                (result) => {
                    recognizer.close();
                    resolve(result);
                },
                (error) => {
                    recognizer.close();
                    reject(error);
                }
            );
        });

        // Process result
        if (result.reason === sdk.ResultReason.RecognizedSpeech) {
            context.log(`Recognized text: ${result.text}`);
            context.res.status = 200;
            context.res.body = {
                success: true,
                text: result.text,
                confidence: result.properties ? result.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult) : null
            };
        } else if (result.reason === sdk.ResultReason.NoMatch) {
            context.res.status = 400;
            context.res.body = {
                success: false,
                error: "No speech detected",
                details: "Could not detect any speech in the provided audio file"
            };
        } else {
            context.res.status = 500;
            context.res.body = {
                success: false,
                error: "Speech recognition failed",
                details: result.errorDetails || "Unknown error occurred during speech recognition"
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
