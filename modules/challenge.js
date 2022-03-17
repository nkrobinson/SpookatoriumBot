const { interencesJsonFile, challengeNameFile, challengeTimeFile } = require('../config/config.json');
const fs = require('fs');

exports.Challenge = class Challenge {

    constructor() {
        this.setOutputFile(challengeNameFile,challengeTimeFile);
        this.loadInterferences(interencesJsonFile);
    }

    get challengeActive() {
        return this.remainingChallengeTime > 0;
    }

    get remainingChallengeTime() {
        return Math.ceil((this.timerDuration - (Date.now() - this.timerStartTime)) / 1000);
    }

    startChallenge(challenge_id) {
        // Iterate through JSON to find challenge with given id
        let challenge = null;
        for (const interfaceTier in this.interferenceJSON.voting) {
            
            for (let i = 0; i < this.interferenceJSON.voting[interfaceTier].length; i++) {
                
                if (this.interferenceJSON.voting[interfaceTier][i].id === challenge_id) {
                    challenge = this.interferenceJSON.voting[interfaceTier][i];
                    break;
                }
            }

            if (challenge != null){
                break;
            }
        }

        if (challenge == null){
            console.log(`Did not find challenge with id of ${challenge_id}`);
            return;
        }
        
        // Start timer
        this.startTimer(challenge.time);

        //Output Challenge name to file
        
        //Output Challenge timer to file
    }

    setOutputFile(nameOutputFile, timeOutputFile) {
        this.nameOutputFile = nameOutputFile;
        this.timeOutputFile = timeOutputFile;
    }

    loadInterferences(interencesFile) {
        console.log(`Reading from file ${interencesFile}`);
        const voting = fs.readFileSync(interencesFile);
        this.interferenceJSON = JSON.parse(voting);
    }

    startTimer(duration) {
        this.timerStartTime = Date.now();
        this.timerDuration = duration;
    }

}