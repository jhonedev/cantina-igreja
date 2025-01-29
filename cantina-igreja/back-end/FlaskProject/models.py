import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

# # Conectar ao banco de dados MySQL
def conectar_banco():
    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME")
        )
        return conn
    except mysql.connector.Error as e:
        print(f"Erro ao conectar ao banco de dados: {e}")
        return None

conn = conectar_banco()
if conn:
    cursor = conn.cursor()
else:
    print("Não foi possível conectar ao banco de dados.")

cursor.execute('''
    CREATE TABLE IF NOT EXISTS pedidos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item VARCHAR(255) NOT NULL,
        valor DECIMAL(10, 2) NOT NULL
    )
''')
conn.commit()

# Funções para interagir com o banco de dados
def adicionar_pedido(item, valor):
    cursor.execute('INSERT INTO pedidos (item, valor) VALUES (%s, %s)', (item, valor))
    conn.commit()

def listar_pedidos():
    cursor.execute('SELECT * FROM pedidos')
    return cursor.fetchall()

def calcular_total():
    cursor.execute('SELECT SUM(valor) FROM pedidos')
    total = cursor.fetchone()[0]
    return total if total else 0