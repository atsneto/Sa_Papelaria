const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido' });
  }

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
      return_url: `${process.env.WEBHOOK_URL || 'https://sa-papelaria.vercel.app'}/confirmacao.html`
    });

    // Buscar o Payment Intent atualizado para pegar os dados do PIX
    const updatedIntent = await stripe.paymentIntents.retrieve(paymentIntent.id);
    
    console.log('Pagamento criado:', paymentIntent.id);
    
    // Extrair dados do PIX
    const pixData = updatedIntent.next_action?.pix_display_qr_code;
    
    if (!pixData) {
      throw new Error('Erro ao gerar QR Code PIX');
    }
    
    res.status(200).json({
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
};
