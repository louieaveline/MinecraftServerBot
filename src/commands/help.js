const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js"); // Importing necessary modules from discord.js
const { determineLanguagePriority, t } = require("../utility/translate"); // Importing translation utilities

module.exports = {
  // Setting up the command using SlashCommandBuilder
  data: new SlashCommandBuilder()
    .setName("help") // Command name
    .setDescription("List all available commands."), // Command description

  // Command execution logic
  async execute(interaction) {
    // Getting the user's language based on their role priority
    const userLanguage = await determineLanguagePriority(interaction.member);

    // Local function to facilitate translations
    const translator = (key, replacements) => t(key, interaction.member, userLanguage, replacements);

    // Translated title and description for the help message
    const title = translator("help.title");
    const description = translator("help.description");

    // List of user commands with their descriptions
    const userCommands = [
      { name: "**/status**", value: translator("help.user.status") },
      { name: "**/info**", value: translator("help.user.report") },
      { name: "**/setlanguage**", value: translator("help.user.setlanguage") },
    ];

    // List of admin commands with their descriptions
    const adminCommands = [
      { name: "**/mark**", value: translator("help.admin.mark_task") },
      { name: "**/admtask**", value: translator("help.admin.admin_task") },
      { name: "**/announce**", value: translator("help.admin.announce") },
      { name: "**/userinfo**", value: translator("help.admin.user_info") },
    ];

    // Creating a translated embed message
    const embed = new EmbedBuilder()
      .setTitle(title) // Setting the title of the embed
      .setDescription(description) // Setting the description of the embed
      .setColor("#0099ff") // Setting the embed color
      .setFooter({
        text: translator("help.footer"), // Adding footer text
      });

    // Adding user commands to the embed
    embed.addFields({
      name: translator("help.section.user"), // Section title for user commands
      value: userCommands.map((cmd) => `${cmd.name}: ${cmd.value}`).join("\n"), // Formatting the user commands list
    });

    // Check if the member has admin permissions and add admin commands if they do
    if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      embed.addFields({
        name: translator("help.section.admin"), // Section title for admin commands
        value: adminCommands.map((cmd) => `${cmd.name}: ${cmd.value}`).join("\n"), // Formatting the admin commands list
      });
    }

    // Sending the embed as a reply to the user
    await interaction.reply({
      embeds: [embed], // Embedding the generated message
      ephemeral: true, // Making the reply visible only to the user who invoked the command
    });
  },
};