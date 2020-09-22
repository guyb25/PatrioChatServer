const uuid = require('uuid');

class ChatsHandler {
    constructor() {
        this.chats = new Map(); // <chatId, chat>
    }    

    AddChat(chat) {
        let id = uuid.v4();
        this.chats.set(id, chat);
        return id;
    }

    GetChat(chatId) {
        return this.chats.get(chatId);
    }
}

module.exports = ChatsHandler;