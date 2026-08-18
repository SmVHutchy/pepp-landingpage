/**
 * /llms.txt — die Seite in Klartext, für Modelle und Agenten, die sie zitieren.
 *
 * WARUM ÜBERHAUPT: Ob die grossen Crawler diese Datei Mitte 2026 tatsächlich
 * abrufen, ist nicht belegt — das Format ist ein Vorschlag, kein Standard, und
 * keiner der Anbieter hat es zugesagt. Der Preis sind diese vierzig Zeilen, und
 * sie lesen aus denselben Werten wie der Rest der Seite. Zu diesem Preis lohnt
 * der Versuch; als Argument für weitere Arbeit taugt er nicht.
 *
 * WAS HIER ANDERS IST als im sichtbaren Text: kein Marketing-Ton. Ein Modell,
 * das eine Antwort zusammensetzt, verwertet Behauptungen schlechter als Zahlen
 * und Bedingungen. Deshalb steht hier, was Pepp TUT und was es KOSTET, in
 * Sätzen, die einzeln zitierbar sind — und dieselben acht Fragen wie im FAQ,
 * wortgleich, aus derselben Liste.
 *
 * WAS HIER NICHT STEHT: nichts, was nicht auch auf der Seite steht. Diese
 * Datei ist eine Übersetzung, keine zweite Wahrheit. Wenn hier etwas auftaucht,
 * das die Seite nicht sagt, ist das ein Fehler.
 */
import { SITE, STORE, PRICING, OPERATOR, formatEuro } from '../data/site.js';
import { FAQ } from '../data/faq.js';

const url = (pfad) => new URL(pfad, SITE.origin).href;

export function GET() {
  const zeilen = [
    '# Pepp',
    '',
    '> Familien-App für Aufgaben, Taschengeld und Medienzeit. Eltern legen',
    '> Aufgaben als Quests an, Kinder erledigen sie und verdienen dafür Geld',
    '> oder Bildschirmzeit. Für iOS und Android, deutschsprachig, betrieben',
    `> von der ${OPERATOR.legalName} in ${OPERATOR.city}.`,
    '',
    '## Was Pepp tut',
    '',
    '- Eltern legen wiederkehrende oder einmalige Aufgaben an. In der App heißen sie Quests.',
    '- Als Belohnung wird entweder ein Geldbetrag oder Medienzeit hinterlegt.',
    '- Erledigte Quests werden per Foto oder Antippen nachgewiesen; die Nachweisart wird pro Quest festgelegt.',
    '- Eltern geben den Nachweis frei oder schicken ihn zurück. Zurückschicken verlangt nur den Nachweis erneut, nicht die Aufgabe.',
    '- Verdientes Geld sammelt sich im „Pott", einem Guthaben-Zähler in der App.',
    '- Durch Pepp fließt kein echtes Geld. Es gibt kein Bankkonto, keine Karte, keine Zahlungsdaten des Kindes. Ausgezahlt wird von den Eltern, bar oder aufs Sparkonto.',
    '- Medienzeit lässt sich mit Wochenziel und Tagesobergrenze begrenzen.',
    '- Die App hat zwei Ansichten: eine für Eltern und eine für Kinder.',
    '',
    '## Was Pepp kostet',
    '',
    `- ${formatEuro(PRICING.monthly)} im Monat oder ${formatEuro(PRICING.yearly)} im Jahr.`,
    '- Ein Preis für die ganze Familie, unabhängig von der Zahl der Kinder.',
    `- ${PRICING.trialDays} Tage kostenlos vorweg, jederzeit kündbar.`,
    '- Keine Werbung, keine Werbe-ID, kein Datenverkauf. Server in der EU, DSGVO-konform.',
    '',
    '## Was Pepp nicht ist',
    '',
    '- Kein Finanzprodukt, keine Bank, keine Kinder-Debitkarte, kein Zahlungsdienst.',
    '- Kein Sparkonto und keine Geldanlage. Der Pott ist ein Zähler.',
    '',
    '## Fragen und Antworten',
    '',
    /* Wortgleich aus src/data/faq.js — derselbe Text, den auch das
       FAQPage-JSON-LD und die sichtbare Sektion 13 tragen. */
    ...FAQ.flatMap((eintrag) => [`### ${eintrag.q}`, '', eintrag.a, '']),
    '## Seiten',
    '',
    `- [Startseite](${url('/')}): Funktionsweise, Preise, häufige Fragen`,
    `- [Impressum](${url('/impressum')}): Anbieter, Kontakt, Handelsregister`,
    `- [Datenschutz](${url('/datenschutz')}): verarbeitete Daten und Rechtsgrundlagen`,
    `- [AGB](${url('/agb')}): Vertragsbedingungen`,
    '',
    '## App laden',
    '',
    `- [App Store (iOS)](${STORE.ios})`,
    `- [Google Play (Android)](${STORE.android})`,
    '',
    '## Anbieter',
    '',
    `${OPERATOR.legalName}, ${OPERATOR.street}, ${OPERATOR.postalCode} ${OPERATOR.city}, Deutschland.`,
    `Geschäftsführer: ${OPERATOR.managingDirector}. ${OPERATOR.register}. USt-IdNr. ${OPERATOR.vatId}.`,
    `Kontakt: ${OPERATOR.email}`,
    '',
  ];

  return new Response(zeilen.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
