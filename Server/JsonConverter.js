class JsonConverter {
    serialize(packetAsObject) {
        return JSON.stringify(packetAsObject);
    }

    deserialize(packetAsJson) {
        return JSON.parse(packetAsJson);
    }
}

module.exports = JsonConverter;