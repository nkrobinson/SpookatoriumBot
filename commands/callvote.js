const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('callvote')
		.setDescription('Calls vote for challenge'),
	async execute({interaction, voting}={}) {
		if (voting.isCurrentlyVoting)
			return interaction.reply({ content: `A Vote is currently active`, ephemeral: true });

		voting.CallVote();
		return interaction.reply({ content: `A new Vote has been called`, ephemeral: true });
	},
};
