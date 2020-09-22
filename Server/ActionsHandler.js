const packetTypes = require('./static/PacketTypes');
const protcolConfigs = require('./static/ProtocolConfigs');
const Chat = require('../Models/Chat');
const Packet = require('../Models/Packet');

class ActionsHandler {
    constructor(usersHandler, chatsHandler, onlineUsersPool, serializer) {
        this.usersHandler = usersHandler;
        this.chatsHandler = chatsHandler;
        this.onlineUsersPool = onlineUsersPool;
        this.serializer = serializer;
    }

    Register(info, socket) {
        let username = info.Username;
        let successfullAddUser = this.usersHandler.TryAddUser(username);

        if (successfullAddUser) {
            this.InitPrivateChats(username);
        }

        this.SendPacket(new Packet(packetTypes.ServerResponse, successfullAddUser), socket);
    }

    Login(info, socket) {
        let username = info.Username;
        let successfullLogin = this.usersHandler.IsUserRegistered(username) && this.onlineUsersPool.TryAddUser(username, socket);
        this.SendPacket(new Packet(packetTypes.ServerResponse, successfullLogin), socket);
    }

    Logout(info) {
        let username = info.Username;
        this.onlineUsersPool.TryRemoveUser(username);
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
            console.log("Exception thrown when trying to send a message to room " + targetRoomId);
            console.log(exception);
        }

        return false;
    }

    RequestChats(info, socket) {
        let username = info.Username;
        let chatsIds = this.usersHandler.GetUserChats(username);

        chatsIds.forEach((chatId) => {
            let chat = this.chatsHandler.GetChat(chatId);
            console.log("sent user " + username + " packet about joining " + chat.chatName);
            let packet = new Packet(packetTypes.NewChat, { ...chat, chatId });
            this.SendPacket(packet, socket);
        });
    }

    SendPacketToOnlineUsers(packet, users) {
        users.forEach((user) => {
            if (this.onlineUsersPool.IsUserOnline(user)) {
                let userSocket = this.onlineUsersPool.GetUserSocket(user);
                this.SendPacket(packet, userSocket);
            }
        });
    }

    SendPacket(packet, socket) {
        let serializedPacket = this.serializer.serialize(packet);
        let lengthString = serializedPacket.length.toString().padStart(protcolConfigs.PacketLengthSize, protcolConfigs.PacketLengthPadCharacter);
        socket.write(lengthString);
        socket.write(serializedPacket);
    }
}

module.exports = ActionsHandler;