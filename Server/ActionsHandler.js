const packetTypes = require('./static/PacketTypes');
const uuid = require('uuid');

class ActionsHandler {
    constructor(dataAccess, onlineUsersPool, packetSender, logger) {
        this.dataAccess = dataAccess;
        this.onlineUsersPool = onlineUsersPool;
        this.packetSender = packetSender;
        this.logger = logger;
    }

    async Register(info, socket) {
        let username = info.Username;
        let successfulRegisterUser = await this.dataAccess.TryRegisterUser(username);

        if (successfulRegisterUser) {
            await this.InitPrivateChats(username);
            this.BroadcastNewUser(username);
            this.logger.info(username + ' has registered.');
        }

        this.packetSender.Send(packetTypes.ServerResponse, successfulRegisterUser, socket);
    }

    async Login(info, socket) {
        let username = info.Username;
        let successfulLogin = false;

        try {
            successfulLogin = await this.dataAccess.IsUserRegistered(username) && this.onlineUsersPool.TryAddUser(username, socket);
        }

        catch(exception) {
            this.logger.warn(successfulLogin);
            successfulLogin = false;
        }

        if (successfulLogin) {
            this.logger.info(username + ' has logged in.');
        }

        this.packetSender.Send(packetTypes.ServerResponse, successfulLogin, socket);
    }

    Logout(info) {
        let username = info.Username;
        let successfulLogout = this.onlineUsersPool.TryRemoveUser(username);

        if (successfulLogout) {
            this.logger.info(username + ' has logged out.');
        }

        else {
            this.logger.warn(username + ' has tried to log out, but the system failed to do so.');
        }
    }

    BroadcastNewUser(username) {
        let onlineUsers = this.onlineUsersPool.GetOnlineUsersUsernames();
        this.SendToOnlineUsers(packetTypes.NewUser, {Username: username}, onlineUsers);
    }

    async CreateNewChat(info) {
        let chatName = info.ChatName;
        let participants = info.Participants.map(participant => participant.Username);
        let chatId = uuid.v4();

        this.dataAccess.CreateNewChat(chatId, chatName, participants);
        this.logger.info('Chat ' + chatName + ' has been created with id ' + chatId);

        let chat = { ChatId: chatId, ChatName: chatName, Messages: [] };
        this.SendToOnlineUsers(packetTypes.NewChat, chat, participants);
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
            this.logger.warn(exception);
        }
    }

    async NewMessage(message) {
        let targetChatId = message.TargetRoomId;

        this.logger.info(message.Sender + ' has sent a new message to room ' + targetChatId + '.');

        // Add message to DB
        await this.dataAccess.AddMessageToChat(targetChatId, message);

        // Send message to online users in the room
        let usersInRoom = await this.dataAccess.GetUsersInChat(targetChatId);
        this.SendToOnlineUsers(packetTypes.NewMessage, message, usersInRoom); 
    }

    async RequestChats(info, socket) {
        try {
            let username = info.Username;
            let chats = await this.dataAccess.GetUserChats(username);
    
            this.logger.info(username + ' has requested his chat history.');
    
            for (const chat of chats) {
                let chatMessages = await this.dataAccess.GetMessagesInChat(chat.ChatId);
                chat.Messages = chatMessages;
                this.packetSender.Send(packetTypes.NewChat, chat, socket);
            }
        }

        catch(exception) {
            this.logger.warn(exception);
        }
    }

    async RequestUsers(socket) {
        let users = [];

        try {
            users = await this.dataAccess.GetAllUsers();   
        }

        catch (exception) {
            this.logger.warn(exception);
        }

        users.forEach((user) => {
            this.packetSender.Send(packetTypes.NewUser, {Username: user}, socket);
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