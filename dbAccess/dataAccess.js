const SimpleNodeLogger = require('simple-node-logger');
const logConfigs = require('config').get('logConfigs');
let logger = SimpleNodeLogger.createSimpleFileLogger(logConfigs.dbLogFileName);

class DataAccess {
    constructor(chatMessagesDB, userChatsDB) {
        this.chatMessagesDB = chatMessagesDB;
        this.userChatsDB = userChatsDB;
    }

    async connect() {
        try {
            this.chatMessagesDB.connect();
        }

        catch(exception) {
            logger.fatal(exception);
            throw 'unable to connect to chat-messages db.';
        }

        try {
            await this.userChatsDB.connect();
        }

        catch(exception) {
            logger.fatal(exception);
            throw 'unable to connect to user-chats db.';
        }
    }

    shutdown() {
        this.chatMessagesDB.shutdown();
        this.userChatsDB.shutdown();
    }

    async tryRegisterUser(username) {
        try {
            return await this.userChatsDB.tryRegisterUser(username)
        }

        catch(exception) {
            logger.error(exception);
            return false;
        }
    }

    async isUserRegistered(username) { 
        try {
            return await this.userChatsDB.isUserRegistered(username);
        }

        catch(exception) {
            logger.error(exception);
            throw 'Database failed to check if user is registered. Username: ' + username + '.';
        }
    }

    async createNewChat(chatId, chatName, participants) {
        try {
            await this.userChatsDB.addChat(chatId, chatName);
            await this.chatMessagesDB.addChat(chatId, chatName);
    
            for (const participant of participants) {
                await this.userChatsDB.addUserToChat(participant, chatId);
            }
        }

        catch(exception) {
            logger.error(exception);
        }
    }

    async addMessageToChat(chatId, message) {
        try {
            await this.chatMessagesDB.addMessageToChat(chatId, message);
        }

        catch(exception) {
            logger.error(exception);
        }
    }

    async getAllUsers() {
        try {
            return await this.userChatsDB.getAllUsers();
        }

        catch(exception) {
            logger.error(exception);
            throw 'Database failed to fetch the users.';
        }
    }

    async getUsersInChat(chatId) {
        try {
            return await this.userChatsDB.getUsersInChat(chatId);
        }

        catch(exception) {
            logger.error(exception);
            throw 'Database failed to fetch the users in the chat! chatId: ' + chatId + '.';
        }
    }

    async getUserChats(username) {
        try {
            return await this.userChatsDB.getUserChats(username);
        }

        catch(exception) {
            logger.error(exception);
            throw 'Database failed to fetch the chats of the user. Username: ' + username + '.';
        }
    }

    async getMessagesInChat(chatId) {
        try {
            return await this.chatMessagesDB.getMessages(chatId);
        }

        catch(exception) {
            logger.error(exception);
            throw 'Database failed to fetch the messages in the chat. chatId: ' + chatId + '.';
        }
    }
}

module.exports = DataAccess;