const assert = require('assert');
const ChatsHandler = require('../DAL/ChatsHandler');
const Chat = require('../Models/Chat');

describe('ChatsHandlerTests', () => {
    it('test add chat', () => {
        let chatsHandler = new ChatsHandler();
        let chat = new Chat('test chat');
        let chatId = chatsHandler.AddChat(chat);
        let chatFromChatHandler = chatsHandler.GetChat(chatId);
        assert.strictEqual(chat.chatName, chatFromChatHandler.chatName);
    });

    it('test add message to chat', () => {
        let chatsHandler = new ChatsHandler();
        let chat = new Chat('test chat');
        let fakeMessage = 'fake message';
        let chatId = chatsHandler.AddChat(chat);

        chatsHandler.AddMessageToChat(chatId, fakeMessage);

        let chatFromChatHandler = chatsHandler.GetChat(chatId);
        assert.strictEqual(true, chatFromChatHandler.messages.includes(fakeMessage));
        assert.strictEqual(1, chatFromChatHandler.messages.length);
    });
});