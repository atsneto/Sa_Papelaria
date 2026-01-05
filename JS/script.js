// Produtos será carregado do Supabase via supabase-config.js
// WHATSAPP e clienteSupabase vêm do supabase-config.js

// Render produtos
function renderProdutos(category = 'all') {
  const grid = document.getElementById('produtosGrid');
  if (!grid) {
    console.error('Grid de produtos não encontrado!');
    return;
  }
  const list = category === 'all' ? produtos : produtos.filter(p => p.categoria === category);
  console.log(`Renderizando ${list.length} produtos para categoria: ${category}`);
  grid.innerHTML = list.map((p) => `
    <article class="produto">
      <img src="${p.img}" alt="${p.nome}">
      <div class="produto-body">
        <h3>${p.nome}</h3>
        <p class="price">${p.preco}</p>
        <a href="produto.html?id=${p.id}" class="btn primary">Comprar</a>
      </div>
    </article>
  `).join('');
}

// Render produtos resumido (página inicial - apenas 4 produtos mais recentes)
function renderProdutosResumido() {
  const grid = document.getElementById('produtosGrid');
  if (!grid) return;
  
  // Pegar os 4 produtos mais recentes
  const produtosResumidos = produtos.slice(0, 4);
  
  grid.innerHTML = produtosResumidos.map((p) => `
    <article class="produto">
      <img src="${p.img}" alt="${p.nome}">
      <div class="produto-body">
        <h3>${p.nome}</h3>
        <p class="price">${p.preco}</p>
        <a href="produto.html?id=${p.id}" class="btn primary">Comprar</a>
      </div>
    </article>
  `).join('');
}

// Filtros
function setupFiltros() {
  const buttons = document.querySelectorAll('.filtro');
  buttons.forEach(btn => btn.addEventListener('click', () => {
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProdutos(btn.dataset.category);
  }));
}

// Modal e Carrossel
let currentList = produtos;
let currentImageIndex = 0;
let currentGallery = [];

function openModal(index, category) {
  currentList = category === 'all' ? produtos : produtos.filter(p => p.categoria === category);
  const product = currentList[index];
  if (!product) return;
  
  currentGallery = product.galeria;
  currentImageIndex = 0;
  
  document.getElementById('modalTitle').textContent = product.nome;
  document.getElementById('modalDesc').textContent = product.descricao;
  document.getElementById('modalSpecs').innerHTML = product.specs.map(s => `<li>${s}</li>`).join('');
  
  const gallery = document.getElementById('modalGallery');
  gallery.innerHTML = currentGallery.map((img, idx) => 
    `<img src="${img}" alt="${product.nome}" class="${idx === 0 ? 'active' : ''}">`
  ).join('');
  
  // Indicadores
  const indicators = document.getElementById('carouselIndicators');
  if (currentGallery.length > 1) {
    indicators.innerHTML = currentGallery.map((_, idx) => 
      `<span class="carousel-dot ${idx === 0 ? 'active' : ''}" onclick="goToImage(${idx})"></span>`
    ).join('');
    indicators.classList.add('show');
    document.getElementById('prevBtn').classList.add('show');
    document.getElementById('nextBtn').classList.add('show');
  } else {
    indicators.classList.remove('show');
    document.getElementById('prevBtn').classList.remove('show');
    document.getElementById('nextBtn').classList.remove('show');
  }
  
  const cta = document.getElementById('modalCTA');
  cta.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Olá! Quero saber mais sobre: ' + product.nome)}`;
  document.getElementById('produtoModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('produtoModal').style.display = 'none';
  currentImageIndex = 0;
}

function prevImage() {
  if (currentGallery.length <= 1) return;
  currentImageIndex = currentImageIndex === 0 ? currentGallery.length - 1 : currentImageIndex - 1;
  updateCarousel();
}

function nextImage() {
  if (currentGallery.length <= 1) return;
  currentImageIndex = currentImageIndex === currentGallery.length - 1 ? 0 : currentImageIndex + 1;
  updateCarousel();
}

function goToImage(index) {
  currentImageIndex = index;
  updateCarousel();
}

function updateCarousel() {
  const images = document.querySelectorAll('#modalGallery img');
  const dots = document.querySelectorAll('.carousel-dot');
  
  images.forEach((img, idx) => {
    img.classList.toggle('active', idx === currentImageIndex);
  });
  
  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentImageIndex);
  });
}

// Menu mobile
function toggleMenu() {
  const nav = document.getElementById('navMenu');
  const toggle = document.querySelector('.menu-toggle');
  nav.classList.toggle('show');
  toggle.classList.toggle('active');
}

// Fechar menu ao clicar nos links
document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', () => {
    const nav = document.getElementById('navMenu');
    const toggle = document.querySelector('.menu-toggle');
    if (nav.classList.contains('show')) {
      nav.classList.remove('show');
      toggle.classList.remove('active');
    }
  });
});

// Fechar menu ao clicar fora
document.addEventListener('click', (e) => {
  const nav = document.getElementById('navMenu');
  const toggle = document.querySelector('.menu-toggle');
  const header = document.querySelector('.header');
  
  if (!header.contains(e.target) && nav.classList.contains('show')) {
    nav.classList.remove('show');
    toggle.classList.remove('active');
  }
});

// Form submit (demo)
document.addEventListener('DOMContentLoaded', async () => {
  // Carregar produtos do Supabase
  const sucessoCarregamento = await carregarProdutos();
  
  if (!sucessoCarregamento) {
    console.warn('Não foi possível carregar do Supabase, usando dados locais');
  }

  // Verificar se estamos na página inicial ou página de catálogo
  const catalogoPage = document.querySelector('.catalogo-page');
  
  if (catalogoPage) {
    // Página de catálogo completo
    renderProdutos();
    // Usar função de catálogo se disponível, senão usar a padrão
    if (typeof setupFiltrosComSearch !== 'undefined') {
      setupFiltrosComSearch();
    } else {
      setupFiltros();
    }
    if (typeof setupSearch !== 'undefined') {
      setupSearch();
    }
  } else {
    // Página inicial
    renderProdutosResumido();
  }

  const modal = document.getElementById('produtoModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }
});
