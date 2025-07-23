const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

module.exports = async function (context, req) {
    context.log('Translation function triggered');

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
        // Get Azure Translator configuration from environment variables
        const translatorKey = process.env.AZURE_TRANSLATOR_KEY;
        const translatorRegion = process.env.AZURE_TRANSLATOR_REGION;

        if (!translatorKey) {
            context.res.status = 500;
            context.res.body = { 
                error: "Azure Translator configuration missing",
                details: "Server configuration error - please contact administrator"
            };
            return;
        }

        // Validate request
        if (!req.body || !req.body.text) {
            context.res.status = 400;
            context.res.body = { 
                error: "Missing text to translate",
                details: "Please provide text in the request body"
            };
            return;
        }

        const { text, from = 'en', to = 'fr' } = req.body;
        
        context.log(`Translating text from ${from} to ${to}: ${text.substring(0, 100)}...`);

        // Prepare headers
        const headers = {
            'Ocp-Apim-Subscription-Key': translatorKey,
            'Content-Type': 'application/json',
            'X-ClientTraceId': uuidv4()
        };

        // Add region header if specified
        if (translatorRegion && translatorRegion.toLowerCase() !== 'global') {
            headers['Ocp-Apim-Subscription-Region'] = translatorRegion;
        }

        // Call Azure Translator API
        const translatorEndpoint = 'https://api.cognitive.microsofttranslator.com';
        const response = await fetch(
            `${translatorEndpoint}/translate?api-version=3.0&from=${from}&to=${to}`,
            {
                method: 'POST',
                headers: headers,
                body: JSON.stringify([{ text: text }])
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            context.log.error('Translation API error:', {
                status: response.status,
                statusText: response.statusText,
                error: errorData
            });

            let errorMessage = "Translation failed";
            if (response.status === 401) {
                errorMessage = "Authentication failed with translation service";
            } else if (response.status === 403) {
                errorMessage = "Translation service access denied";
            } else if (response.status === 429) {
                errorMessage = "Translation rate limit exceeded";
            }

            context.res.status = response.status;
            context.res.body = {
                success: false,
                error: errorMessage,
                details: errorData?.error?.message || response.statusText
            };
            return;
        }

        const result = await response.json();
        const translatedText = result[0]?.translations?.[0]?.text;

        if (!translatedText) {
            context.res.status = 500;
            context.res.body = {
                success: false,
                error: "Translation result invalid",
                details: "No translation text returned from service"
            };
            return;
        }

        context.log(`Translation successful: ${translatedText.substring(0, 100)}...`);

        context.res.status = 200;
        context.res.body = {
            success: true,
            originalText: text,
            translatedText: translatedText,
            fromLanguage: from,
            toLanguage: to
        };

    } catch (error) {
        context.log.error('Translation error:', error);
        context.res.status = 500;
        context.res.body = {
            success: false,
            error: "Internal server error",
            details: error.message
        };
    }
};
