module.exports = {
    dev: {
        client: 'sqlite3',
        useNullAsDefault: true,
        connection: {
            filename: './data/vaccinate.db'
        },
        pool: {
            afterCreate: (conn, cb) => {
                conn.run('PRAGMA foreign_keys = ON', cb);
            }
        }
    },
    prod: {
        client: 'sqlite3',
        useNullAsDefault: true,
        connection: {
            filename: './data/vaccinate.db'
        },
        pool: {
            afterCreate: (conn, cb) => {
                conn.run('PRAGMA foreign_keys = ON', cb);
            }
        }
    }
};