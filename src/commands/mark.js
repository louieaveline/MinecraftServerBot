const { SlashCommandBuilder, EmbedBuilder } = require('discord.js'); // Importing necessary modules from discord.js
const fs = require('fs'); // File system module for reading and writing files
const path = require('path'); // Module to handle file and directory paths
const data = require('../data/data.json'); // Importing data (e.g., users) from a JSON file
const { getUserLanguage } = require("../utility/roles"); // Importing function to get user language based on roles
const { t } = require("../utility/translate"); // Importing translation utility

// Path to the task status JSON file
const taskStatusPath = path.join(__dirname, '../tasksStatus.json');

// Helper function to read a JSON file
const readJSONFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } else {
            return {}; // Return empty object if file doesn't exist
        }
    } catch (error) {
        console.error(`Error reading the file ${filePath}:`, error);
        throw new Error('Error reading JSON file.'); // Throw an error if there's a problem reading the file
    }
};

// Helper function to write to a JSON file
const writeJSONFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2)); // Write data with proper formatting (2 spaces)
    } catch (error) {
        console.error(`Error writing to the file ${filePath}:`, error);
        throw new Error('Error saving JSON file.'); // Throw an error if there's a problem saving the file
    }
};

module.exports = {
    // Setting up the slash command
    data: new SlashCommandBuilder()
        .setName('mark') // Command name
        .setDescription('Update the status of a specific task.') // Command description
        .addIntegerOption(option =>
            option.setName('task') // Option to specify the task number (1, 2, or 3)
                .setDescription('Task number (1, 2, 3)')
                .setRequired(true)) // Make task option required
        .addStringOption(option =>
            option.setName('status') // Option to specify task status
                .setDescription('Task status: “completed” or “not completed”')
                .setRequired(false)), // Make status option optional
    async execute(interaction) {
        // Get the user's language (default to 'en' if not found)
        const userLang = await getUserLanguage(interaction.user.id) || 'en';
        const translated = (key) => t(key, userLang); // Function to fetch translations based on user language

        // Define valid channels for the command to be executed in
        const reportChannelID = data.first_guild.report_channel;
        const privateChannelID = data.second_guild.command_channel;

        // Check if the command is being executed in the correct channel
        if (interaction.channel.id !== reportChannelID && interaction.channel.id !== privateChannelID) {
            return interaction.reply({ content: translated('mark.wrong_channel'), ephemeral: true }); // Inform the user if wrong channel
        }

        // Get the task number and status from the command options
        const taskNumber = interaction.options.getInteger('task');
        const status = interaction.options.getString('status') || 'completed'; // Default to 'completed' if no status is provided
        const userID = interaction.user.id;

        // Check if the task number is valid
        if (![1, 2, 3].includes(taskNumber)) {
            return interaction.reply({ content: translated('mark.invalid_task_number'), ephemeral: true }); // Invalid task number
        }

        // Check if the status is valid
        if (!['completed', 'not completed'].includes(status)) {
            return interaction.reply({ content: translated('mark.invalid_status'), ephemeral: true }); // Invalid status
        }

        // Read task status data from tasksStatus.json
        const taskStatus = readJSONFile(taskStatusPath);
        const usersData = data.users || {}; // Get user data from the JSON file

        // Check if the user exists in the data
        if (!usersData[userID]) {
            return interaction.reply({ content: translated('mark.user_not_found'), ephemeral: true }); // User not found
        }

        // Initialize the task status for the user if not already set
        if (!taskStatus[userID]) {
            taskStatus[userID] = { '1': false, '2': false, '3': false }; // Set default status for all tasks (false)
        }

        // Update the status for the specified task
        taskStatus[userID][taskNumber] = status === 'completed'; // Set the task status to true for 'completed'

        // Try saving the updated task status to tasksStatus.json
        try {
            writeJSONFile(taskStatusPath, taskStatus); // Save updated task status
        } catch (error) {
            return interaction.reply({ content: translated('mark.error_saving_file'), ephemeral: true }); // Error saving file
        }

        // Create the embed for confirmation
        const embed = new EmbedBuilder()
            .setTitle(translated('mark.task_updated_title')) // Set embed title
            .setDescription(translated('mark.task_updated_description', { taskNumber, status: status === 'completed' ? 'Completed' : 'Not completed' })) // Set embed description with task details
            .setColor(status === 'completed' ? '#00FF00' : '#FF0000'); // Set color based on task status (green for completed, red for not completed)

        // Send the embed as a reply to the user
        await interaction.reply({ embeds: [embed] });
    },
};