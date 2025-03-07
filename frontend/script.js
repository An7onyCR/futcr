document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM cargado completamente");
    
    // Verificar que Firebase esté disponible
    if (!firebase || !firebase.auth || !firebase.firestore) {
        console.error("Firebase no está correctamente inicializado");
        alert("Error: Firebase no está disponible. Por favor, recarga la página.");
        return;
    }
    
    // Referencias a los elementos del DOM
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const registerButton = registerForm ? registerForm.querySelector('button[type="submit"]') : null;
    const loginButton = loginForm ? loginForm.querySelector('button[type="submit"]') : null;
    
    // Referencias a Firebase
    const auth = firebase.auth();
    const db = firebase.firestore();
    
    // Clase para manejo de usuarios con Firebase
    class UserManager {
        constructor() {
            this.auth = firebase.auth();
            this.db = firebase.firestore();
            this.currentUser = null;
            
            // Listener para cambios en la autenticación
            this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    try {
                        // Usuario autenticado, obtener datos adicionales de Firestore
                        const docSnap = await this.db.collection('users').doc(user.uid).get();
                        
                        if (docSnap.exists) {
                            this.currentUser = {
                                id: user.uid,
                                email: user.email,
                                name: docSnap.data().name,
                                favoriteTeam: docSnap.data().favoriteTeam
                            };
                            
                            // Si estamos en la página principal y el usuario está logueado, mostrar su equipo
                            if (document.getElementById('team-info')) {
                                showTeamInfo();
                            }
                        } else {
                            console.log("No hay datos de usuario en Firestore");
                        }
                    } catch (error) {
                        console.error("Error al obtener datos del usuario:", error);
                    }
                } else {
                    // Usuario no autenticado
                    this.currentUser = null;
                    
                    // Si estamos en la página principal, mostrar pantalla de login
                    if (document.getElementById('auth-container') && document.getElementById('team-info')) {
                        hideTeamInfo();
                    }
                }
            });
        }
        
        // Registrar nuevo usuario
