const PacketTypes = require('./PacketTypes');
const packetTypes = require('./PacketTypes');
let Packet = require('../Models/Packet');

class MessagesHandler {
    constructor(actionsHandler, packetConverter) {
        this.actionsHandler = actionsHandler;
        this.packetConverter = packetConverter;
        this.loadActions();
    }

    handle(socket, data) {
        let clientPacket = this.packetConverter.deserialize(data);
        let action = this.actions.get(clientPacket.Type);
        let response = action(clientPacket.Value);
        let serverPacket = new Packet(packetTypes.ServerResponse, response);
        serverPacket = this.packetConverter.serialize(serverPacket);
        socket.write(serverPacket);
    }

    loadActions() {
        this.actions = new Map();
        this.actions.set(packetTypes.Register, (value) => this.actionsHandler.Register(value));
        this.actions.set(packetTypes.Login, (value) => this.actionsHandler.Login(value));
        this.actions.set(packetTypes.Logout, (value) => this.actionsHandler.Logout(value));
    }
}

module.exports = MessagesHandler;