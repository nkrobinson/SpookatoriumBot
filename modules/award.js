const { awardsJsonFile, victimsJsonFile, awardsStoreFile, guildId } = require('../config/config.json');
const fs = require('fs');

exports.Award = class Award {

    constructor() {
        this.resetAwardOutputFile();
        this.readAwardFile();
        this.readVictimFile();
    }

    readAwardFile() {
        console.log(`Reading from file ${awardsJsonFile}`);
        const awardFile = fs.readFileSync(awardsJsonFile);
        this.awardsJSON = JSON.parse(awardFile);
    }

    readVictimFile() {
        console.log(`Reading from file ${victimsJsonFile}`);
        const victimFile = fs.readFileSync(victimsJsonFile);
        this.victimsJSON = JSON.parse(victimFile);
    }

    updateAwardCommand(client, command_id) {
        client.guilds.cache.get(guildId)?.commands.edit(command_id, {
                options: [
                    {
                        name: "award",
                        description: "The Award you would like to nominate a Victim for",
                        type: 3,
                        required: true,
                        choices: this.awardsJSON
                    },
                    {
                        name: "victim",
                        description: "The Victim you are nominating",
                        type: 3,
                        required: true,
                        choices: this.victimsJSON
                    },
                    {
                        name: "reason",
                        description: "The reason for nominating the person for an award",
                        type: 3,
                        required: true
                    }
                ]
            }
        )
    }

    addNomination(award, victim, reason, user) {
        const content = 
`${user} nominated ${victim} for the ${award} award at ${new Date().toLocaleTimeString()}.
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