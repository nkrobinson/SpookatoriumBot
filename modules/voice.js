const { joinVoiceChannel,
        createAudioPlayer,
        createAudioResource, 
        getVoiceConnection
} = require('@discordjs/voice');
const { guild_id } = require('../config.json');

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

    completeMediaSource(mediaSource) {
        if (mediaSource.search('\.mp3$') === -1) {

            return mediaSource + '.mp3';
        }
        return mediaSource;
    }

    playMedia(mediaSource) {
        if (!this.inVoiceChannel)
            return;

        const source = `./media/${this.completeMediaSource(mediaSource)}`

        const resource = createAudioResource(source);
        this.player.play(resource);
        this.vc.subscribe(this.player);
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

}