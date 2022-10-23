const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('disconnect')
		.setDescription('Disconnects from the voice channel currently connected to')
		.setDefaultMemberPermissions('0'),
	async execute({interaction, voice}={}) {

        if (!voice.inVoiceChannel)
            return interaction.reply({ content: `Bot is not in a Voice Channel`, ephemeral: true });

        voice.disconnect();
        
        return interaction.reply({ content: `Disconnected from Voice Channel`, ephemeral: true });
	},
};
