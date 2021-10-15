const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vote')
		.setDescription('Vote in current Challenge voting'),
	async execute({interaction, voting}={}) {
		if (!voting.isCurrentlyVoting)
			return interaction.reply({ content: `A Vote is not currently active`, ephemeral: true });

        
		await interaction.reply({ content: `Choose a challenge to vote for`, ephemeral: true });
	},
};
