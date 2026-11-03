
# BladeApp – Sistema Web de Agendamento para Barbearia

Projeto acadêmico desenvolvido na disciplina de Prática Profissional em Análise e Desenvolvimento de Sistemas, da Universidade Presbiteriana Mackenzie.

O BladeApp tem como objetivo facilitar o agendamento de serviços em barbearias, permitindo que os clientes consultem serviços, escolham barbeiros e horários disponíveis e acompanhem suas reservas.

## Integrantes

| Integrante | RA |
|---|---|
| Alberto Edson Galbiatte Junior | 10110306 |
| Douglas Vieira da Silva | 10729706 |
| Gustavo Machado Resende | 10728414 |
| Melissa de Souza Venturim Pacheco | 10740141 |
| Natan Motta Valladão | 10728863 |

## Links do projeto

- **Aplicação:** https://bldapp.vercel.app
- **Repositório:** https://github.com/melissaventurim/projeto-barbearia
- **Quadro de acompanhamento:** https://trello.com/b/nw0qXhdA/projeto-barbearia

## Tecnologias utilizadas

- Next.js
- React
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL (Neon)
- Better Auth

## Funcionalidades

O sistema contempla os seguintes recursos:

### Cliente
- Cadastro e login.
- Consulta dos serviços disponíveis.
- Consulta de barbeiros e horários.
- Agendamento de serviços.
- Consulta e cancelamento de agendamentos.

### Administrador
- Gerenciamento de serviços, barbeiros e horários.
- Gerenciamento de agendamentos.

### Barbeiro
- Consulta da própria agenda.
- Marcação de atendimentos como concluídos.

## Requisitos para execução

Antes de iniciar, é necessário ter instalado:

- Node.js (versão 20.9 ou superior).
- npm.
- Banco de dados PostgreSQL.
- Conta no Neon para disponibilizar o banco de dados.

## Como executar o projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/melissaventurim/projeto-barbearia.git
```

### 2. Acessar a pasta

```bash
cd projeto-barbearia
```

### 3. Instalar as dependências

```bash
npm install
```

### 4. Configurar as variáveis de ambiente

Na raiz do projeto, copie o arquivo `.env.example` e renomeie a cópia para `.env`.

Preencha as variáveis:

```env
DATABASE_URL=
DIRECT_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

**Descrição das variáveis:**

- `DATABASE_URL`: endereço de conexão do PostgreSQL pelo pooler do Neon.
- `DIRECT_URL`: endereço de conexão direta do PostgreSQL no Neon.
- `BETTER_AUTH_SECRET`: chave secreta utilizada pelo sistema de autenticação.
- `BETTER_AUTH_URL`: endereço da aplicação utilizado pela autenticação.
- `NEXT_PUBLIC_APP_URL`: endereço público da aplicação.
- `ADMIN_EMAIL`: e-mail do administrador inicial.
- `ADMIN_PASSWORD`: senha do administrador inicial, com pelo menos 8 caracteres.

Os endereços de conexão podem ser obtidos no painel do Neon, na opção de conexão do banco de dados.

Para gerar uma chave secreta, pode ser utilizado:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Preparar o banco de dados

Gerar o Prisma Client:

```bash
npx prisma generate
```

Aplicar as migrações:

```bash
npx prisma migrate deploy
```

### 6. Criar o administrador inicial

Após configurar o banco de dados e as variáveis de ambiente, execute:

```bash
npm run seed
```

O comando utiliza o e-mail e a senha definidos em `ADMIN_EMAIL` e `ADMIN_PASSWORD` para criar o usuário administrador inicial.

### 7. Executar a aplicação

```bash
npm run dev
```

A aplicação estará disponível em:

http://localhost:3000

## Outros comandos

| Comando | Descrição |
|---|---|
| `npm run dev` | Executa o ambiente de desenvolvimento |
| `npm run build` | Executa as migrações e gera a versão de produção |
| `npm run start` | Inicia a aplicação em produção |
| `npm run lint` | Executa a verificação de código |
| `npm run seed` | Cria o administrador inicial |

## Segurança

- Não compartilhar arquivos `.env`.
- Não publicar senhas ou chaves de acesso no repositório.
- Utilizar variáveis de ambiente para armazenar informações sensíveis.
- Respeitar as permissões de acesso de cada perfil de usuário.

---

**BladeApp – Prática Profissional em Análise e Desenvolvimento de Sistemas.**
