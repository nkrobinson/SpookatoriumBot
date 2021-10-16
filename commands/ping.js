const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!')
		.setDefaultPermission(false),
	async execute({interaction}={}) {
		return interaction.reply('Pong!');
	},
};