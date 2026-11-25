// MESTRE DOS GAMES - funcionalidades do carrinho em JavaScript
// Os produtos ficam armazenados no navegador usando localStorage.
const CHAVE_CARRINHO = "levelUpGamesCarrinho";
const CUPOM_VALIDO = "MESTRE10";
let descontoAtivo = false;

function obterCarrinho() {
    const dados = localStorage.getItem(CHAVE_CARRINHO);
    return dados ? JSON.parse(dados) : [];
}

function salvarCarrinho(carrinho) {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
    atualizarContador();
}

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function atualizarContador() {
    const carrinho = obterCarrinho();
    const quantidade = carrinho.reduce((soma, produto) => soma + produto.quantidade, 0);
    document.querySelectorAll("#cart-count").forEach((elemento) => elemento.textContent = quantidade);
}

function adicionarProduto(botao) {
    const id = botao.dataset.id;
    const nome = botao.dataset.name;
    const preco = Number(botao.dataset.price);
    const plataforma = botao.dataset.platform;
    let carrinho = obterCarrinho();
    const produtoExistente = carrinho.find((produto) => produto.id === id);

    if (produtoExistente) {
        produtoExistente.quantidade++;
    } else {
        carrinho.push({ id, nome, preco, plataforma, quantidade: 1 });
    }
    salvarCarrinho(carrinho);
    const textoOriginal = botao.textContent;
    botao.textContent = "ADICIONADO!";
    setTimeout(() => botao.textContent = textoOriginal, 900);
}

function alterarQuantidade(id, variacao) {
    let carrinho = obterCarrinho();
    const produto = carrinho.find((item) => item.id === id);
    if (produto) {
        produto.quantidade += variacao;
        if (produto.quantidade <= 0) carrinho = carrinho.filter((item) => item.id !== id);
    }
    salvarCarrinho(carrinho);
    renderizarCarrinho();
}

function removerProduto(id) {
    const carrinho = obterCarrinho().filter((produto) => produto.id !== id);
    salvarCarrinho(carrinho);
    renderizarCarrinho();
}

function renderizarCarrinho() {
    const area = document.getElementById("cart-items");
    if (!area) return;
    const carrinho = obterCarrinho();
    if (carrinho.length === 0) {
        area.innerHTML = '<div class="empty-cart"><h2>Seu carrinho está vazio.</h2><p>Explore nossos jogos e adicione seus favoritos!</p><a href="index.html#destaques">Ver jogos em destaque</a></div>';
    } else {
        area.innerHTML = carrinho.map((produto) => `
            <article class="cart-item">
                <div><h3>${produto.nome}</h3><small>${produto.plataforma}</small><p>${formatarMoeda(produto.preco)} cada</p></div>
                <div class="quantity-controls">
                    <button type="button" data-action="minus" data-id="${produto.id}" aria-label="Diminuir quantidade">−</button>
                    <strong>${produto.quantidade}</strong>
                    <button type="button" data-action="plus" data-id="${produto.id}" aria-label="Aumentar quantidade">+</button>
                </div>
                <div><strong>${formatarMoeda(produto.preco * produto.quantidade)}</strong><br><button class="remove-item" type="button" data-action="remove" data-id="${produto.id}">Remover</button></div>
            </article>`).join("");
    }
    atualizarResumo();
    atualizarContador();
}

function atualizarResumo() {
    const carrinho = obterCarrinho();
    const subtotal = carrinho.reduce((soma, produto) => soma + produto.preco * produto.quantidade, 0);
    const desconto = descontoAtivo ? subtotal * 0.10 : 0;
    document.getElementById("subtotal").textContent = formatarMoeda(subtotal);
    document.getElementById("discount").textContent = formatarMoeda(desconto);
    document.getElementById("total").textContent = formatarMoeda(subtotal - desconto);
}

function aplicarCupom() {
    const campo = document.getElementById("coupon");
    const mensagem = document.getElementById("coupon-message");
    const codigo = campo.value.trim().toUpperCase();
    const subtotal = obterCarrinho().reduce((soma, produto) => soma + produto.preco * produto.quantidade, 0);
    if (codigo === CUPOM_VALIDO && subtotal > 0) {
        descontoAtivo = true;
        mensagem.textContent = "Cupom aplicado! Você ganhou 10% de desconto.";
    } else if (subtotal === 0) {
        descontoAtivo = false;
        mensagem.textContent = "Adicione um produto antes de aplicar o cupom.";
    } else {
        descontoAtivo = false;
        mensagem.textContent = "Cupom inválido. Confira o código e tente novamente.";
    }
    atualizarResumo();
}

function finalizarCompra() {
    const mensagem = document.getElementById("checkout-message");
    const carrinho = obterCarrinho();
    if (carrinho.length === 0) {
        mensagem.textContent = "Seu carrinho está vazio. Adicione um jogo para continuar.";
        return;
    }
    mensagem.textContent = "Compra demonstrativa concluída! Obrigado por escolher a MESTRE DOS GAMES.";
    localStorage.removeItem(CHAVE_CARRINHO);
    descontoAtivo = false;
    renderizarCarrinho();
}

// Eventos dos botões de adicionar na homepage
document.querySelectorAll(".add-to-cart").forEach((botao) => {
    botao.addEventListener("click", () => adicionarProduto(botao));
});

// Eventos da página do carrinho
const areaCarrinho = document.getElementById("cart-items");
if (areaCarrinho) {
    areaCarrinho.addEventListener("click", (evento) => {
        const botao = evento.target.closest("button[data-action]");
        if (!botao) return;
        const id = botao.dataset.id;
        if (botao.dataset.action === "plus") alterarQuantidade(id, 1);
        if (botao.dataset.action === "minus") alterarQuantidade(id, -1);
        if (botao.dataset.action === "remove") removerProduto(id);
    });

    document.getElementById("coupon-form").addEventListener("submit", function(evento) {
    evento.preventDefault();
    aplicarCupom();
    });

    document.getElementById("checkout").addEventListener("click", finalizarCompra);
    renderizarCarrinho();
} else {
    atualizarContador();
}
