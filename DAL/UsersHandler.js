class UsersHandler {
    constructor() {
        this.users = [];
    }

    // Attempt to add a user. Returns wether attempt was successful.
    TryAddUser(username) {
        if (!this.IsUserRegistered(username)) {
            this.RegisterUser(username);
            return true;
        }
        return false;
    }

    TryRemoveUser(username) {
        if (this.IsUserRegistered(username)) {
            this.DeleteUser(username);
            return this.IsUserRegistered(username);
        }
        return false;
    }

    IsUserRegistered(username) {
        return this.users.includes(username);
    }

    RegisterUser(username) {
        this.users.push(username);
    }

    DeleteUser(username) {
        let userIndex = this.users.indexOf(username);
        this.users.splice(userIndex, 1);
    }
}

module.exports = UsersHandler;