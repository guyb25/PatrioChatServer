let MongoClient = require('mongodb').MongoClient;
const configs = require('config').get('databaseConfigs').get('chatsMessagesDbConfigs');

class ChatsMessagesMongoDB {
    constructor() {
        MongoClient.connect(configs.url, (err, db) => {
            this.db = db.db(configs.dbName);
            this.collection = this.db.collection(configs.collectionName);
        });
    }

    async addChat(chatId, chatName) {
        let chat = { ChatId: chatId, ChatName: chatName, Messages: []}
        await this.collection.insertOne(chat);
    }

    async getMessages(chatId) {
        let query = { ChatId: chatId };
        let result = await this.collection.findOne(query);
        return result.Messages;
    }

    async addMessageToChat(chatId, message) {
        let messages = await this.getMessages(chatId);
        messages.push(message);

        let findQuery = { ChatId: chatId };
        let setQuery = { $set: { Messages: messages } };
        await this.collection.updateOne(findQuery, setQuery);
    }
}

module.exports = ChatsMessagesMongoDB;