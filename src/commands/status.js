const { SlashCommandBuilder } = require("@discordjs/builders"); // Importing SlashCommandBuilder for creating the slash command
const { EmbedBuilder } = require("discord.js"); // Importing EmbedBuilder to create rich embeds for messages
const axios = require("axios"); // Axios for making HTTP requests
const moment = require("moment-timezone"); // Moment.js for handling timezones and formatting
const data = require("../data/data.json"); // Importing data, including channel IDs and configuration
const { logCommand } = require("../utility/logger"); // Function to log commands to a specific channel
const { getUserLanguage } = require("../utility/roles"); // Function to get the user's language
const { t } = require("../utility/translate"); // Translation function to provide localized responses

const logChannelID = data.channel_ids.log_channel; // Channel ID where command logs will be sent

module.exports = {
  data: new SlashCommandBuilder() // Create a new slash command using SlashCommandBuilder
    .setName("status") // Command name
    .setDescription("Shows the status of the Minecraft server."), // Command description
  
  async execute(interaction) { // Command execution logic

    // Get the channel IDs where the command can be used
    const reportChannelID = data.first_guild.command_channel;
    const privateChannelID = data.second_guild.command_channel;

    // Check if the command is executed in one of the allowed channels
    if (
      interaction.channel.id !== reportChannelID &&
      interaction.channel.id !== privateChannelID
    ) {
      return interaction.reply({
        content: t("mark.wrong_channel", interaction.member, lang), // Reply with an error if in the wrong channel
        ephemeral: true, // Only visible to the user who invoked the command
      });
    }

    const userLanguage = getUserLanguage(interaction.member); // Get the user's language for translations

    try {
      // Defer the reply to give time for fetching data
      await interaction.deferReply();

      const address = "ServerIP"; // Minecraft server address
      const url = `https://api.mcsrvstat.us/3/${address}`; // URL to fetch server status from the mcsrvstat API

      // Make an HTTP GET request to fetch the server status
      const response = await axios.get(url);
      const data = response.data; // Data returned from the API

      // Log the command execution
      await logCommand(interaction, logChannelID);

      // Translate status messages
      const title = t("status.title", userLanguage);
      const onlineMessage = t("status.onlineMessage", userLanguage);
      const offlineMessage = t("status.offlineMessage", userLanguage);
      const noPlayersMessage = t("status.noPlayers", userLanguage);
      const updatedAtMessage = t("status.updatedAt", userLanguage);

      // If the server is online, create an embed with its details
      if (data.online) {
        const customNames = {
          PSMascot01: "Mascot 1",
          PSMascot02: "Mascot 2",
          PSMascot03: "Mascot 3",
          PSMascot04: "Mascot 4",
        };

        // Ensure players and player list are defined
        const players = data.players || {};
        const playerList = players.list || [];

        // Create a rich embed message with server and player details
        const embed = new EmbedBuilder()
          .setTitle(title)
          .setColor("#00ff00") // Green color for online status
          .setThumbnail("https://i.imgur.com/UKU79zN.png") // Server thumbnail image
          .addFields(
            {
              name: t("status.serverStatus", userLanguage),
              value: onlineMessage,
              inline: false,
            },
            {
              name: t("status.welcomeMessage", userLanguage),
              value: data.motd.clean
                ? data.motd.clean.join("\n") // Display the message of the day (MOTD) if available
                : t("status.noMessage", userLanguage),
              inline: false,
            },
            {
              name: t("status.onlineUsers", userLanguage),
              value: `${players.online || 0} ${t("status.of", userLanguage)} ${
                players.max || 0
              } ${t("status.players", userLanguage)}`,
              inline: false,
            },
            {
              name: t("status.playerList", userLanguage),
              value:
                playerList.length > 0
                  ? playerList.map((player) => player.name).join(", ") // List players if any
                  : noPlayersMessage,
              inline: false,
            }
          );

        // Filter custom player names if present
        const possibleChildren = playerList
          .filter((player) => customNames[player.name])
          .map((player) => customNames[player.name]);

        // Add a field for custom player names if any
        if (possibleChildren.length > 0) {
          embed.addFields({
            name: t("status.possibleChildren", userLanguage),
            value: possibleChildren.join(", "),
            inline: false,
          });
        }

        // Set the footer to show when the status was last updated
        embed.setFooter({
          text: `${updatedAtMessage} ${moment()
            .tz("America/Sao_Paulo")
            .format("DD/MM/YYYY HH:mm:ss")}`,
        });

        // Send the embed with the server's online status and player details
        await interaction.editReply({ embeds: [embed] });
      } else {
        // If the server is offline, create an offline status embed
        const embed = new EmbedBuilder()
          .setTitle("🔴 Server") // Title indicating offline status
          .setColor("#ff0000") // Red color for offline status
          .setThumbnail("https://i.imgur.com/UKU79zN.png") // Server thumbnail
          .setDescription(offlineMessage) // Description that server is offline
          .setFooter({
            text: `${updatedAtMessage} ${moment()
              .tz("America/Sao_Paulo")
              .format("DD/MM/YYYY HH:mm:ss")}`,
          });

        // Send the embed with the offline message
        await interaction.editReply({ embeds: [embed] });
      }
    } catch (error) {
      console.error(
        "Erro ao buscar o status do servidor:", // Log any errors
        error.response ? error.response.data : error.message
      );
      return interaction.editReply({
        content: t("status.errorFetching", userLanguage), // Show an error message if fetching fails
        ephemeral: true, // Make the message only visible to the user
      });
    }
  },
};