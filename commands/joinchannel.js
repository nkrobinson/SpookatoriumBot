const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('joinchannel')
		.setDescription('Joins the voice channel user is currently connected to.'),
	async execute(interaction) {
        connection = joinVoiceChannel({
            channelId: interaction.member.voice.channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator
        });
        return interaction.reply({ content: `Connected to Channel ${interaction.member.voice.channel.name}`, ephemeral: true });
	},
};
