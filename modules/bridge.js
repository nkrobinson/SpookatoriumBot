const { MessageActionRow, MessageButton } = require('discord.js');
const { votingChannelId,votingTime } = require('../config/config.json');

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
		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('vote')
					.setLabel('Vote')
					.setStyle('PRIMARY'),
			);
        const channel = this.client.channels.cache.get(this.channelId)
        const promise = channel.send({
            content: `Voting has started!\nClick the Vote button for an interference for the Participant\nYou have ${votingTime/1000} seconds left (may have up to a 5 second delay)`
           ,components: [row] 
        });
        const voting = this.voting;
        promise.then(
            function(msg) {
                const timer = setInterval(() => {
                    if (voting.vote != null) {
                        msg.edit({ 
                            content: `Voting has started!\nClick the Vote button for an interference for the Participant\nYou have ${voting.votingTimeLeft} seconds left (may have up to a 5 second delay)`
                           ,components: [row] 
                        })
                    } else {
                        msg.edit({ 
                            content: `Voting has finished`
                           ,components: [] 
                        });
                        clearInterval(timer);
                    }
                }, 1000);

            },
            function(error) { console.log(error) }
        )
    }

}