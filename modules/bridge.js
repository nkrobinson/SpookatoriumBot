const { votingChannelId } = require('../config/config.json');

exports.Bridge = class Bridge {

    constructor(client, voice, voting) {
        this.client = client;
        this.voice = voice;
        this.voting = voting;

        this.voting.setBridge(this);

        this.channelId = votingChannelId;
    }

    playVoteAudio(audioCategory) {
        this.voice.playMediaCategory(audioCategory, this.voting.tier);
    }

    voteFinish(winner, votes, tied) {
        const channel = this.client.channels.cache.get(this.channelId)

        if (votes === 0 )
            return channel.send(`Voting Failed. No votes cast.`);

        if (tied)
            channel.send(`Voting has Finished. \n${winner.name} won after being randomly selected from tying winners with ${votes} votes.`);
        else
            channel.send(`Voting has Finished. \n${winner.name} won with ${votes} votes.`);

        if (winner.audio_category != null) {
            this.playVoteAudio(winner.audio_category)
        }
    }

    startVoting() {
        const channel = this.client.channels.cache.get(this.channelId)
        channel.send('Voting has started! Use `/vote` to vote for an interference for the Participant');
    }

}