---
title: Käytännöt
description: Mitä voit ja et voi pyörittää omalla verkkotunnuksellasi EU:ssa ja mitä mikin toiminto laukaisee.
navigation:
  icon: i-lucide-gavel
---

::tip
Ainoana sääntönä on kultaisen noudattaminen. Avoimen lähdekoodin periaatteet. Mitään ei tallenneta palvelimelle.
::

**EU:n ja Suomen rajoituksia**

| Toiminto | Laukaisija | Miksi |
|---|---|---|
| Kirjautuminen / tunnistautuminen | :u-badge{label="GDPR" color="info" variant="subtle"} | Istunto-ID + käyttäjä-ID = henkilötietoa. Ei pakotietä. |
| Kommentit / käyttäjien sisältö omalla verkkotunnuksellasi | :u-badge{label="DSA" color="warning" variant="subtle"} | Olet "alusta". Tarvitset käyttöehdot, valitusmekanismin ja läpinäkyvyysraportin. |
| "Ilmoita virheestä" -lomake omalla verkkotunnuksellasi | :u-badge{label="GDPR" color="info" variant="subtle"} | Kerää nimen ja sähköpostin. Olet rekisterinpitäjä. |
| Yhteydenottolomake | :u-badge{label="GDPR" color="info" variant="subtle"} | Sama. Lomake *on* tiedonkeruu. |
| "Tue" / "tippaa" -painike omalla verkkotunnuksellasi | :u-badge{label="ALV + EAA" color="error" variant="subtle"} | Maksuprosessi. Olet kauppias. WCAG pätee. |
| Uutiskirjeen tilaus | :u-badge{label="GDPR" color="info" variant="subtle"} | Sähköposti = henkilötietoa. Suostumus vaaditaan. |
| "Muista minut" / teemavalinta localStoragessa | :u-badge{label="GDPR" color="info" variant="subtle"} | Pysyvä tunniste, joka liittyy henkilöön. |
| Mikä tahansa eväste (myös "toiminnallinen") | :u-badge{label="GDPR" color="info" variant="subtle"} | *Breyer*: IP + eväste = henkilötietoa. |
| Aikapankki / tovi-kirjanpito | :u-badge{label="Tulovero (2013 ratkaisu)" color="error" variant="subtle"} | *Kirjanpitomerkintä* on palkkaa markkina-arvolla. Työtä ei ole vielä saatu. Silti verotettavaa. |
| Vaihtokauppa (koodia palvelintilaa vastaan, suunnittelua verkkotunnusta vastaan) | :u-badge{label="ALV" color="error" variant="subtle"} | "Palvelun suoritus vastiketta vastaan." Rahaa ei tarvita. |
| Talkoot / yhteisötyö sosiaalisella velalla | :u-badge{label="Lahjavero (saaja) + tulovero (tekijä)" color="error" variant="subtle"} | Makkara on luovutus. "He auttavat minua myöhemmin" on vastike. |
| Tekoälychatbot omalla verkkotunnuksellasi | :u-badge{label="AI Act (käyttöönottaja)" color="primary" variant="subtle"} | Läpinäkyvyysilmoitus ja käyttölokit. "Puhut botille." |
| Muiden sisällön isännöinti | :u-badge{label="NIS2" color="warning" variant="subtle"} | "Tärkeä toimija." Poikkeamailmoitukset ja riskienhallinta. |
| Sähköpostiosoite alatunnisteessa | :u-badge{label="GDPR" color="info" variant="subtle"} | Ihmiset lähettävät sinulle sähköpostia. Heidän osoitteensa = henkilötietoa. Olet rekisterinpitäjä. |
| "Tervetuloa takaisin" -banneri (localStorage) | :u-badge{label="GDPR" color="info" variant="subtle"} | Pysyvä tunniste. |
| Mikä tahansa käyttäjien tuottama sisältö omalla verkkotunnuksellasi | :u-badge{label="DSA" color="warning" variant="subtle"} | Heti kun ihminen kirjoittaa jotain sivullesi, olet alusta. |

::note
Byrokratia
- Pitänee käyttää `useState` `localStorage`:n sijaan, jos kävijät ovat **EU-alueella**. _Kommentoitu pois koodista_.
- Ei palvelintoimitoja tai API:a md-dokumenttien reittien listaamisen lisäksi `[...slug].md.get.ts`.
- `colorMode` ja `i18n` käytti keksejä (cookies) oletuksena.
- **GDPR-vapaat** Bunny-kirjaisimet.
::

```ts
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxtjs/i18n'],
  devtools: { enabled: false },
  telemetry: false,
  colorMode: {
    preference: 'dark',
    fallback: 'light',
    storage: 'sessionStorage'
  },
  fonts: {
    provider: 'bunny',
    defaults: {
      preload: true
    },
    families: [
      { name: 'Finlandica' }
    ]
  },
  i18n: {
    defaultLocale: 'en',
    strategy: 'prefix',
    locales: [
      { code: 'en', name: 'English', language: 'en-US', flag: '🇺🇸', dir: 'ltr', file: 'en.yml' },
      { code: 'fi', name: 'Suomi', language: 'fi-FI', flag: '🇫🇮', dir: 'ltr', file: 'fi.yml' }
    ],
    detectBrowserLanguage: {
      useCookie: false,
      redirectOn: 'root'
    }
  }
})
```
