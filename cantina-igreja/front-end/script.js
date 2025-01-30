// Variáveis globais
let currentPage = 1;
const perPage = 10; // Número de pedidos por página

// Função para carregar a lista de pedidos com paginação
async function carregarPedidos(page = 1) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/pedidos?page=${page}&per_page=${perPage}`);
        const data = await response.json();

        const listaPedidos = document.getElementById('listaPedidos');
        const paginacao = document.getElementById('paginacao');

        if (listaPedidos) {
            listaPedidos.innerHTML = data.pedidos.map(pedido => `
                <li>
                    <span>${pedido.item} - R$ ${Number(pedido.valor).toFixed(2)}</span>
                    <div class="botoes">
                        <button class="btn-editar" onclick="editarPedido(${pedido.id}, '${pedido.item}', ${pedido.valor})">Editar</button>
                        <button class="btn-excluir" onclick="excluirPedido(${pedido.id})">Excluir</button>
                    </div>
                </li>
            `).join('');
        }

        if (paginacao) {
            atualizarPaginacao(data.total_pages, page);
        }
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
    }
}

// Função para atualizar os controles de paginação
function atualizarPaginacao(totalPages, currentPage) {
    const paginacao = document.getElementById('paginacao');
    paginacao.innerHTML = '';

    if (currentPage > 1) {
        const btnAnterior = document.createElement('button');
        btnAnterior.textContent = 'Anterior';
        btnAnterior.addEventListener('click', () => {
            currentPage--;
            carregarPedidos(currentPage);
        });
        paginacao.appendChild(btnAnterior);
    }

    for (let i = 1; i <= totalPages; i++) {
        const btnPagina = document.createElement('button');
        btnPagina.textContent = i;
        if (i === currentPage) {
            btnPagina.disabled = true;
            btnPagina.style.backgroundColor = '#4CAF50';
        }
        btnPagina.addEventListener('click', () => {
            currentPage = i;
            carregarPedidos(currentPage);
        });
        paginacao.appendChild(btnPagina);
    }

    if (currentPage < totalPages) {
        const btnProximo = document.createElement('button');
        btnProximo.textContent = 'Próximo';
        btnProximo.addEventListener('click', () => {
            currentPage++;
            carregarPedidos(currentPage);
        });
        paginacao.appendChild(btnProximo);
    }
}

// Função para carregar o total
async function carregarTotal() {
    try {
        const totalResponse = await fetch('http://127.0.0.1:5000/api/total');
        const { total } = await totalResponse.json();
        const totalElement = document.getElementById('total');
        if (totalElement) {
            totalElement.textContent = Number(total).toFixed(2);
        }
    } catch (error) {
        console.error('Erro ao carregar o total:', error);
    }
}

// Função para excluir um pedido
async function excluirPedido(id) {
    if (confirm('Tem certeza que deseja excluir este pedido?')) {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/pedidos/${id}`, { method: 'DELETE' });
            if (response.ok) {
                await carregarPedidos(currentPage); // Recarrega a lista de pedidos após excluir
                await carregarTotal(); // Atualiza o total
            } else {
                console.error('Erro ao excluir pedido');
            }
        } catch (error) {
            console.error('Erro ao excluir pedido:', error);
        }
    }
}

// Função para editar um pedido
async function editarPedido(id, itemAtual, valorAtual) {
    const novoItem = prompt("Editar item:", itemAtual);
    const novoValor = parseFloat(prompt("Editar valor:", valorAtual));
    
    if (novoItem && !isNaN(novoValor)) {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/pedidos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item: novoItem, valor: novoValor })
            });
            if (response.ok) {
                await carregarPedidos(currentPage); // Recarrega a lista de pedidos após editar
                await carregarTotal(); // Atualiza o total
            } else {
                console.error('Erro ao editar pedido');
            }
        } catch (error) {
            console.error('Erro ao editar pedido:', error);
        }
    }
}

// Inicialização da página
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formPedido');

    // Adicionar um novo pedido
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const item = document.getElementById('item').value;
            const valor = parseFloat(document.getElementById('valor').value);

            try {
                const response = await fetch('http://127.0.0.1:5000/api/pedidos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ item, valor })
                });
                if (response.ok) {
                    form.reset();
                    await carregarPedidos(currentPage); // Recarrega a lista de pedidos após adicionar
                    await carregarTotal(); // Atualiza o total
                } else {
                    console.error('Erro ao adicionar pedido:', response.statusText);
                }
            } catch (error) {
                console.error('Erro ao adicionar pedido:', error);
            }
        });
    }

    // Carregar o total sempre que a página index.html for carregada
    if (window.location.pathname.endsWith('index.html')) {
        carregarTotal();
    }

    // Carregar a lista de pedidos apenas na página pedidos.html
    if (window.location.pathname.endsWith('pedidos.html')) {
        carregarPedidos(currentPage);
    }
});