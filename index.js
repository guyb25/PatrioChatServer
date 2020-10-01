const ActionsHandler = require('./Server/ActionsHandler');
const OnlineUsersPool = require('./Server/OnlineUsersPool');
const RequestsRouter = require('./Server/RequestsRouter');
const Server = require('./Server/Server');
const SimpleNodeLogger = require('simple-node-logger');
const PacketSender = require('./Server/PacketSender');
const UserChatsGraphDB = require('./DAL/UserChatsGraphDB');
const ChatsMessagesMongoDB = require('./DAL/ChatsMessagesMongoDB');
const DataAccess = require('./DAL/DataAccess');
const logConfigs = require('config').get('logConfigs');

const packetSenderLog = SimpleNodeLogger.createSimpleLogger(logConfigs.packetSenderLogFileName);
const actionsLog = SimpleNodeLogger.createSimpleFileLogger(logConfigs.actionslogFileName);
const dbLog = SimpleNodeLogger.createSimpleLogger(logConfigs.dbLogFileName);
const serverLog = SimpleNodeLogger.createSimpleLogger();

let userChatsGraphDB = new UserChatsGraphDB();
let chatMessagesMongoDB = new ChatsMessagesMongoDB();
let dataAccess = new DataAccess(chatMessagesMongoDB, userChatsGraphDB, dbLog);
let onlineUsersPool = new OnlineUsersPool();
let packetSender = new PacketSender(packetSenderLog);
let actionsHandler = new ActionsHandler(dataAccess, onlineUsersPool, packetSender, actionsLog);
let requestsRouter = new RequestsRouter(actionsHandler);
let server = new Server(requestsRouter, serverLog);

server.listen();
server.handleMessages();