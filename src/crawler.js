import puppeteer from 'puppeteer';
import { updateCaptureStartTime, updateCaptureEndTime } from './database/repository.js';

// Extrai os dados de cada card de imóvel no contexto da página.
function extractCardsData(baseUrl, uf, tipo_operacao, pageUrl) {
  function extractCard(card) {
    const link = card.getAttribute("data-to-posting");
    const titulo = link
      ? link.replace("/propriedades/", "").replace(/-/g, " ").replace(".html", "").trim()
      : "Título não encontrado";

    const getText = (selector) => {
      const el = card.querySelector(selector);
      return el ? el.innerText.trim() : null;
    };

    const endereco = getText('.postingLocations-module__location-address') || "Endereço não encontrado";
    const localizacao = getText('.postingLocations-module__location-text') || "Localização não encontrada";
    const preco = getText('.postingPrices-module__price') || "Preço não encontrado";
    const descricao = getText('h3.postingCard-module__posting-description a') || "Descrição não encontrada";

    let area = "Área útil não encontrada";
    let quartos = "Número de quartos não encontrado";
    let banheiros = "Número de banheiros não encontrado";
    let vagas = "Número de vagas não encontrado";

    const featuresElement = card.querySelector('h3.postingMainFeatures-module__posting-main-features-block');
    if (featuresElement) {
      const features = Array.from(
        featuresElement.querySelectorAll('.postingMainFeatures-module__posting-main-features-span.postingMainFeatures-module__posting-main-features-listing')
      );
      features.forEach(feature => {
        const text = feature.innerText.trim();
        if (text.includes("m² tot")) {
          area = text.replace(" tot.", "").trim();
        } else if (text.includes("quartos")) {
          quartos = text.replace("quartos", "").trim();
        } else if (text.includes("banheiro") || text.includes("ban.")) {
          banheiros = text.replace(" banheiro", "").replace(" ban.", "").trim();
        } else if (text.includes("vaga")) {
          vagas = text.replace(" vaga", "").replace("s", "").trim();
        }
      });
    }

    return {
      title: titulo,
      operation_type: tipo_operacao,
      portal: baseUrl,
      url: link ? `https://${baseUrl}${link}` : "URL não encontrada",
      adress: `${endereco}, ${localizacao}/${uf}`,
      price: preco,
      useful_area: area,
      bedrooms: quartos,
      bathrooms: banheiros,
      parking_spots: vagas,
      description: descricao,
    };
  }

  const cards = Array.from(document.querySelectorAll(".postingCardLayout-module__posting-card-layout"));
  return cards.map(card => extractCard(card));
}


// Captura os imóveis de uma página específica.
async function getImoveis({ tipo_imovel, tipo_operacao, localizacao, uf, pagina, baseUrl }) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const pageUrl = `https://${baseUrl}/${tipo_imovel}-${tipo_operacao}-${localizacao}-${uf}${pagina === 1 ? "" : "-pagina-" + pagina}.html`;

  try {
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, como Gecko) Chrome/119.0.0.0 Safari/537.36");
    await page.goto(pageUrl, { waitUntil: 'networkidle2' });
    await page.waitForSelector(".postingCardLayout-module__posting-card-layout", { timeout: 20000 });
    
    // Executa a extração dentro do contexto da página
    const imoveis = await page.evaluate(extractCardsData, baseUrl, uf, tipo_operacao, pageUrl);
    return imoveis;
  } catch (error) {
    console.error(`Erro ao capturar a página ${pagina}:`, error);
    return [];
  } finally {
    await browser.close();
  }
}

// Realiza a captura paginada dos imóveis até atingir 120 itens.
async function fetchImoveis({ tipo_imovel, tipo_operacao, localizacao, uf, url, nome, id }) {
  console.log(`Capturando dados do portal: ${nome}...`);
  const totalImoveis = [];
  let pagina = 1;

  await updateCaptureStartTime(id);

  while (totalImoveis.length < 120) {
    const imoveis = await getImoveis({ tipo_imovel, tipo_operacao, localizacao, uf, pagina, baseUrl: url });
    if (!imoveis.length) break;
    totalImoveis.push(...imoveis);
    console.log(`Página ${pagina} capturada. Total de imóveis encontrados: ${totalImoveis.length}`);
    pagina++;
  }

  await updateCaptureEndTime(id);
  console.log(`Total de imóveis encontrados: ${totalImoveis.length}`);
  return totalImoveis;
}

export default fetchImoveis;
