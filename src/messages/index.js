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
if (LANGUAGE !== "en" && !languages[LANGUAGE]) {
  console.warn(
    `⚠️  Language '${LANGUAGE}' not found. Falling back to English.`
  );
} else {
  console.log(
    `🌍 Bot language: ${
      LANGUAGE === "en"
        ? "English"
        : LANGUAGE === "el"
        ? "Greek (Ελληνικά)"
        : LANGUAGE
    }`
  );
}
