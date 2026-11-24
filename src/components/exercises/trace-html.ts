import { HANZI_WRITER_JS } from "@/content/generated/hanzi-writer-lib";

type CharData = { strokes: string[]; medians: number[][][] };

/** Página HTML autocontenida que dibuja y evalúa el trazo con hanzi-writer. */
export const buildTraceHtml = (ch: string, data: CharData | undefined) => `<!doctype html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>html,body{margin:0;background:transparent;overflow:hidden;touch-action:none;-webkit-user-select:none;user-select:none}
#g{display:flex;justify-content:center;align-items:center;height:100vh}
svg{background:#FFFDF6;border-radius:20px;border:3px solid #E3DDCF;box-sizing:border-box}</style></head>
<body><div id="g"></div>
<script>${HANZI_WRITER_JS}</script>
<script>
var CH=${JSON.stringify(ch)};var CD=${data ? JSON.stringify(data) : "null"};
function post(m){var s=JSON.stringify(m);if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(s)}else{window.parent.postMessage(s,'*')}}
var W=Math.max(180,Math.min(window.innerWidth-8,window.innerHeight-8,340));
var writer=HanziWriter.create('g',CH,{width:W,height:W,padding:16,showOutline:true,showCharacter:false,
 strokeColor:'#1F2A2E',outlineColor:'#D9D4C7',drawingColor:'#1F7A5A',highlightColor:'#FFC043',drawingWidth:14,
 showHintAfterMisses:2,highlightOnComplete:true,leniency:1.25,
 charDataLoader:function(c,ok,err){if(CD){ok(CD);return}
  fetch('https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/'+encodeURIComponent(c)+'.json').then(function(r){return r.json()}).then(ok).catch(err)}});
function quiz(){writer.quiz({onMistake:function(){post({type:'mistake'})},onComplete:function(s){post({type:'done',mistakes:s.totalMistakes})}})}
function handle(cmd){
 if(cmd==='animate'){writer.cancelQuiz();writer.animateCharacter({onComplete:function(){setTimeout(function(){writer.hideCharacter();quiz()},500)}})}
 if(cmd==='reset'){writer.cancelQuiz();writer.hideCharacter();quiz()}
}
window.addEventListener('message',function(e){try{var d=typeof e.data==='string'?JSON.parse(e.data):e.data;if(d&&d.cmd){handle(d.cmd)}}catch(_){}});
post({type:'ready'});quiz();
</script></body></html>`;
