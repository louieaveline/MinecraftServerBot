const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js"); // Importing necessary modules from discord.js
const fs = require("fs"); // Importing file system module for reading and writing files
const path = require("path"); // Importing path module for handling file paths
const data = require("../data/data.json"); // Importing data (e.g., user information) from a JSON file
const { getUserLanguage } = require("../utility/roles"); // Function to get user's language
const { t } = require("../utility/translate"); // Function to translate based on user language

module.exports = {
  // Setting up the "resetalltasks" command
  data: new SlashCommandBuilder()
    .setName("resetalltasks") // Command name
    .setDescription("Sets all tasks for all users to unfinished."), // Command description

  async execute(interaction) {
    // Check if the user has administrator permissions
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      return interaction.reply({
        content: "You don't have permission to use this command.",
        ephemeral: true, // Reply is visible only to the user who issued the command
      });
    }

    // Check if the command is being used in the correct channel
    if (
      interaction.channel.id !== data.second_guild.command_channel &&
      interaction.channel.id !== data.first_guild.report_channel
    ) {
      return interaction.reply({
        content: "This command cannot be used on this channel.",
        ephemeral: true, // Reply is visible only to the user who issued the command
      });
    }

    // Define the path to the task status file
    const statusPath = path.join(__dirname, "../tasksStatus.json");
    let taskStatus = {};

    try {
      // Attempt to read the status of tasks from the file
      if (fs.existsSync(statusPath)) {
        taskStatus = JSON.parse(fs.readFileSync(statusPath, "utf8"));
      }
    } catch (error) {
      console.error("Error reading the tasksStatus.json file:", error);
      return interaction.reply({
        content: "Error reading the task status file.",
        ephemeral: true, // Reply is visible only to the user who issued the command
      });
    }

    // Reset the task status for all users to "not completed" (false)
    for (const userID in data.users) {
      taskStatus[userID] = { 1: false, 2: false, 3: false }; // Reset all tasks for each user
    }

    try {
      // Save the updated task status back to the file
      fs.writeFileSync(statusPath, JSON.stringify(taskStatus, null, 2));
    } catch (error) {
      console.error("Error updating the tasksStatus.json file:", error);
      return interaction.reply({
        content: "Error when updating the status of tasks.",
        ephemeral: true, // Reply is visible only to the user who issued the command
      });
    }

    // Create an embed message to confirm the reset action
    const embed = new EmbedBuilder()
      .setTitle("Tasks reset") // Title of the embed
      .setDescription("All tasks have been set to not completed for all users.") // Description of the action performed
      .setColor("#FF0000"); // Red color to indicate that all tasks were reset

    // Send the confirmation embed as a reply
    await interaction.reply({ embeds: [embed] });
  },
};