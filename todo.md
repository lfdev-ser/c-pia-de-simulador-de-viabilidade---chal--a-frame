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

# Pendências técnicas pré-existentes

- [ ] Implementar recuperação de senha com token e fluxo de redefinição.
- [ ] Integrar envio real de e-mails de verificação e deixar de retornar tokens diretamente pela API.
- [ ] Substituir armazenamento de senha em texto puro por hash seguro.
- [ ] Implementar painel administrativo para gerenciamento de usuários.
- [ ] Remover a simulação de confirmação de e-mail do ambiente de produção.
- [x] Corrigir o erro legado de declaração duplicada reportado no Home.tsx, se ainda reproduzido no navegador.

# Nota de escopo

- [ ] Manter preferências puramente visuais, como tema e largura da barra lateral, no armazenamento local do navegador; persistir no banco os dados de negócio e simulações do usuário.
