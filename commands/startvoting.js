const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('startvoting')
		.setDescription('Starts timers for voting')
		.addIntegerOption(option => option.setName('tiercount').setDescription('Give the amount of votes to happen before a Tier is advanced'))
		.setDefaultPermission(false),
	async execute({interaction, voting}={}) {
		if (voting.isCurrentlyVoting)
			return interaction.reply({ content: `A Vote is currently active`, ephemeral: true });

		const tierCount = interaction.options.getChannel('tiercount');
		voting.setTierCount(tierCount);

		voting.startVoting();
		return interaction.reply({ content: `The Voting timer has been started`, ephemeral: true });
	},
};
