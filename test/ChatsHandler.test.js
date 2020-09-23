const assert = require('assert');
const ChatsHandler = require('../DAL/ChatsHandler');
const Chat = require('../Models/Chat');

describe('ChatsHandlerTests', () => {
    it('test add chat', () => {
        let chatsHandler = new ChatsHandler();
        let chat = new Chat('test chat');
        let chatId = chatsHandler.AddChat(chat);
        let chatFromChatHandler = chatsHandler.GetChat(chatId);
        assert.equal(chat.chatName, chatFromChatHandler.chatName);
    });
});