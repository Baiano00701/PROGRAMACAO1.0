const { Sequelize } = require('sequelize');

// Conexão com o banco de dados SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

module.exports = sequelize;
