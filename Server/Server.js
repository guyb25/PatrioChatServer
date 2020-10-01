const net = require('net');
const configs = require('config').get('serverConfigs');

class Server {
    constructor(requestsRouter, logger) {        
        this.requestsRouter = requestsRouter;
        this.logger = logger;
        this.server = net.createServer();
    }

    listen() {
        this.server.listen(configs.port, configs.host, () => {
            this.logger.info('PatrioChat Server is running on port ' + configs.port + '.');
        });        
    }

    handleMessages() {
        this.server.on('connection', (socket) => {
            this.logger.info('CONNECTED: ' + socket.remoteAddress + ': ' + socket.remotePort);

            socket.on('data', (data) => {
                this.logger.info('DATA ' + socket.remoteAddress + ': ' + data);
                this.requestsRouter.route(socket, data);
            });

            socket.on('close', (data) => {
                this.logger.info('CLOSED: ' + socket.remoteAddress + ': ' + socket.remotePort);
            });

            socket.on('error', (error) => {
                this.logger.error("socket threw an exception which couldn't be handled. Exception: ");
                this.logger.error(error);
            });
        });
    }
}

module.exports = Server;