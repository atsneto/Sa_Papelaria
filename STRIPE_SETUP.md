# 🛒 Guia de Configuração - Stripe PIX

## 📋 Pré-requisitos

1. **Conta no Stripe**
   - Acesse: https://dashboard.stripe.com/register
   - Crie uma conta ou faça login
   - O Stripe é gratuito para começar (cobra apenas taxas por transação)

2. **Node.js instalado**
   - Versão 14 ou superior
   - Verifique: `node --version`

## 🚀 Instalação

### Passo 1: Instalar dependências

```powershell
npm install
```

Isso instalará:
- `express` - Servidor web
- `cors` - Permitir requisições do frontend
- `stripe` - SDK oficial do Stripe
- `dotenv` - Gerenciar variáveis de ambiente
- `nodemon` - Reiniciar servidor automaticamente (dev)

### Passo 2: Obter credenciais do Stripe

1. Acesse: https://dashboard.stripe.com/apikeys
2. Você verá duas chaves:
   - **Publishable key** (pk_test_...) - Não usaremos no backend
   - **Secret key** (sk_test_...) - **Esta é a que precisamos!**
3. Clique em "Reveal test key" e copie a **Secret key**

**⚠️ IMPORTANTE:**
- Use chaves de **TESTE** (sk_test_...) durante o desenvolvimento
- Use chaves de **PRODUÇÃO** (sk_live_...) apenas quando for ao ar
- **NUNCA** compartilhe sua Secret Key!

### Passo 3: Ativar PIX no Stripe

1. Acesse: https://dashboard.stripe.com/settings/payment_methods
2. Encontre "PIX" na lista de métodos de pagamento
3. Clique em "Enable" (Ativar)
4. Siga as instruções para configurar PIX no Brasil

### Passo 4: Configurar variáveis de ambiente

1. Copie o arquivo `.env.example` para `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```

2. Edite o arquivo `.env` e adicione sua Secret Key:
   ```
   STRIPE_SECRET_KEY=sk_test_sua_chave_aqui
   WEBHOOK_URL=http://localhost:3000
   ```

### Passo 5: Iniciar o servidor

**Modo desenvolvimento (reinicia automaticamente):**
```powershell
npm run dev
```

**Modo produção:**
```powershell
npm start
```

O servidor estará rodando em: http://localhost:3000

## 🧪 Testando

### 1. Teste com credenciais de teste

Com as credenciais de teste (sk_test_...), todos os pagamentos são simulados.

### 2. Fluxo de teste

1. Abra a página de produto: `produto.html?id=1`
2. Faça login com um usuário
3. Clique em "Comprar via PIX"
4. O QR Code e código PIX serão gerados
5. No modo teste, você pode simular pagamentos

### 3. Simular pagamento aprovado (modo teste)

No Stripe Dashboard:
1. Acesse: https://dashboard.stripe.com/test/payments
2. Encontre o Payment Intent criado
3. Você pode manualmente marcar como bem-sucedido para testar

Ou use a Stripe CLI:
```powershell
stripe trigger payment_intent.succeeded
```

## 📱 Como funciona

### Frontend (produto.html + produto.js)

1. Usuário clica em "Comprar via PIX"
2. Verifica se está logado
3. Abre modal com loading
4. Faz requisição para criar pagamento

### Backend (server.js)

1. Recebe dados do produto e usuário
2. Cria Payment Intent PIX no Stripe
3. Retorna QR Code e código copia-e-cola
4. Inicia polling para verificar status

### Verificação de pagamento

- A cada 3 segundos, verifica o status
- Quando `succeeded`, mostra mensagem de sucesso
- Pode integrar com Supabase para salvar pedidos

## 🔒 Segurança

**NUNCA exponha sua Secret Key no frontend!**

✅ Correto:
- Secret Key no backend (server.js)
- Secret Key em variável de ambiente (.env)
- .env no .gitignore

❌ Errado:
- Secret Key em arquivos JavaScript do frontend
- Secret Key commitada no Git
- Secret Key em código público

## 📦 Estrutura de arquivos

```
Sa_Papelaria/
├── server.js                    # Servidor backend
├── .env                         # Credenciais (NÃO commitar)
├── .env.example                 # Template de configuração
├── package.json                 # Dependências
├── produto.html                 # Interface do produto
├── JS/
│   ├── produto.js              # Lógica do produto + PIX
│   └── stripe-config.js        # Configuração frontend
└── CSS/
    └── style.css               # Estilos do modal PIX
```

## 🌐 Deploy em Produção

### 1. Configurar webhook

O Stripe precisa notificar seu servidor sobre mudanças no pagamento.

