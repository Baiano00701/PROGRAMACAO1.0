require('dotenv').config();
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const { Cliente, Pedido, syncDatabase } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

syncDatabase();



app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});

app.use('/css', express.static(path.join(__dirname, 'ChatBotWPP/css')));
// Configuração do Handlebars 
const hbs = exphbs.create({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  helpers: {
    // Helper eq totalmente seguro
    eq: function() {
      const args = Array.from(arguments);
      const options = args.pop();
      const [v1, v2] = args;
      
      if (typeof options.fn !== 'function') {
        // Modo inline (retorna true/false)
        return v1 === v2;
      }
      
      // Modo bloco
      return v1 === v2 ? options.fn(this) : (options.inverse || (() => '')).call(this);
    },
    // Helper de formatação de data
    formatDate: function(date) {
      if (!date) return 'Data não informada';
      try {
        return new Date(date).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        return 'Data inválida';
      }
    }
  }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middlewares (CONFIGURAÇÃO CORRETA)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal (COM TRATAMENTO DE ERRO MELHORADO)
app.get('/', async (req, res) => {
  try {
    const statusFilter = req.query.status || 'todos';
    const whereClause = statusFilter !== 'todos' ? { status: statusFilter } : {};
    
    const pedidos = await Pedido.findAll({
      where: whereClause,
      include: [Cliente],
      order: [['createdAt', 'DESC']]
    });

    res.render('pedidos', {
      pedidos,
      statusFilter,
      title: 'Pedidos - Bolos do José'
    });

  } catch (error) {
    console.error('Erro na rota principal:', error);
    res.status(500).render('error', {
      title: 'Erro no servidor',
      message: 'Ocorreu um erro ao carregar os pedidos',
      error: process.env.NODE_ENV === 'development' ? error : null
    });
  }
});

// Rotas de atualização de status (COM VALIDAÇÃO)
app.post('/pedidos/:id/status', async (req, res) => {
  try {
    if (!req.params.id || !req.body.status) {
      return res.status(400).send('Dados inválidos');
    }

    const pedido = await Pedido.findByPk(req.params.id);
    if (!pedido) {
      return res.status(404).send('Pedido não encontrado');
    }

    const statusValidos = ['recebido', 'preparando', 'pronto', 'entregue', 'cancelado'];
    if (!statusValidos.includes(req.body.status)) {
      return res.status(400).send('Status inválido');
    }

    pedido.status = req.body.status;
    await pedido.save();
    res.redirect('/');

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).send('Erro interno no servidor');
  }
});

// Inicia o servidor (COM VERIFICAÇÃO DE AMBIENTE)
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log('Servidor rodando na porta 3000');
  console.log(`Acesse: http://localhost:${PORT}`);
  
});