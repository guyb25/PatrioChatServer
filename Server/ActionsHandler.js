const packetTypes = require('./static/PacketTypes');
const protcolConfigs = require('./static/ProtocolConfigs');
const Chat = require('../Models/Chat');
const Packet = require('../Models/Packet');

class ActionsHandler {
    constructor(userChatsDB, chatMessagesDB, onlineUsersPool, packetSender, logger) {
        this.userChatsDB = userChatsDB;
        this.chatMessagesDB = chatMessagesDB;
        this.onlineUsersPool = onlineUsersPool;
        this.packetSender = packetSender;
        this.logger = logger;
    }

    async Register(info, socket) {
        let username = info.Username;
        let successfulRegisterUser = await this.userChatsDB.TryRegisterUser(username);

        if (successfulRegisterUser) {
            await this.InitPrivateChats(username);
            this.BroadcastNewUser(username);
            this.logger.info(username + ' has registered.');
        }

        this.packetSender.Send(packetTypes.ServerResponse, successfulRegisterUser, socket);
    }

    async Login(info, socket) {
        let username = info.Username;
        let successfulLogin = await this.userChatsDB.IsUserRegistered(username) && this.onlineUsersPool.TryAddUser(username, socket);

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

        let chat = new Chat(chatName);
        let chatId = await this.userChatsDB.AddChat(chatName);
        await this.chatMessagesDB.AddChat(chat, chatId);

        for (const participant of participants) {
            await this.userChatsDB.AddUserToChat(participant, chatId);
        }

        this.logger.info('Chat ' + chatName + ' has been created with id ' + chatId);

        this.SendToOnlineUsers(packetTypes.NewChat, {...chat, chatId}, participants);
    }

    async InitPrivateChats(newUser) {
        let users = await this.userChatsDB.GetAllUsers();
        let newUserIndex = users.indexOf(newUser);

        if (newUserIndex !== -1)
        {
            users.splice(newUserIndex, 1);
        }

        for (const user of users) {
            await this.CreateNewChat({ChatName: user + ' & ' + newUser, Participants: [{Username: newUser}, {Username: user}]});
        }   
    }

    async NewMessage(message) {
        let targetRoomId = message.TargetRoomId;

        this.logger.info(message.Sender + ' has sent a new message to room ' + targetRoomId + '.');

        // Add message to DB
        await this.chatMessagesDB.AddMessageToChat(targetRoomId, message);

        // Send message to online users in the room
        let usersInRoom = await this.userChatsDB.GetUsersInChat(targetRoomId);
        this.SendToOnlineUsers(packetTypes.NewMessage, message, usersInRoom); 
    }

    async RequestChats(info, socket) {
        let username = info.Username;
        let chats = await this.userChatsDB.GetUserChats(username);

        this.logger.info(username + ' has requested his chat history.');

        for (const chat of chats) {
            let chatMessages = await this.chatMessagesDB.GetMessages(chat.ChatId);
            chat.Messages = chatMessages;
            this.packetSender.Send(packetTypes.NewChat, chat, socket);
        }
    }

    async RequestUsers(socket) {
        let users = await this.userChatsDB.GetAllUsers();

        users.forEach((user) => {
            this.packetSender.Send(packetTypes.NewUser, {Username: user}, socket);
        });
    }

    SendToOnlineUsers(packetType, packetContent, users) {
        let onlineUsers = users.filter(user => this.onlineUsersPool.IsUserOnline(user));

        onlineUsers.forEach(user => {
            try {
                let socket = this.onlineUsersPool.GetUserSocket(user);
                this.packetSender.Send(packetType, packetContent, socket);
            }

            catch(exception) {
                this.logger.error('Exception thrown when trying to send a packet to ' + user + '. \n' + 
                'Packet: \n' +
                JSON.stringify(packet) + '\n' +
                'Exception: \n' + 
                JSON.stringify(exception));
            }
        });
    }
}

module.exports = ActionsHandler;