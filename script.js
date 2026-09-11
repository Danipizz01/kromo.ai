/* ===========================================================
   SCORRIMENTO MORBIDO QUANDO CLICCHI SULLA NAVBAR
   Non usiamo scroll-behavior: smooth del CSS perché in Chrome
   è veloce e un po' meccanico. Qui l'animazione ha una curva
   ease-in-out: parte piano, accelera, si ferma dolcemente.
   =========================================================== */

var ALTEZZA_NAVBAR = 100;   // quanto spazio lasciare sopra la sezione
var animazioneInCorso = null;

/* la curva del movimento: piano - veloce - piano */
function curva(t) {
  if (t < 0.5) {
    return 4 * t * t * t;
  }
  return 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function vaiA(destinazione) {
  var partenza = window.scrollY;
  var distanza = destinazione - partenza;

  /* più è lontano, più dura: da mezzo secondo a un secondo e mezzo */
  var durata = Math.min(1500, Math.max(600, Math.abs(distanza) * 0.6));
  var inizio = null;

  function passo(ora) {
    if (inizio === null) {
      inizio = ora;
    }
    var avanzamento = Math.min((ora - inizio) / durata, 1);
    window.scrollTo(0, partenza + distanza * curva(avanzamento));

    if (avanzamento < 1) {
      animazioneInCorso = requestAnimationFrame(passo);
    } else {
      animazioneInCorso = null;
    }
  }

  if (animazioneInCorso) {
    cancelAnimationFrame(animazioneInCorso);
  }
  animazioneInCorso = requestAnimationFrame(passo);
}

/* se l'utente scorre da solo, l'animazione si ferma subito */
function fermaAnimazione() {
  if (animazioneInCorso) {
    cancelAnimationFrame(animazioneInCorso);
    animazioneInCorso = null;
  }
}
window.addEventListener("wheel", fermaAnimazione, { passive: true });
window.addEventListener("touchstart", fermaAnimazione, { passive: true });

/* aggancia tutti i link che puntano a una sezione: navbar, footer,
   freccia dell'hero e "torna su" */
var linkInterni = document.querySelectorAll('a[href^="#"]');

for (var k = 0; k < linkInterni.length; k++) {
  linkInterni[k].addEventListener("click", function (evento) {
    var id = this.getAttribute("href").slice(1);
    var sezione = document.getElementById(id);
    if (!sezione) {
      return;
    }
    evento.preventDefault();

    var y = sezione.getBoundingClientRect().top + window.scrollY - ALTEZZA_NAVBAR;
    if (id === "top") {
      y = 0;
    }

    /* chi ha chiesto meno animazioni ci va e basta */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, y);
    } else {
      vaiA(y);
    }
  });
}


/* ===========================================================
   MENU DEL CELLULARE
   =========================================================== */

var burger = document.getElementById("burger");
var chiudi = document.getElementById("chiudi");
var menu = document.getElementById("menu");

function apriMenu() {
  menu.setAttribute("data-aperto", "1");
  document.body.style.overflow = "hidden";   /* blocca lo scorrimento dietro */
}

function chiudiMenu() {
  /* prima esce a destra... */
  menu.setAttribute("data-aperto", "uscita");
  document.body.style.overflow = "";

  /* ...poi, finita l'animazione, torna in attesa a sinistra
     senza farsi vedere attraversare lo schermo */
  setTimeout(function () {
    menu.style.transition = "none";
    menu.setAttribute("data-aperto", "0");
    menu.offsetHeight;              /* forza il ricalcolo */
    menu.style.transition = "";
  }, 360);
}

burger.addEventListener("click", apriMenu);
chiudi.addEventListener("click", chiudiMenu);

/* toccando una voce il menu si chiude e la pagina scorre alla sezione */
var vociMenu = menu.querySelectorAll("a");
for (var v = 0; v < vociMenu.length; v++) {
  vociMenu[v].addEventListener("click", chiudiMenu);
}


/* ===========================================================
   GRIGLIA DI PALLINI DELLA CARD 92,5%
   100 pallini: 92 pieni, uno a metà (lo 0,5%), gli altri spenti.
   =========================================================== */

var pallini = document.getElementById("pallini");

for (var d = 0; d < 100; d++) {
  var pallino = document.createElement("span");
  if (d === 92) {
    pallino.className = "mezzo";
  } else if (d > 92) {
    pallino.className = "spento";
  }
  pallini.appendChild(pallino);
}


/* ===========================================================
   CARD DEI DATI: al tocco si girano
   =========================================================== */

var cardDati = document.querySelectorAll(".riga-dati .card, .card-grande");

