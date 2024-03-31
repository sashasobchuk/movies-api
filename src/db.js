const { Sequelize, DataTypes } = require('sequelize');

 const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
});

const Movie = sequelize.define('Movie', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    releaseYear: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    format: {
        type: DataTypes.ENUM('VHS', 'DVD', 'Blu-ray'),
        allowNull: false
    },
    actors: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
            return this.getDataValue('actors').split(',');
        },
        set(val) {
            this.setDataValue('actors', val.join(','));
        }
    }
});


const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    passwordDigest: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});


module.exports = { sequelize,Movie,User };
