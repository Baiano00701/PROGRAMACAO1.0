const { DataTypes } = require('sequelize');
const sequelize = require('./database'); // Importa a conexão que criamos

// Modelo para Clientes
const Cliente = sequelize.define('Cliente', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  numero: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // Garante que cada número só aparece uma vez
  }
}, {
  timestamps: true // Cria campos createdAt e updatedAt automaticamente
});

// Modelo para Pedidos
const Pedido = sequelize.define('Pedido', {
  bolo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dataRetirada: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pendente', // Valor padrão
    allowNull: false
  },
  mensagemOriginal: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  timestamps: true
});

// Relacionamentos (um Cliente pode ter muitos Pedidos)
Cliente.hasMany(Pedido);
Pedido.belongsTo(Cliente);

// Sincroniza os modelos com o banco de dados
(async () => {
  try {
    await sequelize.sync({ alter: true }); // 'alter' atualiza a estrutura se necessário
    console.log('✅ Modelos sincronizados com o banco de dados');
  } catch (error) {
    console.error('❌ Erro ao sincronizar modelos:', error);
  }
})();

// Exporta os modelos para usar em outros arquivos
module.exports = { Cliente, Pedido };