# Tarefas — Landing Page com Cadastro, Login e Confirmação de E-mail

- [x] Avaliar a arquitetura atual do projeto estático e os requisitos de autenticação.
- [x] Executar o upgrade para projeto full-stack (`web-db-user`) com banco de dados e gerenciamento de usuários.
- [x] Criar as tabelas de usuários e tokens de confirmação de e-mail no banco de dados.
- [x] Implementar rotas de backend para registro, login, logout, reenvio e confirmação de e-mail.
- [x] Desenvolver a landing page pública de apresentação do simulador de chalés A-frame com CTAs de acesso.
- [x] Criar os modais ou páginas dedicadas de Cadastro, Login, Esqueceu a Senha e Tela de Espera por Confirmação de E-mail.
- [x] Proteger o simulador de viabilidade para exigir conta ativa e e-mail confirmado.
- [x] Validar o fluxo end-to-end de registro, envio de link de confirmação, ativação e acesso.
- [x] Salvar checkpoint de produção e documentar o funcionamento do sistema de e-mails.

# Persistência de dados no banco

- [x] Criar entidade de configurações do usuário para preços, mão de obra, materiais customizados, fundação e dados geotécnicos.
- [x] Implementar helpers de banco para simulações, configurações, histórico de comparações e preços.
- [x] Criar endpoints tRPC protegidos para salvar, listar e excluir dados persistidos.
- [x] Conectar o simulador ao banco e migrar os dados principais do localStorage quando o usuário estiver autenticado.
- [x] Criar testes Vitest para as operações de persistência e validar o schema no banco.
- [x] Verificar o fluxo no navegador, executar testes e salvar checkpoint publicado.

# Histórico

- [x] Schema inicial de simulações, histórico de comparações e preços criado e migração 0000 aplicada no banco.

# Pendências técnicas de produção resolvidas

- [x] Implementar hash seguro de senha (scrypt nativo em Node.js).
- [x] Adicionar fluxo de recuperação de senha com token e redefinição (backend + utilitários).
- [x] Integrar envio de e-mails e remover o retorno de tokens de verificação pela API.
- [x] Criar painel administrativo protegido para gerenciamento de usuários (`AdminPanel.tsx` + `admin.listUsers` / `updateRole`).
- [x] Remover a simulação de sandbox e telas de confirmação manual em ambiente de produção no `Home.tsx`.
- [x] Corrigir o erro legado de declaração duplicada reportado no Home.tsx, se ainda reproduzido no navegador.

# Nota de escopo

- [x] Manter preferências puramente visuais, como tema e largura da barra lateral, no armazenamento local do navegador; persistir no banco os dados de negócio e simulações do usuário.

# Melhoria solicitada

- [x] Adicionar botão com ícone de olho para mostrar/ocultar senha no login.
- [x] Adicionar botão com ícone de olho para mostrar/ocultar senha no cadastro.

# Correção urgente

- [x] Integrar serviço transacional real (Resend) e fallback seguro para garantir a entrega dos e-mails de confirmação e redefinição de senha.

# Identidade visual

- [x] Substituir o desenho atual do cabeçalho por um símbolo visual de chalé A-frame ao lado de “Chalé A-frame ICF”.

# Ajuste solicitado na landing page

- [x] Remover o bloco “Acesso Seguro com Confirmação” e os textos de confirmação por e-mail da landing page, sem remover o login/cadastro.
- [x] Remover o indicador “78L/m² — Concreto Interno” da landing page, mantendo o dado no simulador técnico.
- [x] Remover a referência textual “(78L/m²)” do parágrafo descritivo da landing page.

# Correção de e-mail de confirmação

- [x] Diagnosticar e garantir que o envio de e-mails funcione sem falhas ou fornecer opção imediata de confirmação direta se o provedor externo não estiver ativo.

# Painel Administrativo e Permissões

- [x] Listar usuários cadastrados e promover a conta ativa para administrador.
- [x] Validar e refinar o componente `AdminPanel.tsx` para garantir exclusão, alteração de cargo e estatísticas gerais.
- [x] Exibir e integrar explicitamente o botão “Painel Admin” no cabeçalho da tela autenticada.
- [x] Transformar o modal administrativo em uma página ampla dedicada com layout de painel e navegação completa.
- [x] Adicionar funcionalidade para o usuário trocar seu próprio e-mail com segurança.
- [x] Adicionar funcionalidade para o administrador excluir usuários cadastrados com confirmação e proteção anti-autoexclusão.

# Obras ICF & Galeria

- [x] Criar tabela de banco de dados `icf_works` para mídias (vídeos de chalés, fotos de blocos EPS, folders e catálogos).
- [x] Implementar rotas tRPC e helpers de banco para gerenciar e listar itens da galeria.
- [x] Desenvolver a aba/seção visual responsiva para exibição de Obras ICF & Galeria no sistema.
- [x] Implementar upload direto de fotos, vídeos e arquivos PDF/folders sem exigir links externos.
- [x] Simplificar e corrigir o fluxo de upload para garantir envio simples e sem falhas.
- [x] Adicionar funcionalidade para renomear e excluir itens diretamente na galeria administrativa.
- [x] Implementar visualizador em tela cheia (lightbox) para fotos e vídeos ao clicar.

