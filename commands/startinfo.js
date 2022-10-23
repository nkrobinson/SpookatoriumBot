const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('startinfo')
		.setDescription('Starts sending info messages to chat')
		.addIntegerOption(option => option.setName('interval').setDescription('The number of seconds between messages'))
		.setDefaultMemberPermissions('0'),
	async execute({interaction, info}={}) {

		if (info.isActive)
			return interaction.reply({ content: `Info messages are already enabled`, ephemeral: true });

        const interval = interaction.options.getInteger('interval');
        if (interval != null)
            info.setInterval(interval);
        else
            info.setDefaultInterval();

        info.startMessages();
		return interaction.reply({ content: `Messages have started being sent to the chat`, ephemeral: true });
	},
};
