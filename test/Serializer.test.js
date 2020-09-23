const assert = require('assert');
const JsonConverter = require('../Server/JsonConverter');

let serializer = new JsonConverter();

describe('SerializerTests', () => {
    it('test object to object', () => {
        let stubObject = {info1: '123', info2: 'gh87', info3: {info4: '5476'}};
        let serializedObject = serializer.serialize(stubObject);
        let deserializedObject = serializer.deserialize(serializedObject);
        assert.deepStrictEqual(stubObject, deserializedObject);
    });
});