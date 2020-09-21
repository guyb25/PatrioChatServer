const uuid = require('uuid');

class ChatsHandler {
    constructor() {
        this.chats = new Map(); // <chatId, chat>
    }    

    // Attempt to add a chat. Returns wether attempt was successful.
    TryAddChat(chatName) {
        let id = uuid.v4();
        this.chats.set(id, chatName);
        return this.chats.has(id) && this.chats.get(id) == chatName;
    }
}

module.exports = ChatsHandler;