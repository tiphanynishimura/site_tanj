let carrinho = [];
let produtoAtual = null;

// ==========================================
// 1. NAVEGAÇÃO E SIDEBAR
// ==========================================
const sidebar = document.getElementById('sidebar');

document.getElementById('toggle-btn').addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
});

document.getElementById('menu-catalogo-btn').addEventListener('click', (e) => {
    e.preventDefault();
    if (sidebar.classList.contains('collapsed')) sidebar.classList.remove('collapsed');
    document.getElementById('catalogo-submenu').classList.toggle('active');
});

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
}

// Navegação global do menu usando Delegação
document.querySelectorAll('.nav-link-btn').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(link.dataset.section);
    });
});

// Iniciar na aba Home
showSection('home');

// ==========================================
// 2. LÓGICA DO CATÁLOGO E DETALHES
// ==========================================
// Usando event delegation no corpo do documento para escutar os cliques dinâmicos
document.addEventListener('click', (e) => {
    
    // A. Abrir aba de Detalhes (3 pontinhos)
    if (e.target.closest('.details-btn')) {
        const card = e.target.closest('.product-card');
        const pTags = card.querySelectorAll('.product-details p');
        let oQueE = pTags[0] ? pTags[0].innerHTML.replace('<strong>O que é:</strong> ', '').replace('<strong>Contém:</strong> ', '') : '';
        let specs = pTags[1] ? pTags[1].innerHTML.replace('<strong>Specs:</strong> ', '') : 'Conjunto completo de robótica.';

        produtoAtual = {
            id: card.dataset.id,
            name: card.dataset.name,
            price: parseFloat(card.dataset.price),
            image: card.querySelector('img').src,
            categoriaOrigem: card.closest('.content-section').id 
        };

        document.getElementById('detalhe-nome').textContent = produtoAtual.name;
        document.getElementById('detalhe-img').src = produtoAtual.image;
        document.getElementById('detalhe-oque').innerHTML = oQueE;
        document.getElementById('detalhe-specs').innerHTML = specs;
        document.getElementById('detalhe-preco').textContent = `R$ ${produtoAtual.price.toFixed(2).replace('.', ',')}`;
        document.getElementById('detalhe-qtd').textContent = "1"; 
        
        showSection('produto-detalhe');
    }

    // B. Aumentar e Diminuir Qtd direto no Card do Catálogo
    if (e.target.classList.contains('qty-btn') && e.target.closest('.product-card')) {
        const span = e.target.parentElement.querySelector('.qty-value');
        let qty = parseInt(span.textContent);
        if (e.target.classList.contains('plus')) qty++;
        else if (qty > 1) qty--;
        span.textContent = qty;
    }

    // C. Adicionar ao carrinho direto do Card do Catálogo
    if (e.target.classList.contains('add-to-cart-btn') && e.target.closest('.product-card')) {
        const card = e.target.closest('.product-card');
        const qtyToAdd = parseInt(card.querySelector('.qty-value').textContent);
        
        const itemInfo = {
            id: card.dataset.id,
            name: card.dataset.name,
            price: parseFloat(card.dataset.price),
            image: card.querySelector('img').src
        };
        
        adicionarItemLogica(itemInfo, qtyToAdd);
        card.querySelector('.qty-value').textContent = 1;
        
        const btn = e.target;
        btn.textContent = "Adicionado!";
        btn.style.background = "#10B981";
        setTimeout(() => { btn.textContent = "Adicionar"; btn.style.background = ""; }, 1000);
    }
});

// Ações específicas da aba de detalhes
document.getElementById('btn-voltar').addEventListener('click', () => {
    showSection(produtoAtual.categoriaOrigem);
});

document.getElementById('detalhe-btn-minus').addEventListener('click', () => {
    alterarQtdDetalhe(-1);
});

document.getElementById('detalhe-btn-plus').addEventListener('click', () => {
    alterarQtdDetalhe(1);
});

document.getElementById('detalhe-add-btn').addEventListener('click', () => {
    const qtyToAdd = parseInt(document.getElementById('detalhe-qtd').textContent);
    adicionarItemLogica(produtoAtual, qtyToAdd);
    
    const btn = document.getElementById('detalhe-add-btn');
    btn.innerHTML = `<i class="fas fa-check"></i> Adicionado!`;
    btn.style.background = "#10B981";
    setTimeout(() => { 
        btn.innerHTML = `<i class="fas fa-cart-plus"></i> Adicionar ao Carrinho`; 
        btn.style.background = ""; 
    }, 1500);
});

function alterarQtdDetalhe(delta) {
    const span = document.getElementById('detalhe-qtd');
    let qty = parseInt(span.textContent);
    qty += delta;
    if(qty < 1) qty = 1;
    span.textContent = qty;
}

// Lógica unificada para salvar no array do carrinho
function adicionarItemLogica(itemInfo, qty) {
    const item = { ...itemInfo, quantity: qty };
    const exist = carrinho.find(i => i.id === item.id);
    if (exist) exist.quantity += qty;
    else carrinho.push(item);
    atualizarCarrinhoUI();
}

