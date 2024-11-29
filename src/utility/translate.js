const fs = require("fs");
const path = require("path");

// Path to the language data file where user language preferences are stored
const LANGUAGE_DATA_PATH = path.join(__dirname, "../data/languageData.json");

// Default language used when the user's language is not set or available
const DEFAULT_LANGUAGE = "en";

// Cache to store translations for performance improvement (avoiding loading the same translations multiple times)
const translationCache = {};

/**
 * Loads translation data for a given language.
 * @param {string} lang - Language code (e.g., "en" for English).
 * @returns {Object} - An object containing the translations for the specified language.
 */
function loadTranslations(lang) {
  // If translations for the specified language are not in the cache, load them from the file
  if (!translationCache[lang]) {
    const filePath = path.join(__dirname, `../locales/${lang}.json`);
    
    try {
      // Check if the translation file exists
      if (fs.existsSync(filePath)) {
        // Read and parse the translation file, then store it in the cache
        translationCache[lang] = JSON.parse(fs.readFileSync(filePath, "utf8"));
      } else {
        // If the file doesn't exist, store an empty object in the cache
        translationCache[lang] = {};
      }
    } catch (error) {
      console.error(`Error loading translation file (${lang}):`, error);
      // In case of error, store an empty object in the cache to prevent future errors
      translationCache[lang] = {};
    }
  }
  
  // Return the translations from the cache
  return translationCache[lang];
}

/**
 * Loads the language data from the languageData.json file.
 * @returns {Object} - An object containing the user language preferences.
 */
function loadLanguageData() {
  // If the language data file doesn't exist, create it with default data
  if (!fs.existsSync(LANGUAGE_DATA_PATH)) {
    fs.writeFileSync(LANGUAGE_DATA_PATH, JSON.stringify({ users: {} }, null, 2));
  }
  
  // Read and parse the language data file
  const data = fs.readFileSync(LANGUAGE_DATA_PATH, "utf8");
  return JSON.parse(data);
}

/**
 * Saves the language data to the languageData.json file.
 * @param {Object} data - The language data to be saved.
 */
function saveLanguageData(data) {
  // Write the language data to the file
  fs.writeFileSync(LANGUAGE_DATA_PATH, JSON.stringify(data, null, 2));
}

/**
 * Retrieves the language preference for a specific user.
 * @param {Object} member - A Discord member object.
 * @returns {string} - The user's language code (e.g., "en").
 */
function getUserLanguage(member) {
  // Load the language data
  const languageData = loadLanguageData();
  const userId = member.id;
  
  // Return the user's language or the default language if the user doesn't have a language set
  return languageData.users[userId] || DEFAULT_LANGUAGE;
}

/**
 * Determines the language preference for a user.
 * @param {Object} member - A Discord member object.
 * @returns {string} - The user's language code.
 */
function determineLanguagePriority(member) {
  // Get the user's language, prioritizing the setting from languageData.json
  return getUserLanguage(member);
}

/**
 * Translates a key into the appropriate language, with support for placeholder replacement.
 * @param {string} key - The translation key (e.g., "help.description").
 * @param {Object} member - A Discord member object used to determine the user's language.
 * @param {Object} [replacements] - An object containing placeholder names and their replacement values.
 * @returns {string} - The translated string with placeholders replaced.
 */
function t(key, member, replacements = {}) {
  // Get the user's language code
  const lang = determineLanguagePriority(member);
  
  // Load the translations for the user's language
  const translations = loadTranslations(lang);
  
  // Split the key into individual parts to traverse the translation object
  const keys = key.split(".");
  
  // Attempt to get the translation for the specified key
  let translation = keys.reduce((obj, k) => (obj ? obj[k] : null), translations);
  
  // If no translation is found, fallback to the default language
  if (!translation) {
    const defaultTranslations = loadTranslations(DEFAULT_LANGUAGE);
    translation = keys.reduce((obj, k) => (obj ? obj[k] : null), defaultTranslations) || key;
  }

  // Replace placeholders in the translation string
  for (const placeholder in replacements) {
    // Escape special characters in the placeholder name for use in a regular expression
    const escapedPlaceholder = placeholder.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");

    // Create a regular expression to match the placeholder in the translation string
    const placeholderRegex = new RegExp(`\\{${escapedPlaceholder}\\}`, "g");

    // Replace all occurrences of the placeholder with its value from the replacements object
    translation = translation.replace(placeholderRegex, replacements[placeholder]);
  }

  // Return the final translated string with placeholders replaced
  return translation;
}

module.exports = { t, determineLanguagePriority, getUserLanguage, saveLanguageData };
