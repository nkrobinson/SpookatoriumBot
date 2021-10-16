const { 
    votingJsonFile,
    betweenVoteTime,
    votingTime 
} = require('../config.json');
const fs = require('fs');

exports.Voting = class Voting {

    get isCurrentlyVoting() {
        return this.vote != null
    }

    get isChallengesActive() {
        return this.timer != null;
    }

    get votingTimeLeft() {
        return Math.ceil((this.vote._idleStart + this.vote._idleTimeout - Date.now()) / 1000);
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
        this.fileName = votingJsonFile;

        this.betweenVoteInterval = betweenVoteTime;
        this.votingInterval = votingTime;

        this.readVoteFile();
        this.initialiseTier();
    }

    readVoteFile() {
        console.log(`Reading from file ${this.fileName}`);
        const voting = fs.readFileSync(this.fileName);
        this.votingJSON = JSON.parse(voting);
    }

    initialiseTier() {
        this.tier = 1;
        this.setVotingForTier();
    }

    setBridge(bridge) {
        this.bridge = bridge;
    }

    setFile(fileName) {
        this.fileName = fileName;
        this.readVoteFile();
    }

    setBetweenVoteTime(interval) {
        this.betweenVoteInterval = interval;
    }

    setVotingTime(interval) {
        this.votingInterval = interval;
    }

    setVotingForTier() {
        // TODO: Add cumulative list filling (Eliminating duplicates in JSON)
        switch(this.tier) {
            case 1: {
                this.voteList = this.votingJSON.voting.tier_1_voting;
            }
            case 2: {
                this.voteList = this.votingJSON.voting.tier_2_voting;
            }
            case 3: {
                this.voteList = this.votingJSON.voting.tier_3_voting;
            }
            default: {
                break;
            }
        }
    }

    initialiseVotingDictionary() {
        const votingDictionary = {}
        this.voteList.forEach(function(item) {
            votingDictionary[item.id] = new Set();
        });

        this.voteDict = votingDictionary;
    }

    callSideVote() {
        console.log('Calling Side Vote');
        this.initialiseVotingDictionary();
        this.bridge.startVoting();

        var t = this;
        this.vote = setTimeout(
            function() { t.tallyVotes(); },
            this.votingInterval
        );
    }

    callVote() {
        console.log('Calling Vote');
        this.initialiseVotingDictionary();
        this.bridge.startVoting();

        var t = this;
        this.vote = setTimeout(
            function() { 
                t.finishVote(t.tallyVotes());
            },
            this.votingInterval
        );
        this.resetTimer();
    }

    endVoteEarly() {
        this.tallyVotes();
        clearTimeout(this.vote);
    }

    castVote(vote_id, voter) {
        this.voteDict[vote_id].add(voter);
    }

    getVoteDetails(vote_id) {
        return this.voteList.filter(d => d.id == vote_id)[0];
    }

    tallyVotes() {
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

        return {entry, maxVotes, tied};
    }

    finishVote(winner) {
        const winnerJSON = this.getVoteDetails(winner.entry);
        this.bridge.voteFinish(winnerJSON, winner.maxVotes, winner.tied);
    }

    advanceTier() {
        if (this.tier == 3) {
            return;
        }
        this.tier = this.tier + 1;
        this.setVotingForTier(tier);
    }

    resetTimer() {
        this.stopTimer(); // Stop timer if timer active
        this.startTimer(); // Stop timer if timer active
    }

    startTimer() {
        this.stopTimer(); // Stop timer if timer active
        var t = this;
        this.timer = setInterval(
            function() { t.callVote(); },
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