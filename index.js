const Server = require('./API/Server');

let server = new Server();
server.listen();
server.setup();