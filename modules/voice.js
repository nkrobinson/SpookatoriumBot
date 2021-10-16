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

    playMedia(mediaSource) {
        if (!this.inVoiceChannel)
            return;
        // TODO: Check if source has file suffix, if not add it

        const resource = createAudioResource(`./media/${mediaSource}`);
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