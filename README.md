(ENGLISH)

Fútbol CR - User Registration Application
Description
This application uses a hybrid architecture with JavaScript frontend and backend components in Python and Node.js. It allows users to register with their email, password, and select their favorite Costa Rican soccer team. Once registered or authenticated, users can view detailed information about their favorite team, including:

-> Team history and trophies
-> Current player roster
-> Legendary players
-> Representative music and chants

Features

1- User Authentication: Registration and login using Firebase Authentication
2- Data Storage: User profile saved in Firestore
3- Responsive Design: Interface adaptable to different devices
4- Personalized Information: Content displayed according to the user's favorite team
5- Audio Playback: Official team chants and music
6-Intuitive Interface: Easy navigation between sections

Available Teams

Deportivo Saprissa
Liga Deportiva Alajuelense
Club Sport Herediano
Club Sport Cartaginés
Costa Rica National 

Technologies Used

Frontend: HTML5, CSS3, JavaScript
Backend: Python (for server components)
Servers: Node.js (complementary server)
Authentication: Firebase Authentication
Database: Firebase Firestore

Installation
1- Clone the Repository
git clone https://github.com/your-username/Examen1_futbolcr.git
cd Examen1_futbolcr

2- Install Required Dependencies
For python backend: pip install flask firebase-admin
For Node.js server: npm install express body-parser

3- Configure FireBase
1- Create a project in Firebase Console
2- Enable Authentication with email/password
3- Create a Firestore database
4- Update Firebase configuration in the frontend/index.html file

4- Start the Servers:
For python:  python backend/app.py
For Node.js: node server.js


File Structure
project/
│
├── backend/                # Server components
│   ├── controllers/        # Controllers for business logic
│   │   └── user_controller.py
│   ├── data/               # Data files
│   ├── models/             # Data models
│   │   └── user.py
│   ├── services/           # Business services
│   │   └── user_service.py
│   ├── views/              # Views and routes
│   │   └── user_view.py
│   └── app.py              # Main backend application
│
├── frontend/               # Frontend resources
│   ├── Audios/             # Audio files for each team
│   ├── Images/             # Team and player images
│   ├── index.html          # Main page and forms
│   ├── script.js           # Client logic
│   └── style.css           # CSS styles
│
├── server.js               # NodeJS complementary server
└── README.md               # This file

Usage

1- When opening the application, users will see a form to log in or register.
2- New users must complete the registration form with their name, email, password, and favorite team.
3- Once authenticated, detailed information about the selected team is displayed.
4- Users can play the team's song with the audio button.
5- The session remains active until the user manually logs out.

Troubleshooting
Common Errors

1- Authentication Error: Verify that Firebase Authentication is correctly configured and enabled.
2- Error Saving Data: Make sure Firestore rules allow writing for authenticated users.
3- Audio Problems: Some browsers may require user interaction before playing audio automatically.

(SPANISH)

Descripción
Esta aplicación utiliza una arquitectura híbrida con frontend en JavaScript y componentes de backend en Python y Node.js. Permite a los usuarios registrarse con su correo electrónico, contraseña y seleccionar su equipo de fútbol favorito de Costa Rica. Una vez registrados o autenticados, los usuarios pueden ver información detallada sobre su equipo favorito, 

Incluyendo:

-> Historia y trofeos del equipo
-> Planilla actual de jugadores
-> Jugadores legendarios
-> Música y cantos representativos

Características

1- Autenticación de Usuarios: Registro e inicio de sesión utilizando Firebase Authentication
2- Almacenamiento de Datos: Perfil de usuario guardado en Firestore
3- Diseño Responsivo: Interfaz adaptable a diferentes dispositivos
4- Información Personalizada: Contenido mostrado según el equipo favorito del usuario
5- Reproducción de Audio: Cantos y música oficial de cada equipo
6- Interfaz Intuitiva: Navegación fácil entre secciones

Equipos Disponibles

Deportivo Saprissa
Liga Deportiva Alajuelense
Club Sport Herediano
Club Sport Cartaginés
Selección de Costa Rica

Tecnologías Utilizadas

Frontend: HTML5, CSS3, JavaScript
Backend: Python (para componentes del servidor)
Servidores: Node.js (servidor complementario)
Autenticación: Firebase Authentication
Base de Datos: Firebase Firestore

Instalación:
1- Clonar el Repositorio
git clone https://github.com/tu-usuario/Examen1_futbolcr.git
cd Examen1_futbolcr

2- Instalar dependencia necesarias
Para el backend en Phyton: pip install flask firebase-admin 
Para el servidor Node.js: npm install express-body-parser

3- Configurar FireBase:
Crea un proyecto en Firebase Console
Habilita Authentication con email/password
Crea una base de datos Firestore
Actualiza la configuración de Firebase en el archivo frontend/index.html

4- Inicia los servidores:
Para el de python: python backend/app.py
Para el de Node.js: node server.js

Estructura de los Archivos

proyecto/
│
├── backend/                # Componentes del servidor
│   ├── controllers/        # Controladores para la lógica de negocio
│   │   └── user_controller.py
│   ├── data/               # Archivos de datos
│   ├── models/             # Modelos de datos
│   │   └── user.py
│   ├── services/           # Servicios de negocio
│   │   └── user_service.py
│   ├── views/              # Vistas y rutas
│   │   └── user_view.py
│   └── app.py              # Aplicación principal de backend
│
├── frontend/               # Recursos frontend
│   ├── Audios/             # Archivos de audio para cada equipo
│   ├── Images/             # Imágenes de equipos y jugadores
│   ├── index.html          # Página principal y formularios
│   ├── script.js           # Lógica del cliente
│   └── style.css           # Estilos CSS
│
├── server.js               # Servidor complementario NodeJS
└── README.md               # Este archivo


Uso
1- Al abrir la aplicación, los usuarios verán un formulario para iniciar sesión o registrarse.
2- Nuevos usuarios deben completar el formulario de registro con su nombre, correo electrónico, contraseña y equipo favorito.
3- Una vez autenticados, se muestra la información detallada del equipo seleccionado.
4- Los usuarios pueden reproducir la cancion del equipo con el botón de audio.
5- La sesión se mantiene activa hasta que el usuario cierre sesión manualmente

Solución de Problemas
Errores Comunes

1- Error de Autenticación: Verifica que Firebase Authentication esté correctamente configurado y habilitado.
2- Error al Guardar Datos: Asegúrate de que las reglas de Firestore permitan escritura para usuarios autenticados.
3- Problemas con Audio: Algunos navegadores pueden requerir interacción del usuario antes de reproducir audio automáticamente.

