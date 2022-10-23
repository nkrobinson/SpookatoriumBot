const { 
    infoJsonFile,
    infoInterval,
    twitchChannel
} = require('../config/config.json');
const fs = require('fs');

exports.Info = class Info {

    get isActive() {
        return this.timer != null;
    }

    constructor(twitchClient) {
        this.interval = infoInterval;
        this.listIndex = 0;
        this.tClient = twitchClient;
        this.timer = null;
        this.infoList = [];

        this.readInfoFile();
    }

    readInfoFile() {
        console.log(`Reading from file ${infoJsonFile}`);
        const info = fs.readFileSync(infoJsonFile);
        this.getMessageListFromJSON(JSON.parse(info));
    }

    getMessageListFromJSON(infoJSON) {
        let infoList = [];
        infoJSON.forEach(info => {
            infoList.push(info.text);
        });
        this.infoList = infoList;
    }

    setInterval(interval) {
        this.interval = interval;
    }

    setDefaultInterval() {
        this.setInterval(infoInterval);
    }

    startMessages() {
        this.stopMessages(); // Stop timer if timer active
        var t = this;
        this.timer = setInterval(
            function() {
                t.sendMessage();
            }
           ,this.interval
        );
    }

    stopMessages() {
        if (this.isActive) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    sendMessage() {
        let index = this.listIndex;
        let message = this.infoList[index];

        index++;
        if (index >= this.infoList.length)
            index = 0;
        this.listIndex = index;

		this.tClient.say(twitchChannel, message);
    }

}