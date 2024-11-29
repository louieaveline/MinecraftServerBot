// A mapping of role IDs to language codes. Each role represents a language preference for a user.
const languageRoles = {
  "PT_RoleID": "pt", // Portuguese
  "ES_RoleID": "es", // Spanish
  "FR_RoleID": "fr", // French
  "EN_RoleID": "en", // English
};

/**
 * Retrieves the language of a user based on their roles.
 * This function checks the user's roles to determine their preferred language.
 * If no matching language role is found, it defaults to English ("en").
 * 
 * @param {GuildMember} member - The Discord member object representing the user.
 * @returns {string} - The language code associated with the user's language role (e.g., "pt", "es", "fr", "en").
 */
function getUserLanguage(member) {
  // Ensure the member and their roles are available and properly structured
  if (!member || !member.roles || !member.roles.cache) {
    console.error("Member or roles not found.");
    return "en"; // Default to English if the member or roles are not found
  }

  // Get an array of role IDs from the member's role cache
  const roles = member.roles.cache.map((role) => role.id);

  // Loop through each role ID to check if it matches any of the predefined language roles
  for (const roleId of roles) {
    // If a matching language role is found, return the corresponding language code
    if (languageRoles[roleId]) {
      return languageRoles[roleId];
    }
  }

  // If no language role is found, return the default language (English)
  return "en";
}

module.exports = { languageRoles, getUserLanguage };