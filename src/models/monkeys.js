module.exports = (sequelize, DataTypes) => {
    var Monkeys = sequelize.define('Monkeys', {
        name: DataTypes.STRING,
        num: DataTypes.INTEGER,
        color: DataTypes.STRING
    });

    return Monkeys;
};
