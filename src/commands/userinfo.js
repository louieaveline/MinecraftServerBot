const { SlashCommandBuilder, EmbedBuilder } = require("discord.js"); // Importing the necessary classes to build the command and embeds
const moment = require("moment"); // For handling and formatting dates
const data = require("../data/data.json"); // Configuration data (channel IDs, etc.)
const { logCommand } = require("../utility/logger"); // Function for logging commands
const { getUserLanguage } = require("../utility/roles"); // Function to get the user's language
const { t } = require("../utility/translate"); // Translation function for localized messages

const logChannelID = data.channel_ids.log_channel; // Channel ID where command logs are stored

module.exports = {
  data: new SlashCommandBuilder() // Create a new slash command using SlashCommandBuilder
    .setName("userinfo") // Command name
    .setDescription("Fornece informações detalhadas sobre um usuário.") // Command description in Portuguese
    .addUserOption((option) =>
      option
        .setName("target") // Option to select the user
        .setDescription("O usuário para obter informações") // Description of the option
        .setRequired(true) // Make the target user option required
    ),
  async execute(interaction) { // Logic to execute when the command is used

    // Get the channel IDs where the command can be executed
    const privateChannelID = data.second_guild.command_channel;
    const commandChannelID = data.first_guild.report_channel;

    // Check if the command is executed in the correct channels
    if (
      interaction.channel.id !== privateChannelID &&
      interaction.channel.id !== commandChannelID
    ) {
      return interaction.reply({
        content: t("mark.wrong_channel", interaction.member, lang), // Reply if the wrong channel is used
        ephemeral: true, // Only visible to the user who invoked the command
      });
    }

    // Log the command usage in the log channel
    await logCommand(interaction, logChannelID);

    const user = interaction.options.getUser("target"); // Get the target user from the options
    const member = interaction.guild.members.cache.get(user.id); // Get the member object of the user

    if (!member) {
      return interaction.reply({
        content: "Usuário não encontrado no servidor.", // Reply if the user is not found in the server
        ephemeral: true,
      });
    }

    // Variables to store message count and last message
    let messageCount = 0;
    let lastMessage = null;
    const messages = await interaction.channel.messages.fetch({ limit: 100 }); // Fetch the last 100 messages in the channel

    // Iterate through the messages to count the user's messages and find the last message
    messages.each((msg) => {
      if (msg.author.id === user.id) {
        messageCount++;
        if (
          !lastMessage ||
          msg.createdTimestamp > lastMessage.createdTimestamp
        ) {
          lastMessage = msg;
        }
      }
    });

    // Format the dates for when the user joined the server and when their Discord account was created
    const joinedDate = member.joinedAt
      ? moment(member.joinedAt).format("DD/MM/YYYY")
      : "Não disponível"; // Format the join date, or return "Not available" if not found
    const createdDate = moment(user.createdAt).format("DD/MM/YYYY"); // Format the account creation date

    // Create an embed with user information
    const userEmbed = new EmbedBuilder()
      .setTitle(`Informações de ${user.tag}`) // Title with user's tag
      .setColor("#0099ff") // Embed color (blue)
      .setThumbnail(user.displayAvatarURL({ dynamic: true })) // User's avatar as thumbnail
      .addFields(
        {
          name: "Nickname no servidor:",
          value: member.displayName || "Não disponível", // Display the user's server nickname, or "Not available"
        },
        {
          name: "Nickname do Discord (ID):",
          value: `${user.tag} (${user.id})`, // Display the user's Discord tag and ID
        },
        { name: "Data de criação da conta Discord:", value: createdDate }, // Display account creation date
        { name: "Data de entrada no servidor:", value: joinedDate }, // Display server join date
        {
          name: "Tempo no servidor:",
          value: `${Math.floor(
            (Date.now() - member.joinedAt.getTime()) / (1000 * 60 * 60 * 24)
          )} dias`, // Calculate and display the time spent in the server in days
        },
        {
          name: "Lista de cargos:",
          value:
            member.roles.cache.map((role) => role.name).join(", ") || "Nenhum", // List all roles the user has, or "None"
        },
        { name: "Total de mensagens:", value: `${messageCount}` }, // Display total number of messages sent by the user
        {
          name: "Última mensagem no servidor:",
          value: lastMessage
            ? `${lastMessage.content}\n[Link para a mensagem](${lastMessage.url})` // Display the last message and a link to it
            : "Nenhuma mensagem encontrada", // If no message found, display "None found"
        }
      );

    // If the user has any attachments in their last message, include them in the embed
    if (lastMessage && lastMessage.attachments.size > 0) {
      const attachment = lastMessage.attachments.first(); // Get the first attachment
      userEmbed.setImage(attachment.url); // Set the attachment as an image in the embed
      userEmbed.addFields({
        name: "Link do anexo:",
        value: `[Link para o anexo](${attachment.url})`, // Provide a link to the attachment
      });
    }

    // Send the embed as a reply, only visible to the user (ephemeral)
    await interaction.reply({ embeds: [userEmbed], ephemeral: true });
  },
};