// Variáveis principais
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
let usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado')) || null;
let carrinho = [];
let desconto = 0;

const produtos = [
  { codigo: 'F001', nome: "Ficha Personalizada", preco: 12 },
  { codigo: 'L001', nome: "Livro de Regras", preco: 25 },
  { codigo: 'L002', nome: "Livro de Histórias", preco: 18 },
  { codigo: 'D001', nome: "Pack de Dados (D4 a D20)", preco: 1 },
  { codigo: 'A001', nome: "Aventuras Únicas - Volume 1", preco: 10 },
  { codigo: 'K001', nome: "Kit Mestre Completo (fichas + regras + dados)", preco: 30 },
  { codigo: 'M001', nome: "Mapa Dobrável A3 de Dungeon", preco: 5 },
  { codigo: 'T001', nome: "Tokens Coloridos (25 unidades)", preco: 4 }
];

const cuponsValidos = {
  "MAGIA20": 0.20,
  "ESPADA20": 0.20,
  "RPG20": 0.20,
  "BOSS50": 0.50
};

// Função para mostrar uma seção e esconder as outras
function mostrarSecao(id) {
  document.querySelectorAll('section').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  atualizarMsgCarrinho();
  atualizarLoginStatus();
}

// Função para carregar produtos no catálogo
function carregarProdutos() {
  const container = document.getElementById("produtos");
  container.innerHTML = "";
  produtos.forEach(p => {
    const div = document.createElement("div");
    div.className = "produto";
    div.innerHTML = `
      <h3>${p.nome}</h3>
      <p>Código: ${p.codigo}</p>
      <p>Preço: R$ ${p.preco.toFixed(2)}</p>
      <button onclick="adicionarAoCarrinho('${p.codigo}')" class="btn">Adicionar à mochila</button>
    `;
    container.appendChild(div);
  });
}

// Função para registrar novo usuário
function registrar() {
  const user = document.getElementById("novoUsuario").value.trim();
  const pass = document.getElementById("novaSenha").value.trim();
  const msg = document.getElementById("msg-registrar");

  if (!user || !pass) {
    msg.style.color = 'red';
    msg.innerText = "⚠️ Preencha todos os campos, aventureiro!";
    return;
  }

  if (usuarios.some(u => u.usuario === user)) {
    msg.style.color = 'red';
    msg.innerText = "⚠️ Usuário já existe, tente outro nome.";
    return;
  }

  usuarios.push({ usuario: user, senha: pass });
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
  msg.style.color = 'green';
  msg.innerText = "✅ Registro feito com sucesso! Agora faça login.";
  document.getElementById("novoUsuario").value = "";
  document.getElementById("novaSenha").value = "";
}

// Função para fazer login
function fazerLogin() {
  const user = document.getElementById("usuario").value.trim();
  const pass = document.getElementById("senha").value.trim();
  const msg = document.getElementById("msg-login");

  const usuarioEncontrado = usuarios.find(u => u.usuario === user && u.senha === pass);

  if (usuarioEncontrado) {
    usuarioLogado = { usuario: user };
    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
    mostrarSecao("catalogo");
    msg.innerText = "";
    atualizarLoginStatus();
  } else {
    msg.style.color = 'red';
    msg.innerText = "⚔️ Acesso negado, guerreiro!";
  }
}

// Função para deslogar
function deslogar() {
  usuarioLogado = null;
  localStorage.removeItem('usuarioLogado');
  carrinho = [];
  atualizarCarrinho();
  mostrarSecao('login');
  atualizarLoginStatus();
}

// Função para atualizar status do login (exibe botão deslogar e usuário)
function atualizarLoginStatus() {
  const status = document.getElementById('status-login');
  if (usuarioLogado) {
    status.innerHTML = `🛡️ Bem-vindo, <strong>${usuarioLogado.usuario}</strong>! <button onclick="deslogar()" class="btn" style="margin-left: 15px;">Sair</button>`;
  } else {
    status.innerHTML = '';
  }
}

// Função para adicionar item ao carrinho (só se estiver logado)
function adicionarAoCarrinho(codigo) {
  if (!usuarioLogado) {
    alert("⚔️ Aventureiro, crie sua conta antes de comprar! Sua jornada começa com um registro.");
    mostrarSecao('login');
    return;
  }
  const produto = produtos.find(p => p.codigo === codigo);
  if (produto) {
    carrinho.push(produto);
    atualizarCarrinho();
    mostrarSecao('carrinho');
  }
}

// Atualiza a lista do carrinho e total
function atualizarCarrinho() {
  const lista = document.getElementById('lista-carrinho');
  lista.innerHTML = "";
  let total = 0;
  carrinho.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${item.nome} (${item.codigo}) - R$ ${item.preco.toFixed(2)}
      <button onclick="removerDoCarrinho(${index})" class="remover-btn" aria-label="Remover ${item.nome} do carrinho">X</button>
    `;
    lista.appendChild(li);
    total += item.preco;
  });
  total = total - (total * desconto);
  document.getElementById('total').innerText = total.toFixed(2);
  atualizarMsgCarrinho();
}

// Remove item do carrinho
function removerDoCarrinho(index) {
  carrinho.splice(index, 1);
  atualizarCarrinho();
}

// Aplica cupom de desconto
function aplicarCupom() {
  const cupom = document.getElementById('cupom').value.trim().toUpperCase();
  const msgCupom = document.getElementById('msg-cupom');
  if (cuponsValidos[cupom]) {
    desconto = cuponsValidos[cupom];
    msgCupom.innerText = `Cupom aplicado: ${cupom} - Desconto de ${desconto * 100}%`;
    msgCupom.style.color = 'green';
  } else {
    desconto = 0;
    msgCupom.innerText = "Cupom inválido.";
    msgCupom.style.color = 'red';
  }
  atualizarCarrinho();
}

// Finaliza a compra, abre WhatsApp com a mensagem
function finalizarCompra() {
  if (carrinho.length === 0) {
    alert("Seu mochilão está vazio, aventureiro!");
    return;
  }
  const numero = "5542999865245";
  const lista = carrinho.map(p => `${p.nome} (${p.codigo}) - R$ ${p.preco.toFixed(2)}`).join("%0A");
  const total = document.getElementById('total').innerText;
  const msg = `Olá! Quero comprar os seguintes itens:%0A${lista}%0ATotal: R$ ${total}`;
  window.open(`https://wa.me/${numero}?text=${msg}`, '_blank');
}

// Mensagens amigáveis no carrinho
function atualizarMsgCarrinho() {
  const msg = document.getElementById('msg-carrinho');
  if (!usuarioLogado) {
    msg.innerText = "⚔️ Aventureiro, crie sua conta antes de comprar! Sua jornada começa com um registro.";
  } else if (carrinho.length === 0) {
    msg.innerText = "Seu mochilão está vazio, aventureiro.";
  } else {
    msg.innerText = "";
  }
}

// Inicializa a página
window.onload = () => {
  carregarProdutos();
  mostrarSecao('login');
  atualizarLoginStatus();
};