for (var c = 0; c < cardDati.length; c++) {
  cardDati[c].addEventListener("click", function () {
    this.classList.toggle("girata");
  });
}


/* ===========================================================
   LENTE DEI MANIFESTI
   Clicchi un manifesto e lo vedi grande. Si chiude con la X,
   cliccando sul fondo scuro o premendo Esc.
   =========================================================== */

var lente = document.getElementById("lente");
var lenteImg = document.getElementById("lenteImg");
var lenteChiudi = document.getElementById("lenteChiudi");
var manifesti = document.querySelectorAll(".manifesto");

function apriLente(immagine) {
  lenteImg.src = immagine.src;
  lenteImg.alt = immagine.alt;
  lente.setAttribute("data-aperta", "1");
  document.body.style.overflow = "hidden";
}

function chiudiLente() {
  lente.setAttribute("data-aperta", "0");
  document.body.style.overflow = "";
}

for (var t = 0; t < manifesti.length; t++) {
  manifesti[t].addEventListener("click", function () {
    apriLente(this);
  });
}

lenteChiudi.addEventListener("click", chiudiLente);

/* cliccando sul fondo (ma non sull'immagine) si chiude */
lente.addEventListener("click", function (evento) {
  if (evento.target !== lenteImg) {
    chiudiLente();
  }
});

document.addEventListener("keydown", function (evento) {
  if (evento.key === "Escape") {
    chiudiLente();
    chiudiMenu();
  }
});


/* ===========================================================
   DI CHE COLORE È LO SFONDO SOTTO LA NAVBAR
   Ogni sezione porta scritto in data-sfondo di che colore è.
   A ogni scorrimento guardiamo quale sezione si trova sotto
   la metà della barra e lo scriviamo su <body>: ci pensa il CSS
   a ribaltare i colori del marchio e del menu.
   Le sezioni vengono lette dall'ultima alla prima perché quelle
   che vengono dopo si sovrappongono a quelle prima (la fascia
   nera dei manifesti sale sopra a quella arancione).
   =========================================================== */

var fondi = document.querySelectorAll("[data-sfondo]");
var barra = document.querySelector(".navbar");
var sfondoAttuale = "";

function guardaSfondo() {
  if (!barra) return;
  var riga = barra.getBoundingClientRect();
  var meta = riga.top + riga.height / 2;
  var trovato = "crema";

  for (var i = fondi.length - 1; i >= 0; i--) {
    var r = fondi[i].getBoundingClientRect();
    if (r.top <= meta && r.bottom >= meta) {
      trovato = fondi[i].getAttribute("data-sfondo");
      break;
    }
  }

  if (trovato !== sfondoAttuale) {
    sfondoAttuale = trovato;
    document.body.setAttribute("data-navbar", trovato);
  }
}

guardaSfondo();
window.addEventListener("scroll", guardaSfondo, { passive: true });
window.addEventListener("resize", guardaSfondo);


/* ===========================================================
   IL TITOLO DELLA HERO SI ADATTA ALLA COLONNA
   Deve stare su due righe senza uscire dal margine destro.
   Se il carattere in uso è più largo del previsto (succede
   finché manca Hagrid) il corpo scende quel tanto che basta.
   =========================================================== */

var titoloHero = document.querySelector(".display-hero");

function adattaTitolo() {
  if (!titoloHero) return;
  titoloHero.style.fontSize = "";
  titoloHero.style.lineHeight = "";
  if (window.innerWidth <= 1000) return;

  var stile = getComputedStyle(titoloHero);
  var corpo = parseFloat(stile.fontSize);
  var interlinea = parseFloat(stile.lineHeight);
  var disponibile = titoloHero.clientWidth;
  var servono = titoloHero.scrollWidth;

  if (servono > disponibile) {
    var nuovo = Math.floor(corpo * disponibile / servono);
    titoloHero.style.fontSize = nuovo + "px";
    titoloHero.style.lineHeight = (interlinea * nuovo / corpo) + "px";
  }
}

adattaTitolo();
window.addEventListener("resize", adattaTitolo);
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(adattaTitolo);
}


/* Fa comparire i titoli e i testi quando arrivano sullo schermo */
var elementi = document.querySelectorAll(".comparsa");

var osservatore = new IntersectionObserver(function (voci) {
  for (var i = 0; i < voci.length; i++) {
    if (voci[i].isIntersecting) {
      voci[i].target.classList.add("visibile");
    }
  }
}, { threshold: 0.15 });

for (var i = 0; i < elementi.length; i++) {
  osservatore.observe(elementi[i]);
}
