class PacketSender {
    constructor(serializer, packetLengthSize, packetLengthPadCharacter) {
        this.serializer = serializer;
        this.packetLengthSize = packetLengthSize;
        this.packetLengthPadCharacter = packetLengthPadCharacter;
    }

    Send(socket, packet) {
        let serializedPacket = this.serializer.serialize(packet);
        let lengthString = this.CreateLengthString(serializedPacket.length);
        socket.write(lengthString);
        socket.write(serializedPacket);
    }

    CreateLengthString(length) {
        return length.toString().padStart(this.PacketLengthSize, this.PacketLengthPadCharacter);
    }
}

module.exports = PacketSender;