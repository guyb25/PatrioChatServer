const assert = require('assert');
const packetTypes = require('../Server/static/PacketTypes');
const protocolConfigs = require('../Server/static/ProtocolConfigs');
const Packet = require('../Models/Packet');
const JsonConverter = require('../Server/JsonConverter');
const PacketSender = require('../Server/PacketSender');
const SocketStub = require('./stubs/SocketStub');

describe('PacketSenderTests', () => {
    it('test send', () => {
        let serializer = new JsonConverter();
        let packetSender = new PacketSender(serializer, protocolConfigs.PacketLengthSize, protocolConfigs.PacketLengthPadCharacter);
        let packet = new Packet(packetTypes.ServerResponse, 'fake value');
        let socketStub = new SocketStub();

        packetSender.Send(packet, socketStub);
        
        let packetLength = parseInt(socketStub.writeHistory[0]);
        let packetString = socketStub.writeHistory[1];

        assert.strictEqual(2, socketStub.writeHistory.length);
        assert.strictEqual(packetLength, packetString.length);
    });

    it('test create length string', () => {
        let serializer = new JsonConverter();
        let packetSender = new PacketSender(serializer, 6, '#');

        let lengthString = packetSender.CreateLengthString(14);

        assert.strictEqual('####14', lengthString);
    });
});