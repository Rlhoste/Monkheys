module.exports = (sequelize, DataTypes) => {
    var Enclos = sequelize.define('Enclos', {
        
        nom: DataTypes.STRING,
        capacity: DataTypes.INTEGER
    });

    return Enclos;
};
