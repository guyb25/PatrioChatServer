class DataAccess {
    constructor(chatMessagesDB, userChatsDB, logger) {
        this.chatMessagesDB = chatMessagesDB;
        this.userChatsDB = userChatsDB;
        this.logger = logger;
    }

    async TryRegisterUser(username) {
        try {
            return await this.userChatsDB.TryRegisterUser(username)
        }

        catch(exception) {
            this.logger.error(exception);
            return false;
        }
    }

    async IsUserRegistered(username) { 
        try {
            return await this.userChatsDB.IsUserRegistered(username);
        }

        catch(exception) {
            this.logger.error(exception);
            throw 'Database failed to check if user is registered. Username: ' + username + '.';
        }
    }

    async CreateNewChat(chatId, chatName, participants) {
        try {
            await this.userChatsDB.AddChat(chatId, chatName);
            await this.chatMessagesDB.AddChat(chatId, chatName);
    
            for (const participant of participants) {
                await this.userChatsDB.AddUserToChat(participant, chatId);
            }
        }

        catch(exception) {
            this.logger.error(exception);
        }
    }

    async AddMessageToChat(chatId, message) {
        try {
            await this.chatMessagesDB.AddMessageToChat(chatId, message);
        }

        catch(exception) {
            this.logger.error(exception);
        }
    }

    async GetAllUsers() {
        try {
            return await this.userChatsDB.GetAllUsers();
        }

        catch(exception) {
            this.logger.error(exception);
            throw 'Database failed to fetch the users.';
        }
    }

    async GetUsersInChat(chatId) {
        try {
            return await this.userChatsDB.GetUsersInChat(chatId);
        }

        catch(exception) {
            this.logger.error(exception);
            throw 'Database failed to fetch the users in the chat! chatId: ' + chatId + '.';
        }
    }

    async GetUserChats(username) {
        try {
            return await this.userChatsDB.GetUserChats(username);
        }

        catch(exception) {
            this.logger.error(exception);
            throw 'Database failed to fetch the chats of the user. Username: ' + username + '.';
        }
    }

    async GetMessagesInChat(chatId) {
        try {
            return await this.chatMessagesDB.GetMessages(chatId);
        }

        catch(exception) {
            this.logger.error(exception);
            throw 'Database failed to fetch the messages in the chat. chatId: ' + chatId + '.';
        }
    }
}

module.exports = DataAccess;