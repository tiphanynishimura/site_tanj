let carrinho = [];
let produtoAtual = null;
let valorFrete = 0; 

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

document.querySelectorAll('.nav-link-btn').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(link.dataset.section);
    });
});

showSection('home');

// ==========================================
// 2. LÓGICA DO CATÁLOGO E DETALHES
// ==========================================
document.addEventListener('click', (e) => {
    
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

    if (e.target.classList.contains('qty-btn') && e.target.closest('.product-card')) {
        const span = e.target.parentElement.querySelector('.qty-value');
        let qty = parseInt(span.textContent);
        if (e.target.classList.contains('plus')) qty++;
        else if (qty > 1) qty--;
        span.textContent = qty;
    }

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

document.getElementById('btn-voltar').addEventListener('click', () => {
    showSection(produtoAtual.categoriaOrigem);
});

document.getElementById('detalhe-btn-minus').addEventListener('click', () => { alterarQtdDetalhe(-1); });
document.getElementById('detalhe-btn-plus').addEventListener('click', () => { alterarQtdDetalhe(1); });

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

function adicionarItemLogica(itemInfo, qty) {
    const item = { ...itemInfo, quantity: qty };
    const exist = carrinho.find(i => i.id === item.id);
    if (exist) exist.quantity += qty;
    else carrinho.push(item);
    atualizarCarrinhoUI();
}

// ==========================================
// 3. CARRINHO DE COMPRAS E CÁLCULO TOTAL
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
    
    // Soma o frete ao total do pedido se ele já foi calculado
    const totalComFrete = total + valorFrete;
    document.getElementById('summary-total').textContent = `R$ ${totalComFrete.toFixed(2).replace('.', ',')}`;
}

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
// 4. INTEGRAÇÃO COM MELHOR ENVIO (CÁLCULO DE FRETE)
// ==========================================
document.getElementById('btn-calcular-frete').addEventListener('click', async () => {
    const cepInput = document.getElementById('cep-input').value.replace(/\D/g, '');
    const resultadoMsg = document.getElementById('cep-resultado');

    if (cepInput.length !== 8) {
        resultadoMsg.textContent = "Digite um CEP válido com 8 números.";
        resultadoMsg.style.color = "red";
        return;
    }

    resultadoMsg.textContent = "Calculando transportadoras...";
    resultadoMsg.style.color = "var(--gray)";

    try {
        // Conta quantas peças no total existem no carrinho
        const totalItens = carrinho.reduce((acc, item) => acc + item.quantity, 0);
        
        // Se o carrinho estiver vazio, simula pelo menos 1 item para não dar erro na API
        const qtdParaFrete = totalItens > 0 ? totalItens : 1;

        // Agora mandamos o CEP e a QUANTIDADE (&qtd=) para o servidor!
        const response = await fetch(`http://localhost:3000/frete?cep=${cepInput}&qtd=${qtdParaFrete}`);
        const data = await response.json();

        if (data.erro || !data.length) {
            resultadoMsg.textContent = "Erro ao calcular o frete.";
            resultadoMsg.style.color = "red";
            return;
        }

        // Pega todas as transportadoras válidas (filter)
        const transportadorasValidas = data.filter(t => !t.error);

        if (transportadorasValidas.length > 0) {
            
            // Constrói um menu de seleção (dropdown)
            let selectHTML = `<select id="seletor-frete" style="width: 100%; padding: 8px; margin-top: 10px; border-radius: 8px; border: 1px solid var(--light-gray); outline: none; cursor: pointer;">`;
            selectHTML += `<option value="0">Selecione uma opção de frete...</option>`;

            transportadorasValidas.forEach(t => {
                let precoFormatado = parseFloat(t.price).toFixed(2).replace('.', ',');
                // Adicionamos o t.company.name antes do t.name!
                selectHTML += `<option value="${t.price}" data-nome="${t.company.name} ${t.name}" data-prazo="${t.delivery_time}">
                    ${t.company.name} ${t.name} - R$ ${precoFormatado} (${t.delivery_time} dias úteis)
                </option>`;
            });
            
            selectHTML += `</select>`;

            resultadoMsg.innerHTML = selectHTML;
            resultadoMsg.style.color = "var(--dark)";
            
            // Zera o frete até o cliente escolher
            valorFrete = 0;
            document.getElementById('summary-frete').textContent = `Aguardando seleção`;
            document.getElementById('summary-frete').style.color = "var(--gray)";
            atualizarCarrinhoUI();

            // Escuta a seleção do cliente
            document.getElementById('seletor-frete').addEventListener('change', function() {
                if (this.value !== "0") {
                    valorFrete = parseFloat(this.value);
                    const nomeSelecionado = this.options[this.selectedIndex].getAttribute('data-nome');
                    const prazoSelecionado = this.options[this.selectedIndex].getAttribute('data-prazo');
                    
                    document.getElementById('summary-frete').textContent = `${nomeSelecionado} - R$ ${valorFrete.toFixed(2).replace('.', ',')} (${prazoSelecionado} dias)`;
                    document.getElementById('summary-frete').style.color = "#10B981";
                } else {
                    valorFrete = 0;
                    document.getElementById('summary-frete').textContent = `Aguardando seleção`;
                    document.getElementById('summary-frete').style.color = "var(--gray)";
                }
                atualizarCarrinhoUI();
            });

        } else {
            resultadoMsg.textContent = "Nenhum frete disponível para esta região.";
            resultadoMsg.style.color = "red";
            valorFrete = 0;
            document.getElementById('summary-frete').textContent = `A calcular`;
            atualizarCarrinhoUI();
        }

    } catch (error) {
        resultadoMsg.textContent = "Erro de conexão com o servidor.";
        resultadoMsg.style.color = "red";
    }
});

// ==========================================
// 5. CHATBOT TANGERINO COM PREVIEW DE ARQUIVO
// ==========================================
const N8N_WEBHOOK_URL = 'https://alibarbo17.app.n8n.cloud/webhook/0f638c78-f907-4147-af65-de14cf832120/chat';

const chatFab = document.getElementById('chatbot-fab');
const chatWindow = document.getElementById('chatbot-window');
const chatHistory = document.getElementById('chat-history');
const chatInput = document.getElementById('chat-input');
const chatSendBtn = document.getElementById('chat-send-btn');
const fileUpload = document.getElementById('chat-file-upload');

const filePreviewContainer = document.getElementById('file-preview-container');
const filePreviewName = document.getElementById('file-preview-name');
const removeFileBtn = document.getElementById('remove-file-btn');

const sessionId = 'session_' + Math.random().toString(36).substr(2, 9);

chatFab.addEventListener('click', () => chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex');
document.getElementById('close-chat').addEventListener('click', () => chatWindow.style.display = 'none');

fileUpload.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        filePreviewName.textContent = this.files[0].name;
        filePreviewContainer.style.display = 'block';
    }
});

removeFileBtn.addEventListener('click', function() {
    fileUpload.value = '';
    filePreviewContainer.style.display = 'none';
});

function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;
    msgDiv.textContent = text;
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

chatSendBtn.addEventListener('click', enviarMensagem);
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') enviarMensagem(); });

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
        filePreviewContainer.style.display = 'none';
    }

    const indicadorDigitando = document.createElement('div');
    indicadorDigitando.className = 'message bot-msg';
    indicadorDigitando.textContent = 'Digitando...';
    chatHistory.appendChild(indicadorDigitando);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chatInput: texto,
                sessionId: sessionId
            })
        });

        if (!response.ok) {
            throw new Error('Erro na resposta do servidor');
        }

        const data = await response.json();

        if (chatHistory.contains(indicadorDigitando)) {
            chatHistory.removeChild(indicadorDigitando);
        }

        const botResposta = data.output; 
        addMessage(botResposta, 'bot');

    } catch (error) {
        console.error('Erro ao conectar com o n8n:', error);
        
        if (chatHistory.contains(indicadorDigitando)) {
            chatHistory.removeChild(indicadorDigitando);
        }
        
        addMessage('Desculpe, estou com problemas para me conectar ao servidor agora.', 'bot');
    }
}