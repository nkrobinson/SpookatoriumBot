const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays source specified by command')
		.addStringOption(option => option.setName('source').setDescription('Enter a media source to play')),
	async execute({interaction, voice}={}) {

        if (!voice.inVoiceChannel)
            return interaction.reply({ content: `Bot is not in a Voice Channel`, ephemeral: true });

		const source = interaction.options.getString('source');
        voice.playMedia(source);
        
        return interaction.reply({ content: `Playing ${source}`, ephemeral: true });
	},
};
