const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stopvoting')
		.setDescription('Stops timers for voting')
		.setDefaultMemberPermissions('0'),
	async execute({interaction, voting}={}) {
		voting.stopVoting();
		return interaction.reply({ content: `The Voting timer has been stopped`, ephemeral: true });
	},
};
