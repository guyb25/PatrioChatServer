const packetTypes = require('./static/PacketTypes');

class RequestsRouter {
    constructor(actionsHandler) {
        this.actionsHandler = actionsHandler;
    }

    route(socket, data) {
        let clientPacket = JSON.parse(data);

        switch(clientPacket.Type) {
            case packetTypes.Register:
                this.actionsHandler.Register(clientPacket.Value, socket);
                break;

            case packetTypes.Login:
                this.actionsHandler.Login(clientPacket.Value, socket);
                break;

            case packetTypes.RequestChats:
                this.actionsHandler.RequestChats(clientPacket.Value, socket);
                break;

            case packetTypes.Logout:
                this.actionsHandler.Logout(clientPacket.Value);
                break;

            case packetTypes.NewMessage:
                this.actionsHandler.NewMessage(clientPacket.Value);
                break;

            case packetTypes.NewChat:
                this.actionsHandler.CreateNewChat(clientPacket.Value);
                break;

            case packetTypes.RequestUsers:
                this.actionsHandler.RequestUsers(socket);
                break;
        }
    }
}

module.exports = RequestsRouter;