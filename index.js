const fs = require('fs');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token, guildId, roleId } = require('./config/config.json');
const { Voice } = require('./modules/voice.js');
const { Voting } = require('./modules/voting.js');
const { Bridge } = require('./modules/bridge.js');
const { Award } = require('./modules/award.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates] });

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

const award = new Award();
client.login(token);
const voice = new Voice(client);
const voting = new Voting();
new Bridge(client, voice, voting);