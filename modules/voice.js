const { joinVoiceChannel,
        createAudioPlayer,
        createAudioResource, 
        getVoiceConnection
} = require('@discordjs/voice');
const { guild_id } = require('../config/config.json');
const fs = require('fs');

exports.Voice = class Voice {

    get connection() {
        if (this.vc == null)
            return getVoiceConnection(myVoiceChannel.guild.id);
        return this.vc;
    }

    get inVoiceChannel() {
        if (this.vc == null)
            return false;
        return this.vc.state.status === 'ready';
    }

    get isPlaying() {
        if (this.player == null)
            return false;
        return this.player.state.status === 'playing';
    }

    constructor(client) {
        this.client = client;
        this.player = createAudioPlayer();

        this.player.on('stateChange', (oldState, newState) => {
            console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
        });

        this.readMediaJSON();
    }

    readMediaJSON() {
        console.log('Reading from media file media.json');
        const media = fs.readFileSync('./config/media.json');
        this.mediaList = JSON.parse(media).media;
    }

    connect(channel_id, guild_id, adapterCreator) {
        this.vc = joinVoiceChannel({
            channelId: channel_id,
            guildId: guild_id,
            adapterCreator: adapterCreator
        });

        this.vc.on('stateChange', (oldState, newState) => {
            console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
        });
    }

    disconnect() {
        this.connection.destroy();
    }

    pause(){
        this.player.pause()
    }

    resume(){
        this.player.unpause()
    }

    stop(){
        this.player.stop();
    }

    completeMediaSource(mediaSource) {
        if (mediaSource.search('\.mp3$') === -1) {

            return mediaSource + '.mp3';
        }
        return mediaSource;
    }

    playMediaCategory(category, tier) {
        if (!this.inVoiceChannel) return;
        if (this.mediaList == null) return;

        var filteredMediaList = [];
        if (category === "all") {
            filteredMediaList = this.mediaList.filter(d => d.tier <= tier);
        } else {
            filteredMediaList = this.mediaList.filter(d => d.category == category && d.tier <= tier);
        }

        const mediaSource = filteredMediaList[Math.floor(Math.random()*filteredMediaList.length)];

        this.playMedia(mediaSource.source);
    }

    playMedia(mediaSource) {
        if (!this.inVoiceChannel) return;

        const source = `./media/${this.completeMediaSource(mediaSource)}`

        console.log(`playing ${source}`);

        const resource = createAudioResource(source);
        this.player.play(resource);
        this.vc.subscribe(this.player);
    }

}