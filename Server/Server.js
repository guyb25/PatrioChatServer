const SimpleNodeLogger = require('simple-node-logger');
const net = require('net');
const configs = require('config').get('serverConfigs');
const logConfigs = require('config').get('logConfigs');
const logger = SimpleNodeLogger.createSimpleFileLogger(logConfigs.serverLogFileName);

class Server {
    constructor(requestsRouter) {        
        this.requestsRouter = requestsRouter;
        this.server = net.createServer();
    }

    listen() {
        this.server.listen(configs.port, configs.host, () => {
            logger.info('PatrioChat Server is running on port ' + configs.port + '.');
        });        
    }

    handleMessages() {
        this.server.on('connection', (socket) => {
            logger.info('CONNECTED: ' + socket.remoteAddress + ': ' + socket.remotePort);

            socket.on('data', (data) => {
                logger.info('DATA ' + socket.remoteAddress + ': ' + data);
                this.requestsRouter.route(socket, data);
            });

            socket.on('close', (data) => {
                logger.info('CLOSED: ' + socket.remoteAddress + ': ' + socket.remotePort);
            });

            socket.on('error', (error) => {
                logger.error("socket threw an exception which couldn't be handled. Exception: ");
                logger.error(error);
            });
        });
    }

    shutdown() {
        this.server.close();
    }
}

module.exports = Server;