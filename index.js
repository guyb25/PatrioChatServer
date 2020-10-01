const ActionsHandler = require('./Server/ActionsHandler');
const OnlineUsersPool = require('./Server/OnlineUsersPool');
const RequestsRouter = require('./Server/RequestsRouter');
const Server = require('./Server/Server');
const PacketSender = require('./Server/PacketSender');
const UserChatsGraphDB = require('./DAL/UserChatsGraphDB');
const ChatsMessagesMongoDB = require('./DAL/ChatsMessagesMongoDB');
const DataAccess = require('./DAL/DataAccess');

let userChatsGraphDB = new UserChatsGraphDB();
let chatMessagesMongoDB = new ChatsMessagesMongoDB();
let dataAccess = new DataAccess(chatMessagesMongoDB, userChatsGraphDB);

let onlineUsersPool = new OnlineUsersPool();
let packetSender = new PacketSender();
let actionsHandler = new ActionsHandler(dataAccess, onlineUsersPool, packetSender);
let requestsRouter = new RequestsRouter(actionsHandler);
let server = new Server(requestsRouter);

server.listen();
server.handleMessages();