// ==========================================
// 3. CARRINHO DE COMPRAS
// ==========================================
function atualizarCarrinhoUI() {
    const list = document.getElementById('cart-items-list');
    document.getElementById('cart-badge').textContent = carrinho.reduce((acc, i) => acc + i.quantity, 0);

    if (carrinho.length === 0) {
        list.innerHTML = `<div class="empty-state"><i class="fas fa-box-open"></i><p>Seu carrinho está vazio.</p></div>`;
        document.getElementById('summary-subtotal').textContent = 'R$ 0,00';
        document.getElementById('summary-total').textContent = 'R$ 0,00';
        return;
    }

    list.innerHTML = '';
    let total = 0;
    
    // Constrói a lista e aplica os atributos data-id para identificação dos botões
    carrinho.forEach(item => {
        const sub = item.price * item.quantity;
        total += sub;
        list.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <img src="${item.image}" alt="">
                    <span class="cart-item-title">${item.name}</span>
                </div>
                <div class="cart-qty-controls">
                    <button class="cart-qty-btn cart-minus" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="cart-qty-btn cart-plus" data-id="${item.id}">+</button>
                </div>
                <div class="cart-item-subtotal">R$ ${sub.toFixed(2).replace('.', ',')}</div>
                <button class="cart-remove-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>
            </div>
        `;
    });
    
    document.getElementById('summary-subtotal').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    document.getElementById('summary-total').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// Delegação de eventos apenas dentro da lista do carrinho
document.getElementById('cart-items-list').addEventListener('click', (e) => {
    const btnQty = e.target.closest('.cart-qty-btn');
    const btnRemove = e.target.closest('.cart-remove-btn');
    
    if (btnQty) {
        const id = btnQty.dataset.id;
        const delta = btnQty.classList.contains('cart-plus') ? 1 : -1;
        const item = carrinho.find(i => i.id === id);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) removerItemDoCarrinho(id);
            else atualizarCarrinhoUI();
        }
    }
    
    if (btnRemove) {
        removerItemDoCarrinho(btnRemove.dataset.id);
    }
});

function removerItemDoCarrinho(id) { 
    carrinho = carrinho.filter(i => i.id !== id); 
    atualizarCarrinhoUI(); 
}

document.getElementById('btn-finalizar-compra').addEventListener('click', () => {
    if(carrinho.length > 0) {
        alert('Pedido enviado com sucesso! Aguarde a validação técnica.');
    } else {
        alert('Seu carrinho está vazio.');
    }
});

// ==========================================
// 4. CHATBOT TANGERINO
// ==========================================
const N8N_WEBHOOK_URL = 'https://alibarbo17.app.n8n.cloud/webhook/0f638c78-f907-4147-af65-de14cf832120/chat';

const chatFab = document.getElementById('chatbot-fab');
const chatWindow = document.getElementById('chatbot-window');
const chatHistory = document.getElementById('chat-history');
const chatInput = document.getElementById('chat-input');
const chatSendBtn = document.getElementById('chat-send-btn');
const fileUpload = document.getElementById('chat-file-upload');

// Gerar um ID de sessão único para manter o histórico da conversa no n8n
const sessionId = 'session_' + Math.random().toString(36).substr(2, 9);

chatFab.addEventListener('click', () => chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex');
document.getElementById('close-chat').addEventListener('click', () => chatWindow.style.display = 'none');

function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;
    msgDiv.textContent = text;
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

chatSendBtn.addEventListener('click', enviarMensagem);
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') enviarMensagem(); });

// Função assíncrona para lidar com o envio e a resposta do n8n
async function enviarMensagem() {
    const texto = chatInput.value.trim();
    const arquivo = fileUpload.files[0];

    if (!texto && !arquivo) return;

    if (texto) {
        addMessage(texto, 'user');
        chatInput.value = '';
    }
    
    if (arquivo) {
        addMessage(`📎 Arquivo: ${arquivo.name}`, 'user');
        fileUpload.value = ''; 
        // Nota: Envio de arquivos exige multipart/form-data. 
        // Esta implementação foca no envio do texto para o nó de chat padrão do n8n.
    }

    // Cria uma mensagem visual de "Digitando..."
    const indicadorDigitando = document.createElement('div');
    indicadorDigitando.className = 'message bot-msg';
    indicadorDigitando.textContent = 'Digitando...';
    chatHistory.appendChild(indicadorDigitando);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    try {
        // Faz a chamada HTTP POST para o n8n
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chatInput: texto,
                sessionId: sessionId // Importante para o bot lembrar do contexto da conversa
            })
        });

        if (!response.ok) {
            throw new Error('Erro na resposta do servidor');
        }

        // Primeiro pegamos a resposta do JSON de forma segura
        const data = await response.json();

        // Agora que temos os dados e nenhum erro ocorreu, removemos o indicador de digitando
        if (chatHistory.contains(indicadorDigitando)) {
            chatHistory.removeChild(indicadorDigitando);
        }

        // Como você está usando o AI Agent do n8n, a resposta SEMPRE vem na propriedade 'output'
        const botResposta = data.output; 

        addMessage(botResposta, 'bot');

    } catch (error) {
        console.error('Erro ao conectar com o n8n:', error);
        
        // Se deu erro, removemos o indicador aqui (caso ele ainda exista na tela)
        if (chatHistory.contains(indicadorDigitando)) {
            chatHistory.removeChild(indicadorDigitando);
        }
        
        addMessage('Desculpe, estou com problemas para me conectar ao servidor agora.', 'bot');
    }
}