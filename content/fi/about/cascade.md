---
title: Vikaantumisketju
description: Ongelmia henkilön ja viranomaisen välillä sekä mikä kussakin mättää.
navigation:
  icon: i-lucide-workflow
---

::u-stepper
---
class: w-full
color: error
items:
  - title: Vanhus
    description: Saha suljettu, työttömyysturvalla, asuntolaina
    icon: i-lucide-user
    content: Vikatila, "Katson Suomi.fi:stä myöhemmin". Seuraavaksi hän napauttaa puhelinta.
  - title: Suomi.fi-mobiilisovellus
    description: 13,6 Mt:n WebView-kääre, ei natiivi
    icon: i-lucide-smartphone
    content: Play Kaupan arvostelu, "Write simple native app (it is more painful than webview, but webview simplest apps start for ages)". Vikatila, 40 s latausaika, kaatuu Android 15:llä.
  - title: WebView (Chromium)
    description: Näyttää Suomi.fi-verkkokäyttöliittymän sovelluskuoren sisällä
    icon: i-lucide-globe
    content: Vikatila, "jotkin tunnistautumiset eivät toimineet" (helmikuu 2025, 6,5 tuntia). Seuraavaksi HTTPS-pyyntö.
  - title: Suomi.fi-portaali
    description: Tunnistus + tiedonvaihto + viestit + valtuudet
    icon: i-lucide-landmark
    content: '"Et voi kieltäytyä". Vikatilat, DNS-tietueen kirjoitusvirhe (toukokuu 2024, kaikki alhaalla); "viesti kertoo vain, että viesti on olemassa" ja ulosmittausilmoitus jäi huomaamatta.'
  - title: Microsoft Azure (EU-alue)
    description: ~80 % EU:n julkisesta sektorista toimii MS-infrastruktuurilla
    icon: i-lucide-cloud
    content: '"Suvereeni" = EU-IP-osoite, yhdysvaltalainen emoyhtiö. Vikatila, alueellinen katko, ei suomalaista varajärjestelmää.'
  - title: Yhdysvaltalainen konesali
    description: CLOUD Act -lainkäyttöalue
    icon: i-lucide-server
    content: Data on "EU-alueella", mutta yhdysvaltalainen yhtiö hallitsee sitä. CLOUD Act, riippumatta tallennuspaikasta. Suomalaista tuomioistuinkäsittelyä ei vaadita. Rekisteröidylle ei ilmoiteta. Vikatila, yhdysvaltalainen määräys, jota suomalainen tuomioistuin ei koskaan näe.
  - title: Yhdysvaltalainen viranomainen
    description: Saa terveys-, vero-, rikos-, työllisyys- ja viestitiedot, valtuudet, kaiken
    icon: i-lucide-flag
    content: Vanhukselle ei koskaan ilmoiteta. Suomelle ei koskaan ilmoiteta. Metsä on yhä paikallaan. Hän ei enää saa itseään menemään sinne.
---
::

**Vikaantumisketju** (todellinen, 2024-2026)

| Kerros | Tapaus | Tulos |
|---|---|---|
| Sovellus | 40 s lataus, kaatuminen | "Yritän huomenna uudelleen" |
| WebView | Tunnistautuminen epäonnistuu (helmikuu 2025) | Ei pääse sisään, soittaa tukeen |
| Portaali | DNS-kirjoitusvirhe (toukokuu 2024) | Tukilinja on lomake Suomi.fi:ssä. Suomi.fi on alhaalla. |
| Portaali | Viesti ei linkitä | Ulosmittausilmoitus jää huomaamatta |
| Pilvi | Alueellinen katko | Ei paperista varajärjestelmää (Digi ensin, huhtikuu 2026) |
| USA:n konesali | CLOUD Act -määräys | Data poissa. Kukaan Suomessa ei tiedä. |

**13,6 Mt**, joka ohjaa kaikkea

- Vanhuksen kirjoittama koodi yhteensä: **0 riviä.**
- Hänen elämäänsä ohjaava koodi yhteensä: **~13,6 Mt kääret + verkkosivu.**
- Hänelle rahaa maksaneet katkot yhteensä: **vähintään 1 (ulosmittaus).**
- Kertoja, jolloin hänelle ilmoitettiin: **0.**

::u-alert{title="GovTech-palkinto 2025" description="Sovellus voitti." icon="i-lucide-trophy" color="warning" variant="subtle"}
::

**Pyramidihuijaus** pähkinänkuoressa

::::u-page-grid{class="lg:grid-cols-4"}
:::u-page-card{title="Vero" description="Vie rahan." icon="i-lucide-coins" variant="subtle"}
:::

:::u-page-card{title="Sakko" description="Vie riskin." icon="i-lucide-gavel" variant="subtle"}
:::

:::u-page-card{title="Velvoite" description="Vie ajan." icon="i-lucide-hourglass" variant="subtle"}
:::

:::u-page-card{title="Valvonta" description="Vie datan." icon="i-lucide-eye" variant="subtle"}
:::
::::


**Menneisyys**

