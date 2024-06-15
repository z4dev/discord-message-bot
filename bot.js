require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const express = require('express');
const app = express();
const port = 3000;

const token = process.env.DISCORD_TOKEN; // replace it with your bot token 

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.once('ready', () => {
    console.log('Bot is online!');
});

// Function to send a message to all users
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

// Express route to trigger message sending
app.post('/send-message', express.json(), (req, res) => {
    const messageContent = req.body.message;
    if (messageContent) {
        sendMessageToAllUsers(messageContent);
        res.send('Messages sent!');
    } else {
        res.status(400).send('Message content is required');
    }
});

client.login(token);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
