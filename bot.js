require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const express = require('express');
const app = express();
const port = 3000;

const token = process.env.DISCORD_TOKEN;

if (!token) {
    console.error('DISCORD_TOKEN is not defined in environment variables.');
    process.exit(1); // Exit the process with an error code
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.once('ready', async () => {
    console.log('Bot is online!');

    // Ensure the bot has access to all members
    for (const guild of client.guilds.cache.values()) {
        await guild.members.fetch();
        console.log(`Fetched members for guild: ${guild.name}`);
    }
});

async function sendMessageToAllUsers(messageContent) {
    for (const guild of client.guilds.cache.values()) {
        console.log(`Checking guild: ${guild.name}`);
        for (const member of guild.members.cache.values()) {
            if (!member.user.bot) {
                try {
                    console.log(`Sending message to: ${member.user.tag}`);
                    await member.send(messageContent);
                    console.log(`Message sent to ${member.user.tag}`);
                } catch (err) {
                    console.log(`Could not send message to ${member.user.tag}: ${err.message}`);
                }
            }
        }
    }
}

app.post('/send-message', express.json(), (req, res) => {
    const messageContent = req.body.message;
    if (messageContent) {
        sendMessageToAllUsers(messageContent);
        res.send('Messages sent!');
    } else {
        res.status(400).send('Message content is required');
    }
});

client.login(token).catch(err => {
    console.error('Error logging in:', err);
    process.exit(1); // Exit the process with an error code
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
