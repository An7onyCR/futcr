/**
 * server.js - Servidor de API complementario para app.py
 * Proporciona servicios adicionales y procesamiento de datos para la aplicación
 */

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

// Configurar aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Datos de almacenamiento simulado (para desarrollo)
const DATA_FILE = path.join(__dirname, 'data', 'teams_stats.json');

// Asegurar que el directorio de datos exista
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Crear datos de estadísticas si no existen
if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
        teams_stats: {
            saprissa: {
                last_matches: [
                    { opponent: "Alajuelense", result: "W", score: "2-1", date: "2024-02-15" },
                    { opponent: "Herediano", result: "D", score: "1-1", date: "2024-02-08" },
                    { opponent: "Cartaginés", result: "W", score: "3-0", date: "2024-02-01" }
                ],
                top_scorers: [
                    { name: "Ariel Rodríguez", goals: 12 },
                    { name: "Javon East", goals: 9 },
                    { name: "Warren Madrigal", goals: 7 }
                ],
                season_stats: {
                    matches_played: 15,
                    wins: 10,
                    draws: 3,
                    losses: 2,
                    goals_scored: 32,
                    goals_conceded: 12
                }
            },
            liga: {
                last_matches: [
                    { opponent: "Saprissa", result: "L", score: "1-2", date: "2024-02-15" },
                    { opponent: "Cartaginés", result: "W", score: "2-0", date: "2024-02-08" },
                    { opponent: "Herediano", result: "W", score: "3-1", date: "2024-02-01" }
                ],
                top_scorers: [
                    { name: "Johan Venegas", goals: 11 },
                    { name: "Carlos Mora", goals: 8 },
                    { name: "Jonathan Moya", goals: 7 }
                ],
                season_stats: {
                    matches_played: 15,
                    wins: 9,
                    draws: 4,
                    losses: 2,
                    goals_scored: 28,
                    goals_conceded: 14
                }
            },
            herediano: {
                last_matches: [
                    { opponent: "Cartaginés", result: "W", score: "2-0", date: "2024-02-15" },
                    { opponent: "Saprissa", result: "D", score: "1-1", date: "2024-02-08" },
                    { opponent: "Alajuelense", result: "L", score: "1-3", date: "2024-02-01" }
                ],
                top_scorers: [
                    { name: "Francisco Rodríguez", goals: 9 },
                    { name: "Elías Aguilar", goals: 7 },
                    { name: "Yendrick Ruiz", goals: 6 }
                ],
                season_stats: {
                    matches_played: 15,
                    wins: 8,
                    draws: 5,
                    losses: 2,
                    goals_scored: 24,
                    goals_conceded: 15
                }
            },
            cartago: {
                last_matches: [
                    { opponent: "Herediano", result: "L", score: "0-2", date: "2024-02-15" },
                    { opponent: "Alajuelense", result: "L", score: "0-2", date: "2024-02-08" },
                    { opponent: "Saprissa", result: "L", score: "0-3", date: "2024-02-01" }
                ],
                top_scorers: [
                    { name: "Marcel Hernández", goals: 10 },
                    { name: "Allen Guevara", goals: 5 },
                    { name: "Diego Sánchez", goals: 4 }
                ],
                season_stats: {
                    matches_played: 15,
                    wins: 6,
                    draws: 3,
                    losses: 6,
                    goals_scored: 18,
                    goals_conceded: 20
                }
            }
        }
    };
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf8');
}

// Función para leer datos de estadísticas
function getTeamsStats() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error al leer estadísticas:', err);
        return { teams_stats: {} };
    }
}

// Middleware para manejar errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Ha ocurrido un error en el servidor Node.js' });
});

// Rutas de API

// Ruta para obtener estadísticas del equipo
app.get('/node-api/teams/:teamId/stats', (req, res) => {
    try {
        const teamId = req.params.teamId;
        const data = getTeamsStats();
        
        if (data.teams_stats[teamId]) {
            res.json(data.teams_stats[teamId]);
        } else {
            res.status(404).json({ error: 'Equipo no encontrado' });
        }
    } catch (error) {
        console.error('Error en estadísticas de equipo:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

// Ruta para obtener fixture del torneo (simulado)
app.get('/node-api/fixture', (req, res) => {
    const fixture = [
        {
            round: "Jornada 16",
            matches: [
                { home: "Saprissa", away: "San Carlos", date: "2024-02-24", time: "19:00" },
                { home: "Alajuelense", away: "Cartaginés", date: "2024-02-24", time: "17:00" },
                { home: "Herediano", away: "Puntarenas", date: "2024-02-25", time: "15:00" },
                { home: "Guanacasteca", away: "Santos", date: "2024-02-25", time: "15:00" },
                { home: "Pérez Zeledón", away: "Grecia", date: "2024-02-25", time: "15:00" },
                { home: "Liberia", away: "Guápiles", date: "2024-02-25", time: "19:00" }
            ]
        },
        {
            round: "Jornada 17",
            matches: [
                { home: "Cartaginés", away: "Saprissa", date: "2024-03-02", time: "19:00" },
                { home: "Alajuelense", away: "Herediano", date: "2024-03-02", time: "20:00" },
                { home: "San Carlos", away: "Pérez Zeledón", date: "2024-03-03", time: "15:00" },
                { home: "Santos", away: "Liberia", date: "2024-03-03", time: "15:00" },
                { home: "Grecia", away: "Guanacasteca", date: "2024-03-03", time: "15:00" },
                { home: "Puntarenas", away: "Guápiles", date: "2024-03-03", time: "19:00" }
            ]
        }
    ];
    
    res.json(fixture);
});

// Ruta para obtener noticias recientes del fútbol costarricense (simulado)
app.get('/node-api/news', (req, res) => {
    const news = [
        {
            id: 1,
            title: "Saprissa se mantiene líder tras victoria ante Alajuelense",
            date: "2024-02-16",
            summary: "El Deportivo Saprissa venció 2-1 a la Liga Deportiva Alajuelense en el clásico nacional...",
            image_url: "saprissa_liga.jpg"
        },
        {
            id: 2,
            title: "Marcel Hernández alcanza los 100 goles en la Primera División",
            date: "2024-02-10",
            summary: "El delantero cubano del Cartaginés llegó a la histórica cifra de 100 goles en el campeonato costarricense...",
            image_url: "marcel_hernandez.jpg"
        },
        {
            id: 3,
            title: "Herediano anuncia nuevos fichajes para el Clausura 2024",
            date: "2024-01-15",
            summary: "El conjunto florense presentó a tres nuevos jugadores que reforzarán al equipo...",
            image_url: "herediano_fichajes.jpg"
        }
    ];
    
    res.json(news);
});

// Ruta para verificar que el servidor Node.js está funcionando
app.get('/node-api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Servidor Node.js funcionando correctamente' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor Node.js ejecutándose en http://localhost:${PORT}`);
});

module.exports = app; // Para testing