# 🚀 Guia de Deploy - SÁ Papelaria no Vercel

## ✅ O que já está pronto:

1. ✅ Chave do Stripe configurada
2. ✅ Serverless functions criadas (`/api`)
3. ✅ Frontend configurado para detectar ambiente
4. ✅ Arquivo `.env` com suas credenciais (não será commitado)

## 📦 Passos para fazer deploy:

### 1. Instalar Vercel CLI (se ainda não tiver)

```powershell
npm install -g vercel
```

### 2. Fazer login no Vercel

```powershell
vercel login
```

### 3. Fazer deploy

```powershell
vercel
```

O CLI vai perguntar algumas coisas:
- **Set up and deploy?** → Yes
- **Which scope?** → Selecione sua conta
- **Link to existing project?** → No
- **Project name?** → sa-papelaria (ou o nome que preferir)
- **Directory?** → ./ (pressione Enter)
- **Override settings?** → No

### 4. Configurar variáveis de ambiente no Vercel

**IMPORTANTE:** As variáveis do `.env` local não vão para o Vercel automaticamente!

Você tem 2 opções:

#### Opção A: Via Dashboard do Vercel (mais fácil)

1. Acesse: https://vercel.com/dashboard
2. Clique no seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione:
   - `STRIPE_SECRET_KEY` = Cole sua chave secreta aqui (do arquivo .env)
   - `WEBHOOK_URL` = `https://sa-papelaria.vercel.app`

#### Opção B: Via CLI

```powershell
vercel env add STRIPE_SECRET_KEY
# Cole a chave quando solicitado

vercel env add WEBHOOK_URL
# Digite: https://sa-papelaria.vercel.app
```

### 5. Fazer deploy em produção

```powershell
vercel --prod
```

Pronto! Seu site estará no ar! 🎉

## 🔔 Configurar Webhook do Stripe

Para receber notificações de pagamento:

1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique em **Add endpoint**
3. URL: `https://sa-papelaria.vercel.app/api/webhook`
4. Eventos a escutar:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `payment_intent.canceled`
5. Copie o **Signing secret** (whsec_...)
6. Adicione no Vercel:
   - Dashboard → Settings → Environment Variables
   - Nome: `STRIPE_WEBHOOK_SECRET`
   - Valor: `whsec_...` (o secret que você copiou)
7. Faça redeploy: `vercel --prod`

## 🧪 Testar

1. Acesse: `https://sa-papelaria.vercel.app/produto.html?id=1`
2. Clique em "Comprar via PIX"
3. O QR Code deve aparecer!

## 📝 Comandos úteis

```powershell
# Deploy de desenvolvimento
vercel

# Deploy de produção
vercel --prod

# Ver logs em tempo real
vercel logs

# Ver lista de deploys
vercel ls

# Remover projeto
vercel remove
```

## ⚠️ Troubleshooting

### Erro: "Invalid API Key"
- Verifique se adicionou `STRIPE_SECRET_KEY` nas env variables do Vercel
- Redeploy após adicionar variáveis

### QR Code não aparece
- Abra o console do navegador (F12)
- Verifique se há erros na aba Network
- Teste a API diretamente: `https://sa-papelaria.vercel.app/api/criar-pagamento-pix`

### CORS Error
- As serverless functions já têm CORS configurado
- Se ainda der erro, verifique o console

## 📊 Monitoramento

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Stripe Dashboard**: https://dashboard.stripe.com/payments
- **Logs do Vercel**: `vercel logs --follow`

## 🔒 Segurança

✅ **Correto:**
- `.env` está no `.gitignore`
- Chave secreta está nas env variables do Vercel
- `.env.example` tem apenas placeholders

❌ **NUNCA faça:**
- Commitar arquivo `.env`
- Expor chave secreta no frontend
- Compartilhar chaves em mensagens/prints

## 💡 Próximos passos

1. **Domínio customizado** (opcional)
   - Vercel Dashboard → Settings → Domains
   - Adicione: `www.sapapelaria.com.br`

2. **Analytics**
   - Vercel tem analytics integrado
   - Ou use Google Analytics

3. **Email de confirmação**
   - Integre SendGrid ou Resend
   - Envie quando webhook receber `payment_intent.succeeded`

---

**Desenvolvido para SÁ Papelaria** 💖
