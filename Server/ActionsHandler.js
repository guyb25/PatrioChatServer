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
            this.BroadcastNewUser(username);
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

    BroadcastNewUser(username) {
        let onlineUsers = this.onlineUsersPool.GetOnlineUsersUsernames();
        this.SendToOnlineUsers(new Packet(packetTypes.NewUser, {Username: username}), onlineUsers);
    }

    CreateNewChat(info) {
        let chatName = info.ChatName;
        let participants = info.Participants.map(participant => participant.Username);

        let chat = new Chat(chatName);
        let chatId = this.chatsHandler.AddChat(chat);

        participants.forEach((participant) => {
            this.usersHandler.AddUserToChat(participant, chatId);
        });

        this.logger.info('Chat ' + chatName + ' has been created with id ' + chatId);

        let packet = new Packet(packetTypes.NewChat, {...chat, chatId});
        let onlineParticipants = participants.filter(participant => this.onlineUsersPool.IsUserOnline(participant));
        this.SendToOnlineUsers(packet, onlineParticipants);
    }

    InitPrivateChats(newUser) {
        let users = this.usersHandler.GetAllUsers();
        let newUserIndex = users.indexOf(newUser);

        if (newUserIndex !== -1)
        {
            users.splice(newUserIndex, 1);
            users.forEach(user => {
                this.CreateNewChat({ChatName: user + ' & ' + newUser, Participants: [{Username: newUser}, {Username: user}]});
            });
        }   
    }

    NewMessage(message) {
        let targetRoomId = message.TargetRoomId;

        this.logger.info(message.Sender + ' has sent a new message to room ' + targetRoomId + '.');

        // Add message to DB
        this.chatsHandler.AddMessageToChat(targetRoomId, message);

        // Send message to online users in the room
        let packet = new Packet(packetTypes.NewMessage, message);
        let usersInRoom = this.usersHandler.GetUsersInChat(targetRoomId);
        let onlineUsersInRoom = usersInRoom.filter(user => this.onlineUsersPool.IsUserOnline(user));

        try {
            this.SendToOnlineUsers(packet, onlineUsersInRoom);
        }

        catch (exception) {
            this.logger.error("Exception thrown when trying to send a message to room " + targetRoomId);
            this.logger.error(exception);
        }        
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

    RequestUsers(socket) {
        let users = this.usersHandler.GetAllUsers();

        users.forEach((user) => {
            let packet = new Packet(packetTypes.NewUser, {Username: user});
            this.packetSender.Send(packet, socket);
        });
    }

    SendToOnlineUsers(packet, users) {
        let onlineUsers = users.filter(user => this.onlineUsersPool.IsUserOnline(user));
        let onlineUsersSockets = onlineUsers.map(user => this.onlineUsersPool.GetUserSocket(user));
        this.packetSender.SendMultiple(packet, onlineUsersSockets);
    }
}

module.exports = ActionsHandler;