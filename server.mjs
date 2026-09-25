import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {createHash,timingSafeEqual} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const assets={'/':'index.html','/app.js':'app.js','/style.css':'style.css','/manifest.webmanifest':'manifest.webmanifest','/icon.svg':'icon.svg','/apple-touch-icon.png':'apple-touch-icon.png'};
const types={html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8',webmanifest:'application/manifest+json',svg:'image/svg+xml',png:'image/png'};
const digest=x=>createHash('sha256').update(x).digest();
export function createApp(env=process.env,request=fetch){
  let pending=0; const requests=[];
  return http.createServer(async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','no-referrer');
    res.setHeader('Cache-Control','no-store');
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(data));};
    const path=new URL(req.url,'http://localhost').pathname;
    if(req.method==='GET'&&path==='/health') return json(200,{ok:true});
    if(req.method==='GET'&&assets[path]){
      try{const file=assets[path];const data=await readFile(new URL('./public/'+file,import.meta.url));res.writeHead(200,{'Content-Type':types[file.split('.').pop()]});res.end(data);}catch{json(404,{error:'File non trovato'});}return;
    }
    if(req.method==='POST'&&path==='/api/tts'){
      if(!env.FRANCO_XTTS_URL)return json(503,{error:'XTTS non configurato; uso la voce dell’iPhone.'});
      let raw='';for await(const chunk of req){raw+=chunk.toString();if(Buffer.byteLength(raw)>12000)return json(413,{error:'Testo vocale troppo lungo'});}
      let data;try{data=JSON.parse(raw);}catch{return json(400,{error:'Richiesta non valida'});}
      if(typeof data.text!=='string'||!data.text.trim())return json(400,{error:'Testo vocale mancante'});
      try{const upstream=await request(env.FRANCO_XTTS_URL.replace(/\/$/,'')+'/tts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:data.text.slice(0,6000),language:data.language||'it',speaker:data.speaker||env.FRANCO_XTTS_SPEAKER}),signal:AbortSignal.timeout(180000)});if(!upstream.ok)return json(502,{error:'XTTS non disponibile'});res.writeHead(200,{'Content-Type':'audio/wav','Cache-Control':'no-store'});res.end(Buffer.from(await upstream.arrayBuffer()));}catch{json(502,{error:'Connessione XTTS fallita'});}return;
    }
    if(req.method!=='POST'||path!=='/api/chat') return json(404,{error:'Non trovato'});
    if(!env.OPENROUTER_API_KEY) return json(503,{error:'OpenRouter non è configurato sul server.'});
    if(!req.headers['content-type']?.startsWith('application/json')) return json(415,{error:'Formato non valido'});
    while(requests.length&&requests[0]<Date.now()-60000)requests.shift();
    if(pending>=2||requests.length>=20)return json(429,{error:'Troppe richieste. Attendi un minuto.'});
    requests.push(Date.now());pending++;
    try{
      let raw=''; for await(const chunk of req){raw+=chunk.toString();if(Buffer.byteLength(raw)>64000){json(413,{error:'Conversazione troppo lunga'});return;}}
      let data;try{data=JSON.parse(raw);}catch{return json(400,{error:'Richiesta non valida'});}
      const messages=data.messages;
      if(!Array.isArray(messages)||!messages.length||messages.length>30||messages.some(m=>!m||!['user','assistant'].includes(m.role)||typeof m.content!=='string'||!m.content.trim()||m.content.length>8000)||messages.at(-1).role!=='user')return json(400,{error:'Messaggi non validi o troppo lunghi.'});
      const upstream=await request('https://openrouter.ai/api/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+env.OPENROUTER_API_KEY,'Content-Type':'application/json','X-Title':'Franco iPhone'},body:JSON.stringify({model:env.FRANCO_OPENROUTER_MODEL||'openrouter/auto',max_tokens:4000,messages:[{role:'system',content:'Sei Franco, assistente personale di lingua italiana. Rispondi in modo utile, chiaro e completo. Non accorciare, troncare o riassumere automaticamente le risposte: segui la richiesta dell’utente e termina sempre il ragionamento. Questa versione iPhone offre conversazione e lettura vocale. Non hai accesso al PC, ai file, a strumenti, a notizie in tempo reale o alla domotica. Non dichiarare di aver eseguito azioni.'},...messages]}),signal:AbortSignal.timeout(60000)});
      if(!upstream.ok)return json(502,{error:upstream.status===402?'Credito OpenRouter insufficiente.':'OpenRouter non disponibile (HTTP '+upstream.status+').'});
      const body=await upstream.json();const answer=body.choices?.[0]?.message?.content;
      if(typeof answer!=='string'||!answer.trim())return json(502,{error:'Il modello non ha restituito una risposta. Riprova.'});
      json(200,{answer:answer.trim()});
    }catch{if(!res.writableEnded)json(502,{error:'Connessione interrotta o tempo scaduto. Riprova.'});}finally{pending--;}
  });
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const server=createApp();server.requestTimeout=75000;server.headersTimeout=15000;
 server.listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('Franco iPhone pronto'));
}
