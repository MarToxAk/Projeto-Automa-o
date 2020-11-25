const Sequelize = require("sequelize");

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'db/banco_dados.sqlite'
  });

module.exports= {
    Sequelize: Sequelize,
    sequelize: sequelize
};