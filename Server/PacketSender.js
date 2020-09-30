const Packet = require("../Models/Packet");

class PacketSender {
    constructor(packetLengthSize, packetLengthPadCharacter, logger) {
        this.packetLengthSize = packetLengthSize;
        this.packetLengthPadCharacter = packetLengthPadCharacter;
        this.logger = logger;
    }

    Send(packetType, packetContent, socket) {
        let packet = new Packet(packetType, packetContent);
        let serializedPacket = JSON.stringify(packet);
        let lengthString = this.CreateLengthString(serializedPacket.length);

        try {
            socket.write(lengthString);
            socket.write(serializedPacket);
        }

        catch(exception) {
            this.logger.error('Exception thrown when trying to send a packet to ' + user + '. \n' + 
                'Packet: \n' +
                JSON.stringify(packet) + '\n' +
                'Exception: \n' + 
                JSON.stringify(exception));
        }
    }

    CreateLengthString(length) {
        return length.toString().padStart(this.packetLengthSize, this.packetLengthPadCharacter);
    }
}

module.exports = PacketSender;