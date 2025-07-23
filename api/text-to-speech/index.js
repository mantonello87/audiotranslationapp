const sdk = require("microsoft-cognitiveservices-speech-sdk");

module.exports = async function (context, req) {
    context.log('Text-to-speech function triggered');

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
        if (!req.body || !req.body.text) {
            context.res.status = 400;
            context.res.body = { 
                error: "Missing text to synthesize",
                details: "Please provide text in the request body"
            };
            return;
        }

        const { text, language = 'fr-FR', voice = 'fr-FR-DeniseNeural' } = req.body;
        
        context.log(`Synthesizing speech for text: ${text.substring(0, 100)}...`);

        // Configure Azure Speech SDK
        const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
        speechConfig.speechSynthesisLanguage = language;
        speechConfig.speechSynthesisVoiceName = voice;

        // Create synthesizer
        const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

        // Perform speech synthesis
        const result = await new Promise((resolve, reject) => {
            synthesizer.speakTextAsync(
                text,
                (result) => {
                    synthesizer.close();
                    resolve(result);
                },
                (error) => {
                    synthesizer.close();
                    reject(error);
                }
            );
        });

        // Process result
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            context.log('Speech synthesis completed successfully');
            
            // Convert audio data to base64
            const audioBase64 = Buffer.from(result.audioData).toString('base64');
            
            context.res.status = 200;
            context.res.body = {
                success: true,
                audioData: audioBase64,
                format: 'wav',
                language: language,
                voice: voice
            };
        } else {
            context.log.error('Speech synthesis failed:', result.errorDetails);
            context.res.status = 500;
            context.res.body = {
                success: false,
                error: "Speech synthesis failed",
                details: result.errorDetails || "Unknown error occurred during speech synthesis"
            };
        }

    } catch (error) {
        context.log.error('Text-to-speech error:', error);
        context.res.status = 500;
        context.res.body = {
            success: false,
            error: "Internal server error",
            details: error.message
        };
    }
};
