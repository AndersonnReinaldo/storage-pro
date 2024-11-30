import { createClient } from 'redis';
import { isObject } from '../utils.js';
let client;
export const CacheService = {
    connect: async (options) => {
        options = { legacyMode: false, ...options };
        client = createClient(options);
        client.on('error', err => console.log('Redis Client Error', err));
        await client.connect();
    },
    test: async () => {
        await client.hSet('user-session:123', {
            name: 'John',
            surname: 'Smith',
            company: 'Redis',
            age: 29
        });
        let userSession = await client.hGetAll('user-session:123');
        console.log(JSON.stringify(userSession, null, 2));
    },
    get: async (key, object = true) => {
        return (object
            ? await client.hGetAll(key)
            : await client.get(key));
    },
    set: async (key, value) => {
        console.log(`setting ${key}:${value}`);
        return isObject(value)
            ? await client.hSet(key, value)
            : await client.set(key, value);
    },
    del: async (key) => {
        await client.del(key);
    },
    keys: async (pattern) => {
        const keys = await client.keys(pattern);
        return keys;
    }
};
