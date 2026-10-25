---
title: Käyttöliittymä
description: Toimintoja ja kehitysideoita win-ulkoasuun.
navigation: 
  icon: i-lucide-hand
layout: docs
---

Retrotyylinen [työpöytä](/win) selaimessa: vedettävät ikkunat, tehtäväpalkki, Käynnistä-valikko ja joukko pieniä sovelluksia. Se on rakennettu Nuxt 4:llä, Nuxt UI:lla, `@nuxtjs/i18n`:llä ja motion-v:llä, sekä se sisältää englantia ja suomea.

::callout{icon="i-lucide-info" color="info"}
Kaikki toimii selaimessa. Tila säilyy `useState`:ssa ja paikallisessa tallennustilassa, joten taustapalvelinta ei tarvita.
::

## Lisää uusi sovellus

::steps{level="3"}
### Rekisteröi ikkuna

Lisää avain `WinKey`- ja `WIN_KEYS`-listoihin `useWin`:ssä ja anna sille oletustila `closed`.

### Kuvaile se Käynnistä-valikossa

Lisää `START_APPS`-listaan rivi, jossa on kuvake ja tekstiavain `taskbar.apps`-alta.

### Piirrä se asettelussa

Kopioi olemassa oleva lohko tiedostosta `win.vue` ja vaihda avain. Se tarvitsee `open`-, `constraints`-, z-index-, tarkennus-, pienennys- ja sulkemistiedot.

### Lisää viestit

Lisää avaimet sekä tiedostoon `en.yml` että tiedostoon `fi.yml`. Puuttuva avain näkyy varoituksena konsolissa.
::

## Composablet

| Composable | Mitä se tekee |
|---|---|
| `useWin` | Ikkunoiden tilat, tarkennusjärjestys, z-index ja sovellusten käynnistys |
| `useSettings` | Korostusväri, taustakuva sekä tehtäväpalkin ja musiikin asetukset paikallisessa tallennustilassa |
| `useFileSystem` | Pohjasolmut ja tallennettu kerros sekä roskakori |
| `useFileOpen` | Tiedostoliitännät ja tiedon siirto sovellusten välillä |
| `usePlayer` | Jaettu mediajono |
| `useGallery` | Kuvien järjestys ja valittu kuva |
| `useAlarms` | Tallennetut herätykset ja taustalla toimiva valvoja |

::::field-group
:::field{name="states" type="Record<WinKey, WinState>"}
Jokainen ikkuna on tilassa `closed`, `open` tai `minimized`. Asettelu piirtää ikkunan niin kauan kuin sen tila ei ole `closed`.
:::

:::field{name="launch" type="(key: string) => void"}
Avaa ikkunan avaimella ja ohittaa tuntemattomat avaimet. Erikoisavain `shutDown` sulkee kaiken.
:::

:::field{name="toggle" type="(key: WinKey) => void"}
Pienentää tarkennetun ikkunan tai muuten avaa ja tarkentaa sen.
:::
::::

## Kielet

::::tabs
:::tabs-item{label="Englanti" icon="i-lucide-languages"}
Lauseet ovat tiedostossa `en.yml`. Avaimet ovat pisteillä erotettuja polkuja, esimerkiksi `clock.title`.
:::

:::tabs-item{label="Suomi" icon="i-lucide-languages"}
Lauseet ovat tiedostossa `fi.yml` ja ne vastaavat englanninkielisiä avaimia yksi yhteen.
:::
::::

## Käynnistys

```bash
bun i
bun dev
bun run typecheck
bun run lint --fix
bunx nuxi cleanup
bun update
bun upgrade
bun run build
bun run build --analyze
bun run preview
```

## Käytännöt

::::accordion
:::accordion-item{label="Koodityyli" icon="i-lucide-code"}
ESLint stylistic: ei puolipisteitä, yksinkertaiset lainausmerkit ja yksi rajapinnan jäsen riviä kohti. Koodiin ei kirjoiteta kommentteja.
:::

:::accordion-item{label="Värit" icon="i-lucide-palette"}
Vain semanttisia värejä (`info`, `success`, `warning`, `error`, `neutral`) ja läpinäkyvyysmuuntimia, jotta jokainen sovellus seuraa korostusväriä.
:::

:::accordion-item{label="Komponentit" icon="i-lucide-box"}
Komponentit sijaitsevat kansiossa `app/components/m/` ja niiden nimet ovat muotoa `MName`. Propsien ja funktioiden nimet eivät saa mennä päällekkäin, jotta `vue/no-dupe-keys` pysyy hiljaa.
:::
::::

## Pikanäppäimet

Suunnitellut pikanäppäimet: :kbd{value="meta"} :kbd{value="k"} avaa komentopaletin ja :kbd{value="alt"} :kbd{value="tab"} vaihtaa ikkunaa.

::collapsible{name="tulevat" label="Suunnitteilla"}
- Ikkunoiden tarttuminen reunoihin
- Työpöytäkuvakkeet ja hiiren oikean painikkeen valikko
- Leikkaa, kopioi, liitä ja monivalinta resurssienhallinnassa
- Ilmoituskeskus ja pääte
- Näytönsäästäjät
- Sanasto
- Laskin
- CMD
- Tehtävänhallinta
- Järjestelmätiedot
- Edistyneet
  - Kuvanmuokkaus
  - Videonmuokkaus
  - Sähköposti
  - Tiedostojen jakaminen
::

