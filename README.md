# Franco iPhone

Web app installabile su iPhone con chat OpenRouter e lettura vocale. Il server conserva la chiave OpenRouter; il browser non riceve mai la chiave.

## Funzioni

- Chat con OpenRouter, modello configurabile.
- Risposte complete senza troncamento automatico.
- Voce italiana nativa dell’iPhone tramite SpeechSynthesis.
- Proxy XTTS opzionale tramite `FRANCO_XTTS_URL`.
- Interfaccia PWA: Safari → Condividi → Aggiungi alla schermata Home.
- Health check `/health` e test automatici senza consumo API.

## Avvio locale

Richiede Node.js 22 o successivo.

```powershell
Copy-Item .env.example .env
# inserisci OPENROUTER_API_KEY nel file .env
node --env-file=.env server.mjs
```

Apri `http://localhost:3000`. Per i test:

```powershell
npm test
```

## Pubblicazione su Render

Il file `render.yaml` configura il Web Service. Collega questo repository a Render e imposta `OPENROUTER_API_KEY` come variabile segreta. `FRANCO_OPENROUTER_MODEL` usa `openrouter/auto` se non viene specificato.

Il piano gratuito può sospendere il servizio dopo inattività; la prima richiesta successiva può quindi richiedere più tempo. Il deploy usa `node server.mjs` e il controllo `/health`.

## XTTS

XTTS richiede un server separato raggiungibile via HTTPS:

```text
FRANCO_XTTS_URL=https://server-xtts.example
FRANCO_XTTS_SPEAKER=Ludvig Milivoj
```

Quando XTTS non è configurato o non risponde, l’app usa automaticamente la voce dell’iPhone.

## Privacy e sicurezza

Non committare `.env`, chiavi API o token. La demo pubblica senza password usa il credito OpenRouter di chi gestisce il servizio: limita l’accesso tramite il tuo hosting, un reverse proxy con autenticazione o un piano privato prima di condividere l’URL.

La cronologia resta nella memoria della pagina e viene cancellata ricaricando o usando “Cancella la chat”. I messaggi inviati vengono elaborati da OpenRouter.

## Licenza

MIT, vedere `LICENSE`.
