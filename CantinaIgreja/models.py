import mysql.connector
from dotenv import load_dotenv
import os
from mysql.connector import Error

load_dotenv()

allowed_cantinas = ['upa', 'saf', 'uph', 'mocidade']

def validar_cantina(cantina):
    if cantina not in allowed_cantinas:
        raise ValueError(f"Cantina inválida: {cantina}")

def conectar_banco():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

def adicionar_pedido(cantina, item, valor):
    validar_cantina(cantina)
    conn = conectar_banco()
    cursor = conn.cursor()
    try:
        cursor.execute(f'INSERT INTO pedidos_{cantina} (item, valor) VALUES (%s, %s)', (item, valor))
        conn.commit()
    except Error as e:
        print(f"Erro ao adicionar pedido: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

def listar_pedidos(cantina):
    validar_cantina(cantina)
    conn = conectar_banco()
    cursor = conn.cursor()
    try:
        cursor.execute(f'SELECT * FROM pedidos_{cantina}')
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

def calcular_total(cantina):
    validar_cantina(cantina)
    conn = conectar_banco()
    cursor = conn.cursor()
    try:
        cursor.execute(f'SELECT SUM(valor) FROM pedidos_{cantina}')
        total = cursor.fetchone()[0]
        return total if total else 0
    finally:
        cursor.close()
        conn.close()

def excluir_pedido(cantina, id):
    validar_cantina(cantina)
    conn = conectar_banco()
    cursor = conn.cursor()
    try:
        cursor.execute(f'DELETE FROM pedidos_{cantina} WHERE id = %s', (id,))
        conn.commit()
        return cursor.rowcount > 0
    except Error as e:
        print(f"Erro ao excluir pedido: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

def editar_pedido(cantina, id, novo_item, novo_valor):
    validar_cantina(cantina)
    conn = conectar_banco()
    cursor = conn.cursor()
    try:
        cursor.execute(
            f'UPDATE pedidos_{cantina} SET item = %s, valor = %s WHERE id = %s',
            (novo_item, novo_valor, id)
        )
        conn.commit()
        return cursor.rowcount > 0
    except Error as e:
        print(f"Erro ao editar pedido: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

def criar_tabelas_se_nao_existirem():
    conn = conectar_banco()
    cursor = conn.cursor()
    
    tabelas = {
        'upa': """
            CREATE TABLE IF NOT EXISTS pedidos_upa (
                id INT AUTO_INCREMENT PRIMARY KEY,
                item VARCHAR(255) NOT NULL,
                valor DECIMAL(10, 2) NOT NULL
            )
        """,
        'saf': """
            CREATE TABLE IF NOT EXISTS pedidos_saf (
                id INT AUTO_INCREMENT PRIMARY KEY,
                item VARCHAR(255) NOT NULL,
                valor DECIMAL(10, 2) NOT NULL
            )
        """,
        'uph': """
            CREATE TABLE IF NOT EXISTS pedidos_uph (
                id INT AUTO_INCREMENT PRIMARY KEY,
                item VARCHAR(255) NOT NULL,
                valor DECIMAL(10, 2) NOT NULL
            )
        """,
        'mocidade': """
            CREATE TABLE IF NOT EXISTS pedidos_mocidade (
                id INT AUTO_INCREMENT PRIMARY KEY,
                item VARCHAR(255) NOT NULL,
                valor DECIMAL(10, 2) NOT NULL
            )
        """
    }

    try:
        for cantina, sql in tabelas.items():
            cursor.execute(sql)
        conn.commit()
    except Error as e:
        print(f"Erro ao criar tabelas: {e}")
    finally:
        cursor.close()
        conn.close()

# Chame a função no final do arquivo models.py
criar_tabelas_se_nao_existirem()