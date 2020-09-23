class SocketStub {
    constructor() {
        this.writeHistory = [];
        this.on = true;
    }

    write(msg) {
        this.writeHistory.push(msg);
    }

    destroy() {
        this.on = false;
    }
}

module.exports = SocketStub;