# Relatório de Auditoria de Persistência e Plano de Migração

**Autor:** Manus AI  
**Data:** 14 de Agosto de 2026  
**Projeto:** Cópia de Simulador de Viabilidade - Chalé A-frame  

---

## 1. Visão Geral da Auditoria

Este documento apresenta a auditoria técnica de leitura da persistência de dados e infraestrutura do projeto, realizada em conformidade com as diretrizes oficiais de backup e restauração para o encerramento das operações gerenciadas do Manus. Nenhuma alteração foi efetuada no código, banco de dados ou credenciais.

---

## 2. Identificação do Banco de Dados e Hospedagem

| Parâmetro | Detalhes Técnicos |
| :--- | :--- |
| **Sistema Gerenciador (SGBD)** | MySQL / TiDB (compatível com MySQL 8.0) |
| **ORM Utilizado** | Drizzle ORM (`drizzle-orm`) com driver `mysql2` |
| **Hospedagem Atual** | Infraestrutura gerenciada Manus WebDev (Autoscale / TiDB Cloud-backed) |
| **Método de Conexão** | String de conexão segura injetada via ambiente (`DATABASE_URL`) |

---

## 3. Inventário de Tabelas do Banco de Dados

O schema relacional do projeto (`drizzle/schema.ts`) compreende **13 tabelas** ativas, divididas entre o simulador principal, gestão de usuários e o Ad Manager comercial:

1. **`users`**: Cadastro de usuários, perfis (`user` | `admin`), hashes de senha (scrypt) e tokens de recuperação.
2. **`simulations`**: Armazena as simulações de chalés A-frame salvas pelos usuários (título, JSON de parâmetros e carimbos de data/hora).
3. **`comparison_history`**: Histórico de telas de comparação lado a lado geradas pelos usuários.
4. **`material_prices`**: Tabela de preços customizados de insumos de construção (concreto, aço, ICFlex, EPS, etc.) por usuário ou globais.
5. **`user_settings`**: Preferências e configurações de negócio customizadas por conta de usuário em formato JSON.
6. **`icf_works`**: Galeria de obras ICF, vídeos, folders e catálogos de blocos EPS.
7. **`sponsors`**: Espaço de parceiros/patrocinadores na coluna lateral (logotipo, contato, site, endereço, status).
8. **`ad_categories`**: Categorias de segmentação para campanhas publicitárias.
9. **`ad_campaigns`**: Campanhas publicitárias do Ad Manager (orçamento, limites, geolocalização e status).
10. **`ad_creatives`**: Criativos visuais associados às campanhas (padrão 640x360 px, proporção 16:9).
11. **`ad_slots`**: Espaços publicitários dinâmicos na interface do simulador.
12. **`ad_impressions`**: Logs de exibições de anúncios com segmentação geográfica.
13. **`ad_clicks`**: Rastreamento de cliques e interações com os criativos.
14. **`ad_frequency_logs`**: Controle de frequency capping por sessão/dia.

---

## 4. Auditoria de Armazenamento de Arquivos (Storage)

- **Mídia e Assets:** Todos os arquivos de imagem, criativos publicitários, logotipos e vídeos enviados no painel administrativo e na galeria de obras são armazenados no **Storage S3 integrado do Manus** (`storagePut` / proxies dedicados).
- **Dependência:** O código do projeto não armazena arquivos binários localmente em disco na pasta do servidor, garantindo conformidade com as restrições de cloud e deployments serverless.

---

## 5. Exportação e Restauração Fora do Manus

1. **Backup Nativo Manus:** O mecanismo oficial para preservação integral e restauração automatizada é o **Task Data Backup**, gerado através da ferramenta oficial de exportação do Manus (`https://manus.im/backup`). Este pacote empacota o código-fonte, banco de dados relacional completo (todas as tabelas listadas acima), arquivos do S3 storage e variáveis de configuração.
2. **Exportação Externa Manual:**
   - **Código e Schema:** O repositório git e o schema Drizzle podem ser exportados diretamente por download do workspace.
   - **Banco de Dados:** Pode ser extraído via dump SQL utilizando ferramentas de cliente MySQL (`mysqldump`) conectadas à string de conexão atual, desde que o acesso à rede do cluster TiDB esteja ativo.
   - **Storage S3:** Os arquivos no S3 exigem download programático a partir das URLs assinadas ou bucket subjacente.

---

## 6. Variáveis de Ambiente Necessárias (Sem Exposição de Secrets)

Para reconectar o aplicativo e o banco de dados em um novo servidor fora da infraestrutura Manus, as seguintes variáveis de ambiente devem ser configuradas:

| Variável | Descrição / Propósito |
| :--- | :--- |
| `DATABASE_URL` | String de conexão MySQL/TiDB (ex: `mysql://user:pass@host:port/dbname?ssl={"rejectUnauthorized":true}`) |
| `JWT_SECRET` | Segredo criptográfico para assinatura de cookies de sessão de usuário |
| `NODE_ENV` | Modo de execução do Node.js (`production` ou `development`) |
| `PORT` | Porta de escuta do servidor HTTP (ex: `3000`) |
| `BUILT_IN_FORGE_API_URL` | Endpoint da API de serviços integrados Manus (opcional se descontinuado) |
| `BUILT_IN_FORGE_API_KEY` | Chave de autenticação dos serviços integrados (opcional se descontinuado) |
| `STRIPE_SECRET_KEY` *(Opcional)* | Chave de API do gateway de pagamento (Stripe) para produção futura |
| `STRIPE_WEBHOOK_SECRET` *(Opcional)* | Chave secreta de assinatura de webhooks do gateway de pagamento |

---

## 7. Recomendações e Plano de Ação

1. **Gerar Backup Imediato:** Acesse o painel oficial em `https://manus.im/backup` e execute o **Task Data Backup completo** (All tasks / All time) antes da janela de exclusão.
2. **Preservação do Repositório:** Salve uma cópia local do código-fonte e das migrações Drizzle (`drizzle/`).
3. **Migração Futura:** Para migrar para uma infraestrutura própria (ex: VPS Linux com MySQL externo), provisione um banco MySQL 8+, execute as migrações Drizzle, configure o storage S3 compatível (AWS S3 ou MinIO) e insira as variáveis de ambiente auditadas acima.
