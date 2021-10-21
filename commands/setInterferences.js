const { SlashCommandBuilder } = require('@discordjs/builders');
const { interencesJsonFile } = require('../config/config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setinterferences')
		.setDescription('Sets Interferences file')
		.addStringOption(option => option.setName('file').setDescription('Enter a File name in config folder to set for Voting'))
		.setDefaultPermission(false),
    async execute({interaction, voting}={}) {

        var file = interaction.options.getString('file');

        if (file != null) {
            file = './config/' + file;
            const setFile = voting.setFile(file);
            if (!setFile)
                return interaction.reply({ content: `Error: Interferences file not set to ${file}`, ephemeral: true });    
            return interaction.reply({ content: `Interferences file set to ${file}`, ephemeral: true });
        } else {
            voting.resetFile();
            return interaction.reply({ content: `Interferences file reset to ${interencesJsonFile}`, ephemeral: true });
        }
	},
};
