// Ativar QRCODE node chatbot.js
const { Cliente, Pedido } = require('./models');
const qrcode = require('qrcode-terminal');
const { Client, MessageMedia } = require('whatsapp-web.js');
const client = new Client();

// Objeto para armazenar pedidos temporários
const pedidosPendentes = {};

// serviço de leitura do qr code
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});

client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms));

// Funções auxiliares
function extrairNomeBolo(texto) {
    const match = texto.match(/quero (.+?) (para|pras|pro|na|dia|hoje)/i);
    return match ? match[1] : null;
}

function extrairData(texto) {
    const match = texto.match(/(para|pras|pro|na|dia|hoje) (.+)/i);
    return match ? match[2] : 'hoje às 18h';
}

function detectarIntencao(texto) {
    // Padrões para confirmação
    const padroesConfirmacao = [
        /^(sim|confirm[oa]?|pode anotar|quero|aceito|ok|okay|t[áa] certo)$/i,
        /^(claro|com certeza|vou querer|fa[çc]a o pedido)$/i,
        /^\uD83D\uDC4D|\uD83D\uDC4C/ // Emojis de 👍 e 👌
    ];

    // Padrões para cancelamento
    const padroesCancelamento = [
        /^(n[ãa]o|nope|cancel[ea]|desist[io]|n[ãa] quero)$/i,
        /^(esquece|deixa pra l[áa]|volto depois)$/i,
        /^\uD83D\uDC4E|\u274C/ // Emojis de 👎 e ❌
    ];

    // Verifica confirmação
    if (padroesConfirmacao.some(regex => regex.test(texto.trim()))) {
        return 'confirmar';
    }

    // Verifica cancelamento
    if (padroesCancelamento.some(regex => regex.test(texto.trim()))) {
        return 'cancelar';
    }

    return null;
}

async function consultarStatusCliente(numeroCliente) {
    const cliente = await Cliente.findOne({ 
        where: { numero: numeroCliente },
        include: [Pedido],
        order: [[Pedido, 'createdAt', 'DESC']]
    });

    if (!cliente || cliente.Pedidos.length === 0) {
        return null;
    }

    return cliente.Pedidos;
}

function formatarStatus(status) {
    const statusMap = {
        'recebido': '🟡 Em preparação',
        'preparando': '🟠 Sendo preparado',
        'pronto': '🟢 Pronto para retirada',
        'entregue': '✅ Concluído',
        'cancelado': '❌ Cancelado'
    };
    return statusMap[status.toLowerCase()] || status;
}

