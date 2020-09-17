const uuid = require('uuid');

class ChatsHandler {
    constructor() {
        this.chats = new Map(); // <chatName, chatId>
    }    

    // Attempt to add a chat. Returns wether attempt was successful.
    TryAddChat(chatName, chatId) {
        this.chats.set(chatName, chatId);
    }
}