const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { votingChannelId,votingTime, twitchChannel } = require('../config/config.json');
const { Challenge } = require('./challenge');

exports.Bridge = class Bridge {

    constructor(client, twitchClient, voice, voting) {
        this.client = client;
        this.twitchClient = twitchClient;
        this.voice = voice;
        this.voting = voting;

        this.voting.setBridge(this);

        this.challenge = new Challenge();

        this.channelId = votingChannelId;
    }

    playVoteAudio(audioCategory) {
        this.voice.playMediaCategory(audioCategory, this.voting.tier);
    }

    voteFinish(winner, votes, tied) {
        const channel = this.client.channels.cache.get(this.channelId)

        // Announce Voting end to Twitch
        this.twitchClient.say(twitchChannel, `The Interference Vote has ended!`);

        if (votes === 0 )
            return channel.send(`Voting Failed. No votes cast.`);

        if (tied)
            channel.send(`Voting has Finished. \n${winner.name} won after being randomly selected from tying winners with ${votes} votes.`);
        else
            channel.send(`Voting has Finished. \n${winner.name} won with ${votes} votes.`);

        switch (winner.type) {
            case "sound":
                this.playVoteAudio(winner.audio_category);
                break;
            case "challenge":
                if (winner.challenge_start != null)
                    this.voice.playMedia(winner.challenge_start);

                this.challenge.startChallenge(winner);

                if (winner.challenge_end != null) {
                    const timer = setInterval(() => {
                        if (this.challenge.remainingChallengeTime <= 0) {
                            this.voice.playMedia(winner.challenge_end);
                            clearInterval(timer);
                        }
                    }, 1000);
                }
                break;
            default:
                console.log(`unexpected interference type: ${winner.type}`);
        }
    }

    startVoting() {
		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('vote')
					.setLabel('Vote')
					.setStyle('Primary'),
			);
        const channel = this.client.channels.cache.get(this.channelId)
        const promise = channel.send({
            content: `Voting has started!\nClick the Vote button for an interference for the Participant\nYou have ${votingTime/1000} seconds left (may have up to a 5 second delay)`
           ,components: [row] 
        });
        this.twitchVotingAnnounce();
        const voting = this.voting;
        promise.then(
            function(msg) {
                const timer = setInterval(() => {
                    if (voting.vote != null) {
                        msg.edit({ 
                            content: `Voting has started!\nClick the Vote button for an interference for the Participant\nYou have ${voting.votingTimeLeft} seconds left (may have up to a 5 second delay)`
                           ,components: [row] 
                        });
                        voting.writeTimeToFile();
                    } else {
                        msg.edit({ 
                            content: `Voting has finished`
                           ,components: [] 
                        });
                        voting.clearTimeFile();
                        clearInterval(timer);
                    }
                }, 1000);

            },
            function(error) { console.log(error) }
        )
    }

    twitchVotingAnnounce() {
        // Announce Voting
        this.twitchClient.say(twitchChannel, `Interference Vote Started!`);

        // Get Voting Options
        let votingOptions = this.voting.votingOptionsJSON;
        
        // Announce Voting Options
        // Use single message for all the Voting Options
        let optionsText = '';
        for (let i = 0; i < 4; i++) {
            optionsText = optionsText + `Use !vote ${i+1} to vote for the ${votingOptions[i].label} Interference - ${votingOptions[i].description}`;
            if (i != 3) {
                optionsText = optionsText + ' | '
            }
        }
        this.twitchClient.say(twitchChannel, `${optionsText}`);
    }

}