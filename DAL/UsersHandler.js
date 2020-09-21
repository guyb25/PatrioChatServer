class UsersHandler {
    constructor() {
        this.users = [];
    }

    // Attempt to add a user. Returns wether attempt was successful.
    TryAddUser(username) {
        if (!this.users.includes(username))
        {
            this.users.push(username);
            return true;
        }
        return false;
    }
}

module.exports = UsersHandler;