::u-alert{title="Ennen (2022)" description="Pyöritä sahaa → myy puuta → valmis" icon="i-lucide-check" color="success" variant="subtle"}
::

**Jälkeen** (2026): pyöritä sahaa

::u-accordion
---
type: multiple
items:
  - label: ETS2
    content: Seurantasuunnitelma + vuosiraportti
    icon: i-lucide-factory
  - label: EUDR
    content: Paikkatiedot jokaisesta tilasta
    icon: i-lucide-map-pin
  - label: Pakkausasetus
    content: Rekisteröityminen jokaisessa EU-maassa, johon myyt
    icon: i-lucide-package
  - label: Kyberkestävyysasetus
    content: Jos sahallasi on verkkoon kytkettyjä laitteita, haavoittuvuuksien ilmoittaminen
    icon: i-lucide-cpu
  - label: AI Act
    content: Jos käytät mitä tahansa tekoälyä (vaikka taulukkolaskennan lisäosaa), riskiluokitus
    icon: i-lucide-bot
  - label: NIS 2
    content: Jos olet "keskeinen" tai "tärkeä" toimija, kyberturvallisuusvelvoitteet
    icon: i-lucide-shield
  - label: Metaaniasetus
    content: Jos käsittelet kaasua, Tukesin tarkastukset
    icon: i-lucide-flame
  - label: GDPR
    content: Tietosuojavastaava, tietojen kartoitus, suostumus
    icon: i-lucide-lock
  - label: Suomi.fi
    content: Digitaalinen posti, ei paperia
    icon: i-lucide-mail
  - label: Poliisi
    content: Voi vahvistaa sijaintisi terveydenhuoltosi kautta
    icon: i-lucide-siren
  - label: EU:n digitaalinen henkilöllisyys
    content: Kasvosi ovat vähimmäistietosisällössä
    icon: i-lucide-scan-face
  - label: Sakot
    content: Eivät vanhene, julkista sektoriakin sakotetaan nyt
    icon: i-lucide-gavel
---
::

**Tyrmä**

::::u-page-grid{class="md:grid-cols-3"}
:::u-page-card{title="Maksa häkistä" description="2,1 mrd €+" icon="i-lucide-coins" variant="subtle"}
:::

:::u-page-card{title="Ei voi poistua häkistä" description="Pakollinen, ei kieltäytymismahdollisuutta" icon="i-lucide-lock" variant="subtle"}
:::

:::u-page-card{title="Ei näe häkkiä" description="WebView, 40 s, kaatuu" icon="i-lucide-eye-off" variant="subtle"}
:::

:::u-page-card{title="Ei voi poistaa häkkiä" description="Dataa ei voi poistaa" icon="i-lucide-trash-2" variant="subtle"}
:::

:::u-page-card{title="Saat sakon häkissä olemisesta" description="Sakot eivät vanhene" icon="i-lucide-gavel" variant="subtle"}
:::

:::u-page-card{title="Joudut ulosmittaukseen häkin postin ohittamisesta" description="Palkan ulosmittaus" icon="i-lucide-mail-x" variant="subtle"}
:::

:::u-page-card{title="Maksa häkin tietoturvasta" description="30 000 € bugipalkkio" icon="i-lucide-shield" variant="subtle"}
:::

:::u-page-card{title="Häkki arvioidaan keskitason alapuolelle" description="OECD 0,63" icon="i-lucide-star-half" variant="subtle"}
:::

:::u-page-card{title="Et voi valittaa häkistä" description="Valituslomake on häkissä, häkki on alhaalla, DNS-kirjoitusvirhe" icon="i-lucide-message-square-x" variant="subtle"}
:::
::::


**Kuinka kylä suljetaan**

::u-timeline
---
color: error
size: sm
default-value: 13
class: w-full
items:
  - title: Saha sulkeutuu
    description: ETS2 + EUDR + pakkausasetus
    icon: i-lucide-factory
  - title: 60 työpaikkaa katoaa
    icon: i-lucide-briefcase
  - title: Väkiluku laskee
    icon: i-lucide-users
  - title: Koulun oppilasmäärä putoaa alle 20
    icon: i-lucide-school
  - title: Koulu lakkautetaan
    description: Yhdistetään 30 km päähän
    icon: i-lucide-door-closed
  - title: Linja-autovuoro lakkautetaan
    icon: i-lucide-bus
  - title: Kauppa ei saa riittävästi asiakkaita
    icon: i-lucide-footprints
  - title: Kauppa sulkeutuu
    icon: i-lucide-store
  - title: Terveysasema "sopeutetaan"
    description: 200 km päähän
    icon: i-lucide-hospital
  - title: Posti sulkeutuu
    icon: i-lucide-mail-x
  - title: Lankapuhelin on jo poistunut
    description: Kesäkuu 2026
    icon: i-lucide-phone-off
  - title: Ainoa tapa ottaa yhteyttä valtioon on Suomi.fi
    icon: i-lucide-globe
  - title: Suomi.fi on WebView, jonka lataus kestää 40 sekuntia
    icon: i-lucide-loader
  - title: Vanha mies ei huomaa ulosmittausilmoitusta
    icon: i-lucide-triangle-alert
---
::
