// Configuração do Supabase
const SUPABASE_URL = 'https://tsrjpuwmqdtvxvkowdvp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzcmpwdXdtcWR0dnh2a293ZHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNjU2NjYsImV4cCI6MjA4Mjk0MTY2Nn0.j-NaTZXzU1huut0IiQHntUgpBf2kSY28X3J-kTUNZbo';

// WhatsApp da empresa
const WHATSAPP = '5584996208075';

// Inicializar cliente Supabase
let clienteSupabase = null;

// Aguardar a biblioteca carregar
if (typeof supabase !== 'undefined') {
  clienteSupabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.error('Biblioteca Supabase não carregada');
}

// Variável global para armazenar produtos
let produtos = [];

// Função para carregar produtos do Supabase
async function carregarProdutos() {
  if (!clienteSupabase) {
    console.error('Cliente Supabase não inicializado');
    return false;
  }
  
  try {
    console.log('Carregando produtos do Supabase...');
    const { data, error } = await clienteSupabase
      .from('produtos')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Erro ao carregar produtos:', error);
      return false;
    }

    produtos = data || [];
    console.log('Produtos carregados:', produtos.length);
    
    // Emitir evento personalizado informando que produtos foram carregados
    window.dispatchEvent(new CustomEvent('produtosCarregados', { detail: produtos }));
    
    return true;
  } catch (error) {
    console.error('Erro ao conectar com Supabase:', error);
    return false;
  }
}

// Função para adicionar produto
async function adicionarProduto(produto) {
  if (!clienteSupabase) {
    console.error('Cliente Supabase não inicializado');
    return null;
  }
  
  try {
    const { data, error } = await clienteSupabase
      .from('produtos')
      .insert([produto])
      .select();

    if (error) {
      console.error('Erro ao adicionar produto:', error);
      return null;
    }

    return data[0];
  } catch (error) {
    console.error('Erro:', error);
    return null;
  }
}

// Função para atualizar produto
async function atualizarProduto(id, produto) {
  if (!clienteSupabase) {
    console.error('Cliente Supabase não inicializado');
    return null;
  }
  
  try {
    const { data, error } = await clienteSupabase
      .from('produtos')
      .update(produto)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Erro ao atualizar produto:', error);
      return null;
    }

    return data[0];
  } catch (error) {
    console.error('Erro:', error);
    return null;
  }
}

// Função para deletar produto
async function deletarProduto(id) {
  if (!clienteSupabase) {
    console.error('Cliente Supabase não inicializado');
    return false;
  }
  
  try {
    const { error } = await clienteSupabase
      .from('produtos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar produto:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro:', error);
    return false;
  }
}
