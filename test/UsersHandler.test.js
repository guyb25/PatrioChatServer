const assert = require('assert');
const UsersHandler = require('../DAL/UsersHandler');

describe('UsersHandlerTests', () => {
    it('test add new user', () => {
        let usersHandler = new UsersHandler();
        let user = "test user";
        assert.strictEqual(true, usersHandler.TryAddUser(user));
    });

    it('test add existing user', () => {
        let usersHandler = new UsersHandler();
        let user = "test user";
        assert.strictEqual(true, usersHandler.TryAddUser(user));
        assert.strictEqual(false, usersHandler.TryAddUser(user));
    });

    it('test is user registered', () => {
        let usersHandler = new UsersHandler();
        let user = "test user";
        usersHandler.TryAddUser(user);
        assert.strictEqual(true, usersHandler.IsUserRegistered(user));
    });

    it('test is user not registered', () => {
        let usersHandler = new UsersHandler();
        let user = "test user";
        assert.strictEqual(false, usersHandler.IsUserRegistered(user));
    });

    it('test remove existing user', () => {
        let usersHandler = new UsersHandler();
        let user = "test user";
        usersHandler.TryAddUser(user);
        assert.strictEqual(true, usersHandler.TryRemoveUser(user));
    });

    it('test remove non-existing user', () => {
        let usersHandler = new UsersHandler();
        let user = "test user";
        assert.strictEqual(false, usersHandler.TryRemoveUser(user));
    });

    it('test add user to chat room', () => {
        let usersHandler = new UsersHandler();
        let user = "test user";
        let fakeChatId = "1";

        usersHandler.AddUser(user);
        usersHandler.AddUserToChat(user, fakeChatId);
        let userChats = usersHandler.GetUserChats(user);

        assert.strictEqual(true, userChats.has(fakeChatId));
        assert.strictEqual(1, userChats.size);
    });

    it('test dont add user to chat room', () => {
        let usersHandler = new UsersHandler();
        let user = "test user";

        usersHandler.AddUser(user);
        let userChats = usersHandler.GetUserChats(user);

        assert.strictEqual(0, userChats.size);
    });

    it('test get users in chat', () => {
        let usersHandler = new UsersHandler();
        let user = "test user";
        let user2 = "test user 2";
        let fakeChatId = "1";

        usersHandler.AddUser(user);
        usersHandler.AddUser(user2);
        usersHandler.AddUserToChat(user, fakeChatId);
        let usersInChat = usersHandler.GetUsersInChat(fakeChatId);

        assert.strictEqual(true, usersInChat.includes(user));
        assert.strictEqual(false, usersInChat.includes(user2));
        assert.strictEqual(1, usersInChat.length);
    });
});