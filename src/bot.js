// Importing required modules from discord.js and other libraries
const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const data = require('./data/data.json');
const cron = require('node-cron');
const moment = require('moment-timezone');
const axios = require('axios');

// Extracting the bot token from the config file
const { token } = config;

// Creating a new instance of the Discord Client with the necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,  // Intent to interact with guilds
        GatewayIntentBits.GuildMessages,  // Intent to read messages in guilds
        GatewayIntentBits.MessageContent,  // Intent to access message content
    ],
});

// Retrieving server and report channel IDs from the data file
//! Public Server
const reportChannelIDServer1 = data.first_guild.report_channel;
const publicServerID = data.first_guild.guildID;
//! Staff Server
const staffServerID = data.second_guild.guildID;
const reportChannelIDServer2 = data.second_guild.report_channel;

// Initializing the client commands collection to store and manage commands
client.commands = new Collection();

// Path to the 'commands' folder to dynamically load all command files
const commandsPath = path.join(__dirname, 'commands');

// Reading all the files in the 'commands' directory, filtering for .js files
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Loop through each command file and add it to the client commands collection
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);  // Constructing the full file path
    const command = require(filePath);  // Importing the command from the file
    client.commands.set(command.data.name, command);  // Adding command to the collection by its name
}

// Handling the 'ready' event when the bot successfully logs in
client.once('ready', async () => {
    console.log('Multi Purpose Bot');
    console.log('Bot made by 0x50714, thanks for use.');
    console.log('-----------------------------------------------');
    console.log(`Logged in as ${client.user.tag}!`);  // Logging the bot's username
    console.log('-----------------------------------------------');
});

// Handling interactions made by users in the guilds
client.on('interactionCreate', async (interaction) => {
    // Check if the interaction is a command
    if (!interaction.isCommand()) return;

    // Retrieve the corresponding command from the client commands collection
    const command = client.commands.get(interaction.commandName);

    // If no matching command is found, exit
    if (!command) return;

    try {
        console.log(`Command executed: ${interaction.commandName}`);  // Log the command execution

        // Execute the command's function
        await command.execute(interaction);
        
    } catch (error) {
        // If an error occurs while executing the command, log it and inform the user
        console.error('Error executing the command:', error);
        
        // Send a reply to the user indicating the error
        await interaction.reply({ content: 'There was an error running this command.', ephemeral: true });
    }
});

// Logging into the Discord bot using the token from the config file
client.login(token);
