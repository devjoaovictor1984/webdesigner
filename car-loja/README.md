# AutoVitrine PWA — refatoração inicial

Este pacote **não é o sistema final em produção**. Ele é uma **base funcional de front-end + PWA** para validar UX, fluxo de cadastro e estrutura do dashboard.

## O que já entrega

- landing page mobile first
- filtro rápido no front
- cards com botão de WhatsApp preenchido automaticamente
- dashboard com:
  - cadastro de veículo
  - edição
  - exclusão
  - ativo/inativo
  - busca
  - paginação
  - marcas e modelos pré-populados
  - cadastro manual de novas marcas e modelos
  - configurações da loja (nome, WhatsApp, cidade)
- PWA básico com `manifest` e `service-worker`
- persistência local via `localStorage`
- imagem de capa via câmera/galeria do celular (`accept="image/*" capture="environment"`)

## Limitações reais desta base

Sem fantasia:

1. **Não há autenticação real**.
2. **Não há multiusuário real**.
3. **Não há banco na nuvem**.
4. **Não há upload real em storage**.
5. **A imagem fica salva localmente no navegador**, o que serve para protótipo, não para produção séria.
6. **Sem URL amigável por slug** e sem SEO completo por veículo.
7. **Sem proteção contra perda de dados no navegador**.

## Tecnologia recomendada para produção

Para esse caso, a escolha mais equilibrada é:

- **Vite + React + TypeScript**
- **Supabase**
  - Auth
  - Postgres
  - Storage
  - Row Level Security
- **vite-plugin-pwa**

### Motivo técnico

Seu caso tem:
- relacionamento entre **loja > marcas > modelos > veículos**
- busca administrativa
- paginação
- status ativo/inativo
- upload de fotos
- isolamento por cliente/loja
- filtros no catálogo

Isso funciona em Firebase, mas a modelagem e a busca ficam mais limitadas. Em produção, **Supabase/Postgres encaixa melhor** porque resolve relacionamento, filtros e governança com menos gambiarra. Supabase fornece banco relacional, storage e regras por usuário no mesmo stack.

## Estrutura sugerida de produção

```txt
src/
  app/
  components/
  features/
    auth/
    dashboard/
    vehicles/
    catalog/
    settings/
  lib/
    supabase.ts
    whatsapp.ts
    currency.ts
  data/
  routes/
public/
```

## Próximo passo sério

1. migrar esta base visual para React
2. subir Auth + Postgres + Storage no Supabase
3. criar tabela de lojas
4. criar tabela de veículos
5. criar tabela de marcas e modelos
6. criar bucket de imagens
7. ligar filtros e paginação em consultas reais

## Como abrir

Por ser PWA, rode com servidor local. Exemplo:

```bash
npx serve .
```

ou abra com Live Server no VS Code.

## Arquivos principais

- `index.html` → vitrine pública
- `dashboard.html` → dashboard administrativo
- `js/store.js` → persistência local
- `js/catalog.js` → marcas e modelos base
- `js/app.js` → front da vitrine
- `js/dashboard.js` → CRUD e dashboard
