# Franco per iPhone

Versione web autonoma: chat OpenRouter e voce italiana del telefono, senza dipendere dal PC dopo la pubblicazione. Richiede Internet e un hosting Node.js 22 o successivo. Non e' ancora pubblicata e non e' un'app App Store.

## Pubblicazione su Render

1. Crea un repository privato GitHub e carica il CONTENUTO di questa cartella alla radice, incluso render.yaml. Non caricare file .env o la cartella Franco completa.
2. Accedi a https://dashboard.render.com e crea un Blueprint collegato al repository. Esamina il piano e il prezzo proposti prima di confermare. Il pacchetto non acquista servizi.
3. Imposta OPENROUTER_API_KEY nelle variabili segrete del servizio. Usa preferibilmente una nuova chiave, dato che quella precedente e' stata condivisa in chat. FRANCO_OPENROUTER_MODEL seleziona il modello.
4. Render genera FRANCO_ACCESS_TOKEN: copiala dalle variabili del servizio e usala come password personale nell'app. E' diversa dalla chiave OpenRouter. Con configurazione manuale deve essere casuale e lunga almeno 24 caratteri.
5. Attendi la pubblicazione e apri l'indirizzo HTTPS assegnato da Render con Safari sull'iPhone.
6. In Safari scegli Condividi > Aggiungi alla schermata Home, quindi apri Franco dalla nuova icona.

Documentazione hosting: https://render.com/docs/blueprint-spec e https://render.com/docs/web-services

## Utilizzo

Inserisci la password personale in Accesso e voce. Scrivi oppure usa il microfono della tastiera iPhone per dettare. Dopo la risposta tocca Ascolta; scegli la voce italiana disponibile e usa Ferma voce per interrompere. La lettura viene avviata dal tocco per rispettare le restrizioni del browser. Le voci dipendono da quelle disponibili su iOS.

La chiave OpenRouter resta sul server. La password e la conversazione sono mantenute in memoria nella pagina: ricaricarla le cancella. Esci e cancella la chat le rimuove subito. I messaggi vengono inviati a OpenRouter per generare le risposte. Non e' prevista sincronizzazione con le memorie del PC.

Questa versione offre chat e sintesi vocale, senza XTTS o strumenti desktop, domotica, ricerca web in tempo reale o ascolto continuo in background. A PC spento funzionera' quando l'hosting sara' attivo; non basta avviarla localmente. Un eventuale hosting con sospensione puo' richiedere attesa alla prima richiesta.

## Verifica locale

Con Node.js 22+: copia .env.example in .env e inserisci i valori, poi esegui:

    node --env-file=.env server.mjs

Apri http://localhost:3000 sul PC. Test automatici:

    node --test

I test usano risposte simulate: non consumano credito OpenRouter. Verificare dopo la pubblicazione una risposta reale, Ascolta, Ferma voce e l'icona Home direttamente sull'iPhone.

Voce browser: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/speak
