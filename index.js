const fs = require('fs');
const tmi = require('tmi.js');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token, twitchUsername, twitchOAuth, twitchChannel } = require('./config/config.json');
const { Voice } = require('./modules/voice.js');
const { Voting } = require('./modules/voting.js');
const { Bridge } = require('./modules/bridge.js');
const { Award } = require('./modules/award.js');

////// DISCORD CLIENT //////
// Initialise Discord Client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates] });

// Set up Discord Commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
    //TODO: Add permissions for Admin only commands
    // Currently Admin permissions have to be given manually
	console.log('Ready!');
});

// Handle Discord Interactions
client.on('interactionCreate', async interaction => {
	if (interaction.isCommand()) {
		const command = client.commands.get(interaction.commandName);

		if (!command) return;

		try {
			await command.execute({
				interaction : interaction,
				voice : voice,
				voting : voting,
				award : award
			});
		} catch (error) {
			console.error(error);
			return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}

	if (interaction.isSelectMenu()) {

		if (interaction.customId === 'select') {
			if (!voting.isCurrentlyVoting) {
				interaction.update({ content: 'There is no active vote currently', components: [] });
				return;
			}
	
			voting.castVote(interaction.values, interaction.user.id);
			console.log(`Vote Counted: ${voting.getVoteDetails(interaction.values).name}`);
			interaction.update({ content: 'Your vote has been counted', components: [] });
		}

	}

	if (interaction.isButton()) {
		const command = client.commands.get(interaction.customId);
		if (!command) return;

		try {
			await command.execute({
				interaction : interaction,
				voice : voice,
				voting : voting
			});
		} catch (error) {
			console.error(error);
			return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

////// TWITCH CLIENT //////

// Define configuration options
const opts = {
	connection: {
		reconnect: true
	},
	identity: {
		username: twitchUsername,
		password: twitchOAuth
	},
	channels: [
		twitchChannel
	]
};

// Create a Twitch client with our options
const t_client = new tmi.client(opts);

// Twitch client events
t_client.on('message',   onMessageHandler);
t_client.on('connected', onConnectedHandler);

// Twitch command handlers
function onMessageHandler (target, context, msg, self) {
    if (self) return;
    
	// This logs out all the messages sent on the channel on the terminal
    console.log(msg);
	t_client.say(twitchChannel, `YOUR MESSAGE WAS ${msg}`);
}

function onConnectedHandler(addr, port) {
	console.log('Connected');
}

const award = new Award();
client.login(token);
t_client.connect();
const voice = new Voice(client);
const voting = new Voting();
new Bridge(client, voice, voting);