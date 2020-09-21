class Chat {
    constructor(chatName) {
        this.chatName = chatName;
        this.participants = [];
        this.messages = [];
    }

    addUser(user) {
        this.participants.push(user);
    }

    addMessage(message) {
        this.messages.push(message);
    }
}