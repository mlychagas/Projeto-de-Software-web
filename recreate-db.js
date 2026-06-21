const mysql = require('mysql2/promise');

async function recreate() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
    });

    try {
        await connection.query('DROP DATABASE IF EXISTS escola_de_musica;');
        await connection.query('CREATE DATABASE escola_de_musica;');
        console.log('Database recriada com sucesso.');
    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await connection.end();
    }
}

recreate();
