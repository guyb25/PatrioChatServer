const SimpleNodeLogger = require('simple-node-logger');
const logger = SimpleNodeLogger.createSimpleLogger();
let bootstrapper = require('./serverBootstrapper');
let server = bootstrapper.server;
let db = bootstrapper.db;

class ServerRunner {
    init() {
        process.on('exit', () => this.shutdown()); // regular exit
        process.on('SIGINT', () => this.shutdown()); // ctrl+c
    }

    async run() {
        try {
            await db.connect();
            server.listen();
            server.handleMessages();
            logger.info('Server online!');
        }

        catch(exception) {
            console.log(`Exception was thrown that couldn't be handled: \n${JSON.stringify(exception)}`);
            this.shutdown();
        }
    }

    shutdown() {
        logger.info('Shutting down Patriot Chat Server...');
        server.shutdown();
        logger.info('Patriot Chat Server has shut down.');

        logger.info('Shutting down database connections...');
        db.shutdown();
        logger.info('Database connections has shut down.');
    }
}

module.exports = new ServerRunner();