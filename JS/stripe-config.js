// Configuração do Stripe - Frontend
const StripeConfig = {
  // Detectar ambiente: desenvolvimento ou produção
  API_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://sa-papelaria.vercel.app/api',
  
  // Criar pagamento PIX
  async criarPagamentoPix(produto, usuario) {
    try {
      const response = await fetch(`${this.API_URL}/criar-pagamento-pix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ produto, usuario })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao criar pagamento');
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error);
      throw error;
    }
  },
  
  // Verificar status do pagamento
  async verificarPagamento(paymentId) {
    try {
      const response = await fetch(`${this.API_URL}/verificar-pagamento?payment_id=${paymentId}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao verificar pagamento');
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      throw error;
    }
  },
  
  // Copiar código PIX para área de transferência
  copiarCodigoPix(codigo) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(codigo)
        .then(() => true)
        .catch(() => false);
    } else {
      // Fallback para navegadores antigos
      const textarea = document.createElement('textarea');
      textarea.value = codigo;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      
      try {
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return Promise.resolve(true);
      } catch (err) {
        document.body.removeChild(textarea);
        return Promise.resolve(false);
      }
    }
  },
  
  // Formatar status do pagamento (Stripe)
  formatarStatus(status) {
    const statusMap = {
      'requires_payment_method': 'Aguardando pagamento',
      'requires_confirmation': 'Aguardando confirmação',
      'requires_action': 'Aguardando pagamento',
      'processing': 'Processando',
      'succeeded': 'Pagamento aprovado',
      'canceled': 'Cancelado',
      'requires_capture': 'Aguardando captura'
    };
    
    return statusMap[status] || status;
  }
};