1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique em "Add endpoint"
3. URL: `https://seusite.com/api/webhook`
4. Eventos: Selecione `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`
5. Copie o **Webhook signing secret** (whsec_...)
6. Adicione no `.env`: `STRIPE_WEBHOOK_SECRET=whsec_...`

### 2. Trocar para credenciais de produção

1. No Stripe Dashboard, ative o "Live mode"
2. Copie a Secret Key de produção (sk_live_...)
3. No `.env`, use: `STRIPE_SECRET_KEY=sk_live_...`
4. Reinicie o servidor

### 3. HTTPS obrigatório

Em produção, use HTTPS. O Stripe exige conexão segura para webhooks.

## 💰 Taxas do Stripe

- **PIX**: 3,99% por transação (sem mensalidade)
- Recebimento em D+2 (2 dias úteis)
- Sem taxas de setup ou mensalidade

## 🆘 Problemas comuns

### Erro: "Invalid API Key"
- Verifique se copiou a Secret Key completa (sk_test_...)
- Verifique se o arquivo .env existe e está sendo lido
- Reinicie o servidor após alterar .env

### Erro: "PIX is not enabled"
- Acesse Settings > Payment methods no Stripe Dashboard
- Ative o método de pagamento PIX
- Configure sua conta para aceitar BRL

### Erro: "CORS blocked"
- Verifique se o servidor está rodando
- Verifique a configuração CORS em server.js

### QR Code não aparece
- Abra o console do navegador (F12)
- Verifique se há erros
- Verifique se o servidor está respondendo
- Confirme que PIX está ativado no Stripe

### Pagamento não é aprovado
- No modo teste, pagamentos são simulados
- Use o Stripe Dashboard para aprovar manualmente
- Em produção, faça um pagamento real de teste

## 📚 Documentação

- Stripe Developers: https://stripe.com/docs
- PIX no Stripe: https://stripe.com/docs/payments/pix
- API Reference: https://stripe.com/docs/api
- Webhooks: https://stripe.com/docs/webhooks
- Stripe CLI: https://stripe.com/docs/stripe-cli

## 🛠️ Ferramentas úteis

### Stripe CLI (opcional mas recomendado)

Instale a CLI do Stripe para testar webhooks localmente:

```powershell
# Baixar: https://github.com/stripe/stripe-cli/releases
stripe login
stripe listen --forward-to localhost:3000/api/webhook
```

Isso permite testar webhooks sem deploy!

## 💡 Próximos passos

1. **Salvar pedidos no Supabase**
   - Criar tabela `pedidos`
   - Salvar informações do pagamento
   - Vincular com usuário

2. **Enviar email de confirmação**
   - Integrar serviço de email (SendGrid, Resend)
   - Enviar quando pagamento for aprovado
   - Template bonito com detalhes do pedido

3. **Página de confirmação**
   - Criar `confirmacao.html`
   - Mostrar detalhes do pedido
   - Status de entrega

4. **Gestão de estoque**
   - Atualizar quantidade no Supabase
   - Prevenir vendas de itens esgotados
   - Notificar quando estoque baixo

5. **Painel administrativo**
   - Ver todos os pagamentos
   - Filtrar por status
   - Exportar relatórios

## 🆚 Por que Stripe ao invés de Mercado Pago?

✅ **Vantagens do Stripe:**
- API mais moderna e bem documentada
- Melhor suporte a desenvolvedor
- Webhook mais confiável
- Dashboard mais intuitivo
- Integração internacional (útil para expansão)
- Melhor experiência de teste

✅ **PIX no Stripe:**
- Mesmo método de pagamento
- QR Code gerado instantaneamente
- Confirmação em tempo real
- Taxas competitivas (3,99%)

---

**Desenvolvido para SÁ Papelaria** 💖
**Powered by Stripe** 💳

## 📋 Pré-requisitos

1. **Conta no Mercado Pago**
   - Acesse: https://www.mercadopago.com.br
   - Crie uma conta ou faça login

2. **Node.js instalado**
   - Versão 14 ou superior
   - Verifique: `node --version`

## 🚀 Instalação

### Passo 1: Instalar dependências

```powershell
npm install
```

Isso instalará:
- `express` - Servidor web
- `cors` - Permitir requisições do frontend
- `mercadopago` - SDK do Mercado Pago
- `nodemon` - Reiniciar servidor automaticamente (dev)

### Passo 2: Obter credenciais do Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel/credentials
2. Escolha "Credenciais de produção" ou "Credenciais de teste"
3. Copie o **Access Token**

**⚠️ IMPORTANTE:**
- Use credenciais de **TESTE** durante o desenvolvimento
- Use credenciais de **PRODUÇÃO** apenas quando for ao ar

