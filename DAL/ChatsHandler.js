const uuid = require('uuid');

class ChatsHandler {
    constructor() {
        this.chats = new Map(); // <chatId, chat>
    }    

    // Attempt to add a chat. Returns wether attempt was successful.
    TryAddChat(chat) {
        let id = uuid.v4();
        this.chats.set(id, chat);
        return this.chats.has(id);
    }
}

module.exports = ChatsHandler;