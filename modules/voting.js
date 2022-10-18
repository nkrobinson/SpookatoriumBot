const { 
    interencesJsonFile,
    audioInterencesJsonFile,
    betweenVoteTime,
    votingTime,
    tierMaxCount,
    option1File,
    option2File,
    option3File,
    option4File
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
        return Math.ceil((this.timer._idleTimeout - (Date.now() - this.timer.startTime)) / 1000);
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
        this.setTierCount(null);
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

    setTierCount(tierCount) {
        if (tierCount == null) {
            this.tierCount = tierMaxCount;
        }
        else {
            this.tierCount = tierCount;
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

    setVotingList() {
        this.setVotingForTier();
        this.limitVotingOptions();
    }

    setVotingForTier() {
        // Tier Minimum is 1;
        this.fullVoteList = this.votingJSON.voting.tier_1_voting;
        if (this.tier > 1)
            this.fullVoteList = this.fullVoteList.concat(this.votingJSON.voting.tier_2_voting);
        if (this.tier > 2)
            this.fullVoteList = this.fullVoteList.concat(this.votingJSON.voting.tier_3_voting);
    }

    limitVotingOptions() {
        const shuffled = this.fullVoteList.sort(() => 0.5 - Math.random());
        this.voteList = shuffled.slice(0, 5);
    }

    initialiseTier() {
        this.tier = 1;
        this.tierCounter = 1;
        this.setVotingList();
    }

    advanceTier() {
        if (this.tierCounter >= this.tierCount) {
            if (this.tier == 3) {
                return;
            }
            this.tier = this.tier + 1;
            this.setVotingList();
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
            return;
        this.limitVotingOptions();
        this.initialiseVotingDictionary();
        this.outputOptionsToFiles()
        this.voterList = [];
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

    castVote(vote_id, user) {
        this.clearVotes(user);
        this.voteDict[vote_id].add(user);
    }

    clearVotes(user) {
        // If user has previously voted in current vote, remove old vote
        if (this.voterList.includes(user)) {
            for (const key of Object.keys(this.voteDict)) {
                if (this.voteDict[key].has(user)) {
                    this.voteDict[key].delete(user);
                    return;
                }
            }
        }
        // Voter is not in Voter list.
        // Add voter to Voter list.
        this.voterList.push(user);
    }

    getVoteDetails(vote_id) {
        return this.voteList.filter(d => d.id == vote_id)[0];
    }

    tallyVotes(tierAdvance) {
        console.log('Tallying Votes');
        var entry = '';
        var maxVotes = 0;
        var ties = [];
        var localDict = this.voteDict;
        for (const key of Object.keys(localDict)) {
            const size = localDict[key].size;
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
        this.clearOptionFiles();
    }

    resetTimer() {
        this.stopTimer(); // Stop timer if timer active
        this.startTimer(); // Stop timer if timer active
    }

    startTimer() {
        this.stopTimer(); // Stop timer if timer active
        var t = this;
        this.timer = setInterval(
            function() { 
                t.callVote(true);
                t.resetTimer();
            }
           ,this.betweenVoteInterval
        );
        this.timer.startTime = Date.now();
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

    outputOptionsToFiles() {
        // Not using a loop to avoid dynamic file names
        this.writeToFile(option1File, this.voteList[0].name);
        this.writeToFile(option2File, this.voteList[1].name);
        this.writeToFile(option3File, this.voteList[2].name);
        this.writeToFile(option4File, this.voteList[3].name);
    }

    clearOptionFiles() {
        // Not using a loop to avoid dynamic file names
        this.writeToFile(option1File, '');
        this.writeToFile(option2File, '');
        this.writeToFile(option3File, '');
        this.writeToFile(option4File, '');
    }

    writeToFile(fileName, text) {
        fs.writeFile(fileName, text, err => {
            if (err) {
              console.error(err);
              return;
            }
            //file written successfully
          });
    }

}