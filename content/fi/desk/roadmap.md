---
title: Kerityskartta
description: Korjaukset, ominaisuudet ja ideat Win-työpöytäkäyttöliittymässä (Nuxt 4, Nuxt UI, Nuxt i18n ja motion-v).
navigation: 
  icon: i-lucide-map
---

::callout{icon="i-lucide-info" color="info"}
Komponentit sijaitsevat kansiossa `app/components/m/`. Viestit ovat tiedostoissa `en.yml` ja `fi.yml`.
::

## Korjattavaa

::card-group
  :::card{title="JitsiWindow" icon="i-lucide-video"}
  Käsittele tilanne, jossa huonetta ei vielä ole.
  :::

  :::card{title="MediaPlayer" icon="i-lucide-play"}
  Korjaa virhe: play()-pyyntö keskeytettiin pause()-kutsulla.
  :::

  :::card{title="PageState" icon="i-lucide-layout"}
  Tallenna asettelu, sivupalkit ja muu sivun tila.
  :::

  :::card{title="CSS" icon="i-lucide-paintbrush"}
  ColorPicker, PinSlots, RefineFrame ja Error.
  :::
::

::callout{icon="i-lucide-sparkles" color="success"}
Uudet ikkunat: `useWindows`, `win.vue` ja `StartMenu.vue`.
::

### Melko raskas

- Kasvanut muistinkäyttö: Clock, Sheet, MusicPlayer, Gallery
- Charts, Graphs, Kiosk

### Id-nimiö

- ELinkList ja `:bookmarks="mockBookmarks"`-haut
- ContentSearch

## Ehkä

::tabs
  :::tabs-item{label="Sovellukset" icon="i-lucide-app-window"}
  - OGImage
  - EditorSidebar
  - Sanakirja
  - Laskin
  - Komentokehote
  - Tehtävienhallinta
  - Järjestelmätiedot
  - Ohjeen katselu (F1)
  - Tapahtumaloki
  :::

  :::tabs-item{label="MSheet" icon="i-lucide-table"}
  - Kopioi, liitä ja täytä
  - Lisää funktioita: CONCAT, LEN, TODAY, AND ja OR
  :::

  :::tabs-item{label="MPaint" icon="i-lucide-brush"}
  - Täyttöämpäri
  - Viivatyökalut
  :::

  :::tabs-item{label="Työpöytä" icon="i-lucide-monitor"}
  - Työpöytäkuvakkeet pääsovelluksille ja roskakorille. Valinta klikkaamalla, käynnistys kaksoisklikkauksella, tiedot `useFileSystem`-komposiitista.
  - `UContextMenu` tyhjällä työpöydällä: uusi kansio, uusi muistiinpano, taustakuva, asetukset.
  - Yhdistä korjausjono `useBoard`-komposiittiin ja näytä kortin tiedot `USlideover`-paneelissa.
  :::
::

### Monimutkaiset

::badge{color="warning" variant="subtle"}
Laaja kokonaisuus
::

- Kuvankäsittely
- Videoeditointi
- Sähköposti
- Tiedostojen jako
- Abanico

### Pelit

- Miinaharava
- Pasianssi
- FreeCell
- Hämähäkkipasianssi
- Hertta
- 3D-flipperi (Space Cadet, Maze Madness, Beast)

## Bun & Vercel

- .github/workflows/ci.yml `with: bun-version: 1.4.x`
- package.json `"packageManager": "bun@1.4.4"`
- vercel.json `"bunVersion": "1.4.x"`

## Kehitystietoja

::accordion
  :::accordion-item{label="Teknologia ja asennus" icon="i-lucide-layers"}
  - [Nuxt](https://nuxt.com/) tuo Vue-rajapinnat, composablet ja komponentit automaattisesti, joten importteja ei kirjoiteta.
  - [motion-v](https://motion.unovue.com/) rekisteröidään `motion-v/nuxt`-moduulilla. Käytä `<Motion as="div">` ja `<AnimatePresence>`, ei framer-motionia.
  - [Asenna paketit](https://bun.com/) komennolla `bun add`.
  :::

  :::accordion-item{label="i18n" icon="i-lucide-languages"}
  - [Kielitiedostot](https://i18n.nuxtjs.org/) ovat `i18n/locales/en.yml` ja `fi.yml`.
  - Käytä YAMLissa yksittäisiä lainausmerkkejä vain tarvittaessa, esimerkiksi kun arvo sisältää ": " tai alkaa merkillä `{`.
  - Käytä `<script setup lang="ts">`-lohkossa `const { t } = useI18n()`.
  - Käännä käyttöliittymän tekstit. Käyttäjän muokattavaa dataa ei käännetä.
  :::

  :::accordion-item{label="Nuxt UI -muunnokset" icon="i-lucide-replace"}
  - Käytä semanttisia värejä ja luokkia (`text-muted`, `text-highlighted`, `border-default`, `bg-elevated`, `text-success`). Älä käytä `dark:`-variantteja.
  - Vältä dynaamisia [Tailwind-luokkanimiä](https://tailwindcss.com/), kuten `bg-${color}`. Käytä staattista luokkataulukkoa.
  :::

  :::accordion-item{label="Saavutettavuus" icon="i-lucide-accessibility"}
  - UFormFieldin labelin `for` toimii vain kentissä, jotka rekisteröivät id:n (UInput, USelect, UTextarea, USwitch). Se ei toimi UButton-laukaisimien, USliderin tai mukautettujen kenttien kanssa.
  - Jätä niissä `label`-prop pois ja käytä omaa `<span id="x-label">`-elementtiä ja `aria-labelledby`-attribuuttia.
  - Mukautetut tai piilotetut kentät (kuten OTP-kentät) tarvitsevat `id`:n, `name`:n ja vastaavan labelin.
  - Tarkista jokaisesta uudesta lomakekentästä, että labelin `for` ja kentän `id` täsmäävät.
  :::
::
