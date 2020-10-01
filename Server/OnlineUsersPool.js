class OnlineUsersPool {
    constructor() {
        this.users = new Map(); //<username, socket>
    }

    getOnlineUsersUsernames() {
        return Array.from(this.users.keys());
    }

    tryAddUser(username, socket) {
        if (!this.isUserOnline(username)) {
            this.users.set(username, socket);
            return true;
        }
        return false;
    }

    tryRemoveUser(username) {
        if (this.isUserOnline(username)) {
            let successfulCloseSocket = this.tryCloseUserSocket(username);
            this.users.delete(username);
            return successfulCloseSocket;
        }
        return false;
    }

    getUserSocket(username) {
        return this.users.get(username);
    }

    tryCloseUserSocket(username) {
        let userSocket = this.users.get(username);

        try {
            userSocket.destroy();
            return true;
        }

        catch(exception) {
            return false;
        }
    }

    isUserOnline(username) {
        return this.users.has(username);
    }
}

module.exports = OnlineUsersPool;