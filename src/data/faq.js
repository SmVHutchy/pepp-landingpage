import { PRICING, formatEuro } from './site.js';

/* Die acht FAQ-Einträge, wortgleich aus der Design-Quelle übernommen:
   die sechs Eltern-Einwände plus Alter und „nach den 14 Tagen".

   Diese Liste ist die einzige Quelle — das Markup in Sektion 13 UND das
   FAQPage-JSON-LD lesen sie beide. Die strukturierte Antwort kann damit nie
   von der sichtbaren abweichen.

   Antwort 3 und 8 setzen Preis und Testdauer aus PRICING ein, statt sie als
   Text zu wiederholen: bei einer Preisänderung zieht die FAQ automatisch mit. */
export const FAQ = [
  {
    q: 'Ist das sicher?',
    a: 'Ja. Dein Kind braucht kein Bankkonto, keine Karte und keine Zahlungsdaten. Durch Pepp fließt kein echtes Geld — der Pott ist ein Guthaben-Zähler, ausgezahlt wird von dir.',
  },
  {
    q: 'Was passiert mit den Daten meines Kindes?',
    a: 'Keine Werbung, keine Werbe-ID, kein Datenverkauf. Pepp ist DSGVO-konform, die Server stehen in der EU.',
  },
  {
    q: 'Was kostet Pepp?',
    a: `${formatEuro(PRICING.monthly)} im Monat oder ${formatEuro(PRICING.yearly)} im Jahr — ein Preis für die ganze Familie. ${PRICING.trialDays} Tage gratis vorweg, jederzeit kündbar.`,
  },
  {
    q: 'Lernt mein Kind wirklich etwas?',
    a: 'Es verdient statt geschenkt zu bekommen, es sieht den Fortschritt im Pott und es wartet auf ein Ziel, statt sofort zu bekommen. Genau das ist Belohnungsaufschub.',
  },
  {
    q: 'Kontrolle oder Autonomie?',
    a: 'Beides. Du setzt Beträge, Grenzen und Medienzeit. Dein Kind entscheidet darin: welche Quest, wann, und wofür es den Pott knackt.',
  },
  {
    q: 'Noch eine App fürs Kind?',
    a: 'Nicht nötig. Es gibt einen Kind-Modus auf deinem Gerät, PIN-geschützt. Ein eigenes Handy braucht dein Kind erst, wenn es eines hat.',
  },
  {
    q: 'Ab welchem Alter?',
    a: 'Sobald ein Kind kurze Sätze liest, kommt es allein zurecht — erfahrungsgemäß ab etwa sechs Jahren. Jüngere Kinder nutzen den Kind-Modus mit dir zusammen.',
  },
  {
    q: `Was passiert nach den ${PRICING.trialDays} Tagen?`,
    a: 'Du bekommst vorher eine Erinnerung. Ohne Abo ruhen die Quests — deine Familie, Verläufe und der Pott bleiben erhalten.',
  },
];
