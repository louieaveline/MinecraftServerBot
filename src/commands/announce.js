const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
  PermissionsBitField,
} = require("discord.js"); // Importing necessary modules from discord.js
const data = require("../data/data.json"); // Loading data, including authorized users and channel information
const { getUserLanguage } = require("../utility/roles"); // Function to get user's language based on roles
const { t } = require("../utility/translate"); // Translation function for localized messages

module.exports = {
  // Command setup using SlashCommandBuilder
  data: new SlashCommandBuilder()
    .setName("announce") // Command name
    .setDescription("Create an announcement to be sent on a specific channel.") // Command description
    .addChannelOption((option) =>
      option
        .setName("channel") // Channel option to specify where to send the announcement
        .setDescription("Channel where the announcement will be sent.")
        .setRequired(true) // This option is required
    )
    .addStringOption((option) =>
      option
        .setName("embed") // Option to specify if the announcement will be sent as an embed
        .setDescription("Whether to send as an embed. Choose “yes” or “no”.")
        .setRequired(false) // This option is not required
        .addChoices({ name: "Yes", value: "yes" }, { name: "No", value: "no" }) // Choices for embed option
    ),

  // Command execution logic
  async execute(interaction) {
    // Getting the user's language
    const lang = await getUserLanguage(interaction.user.id);

    // Checking if the user is authorized to execute the command (either admin or in the authorized user list)
    const authorizedUsers = data.admin_ids;
    if (
      !authorizedUsers.includes(interaction.user.id) &&
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      return interaction.reply({
        content: t("announce.noPermission", interaction.member, lang), // Responding if the user lacks permission
        ephemeral: true, // Reply is only visible to the user
      });
    }

    // Channel IDs for allowed command usage
    const privateChannelID = data.second_guild.command_channel;
    const admChannelID = "1287972783288225854"; // Example channel ID for admin announcements

    // Verifying if the command is being executed in the correct channel
    if (interaction.channel.id !== privateChannelID && interaction.channel.id !== admChannelID) {
      return interaction.reply({
        content: t("mark.wrong_channel", interaction.member, lang), // Error message if the channel is wrong
        ephemeral: true, // Reply is only visible to the user
      });
    }

    // Getting the selected channel for the announcement and the embed option value
    const selectedChannel = interaction.options.getChannel("channel");
    const useEmbed = interaction.options.getString("embed") === "yes";

    // Asking the user for the announcement text
    await interaction.reply({
      content: t("announce.askForText", interaction.member, lang),
      ephemeral: true,
    });

    // Setting up a message collector to collect the announcement text from the user
    const filter = (response) => response.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({
      filter,
      time: 60000, // Collector will stop after 1 minute
    });

    collector.on("collect", async (message) => {
      collector.stop(); // Stop collecting after receiving the first message

      // Splitting the message into lines
      const lines = message.content.split("\n");
      let footerText = ""; // Variable for footer text if specified by the user
      let announcementText = ""; // Variable for the main announcement text

      // Processing each line for footer and announcement content
      lines.forEach((line) => {
        if (line.startsWith("//footer")) {
          footerText = line.replace("//footer", "").trim(); // Extract footer if it starts with //footer
        } else {
          announcementText += line + "\n"; // Adding to the main announcement text
        }
      });

      // Collecting any attachments the user sent with the message
      const attachments = message.attachments.map(
        (att) => new AttachmentBuilder(att.url, { name: att.name })
      );

      // Informing the user that the announcement is being sent
      await interaction.followUp({
        content: t("announce.announcementSending", interaction.member, lang),
        ephemeral: true,
      });

      try {
        // Sending the announcement
        if (useEmbed) {
          // Creating an embedded message if the user selected "yes" for the embed
          const embed = new EmbedBuilder()
            .setDescription(announcementText.trim()) // Setting the main announcement text
            .setColor("#0099ff"); // Setting the embed color

          // Adding an image to the embed if there are any attachments
          if (attachments.length > 0) {
            embed.setImage(`attachment://${attachments[0].name}`);
          }

          // Adding footer text if specified by the user
          if (footerText) {
            embed.setFooter({ text: footerText });
          }

          // Sending the embed along with any attachments
          await selectedChannel.send({ embeds: [embed], files: attachments });
        } else {
          // Sending the announcement as plain text if no embed is selected
          await selectedChannel.send({ content: announcementText.trim() });

          // Sending attachments separately if there are any
          for (const attachment of attachments) {
            await selectedChannel.send({ files: [attachment] });
          }
        }

        // Informing the user that the announcement was successfully sent
        await interaction.followUp({
          content: t("announce.announcementSuccess", interaction.member, lang),
          ephemeral: true,
        });

        // Deleting the user's message containing the announcement text
        await message.delete();
      } catch (error) {
        // Handling any errors that occur during the announcement process
        await interaction.followUp({
          content: t("announce.errorSending", interaction.member, lang),
          ephemeral: true,
        });
      }
    });

    collector.on("end", (collected) => {
      // If no message was collected within the given time, inform the user
      if (collected.size === 0) {
        interaction.followUp({
          content: t("announce.timeExpired", interaction.member, lang),
          ephemeral: true,
        });
      }
    });
  },
};