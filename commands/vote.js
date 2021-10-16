const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vote')
		.setDescription('Vote in current voting for participant interference')
		.setDefaultPermission(true),
	async execute({interaction, voting}={}) {
		if (!voting.isCurrentlyVoting)
			return interaction.reply({ content: `A Vote is not currently active`, ephemeral: true });

		const row = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('select')
					.setPlaceholder('Nothing selected')
					.addOptions(voting.votingOptionsJSON),
			);
		await interaction.reply({ content: 'Choose an interference for the Participant', components: [row], ephemeral: true });
	},
};