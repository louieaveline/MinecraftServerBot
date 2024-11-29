const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js"); // Importing necessary modules from discord.js
const fs = require("fs"); // File system module for reading and writing files
const path = require("path"); // Path module for working with file and directory paths
const data = require("../data/data.json"); // Loading user data from the data file
const { getUserLanguage } = require("../utility/roles"); // Importing function to get user language based on roles
const { t } = require("../utility/translate"); // Importing translation function

module.exports = {
  // Defining the command structure for "/admtask"
  data: new SlashCommandBuilder()
    .setName("admtask") // The name of the command
    .setDescription("Update the status of a task for a user.") // Description of the command
    .addStringOption((option) =>
      option
        .setName("mascot") // Option to select a "mascot" (user)
        .setDescription("Select the mascot to update the task.")
        .setRequired(true) // This option is required
        .addChoices(
          // Adding choices dynamically based on the users from data.json
          ...Object.entries(data.users).map(([userID, userName]) => ({
            name: userName, // Displayed name of the user
            value: userID, // ID of the user to identify them
          }))
        )
    )
    .addIntegerOption((option) =>
      option
        .setName("task_number") // Option to select the task number (1, 2, or 3)
        .setDescription("Number of the task to be updated (1, 2, 3)")
        .setRequired(true) // This option is required
    )
    .addStringOption((option) =>
      option
        .setName("action") // Option to choose the action for the task (e.g., "cancel")
        .setDescription("Action to be taken: “cancel” to mark the task as not completed.")
    ),

  async execute(interaction) {
    // Getting the user's language based on their roles
    const lang = await getUserLanguage(interaction.member);

    // Checking if the user has Administrator permissions
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      return interaction.reply({
        content: t("errors.no_permission", interaction.member, lang), // Responding with an error message if no permission
        ephemeral: true, // Making the response visible only to the user
      });
    }

    // Getting the channel IDs where the command can be used
    const reportChannelID = data.first_guild.report_channel;
    const privateChannelID = data.second_guild.command_channel;

    // Verifying if the command is being executed in the correct channel
    if (
      interaction.channel.id !== reportChannelID &&
      interaction.channel.id !== privateChannelID
    ) {
      return interaction.reply({
        content: t("mark.wrong_channel", interaction.member, lang), // Informing the user if they are in the wrong channel
        ephemeral: true, // Making the response visible only to the user
      });
    }

    // Extracting the task number, action, and mascot (user) from the options
    const taskNumber = interaction.options.getInteger("task_number");
    const action = interaction.options.getString("action");
    const userID = interaction.options.getString("mascot");
    const userName = data.users[userID];

    // Validating if the task number is valid (1, 2, or 3)
    if (![1, 2, 3].includes(taskNumber)) {
      return interaction.reply({
        content: t("errors.invalid_task", interaction.member, lang), // Informing the user about the invalid task
        ephemeral: true,
      });
    }

    // Loading the task status from the tasksStatus.json file
    const statusPath = path.join(__dirname, "../tasksStatus.json");
    let taskStatus = {};

    try {
      if (fs.existsSync(statusPath)) {
        taskStatus = JSON.parse(fs.readFileSync(statusPath, "utf8"));
      }
    } catch (error) {
      return interaction.reply({
        content: t("errors.read_file_error", interaction.member, lang), // Responding if there was an error reading the file
        ephemeral: true,
      });
    }

    // Initializing the user's task status if not already present
    if (!taskStatus[userID]) {
      taskStatus[userID] = { 1: false, 2: false, 3: false }; // Setting the default status of all tasks to "not completed"
    }

    // Updating the task status based on the action (either cancel or complete)
    if (action === "cancel") {
      taskStatus[userID][taskNumber] = false; // Marking the task as not completed
    } else {
      taskStatus[userID][taskNumber] = true; // Marking the task as completed
    }

    // Writing the updated task status to the file
    try {
      fs.writeFileSync(statusPath, JSON.stringify(taskStatus, null, 2));
    } catch (error) {
      return interaction.reply({
        content: t("errors.update_task_error", interaction.member, lang), // Responding if there was an error updating the task status
        ephemeral: true,
      });
    }

    // Creating an embed message to confirm the task update
    const embed = new EmbedBuilder()
      .setTitle(t("admtask.task_updated", interaction.member, lang)) // Setting the title of the embed
      .setDescription(
        `${t("admtask.task_number", interaction.member, lang)} ${taskNumber} ${
          action === "cancel"
            ? t("admtask.task_cancelled", interaction.member, lang) // Description for cancel action
            : t("admtask.task_completed", interaction.member, lang) // Description for completed action
        } ${userName}!` // Displaying the user who the task was updated for
      )
      .setColor(action === "cancel" ? "#FF0000" : "#00FF00"); // Setting the embed color based on the action (red for cancel, green for complete)

    // Sending the embed as a response to the interaction
    await interaction.reply({ embeds: [embed] });
  },
};
