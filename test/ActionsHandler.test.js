/*const assert = require('assert');
let sinon = require('sinon');
const Packet = require('../Models/Packet');
const ActionsHandler = require('../Server/ActionsHandler');
const JsonConverter = require('../Server/JsonConverter');
const SocketStub = require('./stubs/SocketStub');
const packetTypes = require('../Server/static/PacketTypes');
const UsersHandler = require('../DAL/UsersHandler');
const ChatsHandler = require('../DAL/ChatsHandler');
const OnlineUsersPool = require('../Server/OnlineUsersPool');
const PacketSender = require('../Server/PacketSender');

let serializer = new JsonConverter();
let usersHandler = new UsersHandler();
let chatsHandler = new ChatsHandler();
let onlineUsersPool = new OnlineUsersPool();
let packetSender = new PacketSender();
let logger = sinon.stub({}, 'info');
logger.stu

let actionsHandler = new ActionsHandler(usersHandler, chatsHandler, onlineUsersPool, packetSender, logger)
let socketStub = new SocketStub();
let fakeData = 'fake data';

describe('RequestsRouterTests', () => {
    it('test route to register', () => {        
        let data = GenerateFakeData(packetTypes.Register);
        actionsHandler.Register = sinon.spy(actionsHandler, 'Register').withArgs(fakeData, socketStub);
        
        router.route(socketStub, data);

        sinon.verifyAndRestore();
    });
});*/