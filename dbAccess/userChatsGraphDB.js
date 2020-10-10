const neo4j = require('neo4j-driver');
const configs = require('config').get('databaseConfigs').get('userChatsDbConfigs');

class UserChatsGraphDB {
    async connect() {
        this.driver = neo4j.driver(configs.url, neo4j.auth.basic(configs.user, configs.password));
        await this.driver.verifyConnectivity(); // throws exception if not connected!
    }

    shutdown() {
        this.driver.close();
    }

    async getAllUsers() {
        let session = this.driver.session();
        let result = await session.run('MATCH (users:User) RETURN users');
        session.close();
        return result.records.map((record) => record.get(0).properties.Username);
    }

    async isUserRegistered(username) {
        let allUsernames = await this.getAllUsers();
        return allUsernames.includes(username);
    }

    async tryRegisterUser(username) {
        if (!await this.isUserRegistered(username)) {
            await this.registerUser(username);
            return this.isUserRegistered(username);
        }

        return false;
    }

    async registerUser(username) {
        let session = this.driver.session();
        await session.run('CREATE (:User { Username: "' + username + '" })');
        session.close();
    }

    async addUserToChat(username, chatId) {
        let session = this.driver.session();
        await session.run('MATCH (user: User), (chat: Chat)' + 
        ' WHERE user.Username = "' + username + '" AND chat.ChatId = "' + chatId + '"' +
        ' CREATE (chat)-[:CONTAINS]->(user)');
        session.close();
    }

    async addChat(chatId, chatName) {
        let session = this.driver.session();
        await session.run('CREATE (:Chat { ChatId: "' + chatId + '", ChatName: "' + chatName + '" })');
        session.close();
    }

    async getUsersInChat(chatId) {
        let session = this.driver.session();
        let result = await session.run('MATCH (users: User), (chat: Chat)' + 
        ' WHERE chat.ChatId = "' + chatId + '" AND (chat)-[:CONTAINS]->(users)' + 
        ' RETURN users');
        session.close();
        return result.records.map((record) => record.get(0).properties.Username);
    }

    async getUserChats(username) {
        let session = this.driver.session();
        let result = await session.run('MATCH (user: User), (chats: Chat)' +
        ' WHERE user.Username = "' + username + '" AND (chats)-[:CONTAINS]->(user)' +
        ' RETURN chats');
        session.close();
        return result.records.map((record) => record.get(0).properties);
    }

    async getChat(chatId) {
        let session = this.driver.session();
        let result = await session.run('MATCH (chat: Chat)' +
        ' WHERE chat.ChatId = "' + chatId + '"' +
        ' RETURN chat');
        session.close();
        return result.records[0].get(0).properties;
    }
}

module.exports = UserChatsGraphDB;