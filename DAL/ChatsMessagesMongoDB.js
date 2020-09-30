let MongoClient = require('mongodb').MongoClient;
const constants = require('./static/ChatsMessagesMongoDBConstants');

class ChatsMessagesMongoDB {
    constructor() {
        MongoClient.connect(constants.url, (err, db) => {
            this.db = db.db(constants.dbName);
            this.collection = this.db.collection(constants.collectionName);
        });
    }

    async AddChat(chat, chatId) {
        chat.ChatId = chatId;
        await this.collection.insertOne(chat);
    }

    async GetMessages(chatId) {
        let query = { ChatId: chatId };
        let result = await this.collection.findOne(query);
        return result.Messages;
    }

    async AddMessageToChat(chatId, message) {
        let messages = await this.GetMessages(chatId);
        messages.push(message);

        let findQuery = { ChatId: chatId };
        let setQuery = { $set: { Messages: messages } };
        await this.collection.updateOne(findQuery, setQuery);
    }
}

module.exports = ChatsMessagesMongoDB;