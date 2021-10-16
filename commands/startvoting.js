const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('startvoting')
		.setDescription('Starts timers for voting')
		.setDefaultPermission(false),
	async execute({interaction, voting}={}) {
		if (voting.isCurrentlyVoting)
			return interaction.reply({ content: `A Vote is currently active`, ephemeral: true });

		voting.startVoting();
		return interaction.reply({ content: `The Voting timer has been started`, ephemeral: true });
	},
};
