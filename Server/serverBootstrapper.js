const ActionsHandler = require('./actionsHandler');
const OnlineUsersPool = require('./onlineUsersPool');
const RequestsRouter = require('./requestsRouter');
const Server = require('./server');
const PacketSender = require('./packetSender');
const UserChatsGraphDB = require('../dbAccess/userChatsGraphDB');
const ChatsMessagesMongoDB = require('../dbAccess/chatsMessagesMongoDB');
const DataAccess = require('../dbAccess/dataAccess');

let userChatsGraphDB = new UserChatsGraphDB();
let chatMessagesMongoDB = new ChatsMessagesMongoDB();
let dataAccess = new DataAccess(chatMessagesMongoDB, userChatsGraphDB);

let onlineUsersPool = new OnlineUsersPool();
let packetSender = new PacketSender();
let actionsHandler = new ActionsHandler(dataAccess, onlineUsersPool, packetSender);
let requestsRouter = new RequestsRouter(actionsHandler);
let server = new Server(requestsRouter);

module.exports = {
    server: server,
    db: dataAccess
};