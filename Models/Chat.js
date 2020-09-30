class Chat {
    constructor(chatName) {
        this.ChatName = chatName;
        this.Messages = [];
    }

    AddMessage(message) {
        this.Messages.push(message);
    }
}

module.exports = Chat;