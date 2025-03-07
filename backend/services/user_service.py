import json
import time
import datetime
from backend.models.user import User

class UserService:
    def __init__(self, db_path="./data/users.json"):
        self.db_path = db_path
        try:
            with open(self.db_path, 'r') as file:
                self.users = json.load(file)
        except (FileNotFoundError, json.JSONDecodeError):
            self.users = []
            self._save_to_db()
    
    def _save_to_db(self):
        with open(self.db_path, 'w') as file:
            json.dump(self.users, file, indent=2)
    
    def create_user(self, name, email, password, favorite_team):
        # Verificar si el correo ya está registrado
        if any(user['email'] == email for user in self.users):
            raise ValueError("El correo electrónico ya está registrado")
        
        # Crear nuevo usuario
        user_id = str(int(time.time()))
        now = datetime.datetime.now().isoformat()
        
        new_user = {
            'id': user_id,
            'name': name,
            'email': email,
            'password': password,  # En producción debería encriptarse
            'favorite_team': favorite_team,
            'created_at': now
        }
        
        self.users.append(new_user)
        self._save_to_db()
        
        # Retornar sin password
        user_dict = new_user.copy()
        user_dict.pop('password')
        return user_dict
    
    def authenticate(self, email, password):
        for user in self.users:
            if user['email'] == email and user['password'] == password:
                # Retornar sin password
                user_dict = user.copy()
                user_dict.pop('password')
                return user_dict
        
        raise ValueError("Credenciales inválidas")
    
    def get_user_by_id(self, user_id):
        for user in self.users:
            if user['id'] == user_id:
                # Retornar sin password
                user_dict = user.copy()
                user_dict.pop('password')
                return user_dict
        
        return None