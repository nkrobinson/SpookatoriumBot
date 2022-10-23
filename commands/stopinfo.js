const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stopinfo')
		.setDescription('Stops sending info messages to chat')
		.setDefaultMemberPermissions('0'),
	async execute({interaction, info}={}) {
        info.stopMessages();
		return interaction.reply({ content: `Messages have stopped being sent to the chat`, ephemeral: true });
	},
};
