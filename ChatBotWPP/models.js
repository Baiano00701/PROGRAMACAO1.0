const { DataTypes } = require('sequelize');
const sequelize = require('./database');

// Definição do modelo Cliente (ATUALIZADO)
const Cliente = sequelize.define('Cliente', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telefone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  numero: {  // NOVO CAMPO NECESSÁRIO
    type: DataTypes.STRING,
    allowNull: true,
    unique: false
  }
});

// Definição do modelo Pedido (MANTIDO)
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

// Relacionamentos (MANTIDO)
Cliente.hasMany(Pedido);
Pedido.belongsTo(Cliente);

// Sincronizar o banco de dados (ATUALIZADO)
(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados com sucesso!');
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    process.exit(1); // Encerra o processo em caso de erro crítico
  }
})();

module.exports = { Cliente, Pedido };