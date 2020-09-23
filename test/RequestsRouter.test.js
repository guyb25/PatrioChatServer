const assert = require('assert');
let sinon = require('sinon');
const Packet = require('../Models/Packet');
const ActionsHandler = require('../Server/ActionsHandler');
const JsonConverter = require('../Server/JsonConverter');
const RequestsRouter = require('../Server/RequestsRouter');
const SocketStub = require('./stubs/SocketStub');
const packetTypes = require('../Server/static/PacketTypes');

let actionsHandler = new ActionsHandler();
let serializer = new JsonConverter();
let router = new RequestsRouter(actionsHandler, serializer);
let socketStub = new SocketStub();
let fakeData = 'fake data';

describe('RequestsRouterTests', () => {
    it('test route to register', () => {        
        let data = GenerateFakeData(packetTypes.Register);
        actionsHandler.Register = sinon.spy(actionsHandler, 'Register').withArgs(fakeData, socketStub);
        
        router.route(socketStub, data);

        sinon.verifyAndRestore();
    });

    it('test route to login', () => {        
        let data = GenerateFakeData(packetTypes.Login);
        actionsHandler.Login = sinon.spy(actionsHandler, 'Login').withArgs(fakeData, socketStub);
        
        router.route(socketStub, data);

        sinon.verifyAndRestore();
    });

    it('test route to requestChats', () => {        
        let data = GenerateFakeData(packetTypes.RequestChats);
        actionsHandler.RequestChats = sinon.spy(actionsHandler, 'RequestChats').withArgs(fakeData, socketStub);
        
        router.route(socketStub, data);

        sinon.verifyAndRestore();
    });

    it('test route to logout', () => {        
        let data = GenerateFakeData(packetTypes.Logout);
        actionsHandler.Logout = sinon.spy(actionsHandler, 'Logout').withArgs(fakeData, socketStub);
        
        router.route(socketStub, data);

        sinon.verifyAndRestore();
    });

    it('test route to new message', () => {        
        let data = GenerateFakeData(packetTypes.NewMessage);
        actionsHandler.NewMessage = sinon.spy(actionsHandler, 'NewMessage').withArgs(fakeData, socketStub);
        
        router.route(socketStub, data);

        sinon.verifyAndRestore();
    });
});

function GenerateFakeData(packetType) {
    let packet = new Packet(packetType, fakeData);
    return serializer.serialize(packet);
}