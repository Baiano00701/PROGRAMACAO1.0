// migrate.js
const sequelize = require('./database'); // Importação direta
const { Cliente } = require('./models');

async function migrate() {
  try {
    // 1. Preencher a nova coluna
    const clientes = await Cliente.findAll();
    
    for (const cliente of clientes) {
      if (!cliente.numero) {
        cliente.numero = cliente.telefone ? 
          `${cliente.telefone}@c.us` : 
          `sem-numero-${Date.now()}`;
        await cliente.save();
      }
    }

    // 2. Atualizar restrições
    await sequelize.getQueryInterface().changeColumn('Clientes', 'numero', {
      type: sequelize.Sequelize.STRING,
      allowNull: false,
      unique: true
    });

    console.log('✅ Migração concluída com sucesso!');
} catch (error) {
    console.error('❌ Erro na migração:', error);
  } finally {
    await sequelize.close();
  }
}

migrate();