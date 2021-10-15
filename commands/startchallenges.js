const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('startchallenge')
		.setDescription('starts and sets up for new challenge timer'),
	async execute({interaction, voting}={}) {
		if (voting.isCurrentlyVoting)
			return interaction.reply({ content: `A Vote is currently active`, ephemeral: true });

		voting.startVoting();
		return interaction.reply({ content: `The Voting timer has been started`, ephemeral: true });
	},
};
