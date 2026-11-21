const API='https://codeforces.com/api/problemset.problems';
const CACHE_KEY='cf-randomizer-problems-v1';
let problems=[];let recent=new Set();
const $=id=>document.getElementById(id);
function setStatus(message,error=false){$('status').textContent=message;$('status').className='status'+(error?' error':'')}
async function loadProblems(){
  $('randomBtn').disabled=true;
  try{
    const cached=localStorage.getItem(CACHE_KEY);
    if(cached){const parsed=JSON.parse(cached);if(Date.now()-parsed.time<6*60*60*1000&&Array.isArray(parsed.problems)){problems=parsed.problems;setStatus(`Ready · ${problems.length.toLocaleString()} problems loaded`);$('randomBtn').disabled=false;return;}}
    const response=await fetch(API);if(!response.ok)throw new Error('Could not reach Codeforces.');
    const data=await response.json();if(data.status!=='OK')throw new Error(data.comment||'Codeforces API returned an error.');
    problems=data.result.problems.filter(p=>p.contestId&&p.index&&p.name);
    localStorage.setItem(CACHE_KEY,JSON.stringify({time:Date.now(),problems}));
    setStatus(`Ready · ${problems.length.toLocaleString()} problems loaded`);
  }catch(e){setStatus('Could not load problems. Check your internet connection and try refreshing. '+e.message,true)}
  $('randomBtn').disabled=false;
}
function pickProblem(){
  if(!problems.length){setStatus('Problemset is not loaded yet. Refresh the page and try again.',true);return;}
  const min=Number($('minRating').value),max=Number($('maxRating').value);
  if(!Number.isFinite(min)||!Number.isFinite(max)||min<800||max>3500||min>max){setStatus('Enter a valid range: minimum 800, maximum 3500, and MIN must not exceed MAX.',true);return;}
  const wanted=$('tags').value.toLowerCase().split(',').map(t=>t.trim()).filter(Boolean);
  const includeUnrated=$('unrated').checked;
  const candidates=problems.filter(p=>{
    if(p.rating==null)return includeUnrated;
    if(p.rating<min||p.rating>max)return false;
    return wanted.every(tag=>p.tags?.some(t=>t.toLowerCase()===tag));
  });
  if(!candidates.length){setStatus('No problems match those filters. Try a wider rating range or fewer tags.',true);return;}
  let fresh=candidates.filter(p=>!recent.has(`${p.contestId}-${p.index}`));
  if(!fresh.length){recent.clear();fresh=candidates;}
  const chosen=fresh[Math.floor(Math.random()*fresh.length)];
  recent.add(`${chosen.contestId}-${chosen.index}`);
  showProblem(chosen,candidates.length);
  setStatus(`${candidates.length.toLocaleString()} matching problems · ${recent.size} picked this session`);
}
function showProblem(p,count){
  $('empty').style.display='none';$('problem').style.display='block';
  $('problemCode').textContent=`${p.contestId}${p.index} · CODEFORCES`;
  $('problemName').textContent=p.name;
  $('meta').innerHTML='';
  const addPill=(txt,cls='')=>{const el=document.createElement('span');el.className='pill '+cls;el.textContent=txt;$('meta').appendChild(el)};
  if(p.rating!=null)addPill(`Rating ${p.rating}`,'rating');else addPill('Unrated');
  addPill(`Contest ${p.contestId}`);addPill(`${count.toLocaleString()} matches`);
  $('taglist').innerHTML='';(p.tags||[]).forEach(t=>{const el=document.createElement('span');el.className='tag';el.textContent=t;$('taglist').appendChild(el)});
  $('openLink').href=`https://codeforces.com/contest/${p.contestId}/problem/${encodeURIComponent(p.index)}`;
  $('nextline').textContent='Not feeling this one? Pick another problem.';
}
$('randomBtn').addEventListener('click',pickProblem);
$('resetBtn').addEventListener('click',()=>{$('minRating').value=800;$('maxRating').value=1200;$('tags').value='';$('unrated').checked=false;setStatus(`Filters reset · ${problems.length.toLocaleString()} problems loaded`)});
loadProblems();
