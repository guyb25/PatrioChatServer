class OnlineUsersHandler {
    constructor() {
        this.users = [];
    }

    // Attempt to add a user. Returns wether attempt was successful.
    TryAddUser(username) {
        if (!this.IsUserOnline(username))
        {
            this.users.push(username);
            return this.users.includes(username);
        }
        
        return false;
    }

    // Attempt to remove a user. Returns wether attempt was successful.
    TryRemoveUser(username) {
        if (this.IsUserOnline(username)) {
            let userIndex = this.users.indexOf(username);
            this.users.splice(userIndex, 1);
            return !this.users.includes(username);
        }

        return false;
    }

    IsUserOnline(username) {
        return this.users.includes(username);
    }
}

module.exports = OnlineUsersHandler;