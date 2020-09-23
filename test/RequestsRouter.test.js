let sinon = require('sinon');
const Packet = require('../Models/Packet');
const ActionsHandler = require('../Server/ActionsHandler');
const JsonConverter = require('../Server/JsonConverter');
const RequestsRouter = require('../Server/RequestsRouter');
const packetTypes = require('../Server/static/PacketTypes');

let actionsHandler = new ActionsHandler();
let actionsHandlerMock = sinon.mock(actionsHandler);

let serializer = new JsonConverter();

let router = new RequestsRouter(actionsHandler, serializer);
let socketStub = null;
let fakeData = 'fake data';

describe('RequestsRouterTests', () => {
    it('test route to register', () => {        
        let data = GenerateFakeData(packetTypes.Register);
        actionsHandlerMock.expects('Register').withArgs(fakeData, socketStub);
        
        router.route(socketStub, data);

        actionsHandlerMock.restore();
        actionsHandlerMock.verify();
    });

    it('test route to login', () => {        
        let data = GenerateFakeData(packetTypes.Login);
        actionsHandlerMock.expects('Login').withArgs(fakeData, socketStub);
        
        router.route(socketStub, data);

        actionsHandlerMock.restore();
        actionsHandlerMock.verify();
    });

    it('test route to requestChats', () => {        
        let data = GenerateFakeData(packetTypes.RequestChats);
        actionsHandlerMock.expects('RequestChats').withArgs(fakeData, socketStub);
        
        router.route(socketStub, data);

        actionsHandlerMock.restore();
        actionsHandlerMock.verify();
    });

    it('test route to logout', () => {        
        let data = GenerateFakeData(packetTypes.Logout);
        actionsHandlerMock.expects('Logout').withArgs(fakeData);
        
        router.route(socketStub, data);

        actionsHandlerMock.restore();
        actionsHandlerMock.verify();
    });

    it('test route to new message', () => {        
        let data = GenerateFakeData(packetTypes.NewMessage);
        actionsHandlerMock.expects('NewMessage').withArgs(fakeData);
        
        router.route(socketStub, data);

        actionsHandlerMock.restore();
        actionsHandlerMock.verify();
    });
});

function GenerateFakeData(packetType) {
    let packet = new Packet(packetType, fakeData);
    return serializer.serialize(packet);
}