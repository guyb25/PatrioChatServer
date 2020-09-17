const configurations = require('./ServerConfigs');
const net = require('net');

class Server {
    constructor() {
        this.port = configurations.port;
        this.host = configurations.host;
        this.server = net.createServer();
    }

    listen() {
        this.server.listen(this.port, this.host, () => {
            console.log('PatrioChat Server is running on port ' + port + '.');
        });        
    }

    setup() {
        let sockets = [];

        server.on('connection', (socket) => {
            console.log('CONNECTED: ' + socket.remoteAddress + ':' + socket.remotePort);
            sockets.push(socket);

            socket.on('data', (data) => {
                console.log('DATA ' + socket.remoteAddress + ': ' + data);
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
        });
    }
}

module.exports = Server;