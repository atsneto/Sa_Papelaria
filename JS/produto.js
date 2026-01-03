// WHATSAPP vem do supabase-config.js

function getProductIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  console.log('ID da URL:', id);
  return id ? parseInt(id) : null;
}

async function renderProdutoDetalhe() {
  const produtoId = getProductIdFromURL();
  console.log('=== RENDER PRODUTO DETALHE ===');
  console.log('Produtos array length:', produtos.length);
  console.log('Produto ID buscado:', produtoId);
  console.log('Todos os produtos:', produtos);
  
  // Buscar produto pelo ID real do banco de dados
  const produto = produtos.find(p => p.id === produtoId);
  console.log('Produto encontrado:', produto);

  if (!produto) {
    console.error('Produto não encontrado com ID:', produtoId);
    document.querySelector('.produto-detalhes').innerHTML = `
      <div class="container" style="text-align: center; padding: 3rem;">
        <h2>Produto não encontrado</h2>
        <p>Não encontramos o produto com ID: ${produtoId}</p>
        <p>Produtos disponíveis: ${produtos.length}</p>
        <a href="catalogo.html" class="btn primary">Voltar ao Catálogo</a>
      </div>
    `;
    return;
  }

  console.log('Preenchendo informações do produto:', produto.nome);

  // Preencher informações principais
  document.getElementById('produtoNome').textContent = produto.nome;
  document.getElementById('produtoDescricao').innerHTML = `<p>${produto.descricao || 'Produto exclusivo da SÁ Papelaria.'}</p>`;
  document.getElementById('precoFinal').textContent = produto.preco;

  // Galeria de imagens: imagem principal primeiro, depois galeria
  const galerias = document.getElementById('galerias');
  
  // Criar array com imagem principal primeiro, depois as imagens da galeria
  const todasImagens = [produto.img]; // Começa com a imagem principal
  
  // Adicionar imagens da galeria (se existir)
  if (produto.galeria && Array.isArray(produto.galeria) && produto.galeria.length > 0) {
    todasImagens.push(...produto.galeria);
  }
  
  // Renderizar thumbnails
  galerias.innerHTML = todasImagens.map((img, idx) => `
    <img src="${img}" alt="Foto ${idx + 1}" class="thumbnail ${idx === 0 ? 'active' : ''}" onclick="trocarImagem('${img}', this)">
  `).join('');

  // Imagem principal (sempre a primeira = produto.img)
  const imagemPrincipal = document.getElementById('imagemPrincipal');
  imagemPrincipal.src = produto.img;
  imagemPrincipal.alt = produto.nome;

  // Especificações
  const specs = produto.specs || [];
  if (specs.length > 0) {
    const especsHtml = specs.map(spec => `<li>${spec}</li>`).join('');
    document.getElementById('produtoEspecs').innerHTML = especsHtml;
  } else {
    document.querySelector('.produto-especificacoes').style.display = 'none';
  }

  // Botão de compra - verificar login
  const botaoComprar = document.getElementById('botaoComprar');
  botaoComprar.onclick = async (e) => {
    e.preventDefault();
    const user = await Auth.verificarLogin();
    
    if (!user) {
      if (confirm('Você precisa estar logado para comprar. Deseja fazer login agora?')) {
        window.location.href = `login.html?redirect=${encodeURIComponent(window.location.href)}`;
      }
    } else {
      const mensagem = `Olá! Sou ${user.user_metadata?.nome || user.email}. Quero comprar: ${produto.nome}`;
      window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`, '_blank');
    }
  };

  console.log('Renderizando produtos relacionados...');
  // Produtos relacionados
  renderProdutosRelacionados(produto.categoria, produtoId);
  
  console.log('=== FIM RENDER ===');
}

function trocarImagem(src, element) {
  document.getElementById('imagemPrincipal').src = src;
  document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
  element.classList.add('active');
}

function renderProdutosRelacionados(categoria, produtoIdAtual) {
  console.log('Renderizando produtos relacionados da categoria:', categoria);
  
  // Encontrar todos os produtos da mesma categoria, excluindo o atual
  const produtosRelacionados = produtos
    .filter(p => p.categoria === categoria && p.id !== produtoIdAtual)
    .slice(0, 4);

  console.log('Produtos relacionados encontrados:', produtosRelacionados.length);

  const container = document.getElementById('produtosRelacionados');
  
  if (produtosRelacionados.length > 0) {
    container.innerHTML = produtosRelacionados.map((p) => `
      <article class="produto-relacionado">
        <img src="${p.img}" alt="${p.nome}">
        <h4>${p.nome}</h4>
        <p class="price">${p.preco}</p>
        <button onclick="verificarLoginCompra(${p.id}, '${p.nome.replace(/'/g, "\\'")}')" class="btn ghost">Comprar</button>
      </article>
    `).join('');
  } else {
    // Se não há produtos relacionados da mesma categoria, mostrar aleatórios
    console.log('Nenhum produto relacionado encontrado, mostrando aleatórios');
    const aleatorios = produtos
      .filter(p => p.id !== produtoIdAtual)
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
    
    container.innerHTML = aleatorios.map((p) => `
      <article class="produto-relacionado">
        <img src="${p.img}" alt="${p.nome}">
        <h4>${p.nome}</h4>
        <p class="price">${p.preco}</p>
        <button onclick="verificarLoginCompra(${p.id}, '${p.nome.replace(/'/g, "\\'")}')" class="btn ghost">Comprar</button>
      </article>
    `).join('');
  }
}

// Inicializar página
function inicializarPagina() {
  console.log('Inicializando página de produto');
  console.log('Produtos disponíveis:', produtos.length);
  
  // Verificar se estamos na página de produto
  const produtoDetalhes = document.querySelector('.produto-detalhes');
  if (!produtoDetalhes) {
    console.log('Não estamos na página de produto, ignorando...');
    return;
  }
  
  if (produtos.length > 0) {
    renderProdutoDetalhe();
  } else {
    console.log('Aguardando produtos carregarem...');
    // Mostrar loading sem destruir a estrutura HTML
    const nomeProduto = document.getElementById('produtoNome');
    if (nomeProduto) {
      nomeProduto.textContent = 'Carregando...';
    }
  }
}

// Escutar quando produtos são carregados
window.addEventListener('produtosCarregados', () => {
  console.log('Evento produtosCarregados recebido');
  
  // Verificar se estamos na página de produto antes de renderizar
  if (document.querySelector('.produto-detalhes')) {
    renderProdutoDetalhe();
  }
});

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarPagina);
} else {
  inicializarPagina();
}
