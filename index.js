const ActionsHandler = require('./Server/ActionsHandler');
const JsonConverter = require('./Server/JsonConverter');
const UsersHandler = require('./DAL/UsersHandler');
const OnlineUsersPool = require('./Server/OnlineUsersPool');
const ChatsHandler = require('./DAL/ChatsHandler');
const RequestsRouter = require('./Server/RequestsRouter');
const Server = require('./Server/Server');

let converter = new JsonConverter();
let usersHandler = new UsersHandler();
let onlineUsersPool = new OnlineUsersPool();
let chatsHandler = new ChatsHandler();
let actionsHandler = new ActionsHandler(usersHandler, chatsHandler, onlineUsersPool, converter);
let requestsRouter = new RequestsRouter(actionsHandler, converter);
let server = new Server(requestsRouter);

server.listen();
server.handleMessages();