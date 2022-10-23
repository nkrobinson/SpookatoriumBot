const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nominate')
		.setDescription('Nominate a Victim for an Award'),
	async execute({interaction, award}={}) {

        const awardNom = interaction.options.getString('award');
        const victim = interaction.options.getString('victim');
        const reason = interaction.options.getString('reason');
		const user = interaction.user.username;

		console.log(awardNom);
		console.log(victim);
		console.log(reason);
		console.log(user);
        
        if (awardNom == null || victim == null || reason == null)
            return interaction.reply({ content: `Please fill all required fields`, ephemeral: true });

		award.addNomination(awardNom, victim, reason, user);
		await interaction.reply({ content: 'Thank you for the nomination', ephemeral: true });
	},
};