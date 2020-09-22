class Chat {
    constructor(chatName) {
        this.chatName = chatName;
        this.messages = [];
    }

    addMessage(message) {
        this.messages.push(message);
    }
}

module.exports = Chat;