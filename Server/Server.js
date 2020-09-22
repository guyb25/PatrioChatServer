const configurations = require('./static/ServerConfigs');
const net = require('net');

class Server {
    constructor(requestsRouter) {
        this.requestsRouter = requestsRouter;
        this.server = net.createServer();
    }

    listen() {
        this.server.listen(configurations.port, configurations.host, () => {
            console.log('PatrioChat Server is running on port ' + configurations.port + '.');
        });        
    }

    handleMessages() {
        let sockets = [];

        this.server.on('connection', (socket) => {
            console.log('CONNECTED: ' + socket.remoteAddress + ':' + socket.remotePort);
            sockets.push(socket);

            socket.on('data', (data) => {
                console.log('DATA ' + socket.remoteAddress + ': ' + data);
                this.requestsRouter.route(socket, data);
            });

            socket.on('close', (data) => {
                let index = sockets.findIndex((client) => {
                    return client.remoteAddress === socket.remoteAddress && client.remotePort === socket.remotePort;
                });

                if (index !== -1) {
                    sockets.splice(index, 1);
                    console.log('CLOSED: ' + socket.remoteAddress + ': ' + socket.remotePort);
                }
            });

            socket.on('error', (error) => {
                console.log("socket threw an exception which couldn't be handled. Exception: ");
                console.log(error);
            });
        });
    }
}

module.exports = Server;