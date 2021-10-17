const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('joinchannel')
		.setDescription('Joins the voice channel user is currently connected to')
		.addChannelOption(option => option.setName('channel').setDescription('Enter a Voice Channel to join'))
		.setDefaultPermission(false),
    async execute({interaction, voice}={}) {

        const channelId = interaction.options.getChannel('channel') ?? interaction.member.voice.channel;
        
        if (channelId == null)
            return interaction.reply({ content: `User is not in a Voice Channel and Channel ID not filled`, ephemeral: true });

        voice.connect(
            channelId.id,
            interaction.guild.id,
            interaction.guild.voiceAdapterCreator
        );
        
        return interaction.reply({ content: `Connected to Channel ${channelId.name}`, ephemeral: true });
	},
};
