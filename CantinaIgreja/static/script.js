let currentPage = 1;
const perPage = 10;

function getCurrentCantina() {
    const path = window.location.pathname.toLowerCase();
    const cantinas = ['upa', 'saf', 'uph', 'mocidade'];
    for (let cantina of cantinas) {
        if (path.includes(`cantina${cantina}`) || path.includes(`pedidos${cantina}`)) {
            return cantina;
        }
    }
    return 'upa';
}

async function carregarPedidos(page = 1) {
    const cantina = getCurrentCantina();
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/pedidos/${cantina}?page=${page}&per_page=${perPage}`);
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

async function carregarTotal() {
    const cantina = getCurrentCantina();
    try {
        const totalResponse = await fetch(`http://127.0.0.1:5000/api/total/${cantina}`);
        const { total } = await totalResponse.json();
        const totalElement = document.getElementById('total');
        if (totalElement) {
            totalElement.textContent = Number(total).toFixed(2);
        }
    } catch (error) {
        console.error('Erro ao carregar o total:', error);
    }
}

async function excluirPedido(id) {
    if (confirm('Tem certeza que deseja excluir este pedido?')) {
        const cantina = getCurrentCantina();
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/pedidos/${cantina}/${id}`, { method: 'DELETE' });
            if (response.ok) {
                await carregarPedidos(currentPage);
                await carregarTotal();
            }
        } catch (error) {
            console.error('Erro ao excluir pedido:', error);
        }
    }
}

async function editarPedido(id, itemAtual, valorAtual) {
    const novoItem = prompt("Editar item:", itemAtual);
    const novoValor = parseFloat(prompt("Editar valor:", valorAtual));
    
    if (novoItem && !isNaN(novoValor)) {
        const cantina = getCurrentCantina();
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/pedidos/${cantina}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item: novoItem, valor: novoValor })
            });
            if (response.ok) {
                await carregarPedidos(currentPage);
                await carregarTotal();
            }
        } catch (error) {
            console.error('Erro ao editar pedido:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formPedido');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const cantina = getCurrentCantina();
            const item = document.getElementById('item').value;
            const valor = parseFloat(document.getElementById('valor').value);

            try {
                const response = await fetch(`http://127.0.0.1:5000/api/pedidos/${cantina}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ item, valor })
                });
                if (response.ok) {
                    form.reset();
                    await carregarPedidos(currentPage);
                    await carregarTotal();
                }
            } catch (error) {
                console.error('Erro ao adicionar pedido:', error);
            }
        });
    }

    if (window.location.pathname.includes('cantina')) {
        carregarTotal();
    }

    if (window.location.pathname.includes('pedidos')) {
        carregarPedidos(currentPage);
    }
});