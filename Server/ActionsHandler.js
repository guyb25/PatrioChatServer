const SimpleNodeLogger = require('simple-node-logger');
const logConfigs = require('config').get('logConfigs');
const logger = SimpleNodeLogger.createSimpleFileLogger(logConfigs.actionsLogFileName);
const packetTypes = require('config').get('protocolConfigs').get('packetTypes');
const uuid = require('uuid');

class ActionsHandler {
    constructor(dataAccess, onlineUsersPool, packetSender) {
        this.dataAccess = dataAccess;
        this.onlineUsersPool = onlineUsersPool;
        this.packetSender = packetSender;
    }

    async register(info, socket) {
        let username = info.Username;
        let successfulRegisterUser = await this.dataAccess.tryRegisterUser(username);

        if (successfulRegisterUser) {
            await this.initPrivateChats(username);
            this.broadcastNewUser(username);
            logger.info(username + ' has registered.');
        }

        this.packetSender.send(packetTypes.serverResponse, successfulRegisterUser, socket);
    }

    async login(info, socket) {
        let username = info.Username;
        let successfulLogin = false;

        try {
            successfulLogin = await this.dataAccess.isUserRegistered(username) && this.onlineUsersPool.tryAddUser(username, socket);
        }

        catch(exception) {
            logger.warn(exception);
            successfulLogin = false;
        }

        if (successfulLogin) {
            logger.info(username + ' has logged in.');
        }

        this.packetSender.send(packetTypes.serverResponse, successfulLogin, socket);
    }

    logout(info) {
        let username = info.Username;
        let successfulLogout = this.onlineUsersPool.tryRemoveUser(username);

        if (successfulLogout) {
            logger.info(username + ' has logged out.');
        }

        else {
            logger.warn(username + ' has tried to log out, but the system failed to do so.');
        }
    }

    broadcastNewUser(username) {
        let onlineUsers = this.onlineUsersPool.getOnlineUsersUsernames();
        this.sendToOnlineUsers(packetTypes.newUser, {Username: username}, onlineUsers);
    }

    async createNewChat(info) {
        let chatName = info.ChatName;
        let participants = info.Participants.map(participant => participant.Username);
        let chatId = uuid.v4();

        this.dataAccess.createNewChat(chatId, chatName, participants);
        logger.info('Chat ' + chatName + ' has been created with id ' + chatId);

        let chat = { ChatId: chatId, ChatName: chatName, Messages: [] };
        this.sendToOnlineUsers(packetTypes.newChat, chat, participants);
    }

    async initPrivateChats(newUser) {
        try {
            let users = await this.dataAccess.getAllUsers();
            let newUserIndex = users.indexOf(newUser);

            if (newUserIndex !== -1)
            {
                users.splice(newUserIndex, 1);
            }

            for (const user of users) {
                await this.createNewChat({ChatName: user + ' & ' + newUser, Participants: [{Username: newUser}, {Username: user}]});
            }   
        }
        
        catch(exception) {
            logger.warn(exception);
        }
    }

    async newMessage(message) {
        let targetChatId = message.TargetRoomId;

        logger.info(message.Sender + ' has sent a new message to room ' + targetChatId + '.');

        // Add message to DB
        await this.dataAccess.addMessageToChat(targetChatId, message);

        // Send message to online users in the room
        let usersInRoom = await this.dataAccess.getUsersInChat(targetChatId);
        this.sendToOnlineUsers(packetTypes.newMessage, message, usersInRoom); 
    }

    async requestChats(info, socket) {
        try {
            let username = info.Username;
            let chats = await this.dataAccess.getUserChats(username);
    
            logger.info(username + ' has requested his chat history.');
    
            for (const chat of chats) {
                let chatMessages = await this.dataAccess.getMessagesInChat(chat.ChatId);
                chat.Messages = chatMessages;
                this.packetSender.send(packetTypes.newChat, chat, socket);
            }
        }

        catch(exception) {
            logger.warn(exception);
        }
    }

    async requestUsers(socket) {
        let users = [];

        try {
            users = await this.dataAccess.getAllUsers();   
        }

        catch (exception) {
            logger.warn(exception);
        }

        users.forEach((user) => {
            this.packetSender.send(packetTypes.newUser, {Username: user}, socket);
        });
    }

    sendToOnlineUsers(packetType, packetContent, users) {
        let onlineUsers = users.filter(user => this.onlineUsersPool.isUserOnline(user));

        onlineUsers.forEach(user => {
            let socket = this.onlineUsersPool.getUserSocket(user);
            this.packetSender.send(packetType, packetContent, socket);
        });
    }
}

module.exports = ActionsHandler;