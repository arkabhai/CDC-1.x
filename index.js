require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');

// Initialize Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const BASE_API_URL = 'https://xchecker.cc/api.php?cc=';

// List of allowed channel IDs and role IDs
const ALLOWED_CHANNELS = process.env.ALLOWED_CHANNELS.split(','); // Convert to array
const ALLOWED_ROLES = process.env.ALLOWED_ROLES.split(','); // Convert to array

// In-memory storage for allowed and blocked users
const allowedUsers = new Set(); // Initialize as a Set
const blockedUsers = new Set(process.env.BLOCKED_USERS?.split(',') || []); // Initialize as a Set with existing blocked users

// Admin IDs (Include your own ID)
const ADMIN_IDS = new Set(process.env.ADMIN_IDS.split(',')); // Convert to Set

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Admin commands to allow or block users
    if (message.content.startsWith('!allow') || message.content.startsWith('!block')) {
        // Check if the message author is an admin
        if (!ADMIN_IDS.has(message.author.id)) {
            message.channel.send('You do not have permission to use this admin command.');
            return;
        }

        const args = message.content.split(' ');
        const command = args[0].toLowerCase();
        const userId = args[1]?.replace(/<@|>/g, ''); // Extract user ID from mentions

        if (!userId) {
            message.channel.send('Please specify a user to allow or block.');
            return;
        }

        if (command === '!allow') {
            allowedUsers.add(userId);
            blockedUsers.delete(userId);
            message.channel.send(`<@${userId}> has been allowed to use the command.`);
        } else if (command === '!block') {
            blockedUsers.add(userId);
            allowedUsers.delete(userId);
            message.channel.send(`<@${userId}> has been blocked from using the command.`);
        }
        return;
    }

    // Help command
    if (message.content.startsWith('!help')) {
        const helpEmbed = new EmbedBuilder()
            .setTitle('Help Commands')
            .setColor(0x00FF00) // Green border color
            .setDescription('Here are the available commands:')
            .addFields(
                { name: '!cc <data>', value: 'Fetches and displays data from the API. Example usage: `!cc 53635000073xxxxx|0x|20xx|28x`', inline: false },
                { name: '!allow <user>', value: 'Allows a specified user to use the `!cc` command.', inline: false },
                { name: '!block <user>', value: 'Blocks a specified user from using the `!cc` command.', inline: false },
                { name: '!help', value: 'Displays this help message.', inline: false }
            )
            .setFooter({ text: 'Use commands in allowed channels only.' });

        message.channel.send({ embeds: [helpEmbed] });
        return;
    }

    // Check if the message is in an allowed channel
    if (!ALLOWED_CHANNELS.includes(message.channel.id)) {
        return; // Ignore messages not in allowed channels
    }

    // Check if the user is allowed to use the command
    const userId = message.author.id;
    if (blockedUsers.has(userId)) {
        message.channel.send('You are blocked from using this command.');
        return;
    }
    if (!allowedUsers.has(userId) && !message.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id))) {
        message.channel.send('You do not have permission to use this command.');
        return;
    }

    // Fetch data command
    if (message.content.startsWith('!cc')) {
        // Extract custom data from the message content
        const args = message.content.split(' ');
        const customData = args.slice(1).join(' '); // Get everything after !cc
        
        if (!customData) {
            message.channel.send('Please provide CC-NUM|EX-DATE|EX-YEAR|CVV after `!cc` - Example: `!cc 53635000073xxxxx|0x|20xx|28x`');
            return;
        }

        const API_URL = `${BASE_API_URL}${encodeURIComponent(customData)}`;

        try {
            const response = await axios.get(API_URL);
            const data = response.data;

            // Create an embed to display the data
            const embed = new EmbedBuilder()
                .setTitle('Fetched Data')
                .setColor(0x00FF00)  // Green border color
                .setThumbnail('https://example.com/your-thumbnail.png') // URL of a thumbnail image
                .setTimestamp()

            // If the user specifies a directory, point to it
            let directory = null;
            let currentData = data;
            if (args.length > 2) {
                directory = args.slice(2).join(' '); // Get everything after the customData
                const keys = directory.split('.');
                
                for (const key of keys) {
                    currentData = currentData[key];
                    if (!currentData) {
                        message.channel.send(`Directory ${directory} not found.`);
                        return;
                    }
                }
            }

            // Check if 'details' key exists and remove unwanted text
            if (currentData.details) {
                currentData.details = currentData.details.replace(
                    /Please consider making a donation or we will be forced to shutdown the xchecker.cc service, thanks you\.\nDonations: [^\n]*/g,
                    ''
                ).trim(); // Remove the donation message and trim any extra whitespace
            }

            // Add fields to the embed with emojis
            embed.addFields(
                { name: ':credit_card: CC Number', value: currentData.ccNumber || 'N/A', inline: false },
                { name: ':bank: Bank Name', value: currentData.bankName || 'N/A', inline: false },
                { name: '<:statusup:1272083095142535219> Status', value: currentData.status === 'Live' ? 'Live :green_circle:' : 'Not Live :red_circle:', inline: false },
                { name: ':information_source: Details', value: currentData.details === 'Charge OK' ? 'Charge OK' : `${currentData.details || 'N/A'}`, inline: false }
            );

            // Send the embed
            message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Error fetching data:', error);
            message.channel.send('Failed to fetch data.');
        }
    }
});

client.login(DISCORD_TOKEN);
