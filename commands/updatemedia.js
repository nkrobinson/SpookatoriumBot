const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('updatemedia')
		.setDescription('Update Media List Sources')
		.setDefaultMemberPermissions('0'),
	async execute({interaction, voice}={}) {
        voice.updatePlayCommand(interaction.client);
        
        return interaction.reply({ content: `Updated Play Sources`, ephemeral: true });
	},
};