// Funil de mensagens (único handler)
client.on('message', async msg => {
    try {
        // Menu principal
        if (msg.body.match(/(menu|Menu|BOM DIA|BOA TARDE|BOA NOITE|dia|Bom Dia|bom dia|Boa Tarde|boa tarde|tarde|Boa Noite|boa noite|noite|oi|Oi|Olá|olá|ola|Ola)/i) && msg.from.endsWith('@c.us')) {
            const chat = await msg.getChat();
            const contact = await msg.getContact();
            const name = contact.pushname;

            await delay(1000);
            await chat.sendStateTyping();

            await client.sendMessage(msg.from, 
                `Olá ${name.split(" ")[0]}! 🍰 Eu sou o *Jarvis*, assistente da *Bolos do José*!\n\n` +
                '*Como posso ajudar? Digite o número da opção desejada:*\n\n' +
                '1️⃣ 🍰 Cardápio Completo\n' +
                '2️⃣ ⭐ Mais Vendidos\n' +
                '3️⃣ 🎁 Promoções\n' +
                '4️⃣ ⏰ Horário de Funcionamento\n' +
                '5️⃣ 📝 Fazer Pedido\n' +
                '6️⃣ 📞 Falar com José'
            );
        }

        // Opção 1 - Cardápio Completo
        if (msg.body === '1' && msg.from.endsWith('@c.us')) {
            const chat = await msg.getChat();
            
            await delay(1000);
            await chat.sendStateTyping();
            
            await client.sendMessage(msg.from, 
                '*🍰 CARDÁPIO COMPLETO 🍰*\n\n' +
                '1. Bolo de Chocolate c/ Doce de Leite - R$ 45,00\n' +
                '2. Bolo de Chocolate Caramelizado - R$ 48,00\n' +
                '3. Bolo Trufado - R$ 55,00\n' +
                '4. Bolo de Morango - R$ 50,00\n' +
                '5. Bolo de Prestígio - R$ 52,00\n' +
                '6. Bolo de Leite Ninho - R$ 58,00\n\n' +
                'Para pedir, digite:\n' +
                '"Quero [nome do bolo] para [data/horário]"\n' +
                'Exemplo: _Quero Bolo de Morango para amanhã às 15h_'
            );
        }

        // Opção 2 - Mais Vendidos
        if (msg.body === '2' && msg.from.endsWith('@c.us')) {
            const chat = await msg.getChat();

            await delay(1000);
            await chat.sendStateTyping();

            await client.sendMessage(msg.from, 
                '*⭐ BOLOS MAIS VENDIDOS ⭐*\n\n' +
                '1. Bolo de Morango - R$ 50,00\n' +
                '2. Bolo de Prestígio - R$ 52,00\n' +
                '3. Bolo de Leite Ninho - R$ 58,00\n\n' +
                'Para pedir, digite:\n' +
                '"Quero [nome do bolo] para [data/horário]"\n' +
                'Exemplo: _Quero Bolo de Morango para hoje às 17h_'
            );
        }

        // Opção 4 - Horário de Funcionamento
        if (msg.body === '4' && msg.from.endsWith('@c.us')) {
            await client.sendMessage(msg.from,
                '⏰*HORÁRIO DE FUNCIONAMENTO*⏰\n\n' +
                'Segunda a Sexta: 8h às 19h\n' +
                'Sábados: 8h às 15h\n' +
                'Domingos: Fechado\n\n' +
                'Entregas até 1h antes do fechamento!'
            );
        }

        // Opção 5 - Fazer Pedido
        if (msg.body === '5' && msg.from.endsWith('@c.us')) {
            await client.sendMessage(msg.from,
                '📝*FAZER PEDIDO*📝\n\n' +
                'Digite no formato:\n' +
                '"Quero [nome do bolo] para [data/horário]"\n\n' +
                'Exemplos:\n' +
                '_Quero Bolo de Morango para amanhã às 15h_\n' +
                '_Quero Bolo Trufado para sexta às 18h_'
            );
        }

        // Opção 6 - Falar com José
        if (msg.body === '6' && msg.from.endsWith('@c.us')) {
            await client.sendMessage(msg.from,
                '📞*FALAR COM JOSÉ*📞\n\n' +
                'Você será direcionado para falar diretamente com nosso confeiteiro!\n' +
                'Envie sua mensagem que José responderá em breve.\n\n' +
                'Obrigado por escolher os *Bolos do José*! 🍰'
            );
        }

        // Processamento de pedidos (para qualquer mensagem com "quero")
        if (msg.body.toLowerCase().includes('quero') && msg.from.endsWith('@c.us')) {
            const chat = await msg.getChat();
            const bolo = extrairNomeBolo(msg.body);
            const data = extrairData(msg.body);

            if (!bolo) {
                await client.sendMessage(msg.from,
                    'Não entendi qual bolo você quer. Por favor, digite:\n' +
                    '"Quero [nome do bolo] para [data/horário]"\n' +
                    'Exemplo: _Quero Bolo de Morango para amanhã às 15h_'
                );
                return;
            }

            pedidosPendentes[msg.from] = { bolo, data, status: 'pendente' };

            await client.sendMessage(msg.from, 
                '🔹*CONFIRMAR PEDIDO*🔹\n\n' +
                `🍰 Bolo: ${bolo}\n` +
                `⏰ Quando: ${data}\n\n` +
                'Responda "sim" para confirmar ou "não" para cancelar'
            );
        }

        // Consulta de Status Inteligente
        const padroesConsulta = [
            /^(status|estado|situa[çc][aã]o)/i,
            /^(meus pedidos|hist[óo]rico)/i,
            /^(onde est[áa]|como est[áa]|ver meu)/i,
            /pedido|encomenda/i
        ];

        const ehConsultaStatus = padroesConsulta.some(regex => regex.test(msg.body)) && 
                               !msg.body.match(/confirmar|cancelar|quero/i);

        if (ehConsultaStatus && msg.from.endsWith('@c.us')) {
            const pedidos = await consultarStatusCliente(msg.from);

            if (!pedidos || pedidos.length === 0) {
                await client.sendMessage(msg.from,
                    '📭 *Você não tem pedidos registrados.*\n\n' +
                    'Para fazer um novo pedido, digite "menu" ou comece com:\n' +
                    '"Quero [nome do bolo] para [data/horário]"'
                );
                return;
            }

            let resposta = '📋 *SEUS ÚLTIMOS PEDIDOS*\n\n';
            
            pedidos.slice(0, 3).forEach(p => {
                resposta += `🔹 *Pedido #${p.id}*\n`;
                resposta += `🍰 ${p.bolo}\n`;
                resposta += `⏰ Retirada: ${p.dataRetirada}\n`;
                resposta += `📅 Data do pedido: ${p.createdAt.toLocaleDateString()}\n`;
                resposta += `🔄 Status: ${formatarStatus(p.status)}\n\n`;
            });

            if (pedidos.length > 3) {
                resposta += `ℹ️ Você tem ${pedidos.length - 3} pedidos mais antigos.`;
            }

            await client.sendMessage(msg.from, resposta);
        }

        // Detecção de intenção para confirmação/cancelamento
        const intencao = detectarIntencao(msg.body);
        const temPedidoPendente = pedidosPendentes[msg.from];

        if (intencao === 'confirmar' && temPedidoPendente) {
            const pedidoTemp = pedidosPendentes[msg.from];
            const contact = await msg.getContact();
            
            try {
                const [cliente] = await Cliente.findOrCreate({
                    where: { numero: msg.from },
                    defaults: { nome: contact.pushname || 'Não informado' }
                });

                const pedido = await Pedido.create({
                    bolo: pedidoTemp.bolo,
                    dataRetirada: pedidoTemp.data,
                    status: 'recebido',
                    mensagemOriginal: msg.body,
                    ClienteId: cliente.id
                });

                await client.sendMessage(msg.from,
                    `✅ *Pedido #${pedido.id} registrado!*\n\n` +
                    `🍰 ${pedido.bolo}\n` +
                    `⏰ Retirada: ${pedido.dataRetirada}\n\n` +
                    `Obrigado! Você pode verificar o status a qualquer momento enviando:\n` +
                    `"Meus pedidos" ou "Status do pedido"`
                );

                delete pedidosPendentes[msg.from];
            } catch (error) {
                console.error('Erro ao salvar pedido:', error);
                await client.sendMessage(msg.from,
                    '❌ Houve um problema ao registrar seu pedido. Por favor, tente novamente mais tarde.'
                );
            }
        }
        else if (intencao === 'cancelar' && temPedidoPendente) {
            delete pedidosPendentes[msg.from];
            await client.sendMessage(msg.from,
                '🔄 *Pedido cancelado com sucesso!*\n\n' +
                'Se mudar de ideia, é só começar de novo enviando "menu".'
            );
        }

    } catch (error) {
        console.error('Erro ao processar mensagem:', error);
        await client.sendMessage(msg.from, 
            '⚠️ Ocorreu um erro inesperado. Já estamos verificando!'
        );
    }
});