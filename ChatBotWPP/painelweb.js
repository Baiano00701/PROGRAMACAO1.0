const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path'); // Adicione esta linha
const { Pedido, Cliente } = require('./models');

const app = express();
const PORT = 3000;

// Configuração CORRIGIDA do Handlebars:
app.engine('handlebars', exphbs.engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts') // Opcional
}));
app.set('view engine', 'handlebars');

// Defina explicitamente o diretório das views
app.set('views', path.join(__dirname, 'views'));

// Suas rotas continuam aqui...
app.get('/', async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      include: [Cliente],
      order: [['createdAt', 'DESC']]
    });
    res.render('pedidos', { pedidos }); // Note: o nome deve bater com o arquivo
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao carregar pedidos');
  }
});

app.listen(PORT, () => {
  console.log(`Painel rodando em http://localhost:${PORT}`);
});