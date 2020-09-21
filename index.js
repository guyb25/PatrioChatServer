const ActionsHandler = require('./Server/ActionsHandler');
const JsonConverter = require('./Server/JsonConverter');
const UsersHandler = require('./DAL/UsersHandler');
const OnlineUsersHandler = require('./DAL/OnlineUsersHandler');
const ChatsHandler = require('./DAL/ChatsHandler');
const MessagesHandler = require('./Server/MessagesHandler');
const Server = require('./Server/Server');

let converter = new JsonConverter();
let usersHandler = new UsersHandler();
let onlineUsersHandler = new OnlineUsersHandler();
let chatsHandler = new ChatsHandler();
let actionsHandler = new ActionsHandler(usersHandler, chatsHandler, onlineUsersHandler);
let messagesHandler = new MessagesHandler(actionsHandler, converter);
let server = new Server(messagesHandler);
server.listen();
server.handleMessages();