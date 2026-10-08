import express from 'express';
import cors from 'cors';
import sql from './db.js'; // Conexão com o PostgreSQL / Supabase

const app = express();

// Lista de origens permitidas (Seu novo domínio e suporte a desenvolvimento local)
const allowedOrigins = [
  'https://pedidoscertidoesbrasil.com.br',
  'https://www.pedidoscertidoesbrasil.com.br',
  'http://localhost:3000',
  'http://127.0.0.1:5500' // Para testar com Live Server localmente
];

// Configuração do CORS
app.use(cors({
  origin: function (origin, callback) {
    // Permite chamadas sem 'origin' (como requisições mobile, Postman ou do próprio servidor)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado pelo CORS: Origem não permitida.'));
    }
  }
}));

// Middleware para ler JSON no corpo das requisições
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.send('API do Cartório Digital com postgresJS a funcionar!');
});

// 1. ROTA POST - Salvar Pedidos (Usada no solicitar.html)
app.post('/api/pedidos', async (req, res) => {
  try {
    const { protocolo, total, servico, formato, email, whatsapp, solicitante, cpf } = req.body;

    const result = await sql`
      INSERT INTO pedidos (
        protocolo, total, servico, formato, email, whatsapp, solicitante, cpf, status
      ) VALUES (
        ${protocolo}, ${total}, ${servico}, ${formato}, ${email}, ${whatsapp}, ${solicitante}, ${cpf}, 'Pendente'
      )
      RETURNING id, protocolo;
    `;

    return res.status(201).json({
      sucesso: true,
      mensagem: 'Pedido guardado com sucesso!',
      pedido: result[0]
    });
  } catch (error) {
    console.error('Erro ao guardar pedido no Supabase:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno ao processar o pedido.'
    });
  }
});

// 2. ROTA GET - Listar Pedidos (Usada no admin.html)
app.get('/api/pedidos', async (req, res) => {
  try {
    const pedidos = await sql`
      SELECT * FROM pedidos ORDER BY data_criacao DESC;
    `;
    return res.status(200).json(pedidos);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao carregar lista de pedidos.' });
  }
});

// 3. ROTA PATCH - Atualizar Status (Usada no admin.html)
app.patch('/api/pedidos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await sql`
      UPDATE pedidos
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *;
    `;

    return res.status(200).json({
      sucesso: true,
      mensagem: 'Status atualizado com sucesso!',
      pedido: result[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar status.' });
  }
});

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
