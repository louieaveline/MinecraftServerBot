const { SlashCommandBuilder } = require("discord.js"); // Importing necessary classes from discord.js
const { first_guild } = require("../data/data.json");  // Importing the first guild ID from the configuration file
const { languageRoles } = require("../utility/roles"); // Importing language roles mapping
const fs = require("fs"); // File system module to read and write files
const path = require("path"); // Path module for working with file paths
const { t } = require("../utility/translate"); // Translation function to handle multi-language support

const languageDataPath = path.join(__dirname, "../data/languageData.json"); // Path to the language data file

// Function to load the language data from the languageData.json file
function loadLanguageData() {
  try {
    const data = fs.readFileSync(languageDataPath, "utf8"); // Read the file content
    return JSON.parse(data); // Parse the JSON data
  } catch (error) {
    console.error("Erro ao carregar o arquivo de dados de idioma:", error); // Log error if reading the file fails
    return { users: {} }; // Return default structure in case of an error (empty users object)
  }
}

// Function to save the updated language data to the languageData.json file
function saveLanguageData(data) {
  try {
    fs.writeFileSync(languageDataPath, JSON.stringify(data, null, 2), "utf8"); // Write JSON data to the file
  } catch (error) {
    console.error("Erro ao salvar o arquivo de dados de idioma:", error); // Log error if writing the file fails
  }
}

module.exports = {
  data: new SlashCommandBuilder() // Build the slash command
    .setName("setlanguage") // Set the command name
    .setDescription("Sets the user language.") // Set the description of the command
    .addStringOption((option) => // Add an option to select the language
      option
        .setName("language") // Name of the option
        .setDescription("Select your language") // Description for the user
        .setRequired(true) // Make the option required
        .addChoices( // Provide available language choices
          { name: "Portuguese", value: "pt" },
          { name: "Spanish", value: "es" },
          { name: "French", value: "fr" },
          { name: "English", value: "en" }
        )
    ),

  async execute(interaction) { // Define the command execution logic
    const member = interaction.member; // Get the member who invoked the command
    const selectedLanguage = interaction.options.getString("language"); // Get the selected language from the command options

    // Load the language data from the file
    const languageData = loadLanguageData();
    
    // Check if the command is executed in the correct guild (server)
    if (interaction.guild.id !== first_guild.guildID) {
      const userLanguage = languageData.users[member.id] || "en"; // Get the current language of the user or default to "en"
      const translatedMessage = t("setlanguage.notInPublicServer", member, { lang: userLanguage }); // Translate the error message
      return interaction.reply({
        content: translatedMessage, // Send the translated error message
        ephemeral: true, // Make the message visible only to the user
      });
    }

    // Get the current language of the user or default to "en"
    const currentLanguage = languageData.users[member.id] || "en";

    // Check if the selected language is different from the current language
    if (selectedLanguage === currentLanguage) {
      const translatedMessage = t("setlanguage.alreadyInSelectedLanguage", member, { lang: selectedLanguage });
      return interaction.reply({
        content: translatedMessage, // Send a message saying the user already has the selected language
        ephemeral: true, // Make the message visible only to the user
      });
    }

    // Find the ID of the role corresponding to the selected language
    const newLanguageRoleID = Object.keys(languageRoles).find(
      (roleId) => languageRoles[roleId] === selectedLanguage // Find the role that matches the selected language
    );
    const newLanguageRole = member.guild.roles.cache.get(newLanguageRoleID); // Get the role object

    // Add the new language role to the user if it exists
    if (newLanguageRole) {
      await member.roles.add(newLanguageRole); // Add the role to the member
    }

    // Update the user's language in the languageData.json file
    languageData.users[member.id] = selectedLanguage;
    saveLanguageData(languageData); // Save the updated language data

    // Send a confirmation message to the user that their language has been changed
    const translatedMessage = t("setlanguage.languageChanged", member, { lang: selectedLanguage });
    return interaction.reply({
      content: translatedMessage, // Send the translated confirmation message
      ephemeral: true, // Make the message visible only to the user
    });
  },
};