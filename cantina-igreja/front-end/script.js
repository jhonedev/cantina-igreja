document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formPedido');
    const listaPedidos = document.getElementById('listaPedidos');
    const totalElement = document.getElementById('total');

    // Função para carregar a lista de pedidos
    async function carregarPedidos() {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/pedidos');
            const pedidos = await response.json();

            listaPedidos.innerHTML = pedidos.map(pedido => `
                <li>${pedido.item} - R$ ${Number(pedido.valor).toFixed(2)}</li>
            `).join('');
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
        }
    }

    // Função para carregar apenas o valor total
    async function carregarTotal() {
        try {
            const totalResponse = await fetch('http://127.0.0.1:5000/api/total');
            const { total } = await totalResponse.json();
            totalElement.textContent = Number(total).toFixed(2);
        } catch (error) {
            console.error('Erro ao carregar o total:', error);
        }
    }

    // Adicionar um novo pedido
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
                // Atualiza apenas o valor total, sem recarregar a lista de pedidos
                carregarTotal();
            } else {
                console.error('Erro ao adicionar pedido:', response.statusText);
            }
        } catch (error) {
            console.error('Erro ao adicionar pedido:', error);
        }
    });

    // Carregar pedidos e total ao iniciar a página
    // carregarPedidos();
    carregarTotal();
});