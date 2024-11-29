// Importing required modules from discord.js and Node.js
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Loading configuration from a JSON file
const config = require('./config.json');

// Displaying bot information for debugging purposes
console.log('Multi Purpose Bot');
console.log(' Made by 0x50714, thanks for use.');
console.log('-----------------------------------------------');
console.log('Public server |', config.publicGuildID, '|');  // Public server ID from config
console.log('Staff server  |', config.staffGuildID, ' |'); // Staff server ID from config
console.log('-----------------------------------------------');

// Creating a new instance of the Discord Client with Guilds intent
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Initializing an array to hold all the commands
const commands = [];

// Path to the 'commands' folder where command files are stored
const commandsPath = path.join(__dirname, 'commands');

// Reading all the files in the 'commands' directory and filtering out non-JS files
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Loop through each command file and push its data to the commands array
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);  // Import the command
    commands.push(command.data.toJSON());  // Push command data in JSON format
}

// Initialize the REST API with the bot token
const rest = new REST({ version: '10' }).setToken(config.token);

// IIFE (Immediately Invoked Function Expression) to handle command registration
(async () => {
    try {
        // Starting the registration process for the Staff server
        console.log('Staff server  | Starting..');

        // Registering commands for the staff server using the REST API
        await rest.put(Routes.applicationGuildCommands(config.clientID, config.staffGuildID), {
            body: commands,  // Passing the commands to the API
        });

        console.log('Staff server  | Success');  // If successful, log success message
    } catch (error) {
        // Log error if there was an issue during the command registration process
        console.error('Staff server  | Error', error);
    }

    console.log('-----------------------------------------------');

    try {
        // Starting the registration process for the Public server
        console.log('Public server | Starting..');

        // Registering commands for the public server using the REST API
        await rest.put(Routes.applicationGuildCommands(config.clientID, config.publicGuildID), {
            body: commands,  // Passing the commands to the API
        });

        console.log('Public server | Success');  // If successful, log success message
    } catch (error) {
        // Log error if there was an issue during the command registration process
        console.error('Public server | Error', error);
    }

    console.log('-----------------------------------------------');
})();
