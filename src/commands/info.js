const { SlashCommandBuilder, EmbedBuilder } = require("discord.js"); // Importing necessary modules from discord.js
const fs = require("fs"); // File system module for reading and writing files
const path = require("path"); // Module to handle file and directory paths
const data = require("../data/data.json"); // Importing data from a JSON file
const { logCommand } = require("../utility/logger"); // Importing logging utility
const { getUserLanguage } = require("../utility/roles"); // Importing function to get user language based on roles
const { t } = require("../utility/translate"); // Importing translation utility

const logChannelID = data.channel_ids.log_channel; // Channel ID for logging command usage

module.exports = {
  // Setting up the slash command
  data: new SlashCommandBuilder()
    .setName("info") // Command name
    .setDescription("Displays the task status report for all users."), // Command description

  // Command execution logic
  async execute(interaction) {
    // Getting the channel ID where the command can be used
    const reportChannelID = data.first_guild.command_channel;
    const privateChannelID = data.second_guild.command_channel;

    // Checking if the command is being executed in the correct channel
    const userLang = await getUserLanguage(interaction.member) || "en"; // Ensuring the correct user language is fetched
    if (
      interaction.channel.id !== reportChannelID &&
      interaction.channel.id !== privateChannelID
    ) {
      return interaction.reply({
        content: t("mark.wrong_channel", interaction.member, { lang: userLang }), // Providing translated error message
        ephemeral: true, // Reply visible only to the user
      });
    }

    // Function for translating keys based on the user's language
    const translated = (key) => t(key, interaction.member, { lang: userLang });

    const statusPath = path.join(__dirname, "../tasksStatus.json"); // Path to the tasks status JSON file
    let taskStatus = {}; // Variable to hold the tasks status

    // Logging the command execution
    await logCommand(interaction, logChannelID);

    try {
      // Checking if the tasks status file exists and loading it
      if (fs.existsSync(statusPath)) {
        taskStatus = JSON.parse(fs.readFileSync(statusPath, "utf8"));
      }
    } catch (error) {
      console.error("Error reading tasksStatus.json file:", error);
      return interaction.reply({
        content: translated("admtask.error_reading_file"), // Providing translated error message
        ephemeral: true, // Reply visible only to the user
      });
    }

    const users = data.users; // Fetching users data from the JSON file
    const completedUsers = []; // Array to store users who have completed all tasks
    const notCompletedUsers = []; // Array to store users who haven't completed all tasks

    // Processing the task status for each user
    for (const [userID, userName] of Object.entries(users)) {
      const tasks = taskStatus[userID] || { 1: false, 2: false, 3: false }; // Default task status if not found

      // If all tasks are completed, add the user to the completedUsers array
      if (tasks["1"] && tasks["2"] && tasks["3"]) {
        completedUsers.push(userName);
      } else {
        notCompletedUsers.push(userName); // If not all tasks are completed, add to notCompletedUsers
      }
    }

    // Formatting the text for completed and not completed users
    const completedText =
      completedUsers.length > 0
        ? completedUsers.join(", ") // Joining user names into a comma-separated string
        : translated("report.none"); // Default message if no users have completed all tasks
    const notCompletedText =
      notCompletedUsers.length > 0
        ? notCompletedUsers.join(", ") // Joining user names into a comma-separated string
        : translated("report.none"); // Default message if no users are missing tasks

    // Creating the embed message for the response
    const embed = new EmbedBuilder()
      .setTitle(translated("report.task_update")) // Setting the title of the embed
      .setColor("#0099ff") // Setting the color of the embed
      .addFields(
        {
          name: translated("report.completed_all"), // Title for the completed tasks section
          value: completedText, // Listing users who completed all tasks
          inline: false, // Display the field as a block (not inline)
        },
        {
          name: translated("report.missing_some"), // Title for the not completed tasks section
          value: notCompletedText, // Listing users who haven't completed all tasks
          inline: false, // Display the field as a block (not inline)
        }
      );

    // Sending the embed as a reply to the user
    try {
      await interaction.reply({ embeds: [embed] }); // Sending the embed message
    } catch (error) {
      console.error("Error sending embed message:", error);
      return interaction.reply({
        content: translated("admtask.error_updating_file"), // Providing translated error message
        ephemeral: true, // Reply visible only to the user
      });
    }
  },
};
