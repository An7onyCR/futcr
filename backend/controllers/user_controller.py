import json
from http.server import BaseHTTPRequestHandler
from backend.services.user_service import UserService

class UserController:
    def __init__(self):
        self.user_service = UserService()
    
    def register(self, data):
        try:
            # Validar datos de entrada
            required_fields = ['name', 'email', 'password', 'favorite_team']
            for field in required_fields:
                if field not in data:
                    return {'status': 'error', 'message': f'Campo requerido: {field}'}, 400
            
            # Crear usuario
            user = self.user_service.create_user(
                data['name'],
                data['email'],
                data['password'],
                data['favorite_team']
            )
            
            return {'status': 'success', 'user': user}, 201
        
        except ValueError as e:
            return {'status': 'error', 'message': str(e)}, 400
        except Exception as e:
            return {'status': 'error', 'message': f'Error en el servidor: {str(e)}'}, 500
    
    def login(self, data):
        try:
            # Validar datos de entrada
            if 'email' not in data or 'password' not in data:
                return {'status': 'error', 'message': 'Se requiere email y password'}, 400
            
            # Autenticar usuario
            user = self.user_service.authenticate(data['email'], data['password'])
            
            return {'status': 'success', 'user': user}, 200
        
        except ValueError:
            return {'status': 'error', 'message': 'Credenciales inválidas'}, 401
        except Exception as e:
            return {'status': 'error', 'message': f'Error en el servidor: {str(e)}'}, 500
    
    def get_user(self, user_id):
        try:
            user = self.user_service.get_user_by_id(user_id)
            if user:
                return {'status': 'success', 'user': user}, 200
            else:
                return {'status': 'error', 'message': 'Usuario no encontrado'}, 404
        
        except Exception as e:
            return {'status': 'error', 'message': f'Error en el servidor: {str(e)}'}, 500