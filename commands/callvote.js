const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('callvote')
		.setDescription('Calls vote for challenge'),
	async execute(interaction) {
		await interaction.reply('A VOTE HAS BEEN CALLED');
        // Call Vote within tiers at current time
	},
};
