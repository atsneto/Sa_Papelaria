let produtoEditando = null;
let imagemPrincipalFile = null;
let galeriaFiles = [];

// Carregar produtos ao abrir a página
document.addEventListener('DOMContentLoaded', async () => {
  await carregarProdutos();
  renderizarProdutos();
});

function renderizarProdutos() {
  const loading = document.getElementById('loading');
  const table = document.getElementById('produtosTable');
  const tbody = document.getElementById('produtosTbody');

  loading.style.display = 'none';
  table.classList.remove('hidden');

  tbody.innerHTML = produtos.map(produto => `
    <tr class="hover:bg-pink-50 transition-colors duration-200">
      <td class="px-3 sm:px-6 py-3 sm:py-4">
        <img src="${produto.img}" alt="${produto.nome}" class="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg shadow-md hover:scale-110 sm:hover:scale-150 transition-transform duration-300">
      </td>
      <td class="px-3 sm:px-6 py-3 sm:py-4">
        <div class="font-semibold text-gray-800 text-sm sm:text-base">${produto.nome}</div>
        <div class="md:hidden mt-1 text-xs text-gray-500">${formatarCategoria(produto.categoria)}</div>
      </td>
      <td class="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rosa-suave text-rosa">
          ${formatarCategoria(produto.categoria)}
        </span>
      </td>
      <td class="px-3 sm:px-6 py-3 sm:py-4 text-gray-700 font-medium text-sm sm:text-base hidden lg:table-cell">${produto.preco}</td>
      <td class="px-3 sm:px-6 py-3 sm:py-4">
        <div class="flex items-center justify-center gap-1 sm:gap-2 flex-col sm:flex-row">
          <button onclick="editarProduto(${produto.id})" title="Editar" class="group relative inline-flex items-center gap-1 sm:gap-2 bg-blue-500 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold shadow-md hover:bg-blue-600 hover:shadow-lg hover:scale-105 transition-all duration-300 text-xs sm:text-sm">
            <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            <span class="hidden sm:inline">Editar</span>
          </button>
          <button onclick="confirmarDelecao(${produto.id})" title="Deletar" class="group relative inline-flex items-center gap-1 sm:gap-2 bg-red-500 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold shadow-md hover:bg-red-600 hover:shadow-lg hover:scale-105 transition-all duration-300 text-xs sm:text-sm">
            <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            <span class="hidden sm:inline">Deletar</span>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function formatarCategoria(categoria) {
  const categorias = {
    'agendas': 'Agendas',
    'topo-bolo': 'Topo de Bolo',
    'festas': 'Festas',
    'cartao-sus': 'Cartão do SUS',
    'biblicos': 'Bíblicos',
    'escolares': 'Escolares'
  };
  return categorias[categoria] || categoria;
}

function abrirModalAdicionar() {
  produtoEditando = null;
  imagemPrincipalFile = null;
  galeriaFiles = [];
  document.getElementById('modalTitle').textContent = 'Novo Produto';
  document.getElementById('produtoForm').reset();
  document.getElementById('imgPreview').innerHTML = '';
  document.getElementById('galeriaPreview').innerHTML = '';
  
  const modal = document.getElementById('produtoModal');
  const modalContent = document.getElementById('modalContent');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  setTimeout(() => {
    modalContent.classList.remove('scale-95', 'opacity-0');
    modalContent.classList.add('scale-100', 'opacity-100');
  }, 10);
}

function editarProduto(id) {
  const produto = produtos.find(p => p.id === id);
  if (!produto) return;

  produtoEditando = id;
  imagemPrincipalFile = null;
  galeriaFiles = [];
  
  document.getElementById('modalTitle').textContent = 'Editar Produto';
  document.getElementById('nome').value = produto.nome;
  document.getElementById('categoria').value = produto.categoria;
  document.getElementById('preco').value = produto.preco;
  document.getElementById('descricao').value = produto.descricao || '';
  document.getElementById('specs').value = (produto.specs || []).join('\n');
  
  // Preview da imagem atual
  const imgPreview = document.getElementById('imgPreview');
  if (produto.img) {
    imgPreview.innerHTML = `
      <div class="relative inline-block">
        <img src="${produto.img}" class="max-w-xs rounded-xl shadow-lg mx-auto mt-4" alt="Preview">
        <div class="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
          Imagem Atual
        </div>
      </div>
    `;
  }
  
  // Preview da galeria atual
  const galeriaPreview = document.getElementById('galeriaPreview');
  if (produto.galeria && produto.galeria.length > 0) {
    galeriaPreview.innerHTML = produto.galeria.map(url => 
      `<div class="relative">
        <img src="${url}" class="w-24 h-24 object-cover rounded-lg shadow-md hover:scale-110 transition-transform duration-300">
        <div class="absolute -top-2 -right-2 bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">✓</div>
      </div>`
    ).join('');
  }
  
  const modal = document.getElementById('produtoModal');
  const modalContent = document.getElementById('modalContent');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  setTimeout(() => {
    modalContent.classList.remove('scale-95', 'opacity-0');
    modalContent.classList.add('scale-100', 'opacity-100');
  }, 10);
}

function fecharModal() {
  const modal = document.getElementById('produtoModal');
  const modalContent = document.getElementById('modalContent');
  modalContent.classList.remove('scale-100', 'opacity-100');
  modalContent.classList.add('scale-95', 'opacity-0');
  setTimeout(() => {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
    produtoEditando = null;
    imagemPrincipalFile = null;
    galeriaFiles = [];
    document.getElementById('produtoForm').reset();
    document.getElementById('imgPreview').innerHTML = '';
    document.getElementById('galeriaPreview').innerHTML = '';
  }, 300);
}

async function salvarProduto(event) {
  event.preventDefault();

  // Validar se a imagem principal foi selecionada (obrigatória)
  if (!imagemPrincipalFile && !produtoEditando) {
    alert('Por favor, selecione uma imagem principal para o produto.');
    return;
  }

  mostrarStatus('Salvando produto...', 'info');

  let imgUrl = '';
  let galeriaUrls = [];

  try {
    // Upload da imagem principal se foi selecionada
    if (imagemPrincipalFile) {
      mostrarStatus('Fazendo upload da imagem principal...', 'info');
      const url = await uploadImagem(imagemPrincipalFile);
      if (url) {
        imgUrl = url;
      } else {
        alert('Erro ao fazer upload da imagem principal');
        return;
      }
    } else if (produtoEditando) {
      // Se estiver editando e não selecionou nova imagem, manter a atual
      const produto = produtos.find(p => p.id === produtoEditando);
      imgUrl = produto.img;
    }

    // Upload da galeria se foram selecionadas
    if (galeriaFiles.length > 0) {
      mostrarStatus('Fazendo upload da galeria de imagens...', 'info');
      galeriaUrls = [];
      for (const file of galeriaFiles) {
        const url = await uploadImagem(file, 'galeria');
        if (url) {
          galeriaUrls.push(url);
        }
      }
    } else if (produtoEditando) {
      // Se estiver editando e não selecionou novas imagens, manter as atuais
      const produto = produtos.find(p => p.id === produtoEditando);
      galeriaUrls = produto.galeria || [];
    }

    const produtoData = {
      nome: document.getElementById('nome').value,
      categoria: document.getElementById('categoria').value,
      preco: document.getElementById('preco').value,
      descricao: document.getElementById('descricao').value,
      img: imgUrl,
      galeria: galeriaUrls,
      specs: document.getElementById('specs').value.split('\n').map(s => s.trim()).filter(s => s)
    };

    let resultado;
    if (produtoEditando) {
      resultado = await atualizarProduto(produtoEditando, produtoData);
    } else {
      resultado = await adicionarProduto(produtoData);
    }

    if (resultado) {
      await carregarProdutos();
      renderizarProdutos();
      fecharModal();
      alert(produtoEditando ? 'Produto atualizado!' : 'Produto adicionado!');
    } else {
      alert('Erro ao salvar produto!');
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao processar imagens: ' + error.message);
  }

  // Resetar arquivos
  imagemPrincipalFile = null;
  galeriaFiles = [];
}

function mostrarStatus(mensagem, tipo) {
  console.log(`[${tipo}] ${mensagem}`);
}

function confirmarDelecao(id) {
  const produto = produtos.find(p => p.id === id);
  if (confirm(`Tem certeza que quer deletar "${produto.nome}"?`)) {
    deletarProdutoConfirmado(id);
  }
}

async function deletarProdutoConfirmado(id) {
  const sucesso = await deletarProduto(id);
  
  if (sucesso) {
    await carregarProdutos();
    renderizarProdutos();
    alert('Produto deletado!');
  } else {
    alert('Erro ao deletar produto!');
  }
}

// Fechar modal ao clicar fora dele
document.addEventListener('click', (e) => {
  const modal = document.getElementById('produtoModal');
  if (e.target === modal) {
    fecharModal();
  }
});

// Preview de imagem principal
function previewImagem(input, previewId) {
  const preview = document.getElementById(previewId);
  if (input.files && input.files[0]) {
    imagemPrincipalFile = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.innerHTML = `<img src="${e.target.result}" class="max-w-xs rounded-xl shadow-lg mx-auto mt-4" alt="Preview">`;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// Preview de galeria
function previewGaleria(input) {
  const preview = document.getElementById('galeriaPreview');
  if (input.files) {
    galeriaFiles = Array.from(input.files);
    preview.innerHTML = '';
    galeriaFiles.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = 'w-24 h-24 object-cover rounded-lg shadow-md hover:scale-110 transition-transform duration-300';
        preview.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  }
}

// Upload de imagem para Supabase Storage
// Função para sanitizar nome de arquivo
function sanitizarNomeArquivo(nomeOriginal) {
  // Pegar extensão do arquivo
  const ultimoPonto = nomeOriginal.lastIndexOf('.');
  const extensao = ultimoPonto !== -1 ? nomeOriginal.substring(ultimoPonto) : '';
  const nomeSemExtensao = ultimoPonto !== -1 ? nomeOriginal.substring(0, ultimoPonto) : nomeOriginal;
  
  // Remover/substituir caracteres especiais
  const nomeLimpo = nomeSemExtensao
    .toLowerCase()
    .normalize('NFD') // Decompor caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9]/g, '-') // Substituir caracteres especiais por hífen
    .replace(/-+/g, '-') // Substituir múltiplos hífens por um só
    .replace(/^-|-$/g, ''); // Remover hífens do início e fim
  
  return nomeLimpo + extensao.toLowerCase();
}

async function uploadImagem(file, pasta = 'produtos') {
  if (!clienteSupabase) {
    console.error('Cliente Supabase não inicializado');
    return null;
  }
  
  // Sanitizar nome do arquivo
  const nomeArquivoLimpo = sanitizarNomeArquivo(file.name);
  const nomeArquivo = `${pasta}/${Date.now()}_${nomeArquivoLimpo}`;
  
  const { data, error } = await clienteSupabase.storage
    .from('produtos-imagens')
    .upload(nomeArquivo, file);

  if (error) {
    console.error('Erro ao fazer upload:', error);
    return null;
  }

  // Obter URL pública
  const { data: { publicUrl } } = clienteSupabase.storage
    .from('produtos-imagens')
    .getPublicUrl(nomeArquivo);

  return publicUrl;
}
