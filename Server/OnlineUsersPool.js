class OnlineUsersPool {
    constructor() {
        this.users = new Map(); //<username, socket>
    }

    TryAddUser(username, socket) {
        if (!this.IsUserOnline(username)) {
            this.users.set(username, socket);
            return this.IsUserOnline(username);
        }
        return false;
    }

    TryRemoveUser(username) {
        if (this.IsUserOnline(username)) {
            this.CloseUserSocket(username);
            this.users.delete(username);
            return !this.IsUserOnline(username);
        }
        return false;
    }

    GetUserSocket(username) {
        return this.users.get(username);
    }

    CloseUserSocket(username) {
        let userSocket = this.users.get(username);
        userSocket.destroy();
    }

    IsUserOnline(username) {
        return this.users.has(username);
    }
}

module.exports = OnlineUsersPool;