const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('callvote')
		.setDescription('Calls vote for challenge')
		.setDefaultMemberPermissions('0'),
	async execute({interaction, voting}={}) {
		if (voting.isCurrentlyVoting)
			return interaction.reply({ content: `A vote is currently active`, ephemeral: true });

		voting.callVote();
		return interaction.reply({ content: `A new vote has been called`, ephemeral: true });
	},
};
