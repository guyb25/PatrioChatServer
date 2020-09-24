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

    AddMessageToChat(chatId, message) {
        let chatRoom = this.GetChat(chatId);
        chatRoom.AddMessage(message);
    }
}

module.exports = ChatsHandler;