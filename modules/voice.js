const { joinVoiceChannel,
        createAudioPlayer,
        createAudioResource, 
        getVoiceConnection
} = require('@discordjs/voice');
const { guildId } = require('../config/config.json');
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

    get playOptionsAmount() {
        return this.optionsAmount;
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

    setPlayId(commandId) {
        this.playId = commandId;
    }

    updatePlayCommand(client) {
        let optionsJSON = [];
        let index = 0;
        
        // Get list of all the mp3 files in the media folder
        const mediaFiles = fs.readdirSync('./media').filter(file => file.endsWith('.mp3'));
        
        // Get amount of options requiring added to the command
        const optionsAmount = Math.ceil(mediaFiles.length / 25);

        // Generate an Option for each set of 25
        // (Yes this is a bit insane. Not sure if there is a limit to number of dropdowns)
        for (let i = 0; i < optionsAmount; i++) {

            let mediaJSON = [];
            
            // Discord has a dropdown limit of 25
            // Limit each dropdown parameter to 25 options
            for (let j = 0; j < 25; j++) {

                if (index >= mediaFiles.length)
                    break;
                
                mediaJSON.push(
                    {
                        name: `${mediaFiles[index]}`,
                        value: `${mediaFiles[index]}`
                    }
                );
                index++;
            }

            optionsJSON.push(
                {
                    name: `source${i}`,
                    description: "The Audio file to play",
                    type: 3,
                    required: false,
                    choices: mediaJSON
                }
            );

        }

        client.guilds.cache.get(guildId)?.commands.edit(this.playId, {
            options: optionsJSON
        });

        this.optionsAmount = optionsAmount;
    }

}