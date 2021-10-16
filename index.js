const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');
const { Voice } = require('./modules/voice.js');
const { Voting } = require('./modules/voting.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

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
});

client.on('interactionCreate', interaction => {
	if (!interaction.isSelectMenu()) 
		return;

	if (interaction.customId === 'select') {
		if (!voting.isCurrentlyVoting) {
			interaction.update({ content: 'There is no active vote currently', components: [] });
			return;
		}

		voting.castVote(interaction.values, interaction.user.id);
		console.log(voting.getVoteDetails(interaction.values).name);
		interaction.update({ content: 'Your vote has been counted', components: [] });
	}
});

client.login(token);
const voice = new Voice(client);
const voting = new Voting();