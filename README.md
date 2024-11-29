# Minecraft Server - Multipurpose discord bot

This bot offers commands for managing a Discord guild for a Minecraft server, user and administrator tasks, as well as language customization. Below are all the available commands and their descriptions.

## User Commands

### `/status`
Displays the current status of the Minecraft server, including whether it is online or offline and the list of online players.

### `/report`
Displays a summary of the status of tasks for all users, showing who has or has not completed the tasks.

### `/setlanguage`
Allows the user to set the language that the bot should use with them.

## Server commands

### `/announce`
Sends an announcement to the server, with support for images/videos and embed format.

## Administrator commands

### `/marktask`
Marks the status of a task as completed or not completed for the user.

### `/admintask`
Allows the administrator to mark the status of tasks for a specific user.

### `/userinfo`
Displays detailed information about a user, including nickname, date of joining the server and messages sent.

### `/adminreport`
Displays a status report on all users' tasks for administrators.

---

## Multilingual Support

This bot bot offers multilingual support, allowing users to choose the language in which they interact with the bot.

### How to change the language

The user can change the language used by the bot using the `/setlanguage` command. By using this command, the bot will configure the language for your future interaction.
Currently, the bot supports the following languages:

- **English** (`en`)
- **Portuguese** (`en`)
- **Spanish** (`es`)
- **French** (`fr`)

If the user is already using the desired language, the bot will warn them that the language has not been changed.

### Functionality

After setting the language, all the bot's messages and responses will be adjusted to the chosen language. This includes error messages, confirmations and interaction commands, such as `/status`, `/report`, and other administrator-specific commands.

### How the translation works

Translations are managed by JSON files for each language (e.g. `en.json`, `en.json`, `fr.json`), where each key corresponds to a message that the bot can send. The translation system is dynamic and can be easily expanded to support new languages as required.

If you would like to suggest improvements to the translations or add a new language, please contact the bot administrator.

---

> [!WARNING]
> The bot is structured to work in two Discord guilds at the same time, one for the public and one for the admin team.
