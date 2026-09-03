/* ZENTRALE WERTE — Store-URLs, Preise, Betreiberdaten und Domain.

   Was von hier liest und automatisch mitzieht:
     PRICING   Preissektion, FAQ (Antwort 3 und 8), JSON-LD, CTA-Beschriftung,
               Micro-Trust-Zeile im Hero, Trust-Zeile unter „So funktioniert's",
               Meta-Description und Twitter-Description
     STORE     alle sechs CTA-Instanzen, Store-Links im Footer
     OPERATOR  Footer und JSON-LD
     SITE      Canonical, Open-Graph-URL

   EINE AUSNAHME, und sie ist ein offener Fehler: Die Rechtstexte in
   src/legal/ sind wortgleich übernommener Fremdtext und lesen nichts
   von hier. src/legal/agb.html:58-60 führt eigene Preise — heute
   23,88 € im Jahr und einen Lifetime-Tarif für 79,99 €, während hier 19,90 €
   und kein Lifetime steht. Welcher Wert gilt, ist ungeklärt.
   Siehe Blocker B3 in docs/AUDIT-2026-08-17.md.

   Deshalb gilt bei jeder Preisänderung: hier ändern UND die AGB von Hand
   nachziehen. Die Pflege-Checkliste steht in docs/CONTENT.md.

   Frühere Fassung dieses Kommentars sicherte zu, es gebe „bewusst keine
   zweite Stelle im Code, an der ein Preis oder eine Store-URL steht". Für
   Store-URLs stimmt das. Für Preise verdeckte die Zusicherung den Widerspruch
   oben — Fund 8 aus docs/AUDIT-2026-08-17.md. */

export const STORE = {
  ios: 'https://apps.apple.com/de/app/pepp-taschengeld-aufgaben/id6761885126',
  android:
    'https://play.google.com/store/apps/details?id=de.bluebranch.taschengeld&hl=de',
};

export const PRICING = {
  currency: 'EUR',
  monthly: 2.99,
  yearly: 19.9,
  trialDays: 7,
};

/* OFFEN: finale Domain steht noch nicht fest (README, offener Punkt 5).
   Bis dahin zeigen Canonical und OG-URL auf die bestehende Domain.
   Sobald die Domain da ist: nur origin ändern — Canonical, OG-URL, Sitemap
   und der Hero-QR-Code ziehen alle aus diesem Wert. */
export const SITE = {
  origin: 'https://taschengeldapp.com',
  locale: 'de-DE',
  lang: 'de',
};

export const OPERATOR = {
  legalName: 'BlueBranch GmbH',
  street: 'Hans-Vogel-Straße 59',
  postalCode: '90765',
  city: 'Fürth',
  country: 'DE',
  email: 'hello@bluebranch.de',
  phone: '+49 9131 9430090',
  managingDirector: 'Lukas Beck',
  register: 'Amtsgericht Fürth, HRB 20180',
  vatId: 'DE359576543',
  copyrightYear: 2026,
};

/* Deutsche Geldformatierung: 2,50 € — nie 2.50 EUR. */
export function formatEuro(value) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: PRICING.currency,
  }).format(value);
}

/* Monatspreis des Jahresabos — „nur 1,66 € im Monat" wie im Design.
   19,90 / 12 = 1,6583 -> kaufmännisch gerundet 1,66 €. */
export function yearlyPerMonth() {
  return formatEuro(Math.round((PRICING.yearly / 12) * 100) / 100);
}

/* Ersparnis des Jahresabos gegenüber monatlich, in ganzen Prozent. */
export function yearlySavingsPercent() {
  return Math.round((1 - PRICING.yearly / (PRICING.monthly * 12)) * 100);
}
