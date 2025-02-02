import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

# Função para conectar ao banco de dados
def conectar_banco():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

# Funções para interagir com o banco de dados
def adicionar_pedido(item, valor):
    conn = conectar_banco()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO pedidos (item, valor) VALUES (%s, %s)', (item, valor))
    conn.commit()
    cursor.close()
    conn.close()

def listar_pedidos():
    conn = conectar_banco()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM pedidos')
    pedidos = cursor.fetchall()
    cursor.close()
    conn.close()
    return pedidos

def calcular_total():
    conn = conectar_banco()
    cursor = conn.cursor()
    cursor.execute('SELECT SUM(valor) FROM pedidos')
    total = cursor.fetchone()[0]
    cursor.close()
    conn.close()
    return total if total else 0

def excluir_pedido(id):
    conn = conectar_banco()
    cursor = conn.cursor()
    try:
        cursor.execute('DELETE FROM pedidos WHERE id = %s', (id,))
        conn.commit()
        return True
    except Exception as e:
        print(f"Erro ao excluir pedido: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

def editar_pedido(id, novo_item, novo_valor):
    conn = conectar_banco()
    cursor = conn.cursor()
    try:
        cursor.execute('UPDATE pedidos SET item = %s, valor = %s WHERE id = %s', (novo_item, novo_valor, id))
        conn.commit()
        return True
    except Exception as e:
        print(f"Erro ao editar pedido: {e}")
        return False
    finally:
        cursor.close()
        conn.close()