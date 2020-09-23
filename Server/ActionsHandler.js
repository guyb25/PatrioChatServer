const packetTypes = require('./static/PacketTypes');
const protcolConfigs = require('./static/ProtocolConfigs');
const Chat = require('../Models/Chat');
const Packet = require('../Models/Packet');

class ActionsHandler {
    constructor(usersHandler, chatsHandler, onlineUsersPool, packetSender, logger) {
        this.usersHandler = usersHandler;
        this.chatsHandler = chatsHandler;
        this.onlineUsersPool = onlineUsersPool;
        this.packetSender = packetSender;
        this.logger = logger;
    }

    Register(info, socket) {
        let username = info.Username;
        let successfulAddUser = this.usersHandler.TryAddUser(username);

        if (successfulAddUser) {
            this.InitPrivateChats(username);
            this.logger.info(username + ' has registered.');
        }

        this.packetSender.Send(new Packet(packetTypes.ServerResponse, successfulAddUser), socket);
    }

    Login(info, socket) {
        let username = info.Username;
        let successfulLogin = this.usersHandler.IsUserRegistered(username) && this.onlineUsersPool.TryAddUser(username, socket);

        if (successfulLogin) {
            this.logger.info(username + ' has logged in.');
        }

        this.packetSender.Send(new Packet(packetTypes.ServerResponse, successfulLogin), socket);
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

    InitPrivateChats(newUser) {
        let users = this.usersHandler.users;
        users.forEach((user) => {
            if (user != newUser) {
                // Add chat room to db
                let chat = new Chat(user + ' & ' + newUser);
                let chatId = this.chatsHandler.AddChat(chat);
                this.usersHandler.AddUserToChat(newUser, chatId);
                this.usersHandler.AddUserToChat(user, chatId);

                // Notify users about new chat room
                let packet = new Packet(packetTypes.NewChat, { ...chat, chatId });
                let users = [user, newUser];
                this.SendPacketToOnlineUsers(packet, users);
            }
        });
    }

    NewMessage(message) {
        let targetRoomId = message.TargetRoomId;

        this.logger.info(message.Sender + ' has sent a new message to room ' + targetRoomId + '.');

        // Add message to DB
        let chatRoom = this.chatsHandler.GetChat(targetRoomId);
        chatRoom.addMessage(message);

        // Send message to online users in the room
        let packet = new Packet(packetTypes.NewMessage, message);
        let usersInRoom = this.usersHandler.GetUsersInChat(targetRoomId);

        try {
            this.SendPacketToOnlineUsers(packet, usersInRoom);
            return true;
        }

        catch (exception) {
            this.logger.error("Exception thrown when trying to send a message to room " + targetRoomId);
            this.logger.error(exception);
        }

        return false;
    }

    RequestChats(info, socket) {
        let username = info.Username;
        let chatsIds = this.usersHandler.GetUserChats(username);

        this.logger.info(username + ' has requested his chat history.');

        chatsIds.forEach((chatId) => {
            let chat = this.chatsHandler.GetChat(chatId);
            let packet = new Packet(packetTypes.NewChat, { ...chat, chatId });
            this.packetSender.Send(packet, socket);
        });
    }

    SendPacketToOnlineUsers(packet, users) {
        users.forEach((user) => {
            if (this.onlineUsersPool.IsUserOnline(user)) {
                let userSocket = this.onlineUsersPool.GetUserSocket(user);
                this.packetSender.Send(packet, userSocket);
            }
        });
    }
}

module.exports = ActionsHandler;