from flask import Flask, render_template, jsonify, request, session, redirect, url_for, send_from_directory
import os
import json
import subprocess
import signal
import threading
import time
from datetime import datetime

# Obtener la ruta base del proyecto
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')

# Inicializar Flask app con la configuración de carpetas correcta
app = Flask(__name__, 
            static_folder=os.path.join(BASE_DIR, 'frontend'),
            template_folder=os.path.join(BASE_DIR, 'frontend'))

# Clave secreta para sesiones
app.secret_key = 'clave_secreta_de_desarrollo_futbol_cr'

# Ruta para almacenar datos
DATA_DIR = os.path.join(BASE_DIR, 'data')
USERS_FILE = os.path.join(DATA_DIR, 'users.json')

# Asegurar que exista el directorio de datos
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# Crear archivo de usuarios si no existe
if not os.path.exists(USERS_FILE):
    with open(USERS_FILE, 'w') as f:
        json.dump([], f)

# Función para obtener usuarios
def get_users():
    try:
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

# Función para guardar usuarios
def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

# Variable para almacenar el proceso de Node.js
node_process = None

def start_node_server():
    """Inicia el servidor Node.js como un subproceso"""
    global node_process
    try:
        # Inicia el proceso de Node.js
        node_process = subprocess.Popen(['node', os.path.join(BASE_DIR, 'server.js')], 
                                       stdout=subprocess.PIPE,
                                       stderr=subprocess.PIPE)
        print("Servidor Node.js iniciado correctamente")
        
        # Registra la salida del servidor Node.js
        def log_output():
            for line in node_process.stdout:
                print(f"Node.js: {line.decode().strip()}")
        
        threading.Thread(target=log_output, daemon=True).start()
        
    except Exception as e:
        print(f"Error al iniciar el servidor Node.js: {e}")

def stop_node_server():
    """Detiene el servidor Node.js"""
    global node_process
    if node_process:
        print("Deteniendo servidor Node.js...")
        try:
            if os.name == 'nt':  # Para Windows
                subprocess.call(['taskkill', '/F', '/T', '/PID', str(node_process.pid)])
            else:  # Para Unix/Linux/Mac
                os.kill(node_process.pid, signal.SIGTERM)
            node_process = None
            print("Servidor Node.js detenido correctamente")
        except Exception as e:
            print(f"Error al detener el servidor Node.js: {e}")

# Rutas para la API

@app.route('/')
def index():
    """Página principal"""
    try:
        # Servir el archivo index.html directamente desde la carpeta frontend
        return send_from_directory(FRONTEND_DIR, 'index.html')
    except Exception as e:
        print(f"Error al servir index.html: {e}")
        return f"Error: {str(e)}", 500

@app.route('/<path:path>')
def serve_static(path):
    """Servir archivos estáticos desde la carpeta frontend"""
    try:
        return send_from_directory(FRONTEND_DIR, path)
    except:
        return "Archivo no encontrado", 404

