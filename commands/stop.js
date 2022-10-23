const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stops current media playback from Bot')
		.setDefaultMemberPermissions('0'),
        async execute({interaction, voice}={}) {

        if (!voice.isPlaying) {
            return interaction.reply({ content: `Bot is not playing anything`, ephemeral: true });
        }
        
        voice.stop();
        return interaction.reply({ content: `Bot's playing is stopped`, ephemeral: true });
	},
};
