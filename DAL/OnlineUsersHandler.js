class OnlineUsersHandler {
    constructor() {
        this.users = [];
    }

    // Attempt to add a user. Returns wether attempt was successful.
    TryAddUser(username) {
        if (!this.users.includes(username))
        {
            this.users.push(username);
            return this.users.includes(username);
        }
        
        return false;
    }

    // Attempt to remove a user. Returns wether attempt was successful.
    TryRemoveUser(username) {
        if (this.users.includes(username)) {
            let indexOfUser = this.users.findIndex(username);
            this.users.splice(indexOfUser, 1);
            return !this.users.includes(username);
        }

        return false;
    }
}

module.exports = OnlineUsersHandler;