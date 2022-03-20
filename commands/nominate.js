const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nominate')
		.setDescription('Nominate a Participant for an Award')
		.setDefaultPermission(true),
	async execute({interaction, award}={}) {

        const awardNom = interaction.options.getString('award');
        const participant = interaction.options.getUser('participant').username;
        const reason = interaction.options.getString('reason');
		const user = interaction.user.username;

		console.log(awardNom);
		console.log(participant);
		console.log(reason);
		console.log(user);
        
        if (awardNom == null || participant == null || reason == null)
            return interaction.reply({ content: `Please fill all required fields`, ephemeral: true });

		award.addNomination(awardNom, participant, reason, user);
		await interaction.reply({ content: 'Thank you for the nomination', ephemeral: true });
	},
};