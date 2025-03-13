import pgk from 'pg';
import dotenv from 'dotenv';

const { Client } = pgk;

dotenv.config();

// Cliente principal para conexão com o banco de dados
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Cliente para criar o banco de dados caso não exista
const mainClient = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Função para verificar se o banco de dados existe
async function checkDatabaseExists() {
  const query = `SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}';`;
  const result = await mainClient.query(query);
  return result.rowCount > 0;
}

// Função para criar o banco de dados
async function createDatabase() {
  const query = `CREATE DATABASE ${process.env.DB_NAME};`;
  await mainClient.query(query);
  console.log(`Banco de dados ${process.env.DB_NAME} criado com sucesso...`);
}

// Função para conectar ao banco de dados
async function connectToDatabase() {
  await client.connect();
  console.log('Conectado ao banco de dados...');
}

// Função para verificar se as tabelas existem e criá-las se necessário
async function initializeTables() {
  const tablesQuery = `
    CREATE TABLE IF NOT EXISTS portal (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(255) NOT NULL UNIQUE,
      url TEXT NOT NULL,
      observacoes VARCHAR(255)
    );
    
    CREATE TABLE IF NOT EXISTS captura (
      id SERIAL PRIMARY KEY,
      portal_id INT REFERENCES portal(id) ON DELETE CASCADE,
      filtros JSONB NOT NULL UNIQUE,
      status VARCHAR(50) NOT NULL,
      data_hora_inicio_ultima_captura TIMESTAMP DEFAULT NOW(),
      data_hora_fim_ultima_captura TIMESTAMP
    );
  `;
  await client.query(tablesQuery);
  console.log('Tabelas configuradas...');

  // Inserir dados padrão
  await insertDefaultData();
}

// Função para inserir dados padrão no banco de dados
async function insertDefaultData() {
  const checkPortalQuery = `SELECT id FROM portal WHERE nome = 'imovelweb';`;
  const portalExists = await client.query(checkPortalQuery);

  if (portalExists.rowCount === 0) {
    await client.query(`
      INSERT INTO portal (nome, url, observacoes)
      VALUES ('imovelweb', 'www.imovelweb.com.br', 'Portal de imoveis padrão.')
      ON CONFLICT (nome) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO captura (portal_id, filtros, status)
      VALUES 
        (1, '{"estado": "sc", "localizacao": "florianopolis", "tipo_imovel": "apartamentos", "tipo_operacao": "venda"}', 'ativo')
      ON CONFLICT (filtros) DO NOTHING;
    `);

    console.log('Dados padrões inseridos...');
  } else {
    console.log('Portal padrão já existe na tabela...');
  }
}

// Função para inicializar o banco de dados (verificar e criar banco e tabelas)
async function initializeDatabase() {
  try {
    // Conectar ao cliente principal para criação de banco
    await mainClient.connect();

    // Verificar se o banco de dados existe, se não, criar
    const dbExists = await checkDatabaseExists();
    if (!dbExists) {
      await createDatabase();

    } else {
      console.log(`Banco de dados ${process.env.DB_NAME} já existe...`);
    }

    // Finalizar conexão do cliente principal
    await mainClient.end();

    // Conectar ao banco de dados específico
    await connectToDatabase();

    // Inicializar as tabelas no banco de dados
    await initializeTables();
    
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
    throw error;
  }
}

export { initializeDatabase, client };
