const ActionsHandler = require('./server/actionsHandler');
const OnlineUsersPool = require('./server/onlineUsersPool');
const RequestsRouter = require('./server/requestsRouter');
const Server = require('./server/server');
const PacketSender = require('./server/packetSender');
const UserChatsGraphDB = require('./dbAccess/userChatsGraphDB');
const ChatsMessagesMongoDB = require('./dbAccess/chatsMessagesMongoDB');
const DataAccess = require('./dbAccess/dataAccess');

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