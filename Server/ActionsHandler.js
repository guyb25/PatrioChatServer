const uuid = require('uuid');
const Chat = require('../Models/Chat');

class ActionsHandler {
    constructor(usersHandler, chatsHandler, onlineUsersHandler) {
        this.usersHandler = usersHandler;
        this.chatsHandler = chatsHandler;
        this.onlineUsersHandler = onlineUsersHandler;
    }

    Register(info) {
        let username = info.Username;
        let successfullAddUser = this.usersHandler.TryAddUser(username);

        if (successfullAddUser) {
            this.InitPrivateChats(username);
        }

        return successfullAddUser;
    }

    Login(info) {
        let username = info.Username;
        return this.usersHandler.IsUserRegistered(username) && this.onlineUsersHandler.TryAddUser(username);
    }

    Logout(info) {
        let username = info.Username;
        return this.onlineUsersHandler.TryRemoveUser(username);
    }

    InitPrivateChats(newUser) {
        let users = this.usersHandler.users;
        for (const user in users) {
            if (user != newUser) {
                let chat = new Chat('Private chat - ' + user + ' & ' + newUser);
                chat.addUser(user);
                chat.addUser(newUser);
                this.chatsHandler.TryAddChat(chat);
            }
        }
    }
}

module.exports = ActionsHandler;