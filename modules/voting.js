const defaultInterval = 300000;

export class Voting {

    constructor(file='') {
        if (file != '')  {
            this.file = file
        } else {
            this.file = './voting.json'
        }

        readVoteFile();
        setTier(1);
    }

    setFile(file) {
        this.file = file;
        readVoteFile();
    }

    readVoteFile() {
        const { voting } = require(this.file);
        this.votingJSON = JSON.parse(voting);
    }

    setTier(tier) {
        this.tier = tier;
        switch(tier) {
            case 1: {
                this.voteList = votingJSON.tier_1_voting;
            }
            case 2: {
                this.voteList = votingJSON.tier_2_voting;
            }
            case 3: {
                this.voteList = votingJSON.tier_3_voting;
            }
            default: {
                break;
            }
        }
    }

    callVote() {
        
    }

    advanceTier() {
        if (this.tier == 3) {
            return;
        }
        this.tier = this.tier + 1;
    }

    startTimer(interval=defaultInterval) {
        stopTimer();
        this.timer = setInterval(callVote(), interval); // update about every 5 minutes
    }

    stopTimer() {
        if (this.timer != null) {
            clearInterval(this.timer);
        }
    }

    resetVoting() {
        stopTimer();
        setTier(1);
        startTimer();
    }

}