const ActionsHandler = require('./Server/ActionsHandler');
const JsonConverter = require('./Server/JsonConverter');
const OnlineUsersPool = require('./Server/OnlineUsersPool');
const RequestsRouter = require('./Server/RequestsRouter');
const Server = require('./Server/Server');
const SimpleNodeLogger = require('simple-node-logger');
const PacketSender = require('./Server/PacketSender');
const UserChatsGraphDB = require('./DAL/UserChatsGraphDB');

const serverConfigs = require('./Server/static/ServerConfigs');
const protocolConfigs = require('./Server/static/ProtocolConfigs');
const ChatsMessagesMongoDB = require('./DAL/ChatsMessagesMongoDB');

const actionsLog = SimpleNodeLogger.createSimpleFileLogger(serverConfigs.logFileName);
const serverLog = SimpleNodeLogger.createSimpleLogger();

let userChatsGraphDB = new UserChatsGraphDB();
let chatMessagesMongoDB = new ChatsMessagesMongoDB();
let converter = new JsonConverter();
let onlineUsersPool = new OnlineUsersPool();
let packetSender = new PacketSender(converter, protocolConfigs.PacketLengthSize, protocolConfigs.PacketLengthPadCharacter);
let actionsHandler = new ActionsHandler(userChatsGraphDB, chatMessagesMongoDB, onlineUsersPool, packetSender, actionsLog);
let requestsRouter = new RequestsRouter(actionsHandler, converter);
let server = new Server(serverConfigs.host, serverConfigs.port, requestsRouter, serverLog);

server.listen();
server.handleMessages();