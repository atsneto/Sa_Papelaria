# SÁ Papelaria - Integração Supabase

## ✅ Instalação do Supabase

### 1. Criar a Tabela no Supabase

1. Acesse seu projeto no [Supabase](https://app.supabase.com)
2. Vá para **SQL Editor**
3. Cole todo o conteúdo do arquivo `SETUP_SUPABASE.sql`
4. Clique em **Run** para executar o script

### 2. Verificar a Configuração

A URL e Anon Key já estão configuradas em `JS/supabase-config.js`:
- **URL**: `https://tsrjpuwmqdtvxvkowdvp.supabase.co`
- **ANON_KEY**: Já preenchida

## 🎯 Como Usar

### Página Principal e Catálogo
- Os produtos são carregados automaticamente do Supabase
- Se houver erro na conexão, o site continua funcionando com dados locais

### Painel Admin
Acesse: `admin.html`

**Funcionalidades:**
- ✅ Listar todos os produtos
- ✅ Adicionar novo produto
- ✅ Editar produtos existentes
- ✅ Deletar produtos

**Como adicionar um produto:**
1. Clique em "+ Novo Produto"
2. Preencha os campos:
   - **Nome**: Nome do produto
   - **Categoria**: Escolha uma categoria
   - **Preço**: Ex: "A partir de R$ 45,00"
   - **Descrição**: Descrição do produto
   - **Imagem Principal**: URL da imagem
   - **Galeria**: URLs separadas por vírgula
   - **Especificações**: Uma por linha
3. Clique em "Salvar Produto"

## 📁 Estrutura de Arquivos

```
JS/
  ├── script.js              # Scripts principais
  ├── supabase-config.js     # Configuração Supabase
  ├── catalogo.js            # Lógica do catálogo
  ├── admin.js               # Painel admin
  └── produto.js             # Página de produto

CSS/
  ├── style.css              # Estilos gerais
  └── admin.css              # Estilos do admin

HTML
  ├── index.html             # Página inicial
  ├── catalogo.html          # Catálogo completo
  ├── admin.html             # Painel admin
  └── produto.html           # Página de produto

SETUP_SUPABASE.sql          # Script para criar tabela
```

## 🔐 Segurança

As políticas RLS (Row Level Security) estão configuradas:
- ✅ Leitura pública (qualquer um pode ver)
- ✅ Escrita apenas para usuários autenticados (admin)

Para adicionar autenticação admin, você pode:
1. Configurar usuários no Supabase Auth
2. Atualizar as políticas RLS

## 🆘 Troubleshooting

### "Produtos não carregam"
- Verifique se a tabela foi criada corretamente
- Abra o console do navegador (F12) e procure por erros

### "Erro de conexão com Supabase"
- Verifique a URL e Anon Key em `supabase-config.js`
- Verifique se a conexão internet está funcionando

### "Admin não carrega"
- Certifique-se de que os arquivos estão no servidor
- Verifique permissões CORS no Supabase

## 📊 Próximos Passos

1. **Autenticação Admin**: Implementar login para painel admin
2. **Upload de Imagens**: Usar storage do Supabase
3. **Relatórios**: Dashboard com estatísticas de vendas
4. **Pedidos**: Sistema para registrar pedidos

---

**Desenvolvido com ❤️ para SÁ Papelaria**
