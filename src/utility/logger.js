module.exports = {
    /**
     * Logs a command usage to a specified log channel.
     * This function sends a log message to a channel every time a command is executed.
     * It includes the time of execution, the user who triggered the command, and the channel name.
     * 
     * @param {Interaction} interaction - The interaction object representing the command execution.
     * @param {string} logChannelID - The ID of the channel where the log should be sent.
     */
    async logCommand(interaction, logChannelID) {
        try {
            // Retrieve the log channel using the provided logChannelID
            const logChannel = interaction.client.channels.cache.get(logChannelID);
            if (logChannel) {
                // Get the current date and time
                const now = new Date();
                // Format the current time in 'pt-BR' (Brazilian Portuguese) format: HH:mm:ss
                const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                // Send the log message containing the time, user info, and channel name
                await logChannel.send(`**[${formattedTime}]** **${interaction.user.username}** *(${interaction.user.id})* used the command **/${interaction.commandName}** in the channel **#${interaction.channel.name}**`);
            } else {
                console.error('Log channel not found.');
            }
        } catch (error) {
            console.error('Error while sending log:', error);
        }
    }
};
