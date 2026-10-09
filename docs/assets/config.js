/* First Bounty — site settings.
   Edit THIS file to make the site yours; app.js reads it as window.FB_CONFIG.
   Everything here ships to every visitor's browser, so never put a secret in it.
   The Supabase *publishable* key is meant to be public: it can only do what the table's
   row-level-security policy allows (insert one consented waitlist row; no reads, updates or deletes). */
window.FB_CONFIG={
  supabase:{
    url:"https://kxyzgfobuhbymujmsgyn.supabase.co",
    key:"sb_publishable_rEi6JGhO6FiR3OjBSUcEbQ_91fVC1Xd",
    table:"waitlist",
    consentVersion:"v1"      // bump together with the consent wording (i18n key "wl.consent") and privacy.html
  },
  // Fallback, used only if "supabase" above is removed: link to an external form (Tally, ConvertKit, ...). "" = none.
  waitlistUrl:"",
  communityUrl:"",           // optional second button (e.g. a Discord invite). "" hides it.
  contactEmail:"",           // shown on the privacy page. Use a project address/alias, not your personal one.
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
