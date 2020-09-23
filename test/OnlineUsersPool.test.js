const assert = require('assert');
const OnlineUsersPool = require('../Server/OnlineUsersPool');
const SocketStub = require('./stubs/SocketStub');

describe('UsersHandlerTests', () => {
    it('test add new user', () => {
        let onlineUsersPool = new OnlineUsersPool();
        let socket = new SocketStub();
        let user = "test user";

        assert.strictEqual(true, onlineUsersPool.TryAddUser(user, socket));
        assert.strictEqual(true, onlineUsersPool.IsUserOnline(user));
    });

    it('test remove existing user', () => {
        let onlineUsersPool = new OnlineUsersPool();
        let socket = new SocketStub();
        let user = "test user";

        onlineUsersPool.TryAddUser(user, socket)
        
        assert.strictEqual(true, onlineUsersPool.TryRemoveUser(user));
        assert.strictEqual(false, onlineUsersPool.IsUserOnline(user));
    });

    it('test remove non-existing user', () => {
        let onlineUsersPool = new OnlineUsersPool();
        let socket = new SocketStub();
        let user = "test user";

        assert.strictEqual(false, onlineUsersPool.TryRemoveUser(user, socket));
    });

    it('test get user socket', () => {
        let onlineUsersPool = new OnlineUsersPool();
        let socket = new SocketStub();
        let user = "test user";

        onlineUsersPool.TryAddUser(user, socket);
        assert.strictEqual(socket, onlineUsersPool.GetUserSocket(user));
    });

    it('test close user socket', () => {
        let onlineUsersPool = new OnlineUsersPool();
        let socket = new SocketStub();
        let user = "test user";

        onlineUsersPool.TryAddUser(user, socket);
        onlineUsersPool.CloseUserSocket(user);

        assert.strictEqual(false, socket.on);
    });
});