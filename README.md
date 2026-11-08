# Falls Records Site

Site oficial da Falls Records para apresentar a gravadora, artistas e lançamentos.

## Estado do projeto

- Esta é a cópia de trabalho conectada ao GitHub (`main` / `origin`). Faça alterações nesta pasta; `github-upload-staging/` é uma cópia antiga e não publica o site.
- A página inicial em construção está em `src/pages/index.astro`.
- O layout compartilhado está em `src/layouts/BaseLayout.astro`.
- `prototype-v0/` guarda a primeira versão estática como referência; não é a versão ativa.
- O conteúdo e os estilos estão em `src/`; os arquivos públicos ficam em `public/assets/`.
- Mantenha os originais no Google Drive e, se necessário, temporariamente em `media-source/` (pasta local ignorada pelo Git e pelo site). Em `public/assets/`, coloque apenas cópias aprovadas, otimizadas e prontas para publicação; tudo nessa pasta é incluído no site público.
- Pastas de mídia: `images/artists/`, `images/releases/`, `images/carousel/`, `logos/` e `audio/`. Use nomes descritivos, minúsculos e sem espaços (por exemplo, `rise-rise-forks-live.jpg`).
- A página mantém apenas informações já identificadas; perfis e lançamentos serão completados com nomes, textos, imagens autorizadas e links oficiais fornecidos pela gravadora.
- O catálogo começa simples, em arquivos do projeto; um CMS pode ser avaliado mais adiante.

O manual de marca atual é provisório. A logo otimizada está aplicada no cabeçalho; confirme se é a versão final da marca. Confirme também as licenças de uso das fontes.

## Atenção aos arquivos de mídia atuais

Os PNGs originais recebidos ficam em `media-source/` e não são enviados ao GitHub nem copiados para o site. A imagem otimizada atual está na faixa de artistas em `public/assets/images/carousel/`; a logo otimizada está em `public/assets/logos/`. Confirme autorização para publicar as imagens.

## Tecnologias

- Astro para páginas com foco em conteúdo e geração estática.
- TypeScript para validar código e dados conforme o projeto crescer.
- CSS para implementar a identidade visual e os layouts responsivos.

## Iniciar localmente

```bash
npm install
npm run dev
```

O terminal mostrará o endereço local para abrir no navegador.

## Preparar publicação

```bash
npm run check
npm run build
npm run preview
```

A saída estática será gerada em `dist/`.

## Rádio Falls — prévia com apresentador de IA

A rádio de teste toca vídeos oficiais do YouTube somente depois que a pessoa aperta **Ouvir**. Entre as faixas, um Cloudflare Worker gera uma chamada curta usando a API da OpenAI; a voz é sintetizada pelo navegador do ouvinte. Sem o Worker configurado, as faixas continuam tocando, mas as chamadas de IA não são geradas.

Esta prévia inclui três vídeos já vinculados aos lançamentos do site: “Soft Sparks”, de Duaveira; “You Should Care Less”, de Rise Rise, Forks; e “Hurt Only”, de Rebecca Silveiras. Para adicionar faixas, confirme que há um vídeo oficial e autorização para a reprodução incorporada, e atualize a seleção em `src/pages/index.astro` e a lista permitida em `radio-worker/src/index.js`.

### Configurar o serviço de IA

1. Crie ou acesse uma conta Cloudflare com Workers e habilite o uso da API da OpenAI, incluindo faturamento e um limite de gastos adequado.
2. Em `radio-worker/wrangler.jsonc`, configure `ALLOWED_ORIGIN` com a origem exata do site publicado. Para GitHub Pages neste repositório, use `https://lucas-duaveira.github.io`.
3. Na pasta `radio-worker/`, faça o deploy com Wrangler e salve a chave da OpenAI como segredo do Worker (nunca no código do site):

   ```bash
   npx wrangler secret put OPENAI_API_KEY
   npx wrangler deploy
   ```

4. Configure `PUBLIC_RADIO_HOST_API_URL` como variável de ambiente do build do Astro, com a URL HTTPS do Worker, incluindo a rota `/`. No GitHub, adicione-a em **Settings → Secrets and variables → Actions → Variables** para que o workflow de publicação a receba. Para testar localmente com o Worker publicado, coloque a URL em `.env` como `PUBLIC_RADIO_HOST_API_URL=https://...workers.dev/`.
5. Publique o site novamente e teste o botão Rádio. O Worker limita chamadas por endereço IP e aceita apenas IDs de faixas cadastradas.

Para testar a IA inteiramente no computador, crie `radio-worker/.dev.vars` com `ALLOWED_ORIGIN=http://localhost:4321` e `OPENAI_API_KEY=...`; o arquivo é ignorado pelo Git. Rode `npx wrangler dev` dentro de `radio-worker/` e defina `PUBLIC_RADIO_HOST_API_URL=http://localhost:8787/` no `.env` da raiz. A origem permitida local substitui a configuração de produção apenas durante o Worker local.

Chamadas à API podem gerar custos. A voz usa a síntese de fala disponível no navegador e varia conforme o dispositivo. Antes de lançar uma rádio pública permanente, confirme os direitos de reprodução, inclusive licenciamento e obrigações aplicáveis.

## Prévia de teste no GitHub Pages

- Endereço: <https://lucas-duaveira.github.io/falls-records-site/>
- O repositório e esta prévia são públicos e servem apenas para avaliação do protótipo.
- Cada envio para a branch `main` inicia uma publicação automática pelo GitHub Actions.
- Para abrir o site localmente, use `npm run dev`; o endereço local não é acessível por outras pessoas.

A hospedagem definitiva, o domínio próprio e os requisitos profissionais de segurança serão escolhidos antes do lançamento oficial.
