const packetTypes = require('config').get('protocolConfigs').get('packetTypes');

class RequestsRouter {
    constructor(actionsHandler) {
        this.actionsHandler = actionsHandler;
    }

    route(socket, data) {
        let clientPacket = JSON.parse(data);

        switch(clientPacket.Type) {
            case packetTypes.register:
                this.actionsHandler.Register(clientPacket.Value, socket);
                break;

            case packetTypes.login:
                this.actionsHandler.Login(clientPacket.Value, socket);
                break;

            case packetTypes.requestChats:
                this.actionsHandler.RequestChats(clientPacket.Value, socket);
                break;

            case packetTypes.logout:
                this.actionsHandler.Logout(clientPacket.Value);
                break;

            case packetTypes.newMessage:
                this.actionsHandler.NewMessage(clientPacket.Value);
                break;

            case packetTypes.newChat:
                this.actionsHandler.CreateNewChat(clientPacket.Value);
                break;

            case packetTypes.requestUsers:
                this.actionsHandler.RequestUsers(socket);
                break;
        }
    }
}

module.exports = RequestsRouter;