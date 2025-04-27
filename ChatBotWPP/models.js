const { DataTypes } = require('sequelize');
const sequelize = require('./database');

// Definição do modelo Cliente
const Cliente = sequelize.define('Cliente', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telefone: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// Definição do modelo Pedido
const Pedido = sequelize.define('Pedido', {
  bolo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dataRetirada: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'recebido'
  },
  mensagemOriginal: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// Relacionamentos
Cliente.hasMany(Pedido);
Pedido.belongsTo(Cliente);

// Sincronizar o banco de dados
(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados com o banco de dados');
  } catch (error) {
    console.error('❌ Erro ao sincronizar modelos:', error);
  }
})();

// Exportar os modelos
module.exports = { Cliente, Pedido };