async registerUser(name, email, password, favoriteTeam) {
    try {
        console.log("Intentando registrar usuario:", email);
        
        // Crear usuario en Authentication
        const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log("Usuario creado:", user.uid);
        
        // Agregamos un catch específico para errores de creación de usuario
        try {
            // Guardar datos adicionales en Firestore
            await this.db.collection('users').doc(user.uid).set({
                name: name,
                favoriteTeam: favoriteTeam,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp() // Mejor usar el timestamp del servidor
            });
            
            console.log("Datos guardados en Firestore");
            
            // Actualizar usuario actual
            this.currentUser = {
                id: user.uid,
                name: name,
                email: email,
                favoriteTeam: favoriteTeam
            };
            
            return this.currentUser;
        } catch (firestoreError) {
            console.error("Error al guardar en Firestore:", firestoreError);
            // Si falla la escritura en Firestore, al menos notificamos al usuario
            // pero no eliminamos su cuenta de autenticación
            throw firestoreError;
        }
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        throw error;
    }
}
        
        // Iniciar sesión
        async loginUser(email, password) {
            try {
                // Autenticar con Firebase
                const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                // Obtener datos adicionales de Firestore
                const docSnap = await this.db.collection('users').doc(user.uid).get();
                
                if (docSnap.exists) {
                    this.currentUser = {
                        id: user.uid,
                        email: user.email,
                        name: docSnap.data().name,
                        favoriteTeam: docSnap.data().favoriteTeam
                    };
                    
                    return this.currentUser;
                } else {
                    throw new Error('Datos de usuario no encontrados');
                }
            } catch (error) {
                console.error("Error al iniciar sesión:", error);
                throw error;
            }
        }
        
        // Verificar si hay usuario con sesión activa
        isLoggedIn() {
            return this.currentUser !== null;
        }
        
        // Cerrar sesión
        async logout() {
            try {
                await this.auth.signOut();
                this.currentUser = null;
            } catch (error) {
                console.error("Error al cerrar sesión:", error);
                throw error;
            }
        }
        
        // Obtener usuario actual
        getCurrentUser() {
            return this.currentUser;
        }
    }
    
    // Instancia de gestor de usuarios
    const userManager = new UserManager();
    
    // Función para mostrar información del equipo
    function showTeamInfo() {
        const user = userManager.getCurrentUser();
        
        if (!user) return;
        
        // Ocultar formularios y mostrar info del equipo
        const authContainer = document.getElementById('auth-container');
        const teamInfo = document.getElementById('team-info');
        
        if (authContainer) authContainer.style.display = 'none';
        if (teamInfo) teamInfo.style.display = 'block';
        
        // Actualizar mensaje de bienvenida
        const welcomeUser = document.getElementById('welcome-user');
        if (welcomeUser) welcomeUser.textContent = `¡Bienvenido, ${user.name}! Aquí está la información de tu equipo favorito`;
        
        // Mostrar solo la información del equipo seleccionado
        const teamCards = document.querySelectorAll('.team-card');
        teamCards.forEach(card => card.classList.add('hidden'));
        
        const selectedTeamCard = document.getElementById(`${user.favoriteTeam}-info`);
        if (selectedTeamCard) {
            selectedTeamCard.classList.remove('hidden');
        } else {
            const otherInfo = document.getElementById('other-info');
            if (otherInfo) {
                otherInfo.classList.remove('hidden');
            } else {
                // Crear un fallback si no existe el elemento other-info
                createFallbackTeamCard(user.favoriteTeam);
            }
        }
    }
    
    // Crear una tarjeta de equipo fallback si no existe
    function createFallbackTeamCard(teamId) {
        const teamNames = {
            'saprissa': 'Deportivo Saprissa',
            'liga': 'Liga Deportiva Alajuelense',
            'herediano': 'Club Sport Herediano',
            'cartago': 'Club Sport Cartaginés',
            'cr': 'Federación Costarricense de Fútbol',
            'sancarlos': 'San Carlos',
            'puntarenas': 'Puntarenas F.C.',
            'santos': 'Santos de Guápiles',
            'guanacasteca': 'Asociación Deportiva Guanacasteca',
            'liberia': 'Municipal Liberia',
            'perezz': 'Pérez Zeledón',
            'grecia': 'Municipal Grecia',
            'other': 'Otro Equipo'
        };

        const teamName = teamNames[teamId] || 'Equipo Seleccionado';
        const teamInfo = document.getElementById('team-info');
        
        if (!teamInfo) return;
        
        const fallbackCard = document.createElement('div');
        fallbackCard.id = `${teamId}-info`;
        fallbackCard.className = 'team-card';
        fallbackCard.innerHTML = `
            <h2>${teamName}</h2>
            <img src="/api/placeholder/600/300" alt="${teamName}">
            <p>Información sobre ${teamName} estará disponible próximamente.</p>
            <p>El fútbol costarricense cuenta con una rica historia y diversos equipos competitivos que han contribuido al desarrollo del deporte en el país.</p>
            
            <div class="team-stats">
                <div class="stat">
                    <div><i class="fas fa-futbol"></i></div>
                    <small>Primera División</small>
                </div>
                <div class="stat">
                    <div><i class="fas fa-trophy"></i></div>
                    <small>Títulos</small>
                </div>
                <div class="stat">
                    <div><i class="fas fa-history"></i></div>
                    <small>Historia</small>
                </div>
            </div>
        `;
        
        teamInfo.appendChild(fallbackCard);
    }
    
    // Ocultar información del equipo
    function hideTeamInfo() {
        const authContainer = document.getElementById('auth-container');
        const teamInfo = document.getElementById('team-info');
        const formTitle = document.getElementById('form-title');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (authContainer) authContainer.style.display = 'block';
        if (teamInfo) teamInfo.style.display = 'none';
        if (formTitle) formTitle.textContent = 'Inicio de Sesión';
        if (loginForm) loginForm.classList.add('show');
        if (registerForm) registerForm.classList.remove('show');
    }
    
    // Validadores
    const validators = {
        email: (email) => {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },
        password: (password) => password.length >= 6,
        name: (name) => name.trim().length > 0,
        confirmPassword: (password, confirmPassword) => password === confirmPassword,
        favoriteTeam: (team) => team !== ''
    };
    
    // Configurar eventos para mostrar/ocultar contraseñas
    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }
        });
    });
    
    // Cambio entre formularios
    const loginTab = document.getElementById('switch-to-login');
    const registerTab = document.getElementById('switch-to-register');
    
    if (registerTab) {
        registerTab.addEventListener('click', function(e) {
            e.preventDefault();
            if (loginForm) loginForm.classList.remove('show');
            if (registerForm) registerForm.classList.add('show');
            if (formTitle) formTitle.textContent = 'Registro de Usuario';
        });
    }
    
    if (loginTab) {
        loginTab.addEventListener('click', function(e) {
            e.preventDefault();
            if (registerForm) registerForm.classList.remove('show');
            if (loginForm) loginForm.classList.add('show');
            if (formTitle) formTitle.textContent = 'Inicio de Sesión';
        });
    }
    
    // Validación formulario de registro
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("Formulario de registro enviado");
            
            // Limpiar mensajes de error previos
            document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
            
            // Obtener valores
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            const favoriteTeam = document.getElementById('favorite-team').value;
            
            console.log("Datos del formulario:", { name, email, favoriteTeam });
            
            // Validar campos
            let isValid = true;
            
            if (!validators.name(name)) {
                document.getElementById('register-name-error').style.display = 'block';
                isValid = false;
            }
            
            if (!validators.email(email)) {
                document.getElementById('register-email-error').style.display = 'block';
                isValid = false;
            }
            
            if (!validators.password(password)) {
                document.getElementById('register-password-error').style.display = 'block';
                isValid = false;
            }
            
            if (!validators.confirmPassword(password, confirmPassword)) {
                document.getElementById('register-confirm-password-error').style.display = 'block';
                isValid = false;
            }
            
            if (!validators.favoriteTeam(favoriteTeam)) {
                document.getElementById('favorite-team-error').style.display = 'block';
                isValid = false;
            }
            
            if (isValid) {
                try {
                    // Mostrar indicador de carga
                    if (registerButton) {
                        registerButton.disabled = true;
                        registerButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
                    }
                    
                    console.log("Registrando usuario con Firebase...");
                    
                    // Registrar usuario con Firebase
                    await userManager.registerUser(name, email, password, favoriteTeam);
                    
                    console.log("Usuario registrado exitosamente");
                    
                    // Mostrar pantalla de equipo
                    showTeamInfo();
                    
                } catch (error) {
                    console.error("Error en el registro:", error);
                    
                    // Manejar errores específicos de Firebase
                    let errorMessage = 'Error al registrarse';
                    
                    if (error.code === 'auth/email-already-in-use') {
                        errorMessage = 'Este correo electrónico ya está registrado';
                    } else if (error.code === 'auth/weak-password') {
                        errorMessage = 'La contraseña es demasiado débil';
                    } else if (error.code === 'auth/invalid-email') {
                        errorMessage = 'Correo electrónico inválido';
                    } else if (error.message) {
                        errorMessage = error.message;
                    }
                    
                    const errorElement = document.getElementById('register-form-error');
                    if (errorElement) {
                        errorElement.textContent = errorMessage;
                        errorElement.style.display = 'block';
                    }
                    
                    // Restablecer botón
                    if (registerButton) {
                        registerButton.disabled = false;
                        registerButton.innerHTML = 'Registrarse';
                    }
                }
            }
        });
    } else {
        console.error("Elemento de formulario de registro no encontrado");
    }
    
    // Validación formulario de inicio de sesión
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("Formulario de login enviado");
            
            // Limpiar mensajes de error previos
            document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
            
            // Obtener valores
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            // Validar campos
            let isValid = true;
            
            if (!validators.email(email)) {
                document.getElementById('login-email-error').style.display = 'block';
                isValid = false;
            }
            
            if (!validators.password(password)) {
                document.getElementById('login-password-error').style.display = 'block';
                isValid = false;
            }
            
            if (isValid) {
                try {
                    // Mostrar indicador de carga
                    if (loginButton) {
                        loginButton.disabled = true;
                        loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
                    }
                    
                    // Iniciar sesión con Firebase
                    await userManager.loginUser(email, password);
                    
                    // Mostrar pantalla de equipo
                    showTeamInfo();
                    
                } catch (error) {
                    // Manejar errores específicos de Firebase
                    let errorMessage = 'Error al iniciar sesión';
                    
                    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                        errorMessage = 'Correo electrónico o contraseña incorrectos';
                    } else if (error.code === 'auth/too-many-requests') {
                        errorMessage = 'Demasiados intentos fallidos. Intente más tarde';
                    } else if (error.message) {
                        errorMessage = error.message;
                    }
                    
                    document.getElementById('login-form-error').textContent = errorMessage;
                    document.getElementById('login-form-error').style.display = 'block';
                    
                    // Restablecer botón
                    if (loginButton) {
                        loginButton.disabled = false;
                        loginButton.innerHTML = 'Ingresar';
                    }
                }
            }
        });
    }
    
    // Cerrar sesión
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await userManager.logout();
                hideTeamInfo();
            } catch (error) {
                console.error("Error al cerrar sesión:", error);
                alert("Error al cerrar sesión. Intente nuevamente.");
            }
        });
    }
});

// Función para reproducir audio
function toggleAudio(audioId) {
    const audio = document.getElementById(audioId);
    if (!audio) {
        console.error(`Audio element with ID ${audioId} not found`);
        return;
    }
    
    const button = audio.previousElementSibling;
    const playIcon = button.querySelector('.play-icon');
    const pauseIcon = button.querySelector('.pause-icon');
    
    // Pausa todos los demás audios primero
    document.querySelectorAll('audio').forEach(a => {
        if (a.id !== audioId && !a.paused) {
            a.pause();
            const otherButton = a.previousElementSibling;
            otherButton.querySelector('.play-icon').style.display = 'inline-block';
            otherButton.querySelector('.pause-icon').style.display = 'none';
        }
    });
    
    // Reproduce o pausa el audio seleccionado
    if (audio.paused) {
        audio.play();
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'inline-block';
    } else {
        audio.pause();
        playIcon.style.display = 'inline-block';
        pauseIcon.style.display = 'none';
    }
}

// Manejo de errores globales
window.addEventListener('error', (event) => {
    console.error('Error en la aplicación:', event.error);
});