const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('joinchannel')
		.setDescription('Joins the voice channel user is currently connected to')
		.setDefaultPermission(false),
    async execute({interaction, voice}={}) {

        if (interaction.member.voice.channel == null)
            return interaction.reply({ content: `User ${interaction.user.name} is not in a Voice Channel`, ephemeral: true });

        voice.connect(
            interaction.member.voice.channel.id,
            interaction.guild.id,
            interaction.guild.voiceAdapterCreator
        );
        
        return interaction.reply({ content: `Connected to Channel ${interaction.member.voice.channel.name}`, ephemeral: true });
	},
};
