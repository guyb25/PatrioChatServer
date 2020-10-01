const packetTypes = require('config').get('protocolConfigs').get('packetTypes');

class RequestsRouter {
    constructor(actionsHandler) {
        this.actionsHandler = actionsHandler;
    }

    route(socket, data) {
        let clientPacket = JSON.parse(data);

        switch(clientPacket.Type) {
            case packetTypes.register:
                this.actionsHandler.register(clientPacket.Value, socket);
                break;

            case packetTypes.login:
                this.actionsHandler.login(clientPacket.Value, socket);
                break;

            case packetTypes.requestChats:
                this.actionsHandler.requestChats(clientPacket.Value, socket);
                break;

            case packetTypes.logout:
                this.actionsHandler.logout(clientPacket.Value);
                break;

            case packetTypes.newMessage:
                this.actionsHandler.newMessage(clientPacket.Value);
                break;

            case packetTypes.newChat:
                this.actionsHandler.createNewChat(clientPacket.Value);
                break;

            case packetTypes.requestUsers:
                this.actionsHandler.requestUsers(socket);
                break;
        }
    }
}

module.exports = RequestsRouter;