const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Configurar Stripe
// IMPORTANTE: Substitua com sua Secret Key do Stripe
// Obtenha em: https://dashboard.stripe.com/apikeys
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_...');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Endpoint para criar pagamento PIX
app.post('/api/criar-pagamento-pix', async (req, res) => {
  try {
    const { produto, usuario } = req.body;
    
    console.log('Criando pagamento PIX para:', produto.nome);
    
    // Extrair valor numérico do preço (ex: "R$ 45,00" -> 45.00)
    const precoTexto = produto.preco.replace('R$', '').trim().replace(',', '.');
    const valor = parseFloat(precoTexto);
    
    if (isNaN(valor)) {
      throw new Error('Preço inválido: ' + produto.preco);
    }

    // Converter para centavos (Stripe usa centavos)
    const valorEmCentavos = Math.round(valor * 100);

    // Criar Payment Intent com PIX
    const paymentIntent = await stripe.paymentIntents.create({
      amount: valorEmCentavos,
      currency: 'brl',
      payment_method_types: ['pix'],
      description: produto.nome,
      metadata: {
        produto_id: produto.id,
        produto_nome: produto.nome,
        usuario_email: usuario.email,
        usuario_nome: usuario.nome || 'Cliente'
      },
      receipt_email: usuario.email
    });

    // Gerar QR Code PIX
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'pix',
    });

    await stripe.paymentIntents.confirm(paymentIntent.id, {
      payment_method: paymentMethod.id,
      return_url: `${process.env.WEBHOOK_URL || 'http://localhost:3000'}/confirmacao.html`
    });

    // Buscar o Payment Intent atualizado para pegar os dados do PIX
    const updatedIntent = await stripe.paymentIntents.retrieve(paymentIntent.id);
    
    console.log('Pagamento criado:', paymentIntent.id);
    
    // Extrair dados do PIX
    const pixData = updatedIntent.next_action?.pix_display_qr_code;
    
    if (!pixData) {
      throw new Error('Erro ao gerar QR Code PIX');
    }
    
    res.json({
      success: true,
      payment_id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      status: paymentIntent.status,
      qr_code: pixData.data,
      qr_code_url: pixData.hosted_instructions_url,
      expires_at: pixData.expires_at
    });
    
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Endpoint para verificar status do pagamento
app.get('/api/verificar-pagamento/:payment_id', async (req, res) => {
  try {
    const { payment_id } = req.params;
    
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_id);
    
    res.json({
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100, // Converter de centavos para reais
      currency: paymentIntent.currency
    });
    
  } catch (error) {
    console.error('Erro ao verificar pagamento:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Webhook para receber notificações do Stripe
app.post('/api/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = req.body;
    }
    
    console.log('Webhook recebido:', event.type);
    
    // Processar eventos específicos
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('✅ Pagamento aprovado! ID:', paymentIntent.id);
        console.log('Valor:', paymentIntent.amount / 100, paymentIntent.currency.toUpperCase());
        console.log('Metadados:', paymentIntent.metadata);
        
        // Aqui você pode:
        // - Atualizar banco de dados (Supabase)
        // - Enviar email de confirmação
        // - Atualizar estoque
        // - Criar registro de pedido
        break;
        
      case 'payment_intent.payment_failed':
        console.log('❌ Pagamento falhou:', event.data.object.id);
        break;
        
      case 'payment_intent.canceled':
        console.log('⚠️ Pagamento cancelado:', event.data.object.id);
        break;
    }
    
    res.json({received: true});
    
  } catch (error) {
    console.error('Erro no webhook:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log('⚠️  IMPORTANTE: Configure seu STRIPE_SECRET_KEY');
  console.log('📚 Documentação: https://stripe.com/docs/payments/pix');
});
