const fs = require('fs');
const tmi = require('tmi.js');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token, clientId, guildId, roleId, votingChannelId,
		twitchUsername, twitchOAuth, twitchChannel
	} = require('./config/config.json');
const { Voice } = require('./modules/voice.js');
const { Voting } = require('./modules/voting.js');
const { Bridge } = require('./modules/bridge.js');
const { Award } = require('./modules/award.js');
const { Info } = require('./modules/info');

////// CONFIG CHECK //////
if (!token || !clientId || !guildId || !roleId || !votingChannelId) {
	console.log('Discord is not set up in config file');
	return;
}
if (!twitchUsername || !twitchOAuth || !twitchChannel) {
	console.log('Twitch is not set up in config file');
	return;
}

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

    // TODO: Add permissions for Admin only commands
    // Currently Admin permissions have to be given manually
	//
	// Update Nominate Command for params to use latest configs
	client.guilds.cache.get(guildId)?.commands.fetch().then(collection => {
		collection.forEach(command => {
			if (command.name === 'nominate')
				award.updateAwardCommand(client, command.id);
			else if (command.name === 'play') {
				voice.setPlayId(command.id);
				voice.updatePlayCommand(client);
			}
		});
	});

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
				award : award,
				info : info
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
			console.log(`Vote Counted: ${voting.getVoteDetails(interaction.values).name} by ${interaction.user.id}`);
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
function onMessageHandler (channel, tags, msg, self) {
    if (self) return;
	if (!msg.startsWith('!')) return;

	const args = msg.slice(1).split(' ');
	const command = args.shift().toLowerCase();

	if (command === 'vote') {
		if (!voting.isCurrentlyVoting) {
			t_client.say(twitchChannel, `There is no active vote currently`);
			return;
		}

		if (args.length !== 1) return;
		const vote_index = args.shift().toLowerCase() - 1; //Decrease by 1 due to array index not matching Twitch Options
		if (typeof vote_index !== 'number') return;
		if (!(vote_index >= 0 && vote_index <= 3)) return;

		
		var vote_id = voting.votingOptionsJSON[vote_index].value;
		var user_id = tags["user-id"];


		voting.castVote(vote_id, user_id);
		console.log(`Vote Counted: ${voting.getVoteDetails(vote_id).name} by ${user_id}`);

		// Currently no response from bot as you cannot whisper back to user
		// t_client.say(twitchChannel, `Your vote has been counted`);
	}
}

// Twitch On Launch handlers
function onConnectedHandler(addr, port) {
	console.log('Connected');
}

//// INITIALISE AND START SERVER ////
const award = new Award();
client.login(token);
t_client.connect();
const info = new Info(t_client);
const voice = new Voice(client);
const voting = new Voting();
new Bridge(client, t_client, voice, voting);