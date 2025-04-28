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
  },
  numero: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false
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

// Função para verificar se tabela Clientes_backup existe
async function tabelaBackupExiste() {
  const [results] = await sequelize.query(`
    SELECT name FROM sqlite_master WHERE type='table' AND name='Clientes_backup';
  `);
  return results.length > 0;
}

// Função para sincronizar banco e criar backup apenas se necessário
async function syncDatabase() {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados com sucesso!');

    const existeBackup = await tabelaBackupExiste();
    if (!existeBackup) {
      console.log('ℹ️ Criando tabela de backup Clientes_backup...');
      await sequelize.query(`
        CREATE TABLE Clientes_backup AS
        SELECT id, nome, createdAt, updatedAt, telefone, numero FROM Clientes;
      `);
      console.log('✅ Backup da tabela Clientes criado com sucesso!');
    } else {
      console.log('⚡ Backup já existe. Nenhuma ação necessária.');
    }
    
  } catch (error) {
    console.error('❌ Erro na sincronização ou no backup:', error);
    process.exit(1);
  }
}

module.exports = { Cliente, Pedido, syncDatabase };
