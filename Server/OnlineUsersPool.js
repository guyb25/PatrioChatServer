class OnlineUsersPool {
    constructor() {
        this.users = new Map(); //<username, socket>
    }

    GetOnlineUsersUsernames() {
        return Array.from(this.users.keys());
    }

    TryAddUser(username, socket) {
        if (!this.IsUserOnline(username)) {
            this.users.set(username, socket);
            return true;
        }
        return false;
    }

    TryRemoveUser(username) {
        if (this.IsUserOnline(username)) {
            let successfulCloseSocket = this.TryCloseUserSocket(username);
            this.users.delete(username);
            return successfulCloseSocket;
        }
        return false;
    }

    GetUserSocket(username) {
        return this.users.get(username);
    }

    TryCloseUserSocket(username) {
        let userSocket = this.users.get(username);

        try {
            userSocket.destroy();
            return true;
        }

        catch(exception) {
            return false;
        }
    }

    IsUserOnline(username) {
        return this.users.has(username);
    }
}

module.exports = OnlineUsersPool;