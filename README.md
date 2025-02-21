# Minecraft Server - Multipurpose Discord Bot

This bot offers commands for managing a Discord guild for a Minecraft server, user and administrative tasks, as well as language customization. Below are all the available commands and their descriptions.

## User Commands

### `/status`
Displays the current status of the Minecraft server, including whether it is online or offline and the list of online players.

### `/report`
Displays a summary of the status of tasks for all users, showing who has or has not completed the tasks.

### `/setlanguage`
Allows the user to set the language that the bot should use with them.

## Server Commands

### `/announce`
Sends an announcement to the server, with support for images/videos and embed format.

## Administrator Commands

### `/marktask`
Marks the status of a task as completed or not completed for the user.

### `/admintask`
Allows marking the status of tasks for a specific user.

### `/userinfo`
Displays detailed information about a user, including nickname, date of joining the server, and messages sent.

### `/adminreport`
Displays a status report on all users' tasks for administrators.

---

## Multilingual Support

This bot offers multilingual support, allowing users to choose the language in which they interact with the bot.

### How to change the language

The user can change the language using the `/setlanguage` command. Once set, the bot will use the chosen language for all future interactions.

Currently, the bot supports the following languages:

- **English** (`en`)
- **Portuguese** (`pt`)
- **Spanish** (`es`)
- **French** (`fr`)

If the user is already using the desired language, the bot will notify them that no change was made.

### Functionality

After setting the language, all the bot's messages and responses will be adjusted accordingly. This includes error messages, confirmations, and interaction commands such as `/status`, `/report`, and other administrator commands.

### How the translation works

Translations are managed using JSON files for each language (e.g., `en.json`, `pt.json`, `fr.json`). Each key corresponds to a message that the bot can send. The translation system is dynamic and can be easily expanded to support new languages.

If you would like to contribute improvements to the translations or add a new language, feel free to submit a pull request!

---

# 📌 How to Install and Run the Project  

## 🔧 Prerequisites  
- [Node.js](https://nodejs.org/) installed  
- [npm](https://www.npmjs.com/) installed (comes with Node.js)  

## 🚀 Step-by-Step Guide  

### 1️⃣ Clone the repository  
```sh
git clone https://github.com/0x50F14/MinecraftServerBot
cd MinecraftServerBot
cd src
```

### 2️⃣ Configure the data files  
Edit `data.json` and `taskStatus.json` with the required values.  

### 3️⃣ Install dependencies  
```sh
npm install
```

### 4️⃣ Register commands (if needed)  
```sh
node registercommands
```

### 5️⃣ Start the project  
```sh
npm start
```

That's it! Your project is now running. 🚀  

---

## ⚠️ Disclaimer: Spaghetti Code Ahead! 🍝

This project contains some spaghetti code, and I’m aware of it. 😅  
Known issues might be fixed in the future when there’s time. Contributions and suggestions are welcome! 🚀  

