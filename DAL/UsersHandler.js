class UsersHandler {
    constructor() {
        this.users = [];
        this.usersChats = new Map(); //<username, set<chatIds>>
    }

    GetAllUsers() {
        return [...this.users];
    }
    
    // Attempt to add a user. Returns wether attempt was successful.
    TryAddUser(username) {
        if (!this.IsUserRegistered(username)) {
            this.AddUser(username);
            return this.IsUserRegistered(username);
        }
        return false;
    }

    TryRemoveUser(username) {
        if (this.IsUserRegistered(username)) {
            this.RemoveUser(username);
            return !this.IsUserRegistered(username);
        }
        return false;
    }

    IsUserRegistered(username) {
        return this.users.includes(username);
    }

    AddUser(username) {
        let chats = new Set();
        this.users.push(username);
        this.usersChats.set(username, chats);
    }

    RemoveUser(username) {
        let userIndex = this.users.indexOf(username);
        this.users.splice(userIndex, 1);
        this.usersChats.delete(username);
    }

    AddUserToChat(username, chatId) {
        let chats = this.usersChats.get(username);
        chats.add(chatId);
    }

    GetUsersInChat(chatId) {
        let users = [];

        this.usersChats.forEach((userChats, username) => {
            if (userChats.has(chatId)) {
                users.push(username);
            }
        });

        return users;
    }

    GetUserChats(username) {
        return this.usersChats.get(username);
    }
}

module.exports = UsersHandler;