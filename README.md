# VW Safety Dashboard

Aplicação web em React para monitorar recalls e dados homologados de veículos Volkswagen a partir dos registros oficiais da NHTSA (agência de segurança viária dos Estados Unidos). Este README reúne tudo o que o time precisa para clonar, instalar, entender o fluxo de dados e manter o projeto.

## Visão geral

- Dashboard autenticado que consolida indicadores de recalls, modelos cadastrados e estatísticas por ano.
- Consulta direta aos endpoints públicos da NHTSA para modelos, tipos de veículo, decodificação de VIN e campanhas de recall.
- Páginas dedicadas para exploração de modelos e de recalls com filtros, paginação e visualizações gráficas.
- Login mockado para simular fluxo de autenticação corporativa e proteger rotas internas.

## Principais funcionalidades

- **Dashboard**: cards resumidos, gráfico de barras com recalls por ano e decoder de VIN integrado.
- **Catálogo de modelos**: busca textual, contagem de tipos de veículo e controle de paginação.
- **Recalls**: filtros por ano/modelo/componente, gráfico de pizza por componente e tabela detalhada com resumo.
- **Autenticação mock**: armazenamento de sessão local, expiração automática e controle de acesso via TanStack Router.

## API consumida

Utilizamos dados reais da NHTSA (National Highway Traffic Safety Administration), órgão federal dos EUA responsável por normatização e segurança de veículos. Os endpoints são públicos e não exigem credenciais.

| Endpoint | Uso |
| --- | --- |
| `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/{make}?format=json` | Lista modelos homologados para a marca informada. |
| `https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMake/{make}?format=json` | Retorna categorias/tipos de veículos associados à marca. |
| `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/{vin}?format=json` | Decodifica VINs e exibe informações de fabricação. |
| `https://api.nhtsa.gov/recalls/recallsByManufacturer?manufacturer={nome}` | Recupera recalls registrados para o fabricante. |
| `https://api.nhtsa.gov/recalls/recallsByVehicle?make={make}&model={model}&modelYear={ano}` | Detalha recalls por modelo e ano (base do agregador). |

> Observação: os dados são atualizados pela NHTSA. O projeto agrega recalls de 2020 a 2025 para principais modelos VW (Taos, Tiguan, Atlas, Jetta e ID.4).

## Stack técnica

| Tecnologias | Uso no projeto |
| --- | --- |
| React 19 + TypeScript | SPA tipada, componentes reutilizáveis e DX moderna. |
| Vite | Dev server rápido, build e preview de produção. |
| TanStack Router | Roteamento declarativo com proteção de rotas e prefetch. |
| TanStack React Query | Cache, sincronização de dados da NHTSA e estados de loading. |
| React Hook Form + Zod | Formulários tipados com validação (ex.: decoder de VIN). |
| Tailwind CSS + design-system (Radix + shadcn/ui) | Estilização consistente e componentes acessíveis. |
| Recharts | Visualizações (gráfico de barras e pizza). |
| ESLint + TypeScript ESLint | Padronização de código. |
| Vitest + Testing Library + MSW | Testes unitários/componentes e mocks de API (quando adicionados). |

## Pré-requisitos

- Node.js 20.x LTS (ou superior).

## Instalar e rodar localmente

1. Clonar o repositório  
   `git clone https://seu-repo/vw-safety-dashboard.git`
2. Acessar a pasta do projeto  
   `cd vw-safety-dashboard`
3. Instalar dependências  
   `npm install`
4. Rodar ambiente de desenvolvimento  
   `npm run dev`  
   A aplicação sobe em `http://localhost:5173`.

## Scripts npm disponíveis

- `npm run dev`: inicia o servidor Vite com HMR.
- `npm run build`: gera artefatos de produção (TypeScript + Vite).
- `npm run preview`: serve o build gerado para validação final.
- `npm run lint`: executa ESLint em todo o projeto.

> Testes automatizados: execute `npm run test` para rodar toda a suíte ou `npm run test -- src/tests/{path}` para um arquivo específico.

## Estrutura principal de pastas

```text
src/
  app/              # Configuração do router TanStack e root layout
  components/       # Componentes compartilhados do frontend
  design-system/    # Tokens e wrappers do design system (shadcn/ui)
  features/         # Domínios (ex.: auth) com hooks, serviços e storage
  layouts/          # Layouts reutilizáveis
  lib/              # APIs, utils de formato, query-client, etc.
  pages/            # Páginas montadas pelo router (dashboard, models, recalls, login)
  styles/           # Configurações globais de estilo
  main.tsx          # Bootstrap React + TanStack Router + QueryClient
```

## Notas sobre dados e agregações

- `getAggregatedVolkswagenRecalls` combina os dados do endpoint `recallsByVehicle` para cada modelo/ano definido em `VOLKSWAGEN_RECALL_SOURCES`.
- A lista atual cobre anos de 2020 a 2025 para manter o dashboard atualizado com os recalls mais recentes.
- O cache dos requests é controlado pelo React Query para reduzir chamadas repetidas e melhorar a UX.

