const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Método não permitido' });
  }

  try {
    const { payment_id } = req.query;
    
    if (!payment_id) {
      return res.status(400).json({ success: false, error: 'ID do pagamento não fornecido' });
    }
    
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_id);
    
    res.status(200).json({
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency
    });
    
  } catch (error) {
    console.error('Erro ao verificar pagamento:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
