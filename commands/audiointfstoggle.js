const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('audiointfstoggle')
		.setDescription('Toggles audio only interferences')
		.setDefaultMemberPermissions('0'),
	async execute({interaction, voting}={}) {
		if (voting.isCurrentlyVoting)
			return interaction.reply({ content: `A Vote is currently active. Can't change while vote is active`, ephemeral: true });
		if (voting.isDefaultInterferences) {

			const audioOnly = voting.toggleAudioOnly();
			if (audioOnly)
				return interaction.reply({ content: 'Interferences has been set to Audio Only', ephemeral: true });
			else
				return interaction.reply({ content: 'Interferences has been set to any Interference allowed', ephemeral: true });
		} else
			return interaction.reply({ content: 'Voting uses a custom Interferences file', ephemeral: true });			
	},
};
