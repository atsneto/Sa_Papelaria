const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

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
};