### Passo 3: Configurar variáveis de ambiente

1. Copie o arquivo `.env.example` para `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```

2. Edite o arquivo `.env` e adicione seu token:
   ```
   MERCADOPAGO_ACCESS_TOKEN=seu_token_aqui
   WEBHOOK_URL=http://localhost:3000
   ```

### Passo 4: Iniciar o servidor

**Modo desenvolvimento (reinicia automaticamente):**
```powershell
npm run dev
```

**Modo produção:**
```powershell
npm start
```

O servidor estará rodando em: http://localhost:3000

## 🧪 Testando

### 1. Teste com credenciais de teste

Com as credenciais de teste, você pode usar usuários de teste:

**Criador de pagamentos:**
- Email: test_user_123456@testuser.com
- Senha: qatest123

**Pagador:**
- Email: test_user_789012@testuser.com  
- Senha: qatest123

### 2. Fluxo de teste

1. Abra a página de produto: `produto.html?id=1`
2. Faça login com um usuário
3. Clique em "Comprar via PIX"
4. O QR Code e código PIX serão gerados
5. No modo teste, o pagamento pode ser simulado

### 3. Simular pagamento aprovado (modo teste)

No Mercado Pago Sandbox, você pode usar a API para aprovar pagamentos manualmente.

## 📱 Como funciona

### Frontend (produto.html + produto.js)

1. Usuário clica em "Comprar via PIX"
2. Verifica se está logado
3. Abre modal com loading
4. Faz requisição para criar pagamento

### Backend (server.js)

1. Recebe dados do produto e usuário
2. Cria pagamento PIX no Mercado Pago
3. Retorna QR Code e código copia-e-cola
4. Inicia polling para verificar status

### Verificação de pagamento

- A cada 3 segundos, verifica o status
- Quando aprovado, mostra mensagem de sucesso
- Pode integrar com Supabase para salvar pedidos

## 🔒 Segurança

**NUNCA exponha seu Access Token no frontend!**

✅ Correto:
- Token no backend (server.js)
- Token em variável de ambiente (.env)
- .env no .gitignore

❌ Errado:
- Token em arquivos JavaScript do frontend
- Token commitado no Git
- Token em código público

## 📦 Estrutura de arquivos

```
Sa_Papelaria/
├── server.js                    # Servidor backend
├── .env                         # Credenciais (NÃO commitar)
├── .env.example                 # Template de configuração
├── package.json                 # Dependências
├── produto.html                 # Interface do produto
├── JS/
│   ├── produto.js              # Lógica do produto + PIX
│   └── mercadopago-config.js   # Configuração frontend
└── CSS/
    └── style.css               # Estilos do modal PIX
```

## 🌐 Deploy em Produção

### 1. Configurar webhook

O Mercado Pago precisa notificar seu servidor sobre mudanças no pagamento.

1. Configure uma URL pública (ex: https://seusite.com/api/webhook)
2. Atualize `WEBHOOK_URL` no `.env`
3. Teste o webhook: https://www.mercadopago.com.br/developers/panel/webhooks

### 2. Trocar para credenciais de produção

1. No `.env`, use o Access Token de **produção**
2. Reinicie o servidor

### 3. HTTPS obrigatório

Em produção, use HTTPS. O Mercado Pago exige conexão segura.

## 🆘 Problemas comuns

### Erro: "Access Token inválido"
- Verifique se copiou o token completo
- Verifique se está usando o token correto (teste vs produção)

### Erro: "CORS blocked"
- Verifique se o servidor está rodando
- Verifique a configuração CORS em server.js

### QR Code não aparece
- Abra o console do navegador (F12)
- Verifique se há erros
- Verifique se o servidor está respondendo

### Pagamento não é aprovado
- No modo teste, pagamentos não são reais
- Use o painel do Mercado Pago para simular aprovação
- Em produção, faça um pagamento real de teste

## 📚 Documentação

- Mercado Pago Developers: https://www.mercadopago.com.br/developers
- SDK Node.js: https://github.com/mercadopago/sdk-nodejs
- API Reference: https://www.mercadopago.com.br/developers/pt/reference

## 💡 Próximos passos

1. **Salvar pedidos no Supabase**
   - Criar tabela `pedidos`
   - Salvar informações do pagamento
   - Vincular com usuário

2. **Enviar email de confirmação**
   - Integrar serviço de email
   - Enviar quando pagamento for aprovado

3. **Página de confirmação**
   - Criar `confirmacao.html`
   - Mostrar detalhes do pedido
   - Status de entrega

4. **Gestão de estoque**
   - Atualizar quantidade no Supabase
   - Prevenir vendas de itens esgotados

---

**Desenvolvido para SÁ Papelaria** 💖
