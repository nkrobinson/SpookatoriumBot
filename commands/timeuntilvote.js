const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('timeuntilvote')
		.setDescription('Returns how long until the next vote starts')
		.setDefaultPermission(false),
	async execute({interaction, voting}={}) {
		if (voting.isCurrentlyVoting)
			return interaction.reply({ content: `A vote is currently active`, ephemeral: true });
        if (voting.isChallengesActive)
		    return interaction.reply({ content: `A vote will be called in ${voting.timeUntilNextChallenge} seconds`, ephemeral: true });
        return interaction.reply({ content: `There is currently not a running timer for the next vote`, ephemeral: true });
	},
};
