const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com o banco PostgreSQL no Supabase via variável de ambiente
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Teste de conexão
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Erro ao conectar ao Supabase:', err.stack);
  }
  console.log('Conectado com sucesso ao Supabase!');
  release();
});

// Rota principal de teste
app.get('/', (req, res) => {
  res.send('API do Cartório Digital a funcionar!');
});

// Rota para receber e guardar os pedidos no banco
app.post('/api/pedidos', async (req, res) => {
  try {
    const { nome, cpf, tipoCertidao, telefone } = req.body;

    const query = `
      INSERT INTO pedidos (nome, cpf, tipo_certidao, telefone)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;
    const values = [nome, cpf, tipoCertidao, telefone];

    const result = await pool.query(query, values);

    return res.status(201).json({
      sucesso: true,
      mensagem: 'Pedido guardado com sucesso!',
      pedidoId: result.rows[0].id
    });
  } catch (error) {
    console.error('Erro ao guardar pedido:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno ao processar o pedido.'
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor a rodar na porta ${PORT}`));