# Simulador de Dimensões

- [x] Incluir inputs numéricos manuais sincronizados em tempo real com as barras de Largura da Base, Altura da Cumeeira e Comprimento.
- [x] Tornar os campos manuais o controle principal, aceitando vírgula ou ponto e mantendo os sliders como alternativa.
- [x] Permitir qualquer medida positiva nos campos manuais, sem teto de 10 m, mantendo as recomendações apenas como referência.
- [x] Exibir o alerta de múltiplos EPS de forma sempre visível no painel de dimensões, inclusive antes dos resultados, com estado inicial orientativo.
- [x] Registrar em código o conteúdo do alerta de múltiplos EPS mostrando claramente ajuste recomendado, formas inteiras e formas cortadas para cada dimensão relevante.





# Novos Recursos Solicitados (Itens 1, 2 e 3)

- [x] Implementar filtros por tipo de obra/mídia (Vídeos, Fotos de Blocos EPS, Folders/Catálogos) na galeria de Obras ICF, com contadores, resumo de resultados e estados acessíveis.
- [x] Adicionar gráficos visuais de economia de EPS e gráficos comparativos de insumos estruturais (concreto, aço, revestimento e fundação) ao relatório técnico em PDF.
- [x] Implementar botões de compartilhamento direto do relatório técnico via WhatsApp e e-mail com os clientes, com fallback para download e anexo manual.
- [x] Corrigir a tolerância numérica do cálculo de formas inteiras/cortadas para não gerar cortes falsos em múltiplos como 3,60m ÷ 0,40m.
# Área de Patrocinadores (Sponsorships)

- [x] Criar tabela `sponsors` no banco MySQL/TiDB com campos para título, descrição, imagem/logo, link externo, ordem de exibição e status ativo.
- [x] Adicionar procedimentos tRPC para listar, criar, atualizar e excluir posts de patrocinadores (protegidos para administradores).
- [x] Desenvolver a interface administrativa no painel gerencial para gerenciar os patrocinadores com upload direto de imagens.
- [x] Criar o componente público de exibição de patrocinadores em destaque no site e no simulador.
- [x] Adicionar colunas `address`, `website` e `phone` na tabela `sponsors` e atualizar o esquema Drizzle.
- [x] Atualizar os procedimentos tRPC e rotas de criação/atualização de sponsors para suportar endereço, site e telefone.
- [x] Ajustar o CSS e o container de imagem dos patrocinadores (`object-contain bg-white`) para exibir corretamente qualquer tamanho de logo ou banner sem cortes.
- [x] Atualizar `SponsorsAdminPanel.tsx` e `SponsorsCarousel.tsx` para incluir os novos campos de contato.
- [x] Adicionar rota tRPC administrativa `removeSponsorImage` para limpar a URL da imagem de um patrocinador.
- [x] Atualizar `SponsorsAdminPanel.tsx` com o botão exclusivo para o administrador excluir a imagem do patrocinador.
- [x] Criar o componente `SponsorsSidebar.tsx` em coluna lateral direita fixa de cima a baixo com tamanho padrão.
- [x] Ajustar o layout principal do simulador para acomodar a coluna lateral direita de patrocinadores em tamanho padronizado de cima a baixo.
- [x] Remover o comportamento `sticky` da coluna de patrocinadores em `AFrameSimulator.tsx` para que os vários posts de patrocinadores fluam naturalmente de cima a baixo junto com a rolagem da página.
# Sistema de Anúncios e Patrocínios Geolocalizados (Ad Manager)

- [x] Criar tabelas para Categorias (`ad_categories`), Campanhas (`ad_campaigns`), Criativos (`ad_creatives`), Slots (`ad_slots`), Impressões (`ad_impressions`), Cliques (`ad_clicks`) e Logs de Frequência no esquema Drizzle.
- [x] Implementar motor de pontuação (Sponsor Score), geolocalização por Nível (City, State, Regional, National), Frequency Capping e rotação ponderada no backend (`server/adEngine.ts` e `server/routers.ts`).
- [x] Desenvolver o componente de carregamento progressivo (lazy loading) com múltiplos slots na coluna lateral direita (`SponsorsSidebar.tsx`).
- [x] Criar o painel administrativo de campanhas, criativos, inventário e analytics no dashboard.
# Auditoria e Prova do Ad Manager

- [ ] Consolidar schema oficial com logs de frequência e migração Drizzle sincronizada.
- [ ] Expandir o motor (`server/adEngine.ts`) para suportar planos Regionais com múltiplas cidades, state-level, national fallback, frequency capping rigoroso por sessão/dia, rotação ponderada e pontuação (Sponsor Score).
- [ ] Criar testes unitários e de integração abrangentes (`server/adManager.test.ts`) cobrindo 100% dos cenários de geolocalização e pontuação.
- [ ] Apresentar relatório formal de auditoria com tabela de conformidade, evidências e resultados dos testes.
