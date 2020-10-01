const SimpleNodeLogger = require('simple-node-logger');
const logConfigs = require('config').get('logConfigs');
const logger = SimpleNodeLogger.createSimpleLogger(logConfigs.actionsLogFileName);
const packetTypes = require('config').get('protocolConfigs').get('packetTypes');
const uuid = require('uuid');

class ActionsHandler {
    constructor(dataAccess, onlineUsersPool, packetSender) {
        this.dataAccess = dataAccess;
        this.onlineUsersPool = onlineUsersPool;
        this.packetSender = packetSender;
    }

    async Register(info, socket) {
        let username = info.Username;
        let successfulRegisterUser = await this.dataAccess.TryRegisterUser(username);

        if (successfulRegisterUser) {
            await this.InitPrivateChats(username);
            this.BroadcastNewUser(username);
            logger.info(username + ' has registered.');
        }

        this.packetSender.Send(packetTypes.serverResponse, successfulRegisterUser, socket);
    }

    async Login(info, socket) {
        let username = info.Username;
        let successfulLogin = false;

        try {
            successfulLogin = await this.dataAccess.IsUserRegistered(username) && this.onlineUsersPool.TryAddUser(username, socket);
        }

        catch(exception) {
            logger.warn(exception);
            successfulLogin = false;
        }

        if (successfulLogin) {
            logger.info(username + ' has logged in.');
        }

        this.packetSender.Send(packetTypes.serverResponse, successfulLogin, socket);
    }

    Logout(info) {
        let username = info.Username;
        let successfulLogout = this.onlineUsersPool.TryRemoveUser(username);

        if (successfulLogout) {
            logger.info(username + ' has logged out.');
        }

        else {
            logger.warn(username + ' has tried to log out, but the system failed to do so.');
        }
    }

    BroadcastNewUser(username) {
        let onlineUsers = this.onlineUsersPool.GetOnlineUsersUsernames();
        this.SendToOnlineUsers(packetTypes.newUser, {Username: username}, onlineUsers);
    }

    async CreateNewChat(info) {
        let chatName = info.ChatName;
        let participants = info.Participants.map(participant => participant.Username);
        let chatId = uuid.v4();

        this.dataAccess.CreateNewChat(chatId, chatName, participants);
        logger.info('Chat ' + chatName + ' has been created with id ' + chatId);

        let chat = { ChatId: chatId, ChatName: chatName, Messages: [] };
        this.SendToOnlineUsers(packetTypes.newChat, chat, participants);
    }

    async InitPrivateChats(newUser) {
        try {
            let users = await this.dataAccess.GetAllUsers();
            let newUserIndex = users.indexOf(newUser);

            if (newUserIndex !== -1)
            {
                users.splice(newUserIndex, 1);
            }

            for (const user of users) {
                await this.CreateNewChat({ChatName: user + ' & ' + newUser, Participants: [{Username: newUser}, {Username: user}]});
            }   
        }
        
        catch(exception) {
            logger.warn(exception);
        }
    }

    async NewMessage(message) {
        let targetChatId = message.TargetRoomId;

        logger.info(message.Sender + ' has sent a new message to room ' + targetChatId + '.');

        // Add message to DB
        await this.dataAccess.AddMessageToChat(targetChatId, message);

        // Send message to online users in the room
        let usersInRoom = await this.dataAccess.GetUsersInChat(targetChatId);
        this.SendToOnlineUsers(packetTypes.newMessage, message, usersInRoom); 
    }

    async RequestChats(info, socket) {
        try {
            let username = info.Username;
            let chats = await this.dataAccess.GetUserChats(username);
    
            logger.info(username + ' has requested his chat history.');
    
            for (const chat of chats) {
                let chatMessages = await this.dataAccess.GetMessagesInChat(chat.ChatId);
                chat.Messages = chatMessages;
                this.packetSender.Send(packetTypes.newChat, chat, socket);
            }
        }

        catch(exception) {
            logger.warn(exception);
        }
    }

    async RequestUsers(socket) {
        let users = [];

        try {
            users = await this.dataAccess.GetAllUsers();   
        }

        catch (exception) {
            logger.warn(exception);
        }

        users.forEach((user) => {
            this.packetSender.Send(packetTypes.newUser, {Username: user}, socket);
        });
    }

    SendToOnlineUsers(packetType, packetContent, users) {
        let onlineUsers = users.filter(user => this.onlineUsersPool.IsUserOnline(user));

        onlineUsers.forEach(user => {
            let socket = this.onlineUsersPool.GetUserSocket(user);
            this.packetSender.Send(packetType, packetContent, socket);
        });
    }
}

module.exports = ActionsHandler;