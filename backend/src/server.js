require('dotenv').config();

const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await pool.query('SELECT NOW()');   // PSQL ko connect karne ke liye ek simple query run karte hain
        console.log('Database connected');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Startup failed:', error.message);
        process.exit(1);
    }
};

startServer();