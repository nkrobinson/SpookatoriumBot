const { 
    interencesJsonFile,
    audioInterencesJsonFile,
    betweenVoteTime,
    votingTime,
    tierMaxCount
} = require('../config/config.json');
const fs = require('fs');

exports.Voting = class Voting {

    get isCurrentlyVoting() {
        return this.vote != null
    }

    get isChallengesActive() {
        return this.timer != null;
    }

    get isDefaultInterferences() {
        return (this.fileName == interencesJsonFile || this.fileName == audioInterencesJsonFile);
    }

    get votingTimeLeft() {
        return Math.ceil((this.vote._idleTimeout - (Date.now() - this.vote.startTime)) / 1000);
    }

    get timeUntilNextChallenge() {
        return Math.ceil((this.timer._idleStart + this.timer._idleTimeout - Date.now()) / 1000);
    }

    get votingOptionsJSON() {
        const votingJSON = []
        this.voteList.forEach(function(item) {
            votingJSON.push( {
                "label" : item.name,
                "description" : item.description,
                "value" : item.id,
            })
        });
        return votingJSON;
    }

    constructor() {
        this.betweenVoteInterval = betweenVoteTime;
        this.votingInterval = votingTime;

        this.setFile(interencesJsonFile);
    }

    readVoteFile() {
        console.log(`Reading from file ${this.fileName}`);
        const voting = fs.readFileSync(this.fileName);
        this.votingJSON = JSON.parse(voting);
    }

    setBridge(bridge) {
        this.bridge = bridge;
    }

    setFile(fileName) {
        const currentFile = this.fileName;
        try {
            this.fileName = fileName;
            this.readVoteFile();
            this.initialiseTier();
            return true;
        } catch(err) {
            this.fileName = currentFile;
            return false;
        }
    }

    resetFile() {
        this.setFile(interencesJsonFile);
    }

    toggleAudioOnly() {
        var audioOnly = false;
        if (this.fileName === interencesJsonFile) {
            this.fileName = audioInterencesJsonFile;
            var audioOnly = true;
        } else if (this.fileName === audioInterencesJsonFile) {
            this.fileName = interencesJsonFile;
        }
        this.readVoteFile();
        this.initialiseTier();
        return audioOnly;
    }

    setBetweenVoteTime(interval) {
        this.betweenVoteInterval = interval;
    }

    setVotingTime(interval) {
        this.votingInterval = interval;
    }

    setVotingForTier() {
        // Tier Minimum is 1;
        this.voteList = this.votingJSON.voting.tier_1_voting;
        if (this.tier > 1)
            this.voteList = this.voteList.concat(this.votingJSON.voting.tier_2_voting);
        if (this.tier > 2)
            this.voteList = this.voteList.concat(this.votingJSON.voting.tier_3_voting);
    }

    initialiseTier() {
        this.tier = 1;
        this.tierCounter = 1;
        this.setVotingForTier();
    }

    advanceTier() {
        if (this.tierCounter >= tierMaxCount) {
            if (this.tier == 3) {
                return;
            }
            this.tier = this.tier + 1;
            this.setVotingForTier();
            this.tierCounter = 1;
        } else
            this.tierCounter++;
    }

    initialiseVotingDictionary() {
        const votingDictionary = {}
        this.voteList.forEach(function(item) {
            votingDictionary[item.id] = new Set();
        });

        this.voteDict = votingDictionary;
    }

    callVote(tierAdvance=false) {
        console.log('Calling Vote');

        if (this.vote != null)
            return 
        this.initialiseVotingDictionary();
        this.bridge.startVoting();

        var t = this;
        this.vote = setTimeout(
            function() { 
                t.finishVote(t.tallyVotes(tierAdvance));
            },
            this.votingInterval
        )
        this.vote.startTime = Date.now();
    }

    castVote(vote_id, voter) {
        this.voteDict[vote_id].add(voter);
    }

    getVoteDetails(vote_id) {
        return this.voteList.filter(d => d.id == vote_id)[0];
    }

    tallyVotes(tierAdvance) {
        console.log('Tallying Votes');
        var entry = '';
        var maxVotes = 0;
        var ties = [];
        for (const key of Object.keys(this.voteDict)) {
            const size = this.voteDict[key].size;
            if (size === maxVotes)
                ties.push(key);
            if (size > maxVotes) {
                maxVotes = size;
                entry = key;
                ties = [key];
            }
        }

        if (ties.length > 1) {
            entry = ties[Math.floor(Math.random()*ties.length)];
            var tied = true;
        } else
            var tied = false;

        this.vote = null;
        this.voteDict = null;
        if (tierAdvance) 
            this.advanceTier();

        return {entry, maxVotes, tied};
    }

    finishVote(winner) {
        const winnerJSON = this.getVoteDetails(winner.entry);
        this.bridge.voteFinish(winnerJSON, winner.maxVotes, winner.tied);
    }

    resetTimer() {
        this.stopTimer(); // Stop timer if timer active
        this.startTimer(); // Stop timer if timer active
    }

    startTimer() {
        this.stopTimer(); // Stop timer if timer active
        var t = this;
        this.timer = setInterval(
            function() { t.callVote(true); },
            this.betweenVoteInterval
        );
    }

    stopTimer() {
        if (this.timer != null) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    stopVoteTimer() {
        if (this.vote != null) {
            clearInterval(this.vote);
            this.vote = null;
        }
    }

    resetVoting() {
        this.stopTimer();
        this.readVoteFile();
        this.initialiseTier();
        this.startTimer();
    }

    startVoting() {
        this.readVoteFile();
        this.initialiseTier();
        this.startTimer();
    }

    stopVoting() {
        this.initialiseTier();
        this.stopTimer();
        this.stopVoteTimer();
    }

}