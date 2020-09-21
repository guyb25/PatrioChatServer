const uuid = require('uuid');

class ActionsHandler {
    constructor(usersHandler, chatsHandler, onlineUsersHandler) {
        this.usersHandler = usersHandler;
        this.chatsHandler = chatsHandler;
        this.onlineUsersHandler = onlineUsersHandler;
    }

    Register(info) {
        let username = info.Username;
        let successfullAddUser = this.usersHandler.TryAddUser(username);
        let successfullCreateChat = this.chatsHandler.TryAddChat(username);
        return successfullAddUser && successfullCreateChat;
    }

    Login(info) {
        let username = info.Username;
        return this.onlineUsersHandler.TryAddUser(username);
    }

    Logout(info) {
        let username = info.Username;
        return this.onlineUsersHandler.TryRemoveUser(username);
    }
}

module.exports = ActionsHandler;