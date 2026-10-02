const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API do Cartório Digital a funcionar!');
});

app.post('/api/pedidos', async (req, res) => {
  const dados = req.body;
  console.log('Pedido recebido:', dados);

  return res.status(201).json({
    sucesso: true,
    mensagem: 'Pedido recebido com sucesso!',
    pedidoId: Math.floor(100000 + Math.random() * 900000)
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor a rodar na porta ${PORT}`));
