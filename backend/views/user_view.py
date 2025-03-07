import json
from backend.controllers.user_controller import UserController

class UserView:
    def __init__(self):
        self.user_controller = UserController()
    
    def handle_request(self, request_method, path, request_body=None):
        # Definir rutas
        if path == '/api/users/register' and request_method == 'POST':
            return self.handle_register(request_body)
        
        elif path == '/api/users/login' and request_method == 'POST':
            return self.handle_login(request_body)
        
        elif path.startswith('/api/users/') and request_method == 'GET':
            # Extraer ID de usuario de la ruta
            user_id = path.split('/')[-1]
            return self.handle_get_user(user_id)
        
        # Ruta no encontrada
        return {'status': 'error', 'message': 'Ruta no encontrada'}, 404
    
    def handle_register(self, request_body):
        try:
            data = json.loads(request_body)
            return self.user_controller.register(data)
        except json.JSONDecodeError:
            return {'status': 'error', 'message': 'Formato JSON inválido'}, 400
    
    def handle_login(self, request_body):
        try:
            data = json.loads(request_body)
            return self.user_controller.login(data)
        except json.JSONDecodeError:
            return {'status': 'error', 'message': 'Formato JSON inválido'}, 400
    
    def handle_get_user(self, user_id):
        return self.user_controller.get_user(user_id)