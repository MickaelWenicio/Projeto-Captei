import { client } from './connection.js'

// Função para buscar a captura ativa
export const getFirstActiveCapture = async () => {
  try {
    const res = await client.query(
      `
        SELECT 
          captura.id, 
          captura.filtros, 
          portal.nome AS portal_nome, 
          portal.url AS portal_url
        FROM captura
        INNER JOIN portal ON captura.portal_id = portal.id
        WHERE captura.status = 'ativo'
        ORDER BY captura.id
        LIMIT 1
        `
    );

    if (res.rows.length === 0) {
      throw new Error('Nenhuma captura ativa encontrada.');
    }

    return res.rows[0];
  } catch (error) {
    console.error('Erro ao buscar captura ativa:', error.message);
    throw error;
  }
};

// Função para atualizar a hora do início da última captura
export const updateCaptureStartTime = async (captureId) => {
  try {
    await client.query(
      `UPDATE captura SET data_hora_inicio_ultima_captura = NOW() WHERE id = $1`,
      [captureId]
    );
  } catch (error) {
    console.error('Erro ao atualizar data_hora_inicio_ultima_captura:', error.message);
    throw error;
  }
};

// Função para atualizar a hora do fim da última captura
export const updateCaptureEndTime = async (captureId) => {
  try {
    await client.query(
      `UPDATE captura SET data_hora_fim_ultima_captura = NOW() WHERE id = $1`,
      [captureId]
    );
  } catch (error) {
    console.error('Erro ao atualizar data_hora_fim_ultima_captura:', error.message);
    throw error;
  }
};