@app.route('/api/users', methods=['GET'])
def get_all_users():
    """Obtiene todos los usuarios (sin contraseñas)"""
    users = get_users()
    safe_users = []
    for user in users:
        user_copy = user.copy()
        if 'password' in user_copy:
            del user_copy['password']
        safe_users.append(user_copy)
    return jsonify(safe_users)

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Registra un nuevo usuario"""
    data = request.json
    
    # Validar datos requeridos
    required_fields = ['name', 'email', 'password', 'favorite_team']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'El campo {field} es requerido'}), 400
    
    # Validar longitud de contraseña
    if len(data['password']) < 6:
        return jsonify({'error': 'La contraseña debe tener al menos 6 caracteres'}), 400
    
    # Verificar si el correo ya existe
    users = get_users()
    if any(user['email'] == data['email'] for user in users):
        return jsonify({'error': 'Este correo electrónico ya está registrado'}), 400
    
    # Crear nuevo usuario
    new_user = {
        'id': str(int(time.time() * 1000)),
        'name': data['name'],
        'email': data['email'],
        'password': data['password'],  # En producción: hashear contraseña
        'favorite_team': data['favorite_team'],
        'created_at': datetime.now().isoformat()
    }
    
    # Guardar usuario
    users.append(new_user)
    save_users(users)
    
    # Iniciar sesión
    session['user_id'] = new_user['id']
    
    # Devolver usuario (sin contraseña)
    user_copy = new_user.copy()
    del user_copy['password']
    
    return jsonify({
        'message': 'Usuario registrado correctamente',
        'user': user_copy
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Inicia sesión de usuario"""
    data = request.json
    
    # Validar datos
    if 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Correo y contraseña son requeridos'}), 400
    
    # Buscar usuario
    users = get_users()
    user = next((u for u in users if u['email'] == data['email'] and 
                 u['password'] == data['password']), None)
    
    if not user:
        return jsonify({'error': 'Credenciales inválidas'}), 401
    
    # Iniciar sesión
    session['user_id'] = user['id']
    
    # Devolver usuario (sin contraseña)
    user_copy = user.copy()
    del user_copy['password']
    
    return jsonify({
        'message': 'Inicio de sesión exitoso',
        'user': user_copy
    })

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Cierra sesión de usuario"""
    session.pop('user_id', None)
    return jsonify({'message': 'Sesión cerrada correctamente'})

@app.route('/api/auth/me', methods=['GET'])
def get_current_user():
    """Obtiene el usuario actual basado en la sesión"""
    if 'user_id' not in session:
        return jsonify({'error': 'No autorizado'}), 401
    
    users = get_users()
    user = next((u for u in users if u['id'] == session['user_id']), None)
    
    if not user:
        session.pop('user_id', None)
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    # Devolver usuario (sin contraseña)
    user_copy = user.copy()
    del user_copy['password']
    
    return jsonify(user_copy)

@app.route('/api/teams', methods=['GET'])
def get_teams():
    """Obtiene datos de equipos de fútbol de Costa Rica"""
    teams = [
        {
            'id': 'saprissa',
            'name': 'Deportivo Saprissa',
            'founded': '1935',
            'stadium': 'Ricardo Saprissa Aymá',
            'titles': 38,
            'concacaf': 3,
            'nickname': 'El Monstruo Morado'
        },
        {
            'id': 'liga',
            'name': 'Liga Deportiva Alajuelense',
            'founded': '1919',
            'stadium': 'Alejandro Morera Soto',
            'titles': 30,
            'concacaf': 2,
            'nickname': 'Los Rojinegros, La Liga'
        },
        {
            'id': 'herediano',
            'name': 'Club Sport Herediano',
            'founded': '1921',
            'stadium': 'Eladio Rosabal Cordero',
            'titles': 29,
            'concacaf': 1,
            'nickname': 'El Team, Los Florenses'
        },
        {
            'id': 'cartago',
            'name': 'Club Sport Cartaginés',
            'founded': '1906',
            'stadium': 'José Rafael "Fello" Meza',
            'titles': 4,
            'concacaf': 0,
            'nickname': 'Los Brumosos'
        },
        {
            'id': 'sancarlos',
            'name': 'San Carlos',
            'founded': '1965',
            'stadium': 'Carlos Ugalde Álvarez',
            'titles': 1,
            'concacaf': 0,
            'nickname': 'Los Toros del Norte'
        },
        {
            'id': 'puntarenas',
            'name': 'Puntarenas F.C.',
            'founded': '2004',
            'stadium': 'Miguel Lito Pérez',
            'titles': 1,
            'concacaf': 0,
            'nickname': 'Los Chuchequeros'
        }
    ]
    return jsonify(teams)

# Configuración para ejecutar la aplicación
if __name__ == '__main__':
    try:
        print("Iniciando aplicación...")
        print(f"Ruta frontend: {FRONTEND_DIR}")
        print(f"Verificando existencia de index.html: {os.path.exists(os.path.join(FRONTEND_DIR, 'index.html'))}")
        
        # Iniciar el servidor Node.js
        start_node_server()
        # Esperar un poco para dar tiempo a Node.js a iniciar
        time.sleep(1)
        # Iniciar servidor Flask
        app.run(debug=True, port=5000)
    finally:
        # Detener servidor Node.js al salir
        stop_node_server()