require('dotenv').config()

const config = {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 3000,
    public: '../client/',
    db: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    }
}

module.exports = config