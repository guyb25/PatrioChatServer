const neo4j = require('neo4j-driver');
const configs = require('config').get('databaseConfigs').get('userChatsDbConfigs');
const driver = neo4j.driver(configs.url, neo4j.auth.basic(configs.user, configs.password));

class UserChatsGraphDB {
    Shutdown() {
        driver.close();
    }

    async GetAllUsers() {
        let session = driver.session();
        let result = await session.run('MATCH (users:User) RETURN users');
        session.close();
        return result.records.map((record) => record.get(0).properties.Username);
    }

    async IsUserRegistered(username) {
        let allUsernames = await this.GetAllUsers();
        return allUsernames.includes(username);
    }

    async TryRegisterUser(username) {
        if (!await this.IsUserRegistered(username)) {
            await this.RegisterUser(username);
            return this.IsUserRegistered(username);
        }

        return false;
    }

    async RegisterUser(username) {
        let session = driver.session();
        await session.run('CREATE (:User { Username: "' + username + '" })');
        session.close();
    }

    async AddUserToChat(username, chatId) {
        let session = driver.session();
        await session.run('MATCH (user: User), (chat: Chat)' + 
        ' WHERE user.Username = "' + username + '" AND chat.ChatId = "' + chatId + '"' +
        ' CREATE (chat)-[:CONTAINS]->(user)');
        session.close();
    }

    async AddChat(chatId, chatName) {
        let session = driver.session();
        await session.run('CREATE (:Chat { ChatId: "' + chatId + '", ChatName: "' + chatName + '" })');
        session.close();
    }

    async GetUsersInChat(chatId) {
        let session = driver.session();
        let result = await session.run('MATCH (users: User), (chat: Chat)' + 
        ' WHERE chat.ChatId = "' + chatId + '" AND (chat)-[:CONTAINS]->(users)' + 
        ' RETURN users');
        session.close();
        return result.records.map((record) => record.get(0).properties.Username);
    }

    async GetUserChats(username) {
        let session = driver.session();
        let result = await session.run('MATCH (user: User), (chats: Chat)' +
        ' WHERE user.Username = "' + username + '" AND (chats)-[:CONTAINS]->(user)' +
        ' RETURN chats');
        session.close();
        return result.records.map((record) => record.get(0).properties);
    }

    async GetChat(chatId) {
        let session = driver.session();
        let result = await session.run('MATCH (chat: Chat)' +
        ' WHERE chat.ChatId = "' + chatId + '"' +
        ' RETURN chat');
        session.close();
        return result.records[0].get(0).properties;
    }
}

module.exports = UserChatsGraphDB;