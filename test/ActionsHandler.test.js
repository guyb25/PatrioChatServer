const sinon = require('sinon');
const ActionsHandler = require('../Server/ActionsHandler');
const SocketStub = require('./stubs/SocketStub');
const UsersHandler = require('../DAL/UsersHandler');
const ChatsHandler = require('../DAL/ChatsHandler');
const OnlineUsersPool = require('../Server/OnlineUsersPool');
const PacketSender = require('../Server/PacketSender');
const LoggerStub = require('./stubs/LoggerStub');
const packetTypes = require('../Server/static/PacketTypes');
const Packet = require('../Models/Packet');
const Chat = require('../Models/Chat');

let usersHandler = new UsersHandler();
let chatsHandler = new ChatsHandler();
let onlineUsersPool = new OnlineUsersPool();
let packetSender = new PacketSender();

let logger = new LoggerStub();
let socketStub = new SocketStub();

let actionsHandler = new ActionsHandler(usersHandler, chatsHandler, onlineUsersPool, packetSender, logger)

describe('ActionsHandlerTests', () => {
    // Expecting the system to add the user to the database, initialize the private chats, and notify the user.
    it('test successful register', () => {        
        let fakeData = {Username: 'testUsername'};
        let usersHandlerMock = sinon.mock(usersHandler);
        let actionsHandlerMock = sinon.mock(actionsHandler);
        let packetSenderMock = sinon.mock(packetSender);

        usersHandlerMock.expects('TryAddUser').withArgs(fakeData.Username).returns(true);
        actionsHandlerMock.expects('InitPrivateChats').withArgs(fakeData.Username).once();
        actionsHandlerMock.expects('BroadcastNewUser').withArgs(fakeData.Username).once();
        packetSenderMock.expects('Send').withArgs(new Packet(packetTypes.ServerResponse, true), socketStub).once();

        actionsHandler.Register(fakeData, socketStub);

        sinon.verifyAndRestore();
    });

    // Expecting the system to try to add the user to the database, and notify the user it couldn't.
    it('test unsuccessful register', () => {        
        let fakeData = {Username: 'testUsername'};
        let usersHandlerMock = sinon.mock(usersHandler);
        let actionsHandlerMock = sinon.mock(actionsHandler);
        let packetSenderMock = sinon.mock(packetSender);

        usersHandlerMock.expects('TryAddUser').withArgs(fakeData.Username).returns(false);
        actionsHandlerMock.expects('InitPrivateChats').never();
        actionsHandlerMock.expects('BroadcastNewUser').never();
        packetSenderMock.expects('Send').withArgs(new Packet(packetTypes.ServerResponse, false), socketStub).once();

        actionsHandler.Register(fakeData, socketStub);

        sinon.verifyAndRestore();
    });

    // Expecting the system to add the user to the online users pool, and notify the user login was successful.
    it('test successful login', () => {        
        let fakeData = {Username: 'testUsername'};
        let usersHandlerStub = sinon.stub(usersHandler);
        let onlineUsersPoolMock = sinon.mock(onlineUsersPool);
        let packetSenderMock = sinon.mock(packetSender);

        usersHandlerStub.IsUserRegistered.withArgs(fakeData.Username).returns(true);
        onlineUsersPoolMock.expects('TryAddUser').withArgs(fakeData.Username, socketStub).returns(true);
        packetSenderMock.expects('Send').withArgs(new Packet(packetTypes.ServerResponse, true), socketStub).once();

        actionsHandler.Login(fakeData, socketStub);

        sinon.verifyAndRestore();
    });

    // Expecting the system to not add the user to the online users pool, and notify the user login was unsuccessful.
    it('test unsuccessful login - user not registered', () => {        
        let fakeData = {Username: 'testUsername'};
        let usersHandlerStub = sinon.stub(usersHandler);
        let onlineUsersPoolMock = sinon.mock(onlineUsersPool);
        let packetSenderMock = sinon.mock(packetSender);

        usersHandlerStub.IsUserRegistered.withArgs(fakeData.Username).returns(false);
        onlineUsersPoolMock.expects('TryAddUser').never();
        packetSenderMock.expects('Send').withArgs(new Packet(packetTypes.ServerResponse, false), socketStub).once();
        
        actionsHandler.Login(fakeData, socketStub);
        
        sinon.verifyAndRestore();
    });

    // Expecting the system to try to add the user to the online users pool, and notify the user login was unsuccessful.
    it('test unsuccessful login - user registered but failed to add user to online users pool', () => {        
        let fakeData = {Username: 'testUsername'};
        let usersHandlerStub = sinon.stub(usersHandler);
        let onlineUsersPoolMock = sinon.mock(onlineUsersPool);
        let packetSenderMock = sinon.mock(packetSender);

        usersHandlerStub.IsUserRegistered.withArgs(fakeData.Username).returns(true);
        onlineUsersPoolMock.expects('TryAddUser').withArgs(fakeData.Username, socketStub).returns(false);
        packetSenderMock.expects('Send').withArgs(new Packet(packetTypes.ServerResponse, false), socketStub).once();

        actionsHandler.Login(fakeData, socketStub);

        sinon.verifyAndRestore();
    });

    // Expecting the system to remove the user from the online users pool.
    it('test logout', () => {        
        let fakeData = {Username: 'testUsername'};
        let onlineUsersPoolMock = sinon.mock(onlineUsersPool);

        onlineUsersPoolMock.expects('TryRemoveUser').withArgs(fakeData.Username).returns(true);

        actionsHandler.Logout(fakeData);

        sinon.verifyAndRestore();
    });

    // Expecting the system to send the packet only to the online users.
    it('test send packet to multiple users', () => {        
        let fakeData = ['testUsername1', 'testUsername2', 'testUsername3'];
        let onlineUsersPoolStub = sinon.stub(onlineUsersPool);
        let packetSenderMock = sinon.mock(packetSender);

        let fakePacket = 'fake packet';
        let fakeSocket = 'fake socket';

        onlineUsersPoolStub.IsUserOnline.withArgs(fakeData[0]).returns(true);
        onlineUsersPoolStub.IsUserOnline.withArgs(fakeData[1]).returns(false);
        onlineUsersPoolStub.IsUserOnline.withArgs(fakeData[2]).returns(true);
        onlineUsersPoolStub.GetUserSocket.returns(fakeSocket);

        packetSenderMock.expects('Send').withArgs(fakePacket, fakeSocket).exactly(2);

        actionsHandler.SendToOnlineUsers(fakePacket, fakeData);

        sinon.verifyAndRestore();
    });

    // Expecting the system to add the message to the database, and notify the online users inside that chatroom that a new message has been added.
    it('test new message', () => {        
        let fakeMessage = {TargetRoomId: '1', Content: 'fake content'}
        let fakeUsersInRoom = ['testUsername1', 'testUsername2', 'testUsername3'];
        let chatsHandlerMock = sinon.mock(chatsHandler);
        let usersHandlerStub = sinon.stub(usersHandler);
        let actionsHandlerMock = sinon.mock(actionsHandler);

        chatsHandlerMock.expects('AddMessageToChat').withArgs(fakeMessage.TargetRoomId, fakeMessage).once();
        usersHandlerStub.GetUsersInChat.withArgs(fakeMessage.TargetRoomId).returns(fakeUsersInRoom);
        actionsHandlerMock.expects('SendToOnlineUsers').once().withArgs(new Packet(packetTypes.NewMessage, fakeMessage), fakeUsersInRoom);

        actionsHandler.NewMessage(fakeMessage);

        sinon.verifyAndRestore();
    });

    // Expecting the system to notify the user about their chat rooms
    it('test request chats', () => {        
        let fakeInfo = {Username: 'fakeUsername'};
        let fakeChatIds = ['1', '42', '37'];
        let fakeChats = {'1': {'fakeChat1':'fakeChat1'}, '42': {'fakeChat2':'fakeChat2'}, '37': {'fakeChat3':'fakeChat3'}};
        let fakeSocket = 'fakeSocket';

        let chatsHandlerStub = sinon.stub(chatsHandler);
        let usersHandlerStub = sinon.stub(usersHandler);
        let packetSenderMock = sinon.mock(packetSender);

        usersHandlerStub.GetUserChats.withArgs(fakeInfo.Username).returns(fakeChatIds);
        fakeChatIds.forEach((fakeChatId) => {
            let fakeChat = fakeChats[fakeChatId];
            chatsHandlerStub.GetChat.withArgs(fakeChatId).returns(fakeChat);
            packetSenderMock.expects('Send').withArgs(new Packet(packetTypes.NewChat, { ...fakeChat, 'chatId': fakeChatId}), fakeSocket).once();
        });

        actionsHandler.RequestChats(fakeInfo, fakeSocket);

        sinon.verifyAndRestore();
    });

    // Expecting the system to create the chat rooms for the users, and notify all the online users that a new chat was created.
    it('test init private chats', () => {        
        let fakeUsers = ['fakeUser1', 'fakeUser2', 'fakeUser3', 'fakeUser4', 'fakeUser5'];
        let amountOfChats = fakeUsers.length - 1;

        let usersHandlerStub = sinon.stub(usersHandler);
        let actionsHandlerMock = sinon.mock(actionsHandler);

        usersHandlerStub.GetAllUsers.returns(fakeUsers);
        actionsHandlerMock.expects('CreateNewChat').exactly(amountOfChats);

        actionsHandler.InitPrivateChats(fakeUsers[0]);

        sinon.verifyAndRestore();
    });

    // Expecting the system to create the chat rooms for the users, and notify all the online users that a new chat was created.
    it('test init private chats - user not found', () => {        
        let fakeUsers = ['fakeUser1', 'fakeUser2', 'fakeUser3', 'fakeUser4', 'fakeUser5'];
        let fakeUser = 'fakeUser6';

        let usersHandlerStub = sinon.stub(usersHandler);
        let actionsHandlerMock = sinon.mock(actionsHandler);

        usersHandlerStub.GetAllUsers.returns(fakeUsers);
        actionsHandlerMock.expects('CreateNewChat').never();

        actionsHandler.InitPrivateChats(fakeUser);

        sinon.verifyAndRestore();
    });

    // Expecting the system to create the notify all the users that a user was created.
    it('test broadcast new user', () => {        
        let fakeUser = 'fakeUser';
        let fakeUsers = ['fakeUser1', 'fakeUser2'];
        let onlineUsersPoolStub = sinon.stub(onlineUsersPool);
        let actionsHandlerMock = sinon.mock(actionsHandler);

        onlineUsersPoolStub.GetOnlineUsersUsernames.returns(fakeUsers);
        actionsHandlerMock.expects('SendToOnlineUsers').once().withArgs(new Packet(packetTypes.NewUser, {Username: fakeUser}), fakeUsers);

        actionsHandler.BroadcastNewUser(fakeUser);

        sinon.verifyAndRestore();
    });

    // Expecting the system to create the chat room, and notify all the participants.
    it('test create new chat', () => {        
        let fakeParticipants = [{Username: 'fakeUser1'}, {Username:'fakeUser2'}];
        let fakeUsernames = ['fakeUser1', 'fakeUser2'];
        let fakeChatName = 'fakeChatName';
        let fakeChatId = '6';
        let fakeInfo = { ChatName: fakeChatName, Participants: fakeParticipants };
        let fakeChat = new Chat(fakeChatName);

        let chatsHandlerMock = sinon.mock(chatsHandler);
        let usersHandlerMock = sinon.mock(usersHandler);
        let actionsHandlerMock = sinon.mock(actionsHandler);

        chatsHandlerMock.expects('AddChat').once().returns(fakeChatId);

        fakeUsernames.forEach((user) => {
            usersHandlerMock.expects('AddUserToChat').once().withArgs(user, fakeChatId);
        });

        actionsHandlerMock.expects('SendToOnlineUsers').once().withArgs(new Packet(packetTypes.NewChat, {...fakeChat, chatId: fakeChatId}), fakeUsernames);

        actionsHandler.CreateNewChat(fakeInfo);

        sinon.verifyAndRestore();
    });
});