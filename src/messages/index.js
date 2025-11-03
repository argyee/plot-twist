/**
 * Language Loader
 * Automatically loads the correct language file based on LANGUAGE environment variable
 *
 * Supported languages:
 * - en (English) - Default
 * - el (Greek - Ελληνικά)
 *
 * Usage:
 * Set LANGUAGE=el in .env to use Greek
 * Set LANGUAGE=en in .env to use English (or leave unset for default)
 */

const LANGUAGE = process.env.LANGUAGE || "en";

const languages = {
    en: require("./en"),
    el: require("./el"),
};

// Export the selected language, fallback to English if language not found
module.exports = languages[LANGUAGE] || languages.en;

// Log which language is being used (helpful for debugging)
// Note: Logger is imported after module.exports to avoid circular dependency
// but it should be initialized by the time this code runs
try {
    const logger = require("../utils/logger");

    if (LANGUAGE !== "en" && !languages[LANGUAGE]) {
        logger.warn("Language not found, falling back to English", {
            requestedLanguage: LANGUAGE,
            fallbackLanguage: "en",
        });
    } else {
        const languageNames = {
            en: "English",
            el: "Greek (Ελληνικά)",
        };
        logger.info("Bot language loaded", {
            language: LANGUAGE,
            languageName: languageNames[LANGUAGE] || LANGUAGE,
        });
    }
} catch (error) {
    // Fallback to console if logger is not yet available
    console.log(`🌍 Bot language: ${LANGUAGE}`);
}
