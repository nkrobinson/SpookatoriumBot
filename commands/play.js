const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays source specified by command')
		.addStringOption(option => option.setName('source').setDescription('Enter a media source to play'))
		.setDefaultMemberPermissions('0'),
	async execute({interaction, voice}={}) {

        if (!voice.inVoiceChannel)
            return interaction.reply({ content: `Bot is not in a Voice Channel`, ephemeral: true });

		// Get all the possible vlaues from all the Options
		// Check the amount of parameters and then check for correct value
		let sourceOption = [];
		let source = null;
		for (let i = 0; i < voice.playOptionsAmount; i++) {
			sourceOption[i] = interaction.options.getString(`source${i}`);
			if (sourceOption[i] != null) {
				if (source != null)
					return interaction.reply({ content: `Select only 1 media file`, ephemeral: true });
				source = sourceOption[i];
			}
		}

		if (source == null)
			return interaction.reply({ content: `Select a media file`, ephemeral: true });

        voice.playMedia(source);
        
        return interaction.reply({ content: `Playing ${voice.completeMediaSource(source)}`, ephemeral: true });
	},
};
