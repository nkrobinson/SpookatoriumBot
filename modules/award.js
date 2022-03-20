const { awardsJsonFile, awardsStoreFile, guildId } = require('../config/config.json');
const fs = require('fs');

exports.Award = class Award {

    constructor() {
        this.resetAwardOutputFile();
        this.readAwardFile();
    }

    readAwardFile() {
        console.log(`Reading from file ${awardsJsonFile}`);
        const awardFile = fs.readFileSync(awardsJsonFile);
        this.awardsJSON = JSON.parse(awardFile);
    }

    updateAwardCommand(client, command_id) {
        client.guilds.cache.get(guildId)?.commands.edit(command_id, {
                options: [
                    {
                        name: "award",
                        description: "The Award you would like to nominate a participant for",
                        type: 3,
                        required: true,
                        choices: this.awardsJSON
                    },
                    {
                        name: "participant",
                        description: "The Participant you are nominating",
                        type: 6,
                        required: true
                    },
                    {
                        name: "reason",
                        description: "The reason for nominating the person",
                        type: 3,
                        required: true
                    }
                ]
            }
        )
    }

    addNomination(award, participant, reason, user) {
        const content = 
`${user} nominated ${participant} for the ${award} award at ${new Date().toLocaleTimeString()}.
Reason: ${reason} \n\n`;

        this.writeNominationToFile(content);
    }

    resetAwardOutputFile() {
        fs.writeFile(awardsStoreFile, '', err => {
            if (err) {
                console.error(err);
                return;
            }
        });
    }

    writeNominationToFile(content) {
        fs.appendFile(awardsStoreFile, content, err => {
            if (err) {
                console.error(err);
                return;
            }
        });
    }

}