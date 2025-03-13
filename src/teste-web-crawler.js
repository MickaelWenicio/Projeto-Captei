import fetchImoveis from './crawler.js';
import { esClient } from './config/elasticsearch.js';
import { initializeDatabase } from './database/connection.js';
import { getFirstActiveCapture } from './database/repository.js';

//Formata uma data para o formato "yyyy-MM-dd HH:mm:ss".
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Indexa um único imóvel no Elasticsearch.
async function indexImovel(imovel, id) {
  try {
    // Converte o preço para número, se possível.
    const formattedPrice = parseFloat(
      imovel.price.replace(/[^\d,-]/g, '').replace(',', '.')
    );

    // Indexa o imóvel no Elasticsearch
    const response = await esClient.index({
      index: 'imoveis',
      id,
      body: {
        id,
        titulo: imovel.title,
        descricao: imovel.description,
        portal: imovel.portal,
        url: imovel.url,
        tipoNegocio: imovel.operation_type,
        endereco: imovel.adress,
        preco: formattedPrice || 0,
        quartos: parseInt(imovel.bedrooms) || 0,
        banheiros: parseInt(imovel.bathrooms) || 0,
        vagas_garagem: parseInt(imovel.parking_spots) || 0,
        area_util:
          typeof imovel.useful_area === 'string'
            ? parseFloat(imovel.useful_area.replace('m²', '').trim()) || 0
            : 0,
        capturado_em: formatDate(new Date()),
        atualizado_em: formatDate(new Date()),
      },
      refresh: true,
    });

    console.log(`Imóvel indexado com sucesso: ${imovel.title}`, response);
  } catch (error) {
    console.error(`Erro ao indexar imóvel ${imovel.title}:`, error);
  }
}

// Função principal que orquestra a captura e indexação dos imóveis.
async function main() {
  try {
    // Inicializa o banco de dados
    await initializeDatabase();

    // Busca a captura ativa e os filtros
    const captura = await getFirstActiveCapture();
    const dados = {
      id: captura.id,
      tipo_imovel: captura.filtros.tipo_imovel,
      tipo_operacao: captura.filtros.tipo_operacao,
      localizacao: captura.filtros.localizacao,
      uf: captura.filtros.estado,
      url: captura.portal_url,
      nome: captura.portal_nome,
    };

    // Busca os imóveis com os filtros obtidos
    const imoveis = await fetchImoveis(dados);
    console.log(`Capturados ${imoveis.length} imóveis do portal ${dados.nome}.`);

    // Indexa os imóveis no Elasticsearch
    let idCounter = 1;
    for (const imovel of imoveis) {
      const indexId = `imovel_${idCounter++}`;
      await indexImovel(imovel, indexId);
    }

    console.log(`Total de imóveis indexados no Elasticsearch: ${imoveis.length}`);
  } catch (error) {
    console.error('Erro durante a execução:', error);
  } finally {
    process.exit();
  }
}

// Executa o projeto
main();
