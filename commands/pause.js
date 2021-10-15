const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pauses/Unpauses current media playback from Bot'),
    async execute({interaction, voice}={}) {

        if (voice.isPlaying) {
            voice.pause();
            return interaction.reply({ content: `Bot is paused`, ephemeral: true });
        }
        
        voice.resume();
        return interaction.reply({ content: `Bot's playing is resumed`, ephemeral: true });
	},
};
