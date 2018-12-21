const mysql = require('mysql');
module.exports = {
    database: 'process.env.MYSQL_ADDON_DB',
    username: 'process.env.MYSQL_ADDON_USER',
    password: 'process.env.MYSQL_ADDON_PASSWORD',
    options: {
        host: '3306',
        dialect: 'mysql'
    }
}