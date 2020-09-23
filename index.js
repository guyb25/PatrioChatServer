const ActionsHandler = require('./Server/ActionsHandler');
const JsonConverter = require('./Server/JsonConverter');
const UsersHandler = require('./DAL/UsersHandler');
const OnlineUsersPool = require('./Server/OnlineUsersPool');
const ChatsHandler = require('./DAL/ChatsHandler');
const RequestsRouter = require('./Server/RequestsRouter');
const Server = require('./Server/Server');
const SimpleNodeLogger = require('simple-node-logger');
const PacketSender = require('./Server/PacketSender');
const serverConfigs = require('./Server/static/ServerConfigs');

const actionsLog = SimpleNodeLogger.createSimpleFileLogger(serverConfigs.logFileName);
const serverLog = SimpleNodeLogger.createSimpleLogger();

let converter = new JsonConverter();
let usersHandler = new UsersHandler();
let onlineUsersPool = new OnlineUsersPool();
let chatsHandler = new ChatsHandler();
let packetSender = new PacketSender();
let actionsHandler = new ActionsHandler(usersHandler, chatsHandler, onlineUsersPool, packetSender, actionsLog);
let requestsRouter = new RequestsRouter(actionsHandler, converter);
let server = new Server(serverConfigs.host, serverConfigs.port, requestsRouter, serverLog);

server.listen();
server.handleMessages();