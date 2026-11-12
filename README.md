# Ia.stify – hospedar na Vercel

1. Suba esta pasta num repositório do GitHub (ou rode `npx vercel` dentro dela). A raiz do projeto é esta pasta; framework preset: **Other**.
2. No projeto da Vercel, aba **Storage**: crie um **Blob** e um **Upstash Redis** (Marketplace) e conecte os dois ao projeto. Isso cria sozinho as variáveis `BLOB_READ_WRITE_TOKEN` e `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` (ou `KV_REST_API_*`).
3. Faça o deploy (ou Redeploy depois de conectar os storages).

Estrutura: `index.html` (site), `api/rpc.js` (contas, dados, curtidas, comentários), `api/upload.js` (envio de mp3/imagens para o Blob), `api/_r.js` (Redis).
