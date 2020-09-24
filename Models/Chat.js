class Chat {
    constructor(chatName) {
        this.chatName = chatName;
        this.messages = [];
    }

    AddMessage(message) {
        this.messages.push(message);
    }
}

module.exports = Chat;