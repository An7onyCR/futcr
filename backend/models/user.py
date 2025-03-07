class User:
    def __init__(self, id, name, email, password, favorite_team, created_at=None):
        self.id = id
        self.name = name
        self.email = email
        self.password = password  
        self.favorite_team = favorite_team
        self.created_at = created_at
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'favorite_team': self.favorite_team,
            'created_at': self.created_at
        }

    @staticmethod
    def from_dict(data):
        return User(
            id=data.get('id'),
            name=data.get('name'),
            email=data.get('email'),
            password=data.get('password'),
            favorite_team=data.get('favorite_team'),
            created_at=data.get('created_at')
        )