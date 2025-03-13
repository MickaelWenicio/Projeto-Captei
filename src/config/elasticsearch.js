import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do cliente Elasticsearch
const esClient = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    tls: {
        rejectUnauthorized: false,
    },
});

// Função para deletar os dados do índice
async function deleteOldData() {
    try {
        const response = await esClient.deleteByQuery({
            index: process.env.ELASTICSEARCH_INDEX_NAME,
            body: {
                query: {
                    match_all: {} // Deleta todos os documentos
                }
            }
        });

        console.log('Dados anteriores deletados:', response);
    } catch (error) {
        console.error('Erro ao deletar os dados:', error);
    }
}

// Função para verificar se o índice existe
async function indexExists() {
    try {
        const exists = await esClient.indices.exists({ index: process.env.ELASTICSEARCH_INDEX_NAME });
        return exists;
    } catch (error) {
        console.error('Erro ao verificar a existência do índice:', error);
        return false;
    }
}

// Função para criar o índice
async function createIndex() {
    const exists = await indexExists();

    if (exists) {
        console.log('Índice imoveis já existe, continuando...');
        await deleteOldData()
        return;
    }

    // Criando o índice
    console.log('Criando índice imoveis...');
    try {
        const response = await esClient.indices.create({
            index: process.env.ELASTICSEARCH_INDEX_NAME,
            body: {
                mappings: {
                    properties: {
                        id: { type: 'keyword' },
                        titulo: { type: 'text' },
                        descricao: { type: 'text' },
                        portal: { type: 'keyword' },
                        url: { type: 'keyword' },
                        tipoNegocio: { type: 'keyword' },
                        endereco: { type: 'text' },
                        preco: { type: 'double' },
                        quartos: { type: 'integer' },
                        banheiros: { type: 'integer' },
                        vagas_garagem: { type: 'integer' },
                        area_util: { type: 'double' },
                        capturado_em: { type: 'date', format: 'yyyy-MM-dd HH:mm:ss' },
                        atualizado_em: { type: 'date', format: 'yyyy-MM-dd HH:mm:ss' },
                    },
                },
            },
        });

        console.log('Índice "imoveis" criado com sucesso!', response);
    } catch (error) {
        console.error('Erro ao criar o índice "imoveis":', error);
    }
}

// Chama a função para criar o índice
createIndex();

export {esClient};