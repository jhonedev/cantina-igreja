from flask import Flask, render_template, jsonify, request, abort
from flask_cors import CORS
from models import adicionar_pedido, listar_pedidos, calcular_total, excluir_pedido, editar_pedido

app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app)

allowed_cantinas = ['upa', 'saf', 'uph', 'mocidade']

# Rotas para servir os templates HTML
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/cantinaUpa')
def cantinaUpa():
    return render_template('cantinaUpa.html')

@app.route('/cantinaSaf')
def cantinaSaf():
    return render_template('cantinaSaf.html')

@app.route('/cantinaUph')
def cantinaUph():
    return render_template('cantinaUph.html')

@app.route('/cantinaMocidade')
def cantinaMocidade():
    return render_template('cantinaMocidade.html')

@app.route('/pedidosUpa')
def pedidosUpa():
    return render_template('pedidosUpa.html')

@app.route('/pedidosSaf')
def pedidosSaf():
    return render_template('pedidosSaf.html')

@app.route('/pedidosUph')
def pedidosUph():
    return render_template('pedidosUph.html')

@app.route('/pedidosMocidade')
def pedidosMocidade():
    return render_template('pedidosMocidade.html')

# Rotas da API
@app.route('/api/pedidos/<cantina>', methods=['GET'])
def listar_pedidos_route(cantina):
    if cantina not in allowed_cantinas:
        abort(404)
    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=10, type=int)
    pedidos = listar_pedidos(cantina)
    total_pedidos = len(pedidos)
    start = (page - 1) * per_page
    end = start + per_page
    pedidos_paginados = pedidos[start:end]
    return jsonify({
        "pedidos": [{"id": p[0], "item": p[1], "valor": float(p[2])} for p in pedidos_paginados],
        "total_pedidos": total_pedidos,
        "page": page,
        "per_page": per_page,
        "total_pages": (total_pedidos + per_page - 1) // per_page
    })

@app.route('/api/pedidos/<cantina>', methods=['POST'])
def adicionar_pedido_route(cantina):
    if cantina not in allowed_cantinas:
        abort(404)
    novo_pedido = request.get_json()
    if not novo_pedido or 'item' not in novo_pedido or 'valor' not in novo_pedido:
        abort(400, description="Pedido inválido. Certifique-se de incluir 'item' e 'valor'.")
    try:
        adicionar_pedido(cantina, novo_pedido['item'], novo_pedido['valor'])
        return jsonify(novo_pedido), 201
    except Exception as e:
        abort(500, description=str(e))

@app.route('/api/total/<cantina>', methods=['GET'])
def calcular_total_route(cantina):
    if cantina not in allowed_cantinas:
        abort(404)
    total = calcular_total(cantina)
    return jsonify({"total": total})

@app.route('/api/pedidos/<cantina>/<int:pedido_id>', methods=['DELETE'])
def excluir_pedido_route(cantina, pedido_id):
    if cantina not in allowed_cantinas:
        abort(404)
    sucesso = excluir_pedido(cantina, pedido_id)
    if sucesso:
        return jsonify({"message": "Pedido excluído com sucesso"}), 200
    abort(404, description="Pedido não encontrado")

@app.route('/api/pedidos/<cantina>/<int:pedido_id>', methods=['PUT'])
def editar_pedido_route(cantina, pedido_id):
    if cantina not in allowed_cantinas:
        abort(404)
    dados = request.get_json()
    if not dados or 'item' not in dados or 'valor' not in dados:
        abort(400, description="Dados inválidos para edição")
    sucesso = editar_pedido(cantina, pedido_id, dados['item'], dados['valor'])
    if sucesso:
        return jsonify({"message": "Pedido atualizado com sucesso"}), 200
    abort(404, description="Pedido não encontrado")

if __name__ == '__main__':
    app.run(debug=True)