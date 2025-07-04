# 🎓 Unisinos - Banca Fácil

Sistema web para gerenciamento de bancas de TCC da Universidade do Vale do Rio dos Sinos (Unisinos).

## 📋 Sobre o Projeto

O **Banca Fácil** é uma aplicação desenvolvida para facilitar o processo de agendamento, organização e gerenciamento de bancas de Trabalho de Conclusão de Curso (TCC) na Unisinos. O sistema oferece uma interface moderna e intuitiva para coordenadores.

## 🚀 Tecnologias Utilizadas

### Frontend
- **React** - Biblioteca para construção da interface
- **Vite** - Build tool e dev server
- **TailwindCSS** - Framework CSS para estilização
- **React Router Dom** - Roteamento da aplicação

### UI/UX
- **Radix UI** - Componentes acessíveis e customizáveis
  - Dialog, Select, Tabs, Tooltip, Switch, etc.
- **Lucide React** - Biblioteca de ícones
- **Class Variance Authority** - Utilitário para variantes de componentes

### Estado e Dados
- **TanStack Query** - Gerenciamento de estado servidor
- **Axios** - Cliente HTTP para requisições
- **React Query DevTools** - Ferramentas de desenvolvimento

### Utilitários
- **date-fns** - Manipulação de datas
- **clsx & tailwind-merge** - Utilitários para classes CSS

## 📁 Estrutura do Projeto

- **src/assets/** - Imagens, ícones e recursos estáticos
- **src/components/** - Componentes reutilizáveis
- **src/pages/** - Páginas da aplicação
- **src/services/** - Serviços de API e integração
- **src/hooks/** - Custom hooks
- **src/utils/** - Funções utilitárias
- **src/lib/** - Configurações de bibliotecas
- **src/App.jsx** - Componente principal
- **src/main.jsx** - Ponto de entrada da aplicação
- **src/index.css** - Estilos globais

## ⚙️ Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

## 🔧 Instalação e Execução

### 1. Clone o repositório
- git clone https://github.com/kevin-kuhn/tcc-board.git
- cd tcc-board

### 2. Instale as dependências
- npm install

### 3. Execute o projeto
- npm run dev

A aplicação estará disponível em http://localhost:5173

- As credenciais de teste são
	- Email: professor@unisinos.com
	- Senha: 123456

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a build de produção
- `npm run preview` - Visualiza a build de produção localmente
- `npm run lint` - Executa o linter para verificar qualidade do código

## 🏗️ Build de Produção

Execute `npm run build` para criar a build otimizada na pasta `dist/`.

## 🤝 Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 👥 Desenvolvido por

Projeto desenvolvido no estágio obrigatório na Universidade do Vale do Rio dos Sinos (Unisinos) por Kevin Mulinari Kuhn.

## 📄 Licença

Este projeto é desenvolvido como parte do estágio obrigatório da Unisinos.