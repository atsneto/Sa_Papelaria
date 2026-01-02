// Funcionalidade de pesquisa na página de catálogo
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;
  
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    filterProdutosBySearch(searchTerm);
  });
}

function filterProdutosBySearch(searchTerm) {
  const grid = document.getElementById('produtosGrid');
  if (!grid) return;
  
  // Pegar categoria ativa
  const activeFilter = document.querySelector('.filtro.active');
  const activeCategory = activeFilter ? activeFilter.dataset.category : 'all';
  
  let filtered = produtos;
  
  // Filtrar por categoria
  if (activeCategory !== 'all') {
    filtered = filtered.filter(p => p.categoria === activeCategory);
  }
  
  // Filtrar por busca
  if (searchTerm) {
    filtered = filtered.filter(p => 
      p.nome.toLowerCase().includes(searchTerm) ||
      p.descricao.toLowerCase().includes(searchTerm)
    );
  }
  
  // Renderizar resultados
  if (filtered.length === 0) {
    grid.innerHTML = '<div class="no-results"><p>Nenhum produto encontrado.</p></div>';
    return;
  }
  
  grid.innerHTML = filtered.map((p) => `
    <article class="produto">
      <img src="${p.img}" alt="${p.nome}">
      <div class="produto-body">
        <h3>${p.nome}</h3>
        <p class="price">${p.preco}</p>
        <a href="produto.html?id=${produtos.indexOf(p)}" class="btn primary">Comprar</a>
      </div>
    </article>
  `).join('');
}

// Setup de filtros com pesquisa integrada
function setupFiltrosComSearch() {
  const buttons = document.querySelectorAll('.filtro');
  buttons.forEach(btn => btn.addEventListener('click', () => {
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Limpar busca ao mudar filtro
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = '';
    }
    
    renderProdutos(btn.dataset.category);
  }));
}
