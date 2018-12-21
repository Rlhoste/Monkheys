module.exports = {
    database: 'process.env.MYSQL_ADDON_DB',
    username: 'process.env.MYSQL_ADDON_USER',
    password: 'process.env.MYSQL_ADDON_PASSWORD',
    options: {
        host: '127.0.0.1',
        dialect: 'mysql'
    }
}