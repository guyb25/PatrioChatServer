const SimpleNodeLogger = require('simple-node-logger');
const logConfigs = require('config').get('logConfigs');
const logger = SimpleNodeLogger.createSimpleLogger(logConfigs.packetSenderLogFileName);

const Packet = require("../models/Packet");
const configs = require('config').get('protocolConfigs');

class PacketSender {
    send(packetType, packetContent, socket) {
        let packet = new Packet(packetType, packetContent);
        let serializedPacket = JSON.stringify(packet);
        let lengthString = this.createLengthString(serializedPacket.length);

        try {
            socket.write(lengthString);
            socket.write(serializedPacket);
        }

        catch(exception) {
            logger.error('Exception thrown when trying to send a packet to ' + user + '. \n' + 
                'Packet: \n' +
                JSON.stringify(packet) + '\n' +
                'Exception: \n' + 
                JSON.stringify(exception));
        }
    }

    createLengthString(length) {
        return length.toString().padStart(configs.packetLengthSize, configs.packetLengthPadCharacter);
    }
}

module.exports = PacketSender;