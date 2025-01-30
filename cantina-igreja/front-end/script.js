document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formPedido');
    const listaPedidos = document.getElementById('listaPedidos');
    const totalElement = document.getElementById('total');

    // Função para carregar a lista de pedidos
    async function carregarPedidos() {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/pedidos');
            const pedidos = await response.json();
    
            if (listaPedidos) {
                listaPedidos.innerHTML = pedidos.map(pedido => `
                    <li>
                        <span>${pedido.item} - R$ ${Number(pedido.valor).toFixed(2)}</span>
                        <div class="botoes">
                            <button class="btn-editar" onclick="editarPedido(${pedido.id}, '${pedido.item}', ${pedido.valor})">Editar</button>
                            <button class="btn-excluir" onclick="excluirPedido(${pedido.id})">Excluir</button>
                        </div>
                    </li>
                `).join('');
            }
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
        }
    }

    async function excluirPedido(id) {
        if (confirm('Tem certeza que deseja excluir este pedido?')) {
            try {
                const response = await fetch(`http://127.0.0.1:5000/api/pedidos/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    carregarPedidos();
                    if (totalElement) carregarTotal();
                } else {
                    console.error('Erro ao excluir pedido');
                }
            } catch (error) {
                console.error('Erro ao excluir pedido:', error);
            }
        }
    }
    
    function editarPedido(id, itemAtual, valorAtual) {
        const novoItem = prompt("Editar item:", itemAtual);
        const novoValor = parseFloat(prompt("Editar valor:", valorAtual));
        
        if (novoItem && !isNaN(novoValor)) {
            fetch(`http://127.0.0.1:5000/api/pedidos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item: novoItem, valor: novoValor })
            })
            .then(response => {
                if (response.ok) {
                    carregarPedidos();
                    if (totalElement) carregarTotal();
                } else {
                    console.error('Erro ao editar pedido');
                }
            })
            .catch(error => console.error('Erro ao editar pedido:', error));
        }
    }
    
    // Função para carregar apenas o valor total
    async function carregarTotal() {
        try {
            const totalResponse = await fetch('http://127.0.0.1:5000/api/total');
            const { total } = await totalResponse.json();
            if (totalElement) {
                totalElement.textContent = Number(total).toFixed(2);
            }
        } catch (error) {
            console.error('Erro ao carregar o total:', error);
        }
    }

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
                    // Atualiza o valor total imediatamente após adicionar o pedido
                    carregarTotal();
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
        carregarPedidos();
    }
});