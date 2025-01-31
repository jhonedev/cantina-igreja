from flask import Flask, jsonify, request, abort
from flask_cors import CORS
from models import adicionar_pedido, listar_pedidos, calcular_total, excluir_pedido, editar_pedido

app = Flask(__name__)
CORS(app)

# Rota para listar pedidos com paginação
@app.route('/api/pedidosUpa', methods=['GET'])
def listar_pedidos_route():
    page = request.args.get('page', default=1, type=int)  # Página atual
    per_page = request.args.get('per_page', default=10, type=int)  # Itens por página

    pedidos = listar_pedidos()
    total_pedidos = len(pedidos)

    # Calcula o índice inicial e final para a paginação
    start = (page - 1) * per_page
    end = start + per_page

    # Seleciona os pedidos da página atual
    pedidos_paginados = pedidos[start:end]

    return jsonify({
        "pedidos": [{"id": p[0], "item": p[1], "valor": p[2]} for p in pedidos_paginados],
        "total_pedidos": total_pedidos,
        "page": page,
        "per_page": per_page,
        "total_pages": (total_pedidos + per_page - 1) // per_page
    })

# Rota para adicionar um novo pedido
@app.route('/api/pedidosUpa', methods=['POST'])
def adicionar_pedido_route():
    novo_pedido = request.json
    if not novo_pedido or not 'item' in novo_pedido or not 'valor' in novo_pedido:
        abort(400, description="Pedido inválido. Certifique-se de incluir 'item' e 'valor'.")

    adicionar_pedido(novo_pedido['item'], novo_pedido['valor'])
    return jsonify(novo_pedido), 201

# Rota para calcular o total dos pedidos
@app.route('/api/totalUpa', methods=['GET'])
def calcular_total_route():
    total = calcular_total()
    return jsonify({"total": total})

# Rota para excluir um pedido
@app.route('/api/pedidosUpa/<int:pedido_id>', methods=['DELETE'])
def excluir_pedido_route(pedido_id):
    sucesso = excluir_pedido(pedido_id)
    if sucesso:
        return jsonify({"message": "Pedido excluído com sucesso"}), 200
    else:
        abort(404, description="Pedido não encontrado")

# Rota para editar um pedido
@app.route('/api/pedidosUpa/<int:pedido_id>', methods=['PUT'])
def editar_pedido_route(pedido_id):
    dados = request.json
    if not dados or 'item' not in dados or 'valor' not in dados:
        abort(400, description="Dados inválidos para edição")

    sucesso = editar_pedido(pedido_id, dados['item'], dados['valor'])
    if sucesso:
        return jsonify({"message": "Pedido atualizado com sucesso"}), 200
    else:
        abort(404, description="Pedido não encontrado")


if __name__ == '__main__':
    app.run(debug=True)