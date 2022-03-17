const { interencesJsonFile, challengeNameFile, challengeTimeFile } = require('../config/config.json');
const fs = require('fs');

exports.Challenge = class Challenge {

    constructor() {
        this.setOutputFile(challengeNameFile,challengeTimeFile);
        this.clearFiles();
    }

    get challengeActive() {
        return this.remainingChallengeTime > 0;
    }

    get remainingChallengeTime() {
        return Math.ceil((this.timerDuration - (Date.now() - this.timerStartTime)) / 1000);
    }

    startChallenge(challenge) {
        // Start timer
        this.startTimer(challenge.time);

        //Output Challenge name to file
        this.writeChallengeToFile(challenge.name);
        //Output Challenge timer to file
        this.writeTimerToFile();
    }

    setOutputFile(nameOutputFile, timeOutputFile) {
        this.nameOutputFile = nameOutputFile;
        this.timeOutputFile = timeOutputFile;
    }

    startTimer(duration) {
        this.timerStartTime = Date.now();
        this.timerDuration = duration;
    }

    writeChallengeToFile(name) {
        fs.writeFile(this.nameOutputFile, name, err => {
            if (err) {
              console.error(err);
              return;
            }
            //file written successfully
          });
    }

    clearFiles() {
        fs.writeFile(this.nameOutputFile, '', err => {
            if (err) {
              console.error(err);
              return;
            }
            //file written successfully
        });
        fs.writeFile(this.timeOutputFile, '', err => {
            if (err) {
            console.error(err);
            return;
            }
            //file written successfully
        });
    }

    writeTimerToFile() {
        const timer = setInterval(() => {
            if (this.remainingChallengeTime <= 0) {
                this.clearFiles();
                clearInterval(timer);
            } else {
                const content = `${this.remainingChallengeTime} Seconds Left`;
                fs.writeFile(this.timeOutputFile, content, err => {
                    if (err) {
                    console.error(err);
                    return;
                    }
                    //file written successfully
                });
            }
        }, 1000);
    }

}