import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

# Criar uma função para conectar ao banco de dados
def conectar_banco():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

# Criar pedido
def adicionar_pedido(item, valor):
    conn = conectar_banco()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO pedidos (item, valor) VALUES (%s, %s)', (item, valor))
    conn.commit()
    cursor.close()
    conn.close()

# Listar pedidos
def listar_pedidos():
    conn = conectar_banco()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM pedidos')
    pedidos = cursor.fetchall()
    cursor.close()
    conn.close()
    return pedidos

# Calcular total
def calcular_total():
    conn = conectar_banco()
    cursor = conn.cursor()
    cursor.execute('SELECT SUM(valor) FROM pedidos')
    total = cursor.fetchone()[0]
    cursor.close()
    conn.close()
    return total if total else 0

# Excluir pedido
def excluir_pedido(id):
    conn = conectar_banco()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM pedidos WHERE id = %s', (id,))
    conn.commit()
    cursor.close()
    conn.close()

# Editar pedido
def editar_pedido(id, novo_item, novo_valor):
    conn = conectar_banco()
    cursor = conn.cursor()
    cursor.execute('UPDATE pedidos SET item = %s, valor = %s WHERE id = %s', (novo_item, novo_valor, id))
    conn.commit()
    cursor.close()
    conn.close()
