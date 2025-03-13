Aqui está o README atualizado com a etapa de clonagem do repositório:  

---

# 📌 Projeto de Captura e Indexação de Imóveis  

Este projeto captura dados de imóveis de um portal e os indexa no **Elasticsearch** para buscas rápidas e eficientes. Ele utiliza **Node.js**, **PostgreSQL** e **Elasticsearch**.  

---  

## ✅ Requisitos  

Antes de iniciar, certifique-se de ter os seguintes softwares instalados:  

- [Git](https://git-scm.com/downloads/win)  
- [Node.js](https://nodejs.org/) (versão 16+)  
- [PostgreSQL](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)  
- [Elasticsearch](https://www.elastic.co/downloads/elasticsearch)    

---  

## 📌 Instalação  

### 1️⃣ Clonar o repositório  
Primeiro, abra o terminal e execute o comando abaixo para clonar o repositório do projeto:  
```sh
git clone https://github.com/seu-usuario/nome-do-repositorio.git
```
Em seguida, entre na pasta do projeto:  
```sh
cd nome-do-repositorio
```

---  

### 2️⃣ Instalar e configurar o **PostgreSQL**  
1. Baixe e instale o PostgreSQL pelo [site oficial](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads).  
2. O projeto usará por padrão o usuário `postgres`, que é o usuário padrão do banco.  
3. No arquivo `.env` do projeto, configure as credenciais do banco de dados:  
   ```env
   DB_USER=postgres
   DB_PASSWORD=sua_senha
   ```  

---  

### 3️⃣ Instalar e configurar o **Elasticsearch**  
1. Baixe o Elasticsearch pelo [site oficial](https://www.elastic.co/downloads/elasticsearch).  
2. Extraia o conteúdo do arquivo baixado para um diretório de sua escolha.  
3. Acesse a pasta extraída e entre no diretório **bin**, clique duas vezes no arquivo `elasticsearch.bat`.  
4. Aguarde finalizar o processo, e após finalizado, **feche o elasticsearch(cmd)**.  
5. No diretório do **projeto**, abra a pasta `elasticsearch`.    
   - Dentro dela, existe apenas uma pasta chamada **`config`** com um arquivo.  
6. **Copie** esse arquivo.  
7. Agora, vá até a pasta onde você **extraiu** o Elasticsearch.  
8. Dentro da pasta extraída, localize o diretório `config`, acesse ele e **cole o arquivo** copiado, substituindo o arquivo existente.  
9. Para iniciar o Elasticsearch, vá até a pasta `bin` novamente, dentro do diretório extraído e **execute o arquivo**:  
   - **Windows**: Clique duas vezes no arquivo `elasticsearch.bat`.  
   - **Linux/macOS**: No terminal, execute:  
     ```sh
     ./bin/elasticsearch
     ```  
10. Aguarde o Elasticsearch iniciar e teste acessando [http://localhost:9200](http://localhost:9200) no navegador.  
    Se estiver funcionando, ele mostrará uma resposta JSON com informações sobre o serviço.  

---  

### 4️⃣ Instalar as dependências do projeto  
Com o **Node.js** instalado, navegue até a pasta do projeto e execute:  
```sh
npm install
```  

---  

## 🚀 Execução do Projeto  

### 🔹 Iniciar a aplicação  
Para rodar a aplicação, use:  
```sh
npm start
```  
Agora a aplicação estará rodando! 🎉 O projeto criará os índices, banco e tabelas necessárias.  

---  

## 👀 Visualização do Projeto  

Após iniciar a aplicação, você pode visualizar os dados dos imóveis indexados no Elasticsearch de diferentes maneiras:  

### 1️⃣ Via Navegador  
- Acesse diretamente um documento específico no Elasticsearch colando o código do imóvel desejado após a URL base:  
  **Exemplo:**  
  `http://localhost:9200/imoveis/_doc/imovel_12`  
  Isso retornará um documento no formato JSON, como o exemplo abaixo:  
  ```json
  {
    "_index": "imoveis",
    "_id": "imovel_12",
    "_version": 1,
    "_seq_no": 12,
    "_primary_term": 1,
    "found": true,
    "_source": {
      "id": "12",
      "titulo": "Apartamento com 3 quartos no centro",
      "descricao": "Descrição detalhada do imóvel...",
      "url": "https://exemplo.com/imovel_12",
      "tipoNegocio": "Venda",
      "endereco": "Rua Exemplo, 123",
      "preco": 500000,
      "quartos": 3,
      "banheiros": 2,
      "vagas_garagem": 1,
      "area_util": 80,
      "capturado_em": "2023-10-01T12:00:00Z",
      "atualizado_em": "2023-10-01T12:00:00Z"
    }
  }
  ```  

### 2️⃣ Via Ferramentas como **Insomnia** ou **Postman**  
- Faça uma requisição **GET** para a API do Elasticsearch:  
  **URL:** `http://localhost:9200/imoveis/_search`  
  **Corpo da Requisição (JSON):**  
  ```json
  {
    "query": {
      "match_all": {}
    },
    "from": 0,
    "size": 120
  }
  ```  
  Isso retornará todos os imóveis indexados (até 120 documentos) no formato JSON.  

### 3️⃣ Via **Kibana** (Opcional)  
- Se você estiver utilizando o Kibana, pode usar o **Dev Tools** para executar consultas diretamente no Elasticsearch.  
  **Exemplo de consulta:**  
  ```json
  GET /imoveis/_search
  {
    "query": {
      "match_all": {}
    }
  }
  ```  

---  