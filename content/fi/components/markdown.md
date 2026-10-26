---
title: Markdown-komponentit
description: Monta hyödyllistä työkalua tiedon esittämiseen haluamallasi tavalla.
navigation:
  icon: i-lucide-astroid
layout: docs
---

## Käyttö

Käytä komponentteja kirjoittaessasi Markdown-dokumentteja. Saat tärkeän tiedon näkymään juuri haluamallasi tavalla.

Esimerkit käyttävät ensisijaisesti YAML-tapaa, tässä on kokoelma uusimpia UI-komponentteja.

## Kaaviot

Piirrä data viivoina, alueina, palkkeina tai donitsina. Kaaviot renderöidään palvelimella SVG:nä ja ne mukautuvat säiliönsä leveyteen.

::tabs
  :::tabs-item{label="Inline-attribuutit" icon="i-lucide-code"}
  ```md
  ::u-chart{type="bar" index="month" aria-label="Kävijät kuukausittain" :colors='["success","info"]' :categories='["desktop","mobile"]' :data='[{"month":"Tammikuu","desktop":186,"mobile":80},{"month":"Helmikuu","desktop":305,"mobile":200}]'}
  ::
  ```
  :::

  :::tabs-item{label="YAML-propsit" icon="i-lucide-file-text"}
  ```md
  ::u-chart
  ---
  type: bar
  index: month
  ariaLabel: Kävijät kuukausittain
  colors:
    - success
    - info
  categories:
    - key: desktop
      label: Työpöytä
    - key: mobile
      label: Mobiili
  data:
    - month: Tammikuu
      desktop: 18
      mobile: 8
    - month: Helmikuu
      desktop: 30
      mobile: 20
  ---
  ::
  ```
  :::
::

### Propsit

- `type`: `line`, `area`, `bar` tai `donut`. Oletus on `line`.
- `data`: yksi objekti jokaista x-arvoa kohti, tai `donut`-tyypillä jokaista siivua kohti.
- `index`: x-akselin avain, tai `donut`-tyypillä siivujen nimet.
- `categories`: sarjat avaimina tai objekteina, joissa on `key`, `label` ja `color`.
- `colors`: sarjojen värit teeman väreinä tai mielivaltaisina CSS-väreinä.
- `stacked`: pinoaa sarjat, vain `area`- ja `bar`-tyypeille.
- `curve`: `linear`, `monotone` tai `step`, vain `line`- ja `area`-tyypeille.
- `points`: piirtää pisteen jokaiseen arvoon, vain `line`-tyypille.
- `grid`, `xAxis`, `yAxis`: näyttävät tai piilottavat ruudukon ja akselit. Kaikkien oletus on `true`.
- `xLabel`, `yLabel`: akselien otsikot.
- `legend`: näytetään oletuksena, kun sarjoja on useampi kuin yksi.
- `tooltip`: oletuksena `true`, piilota arvolla `false`.
- `thickness`: renkaan leveys pikseleinä, vain `donut`-tyypille. Oletus on `24`.
- `height`, `width`, `aspectRatio`: mitoitus. Korkeuden oletus on `300`.
- `ariaLabel`, `ariaDescription`: saavutettava nimi ja kuvaus.

## Aikajana

Näytä tapahtumat tai vaiheet järjestyksessä, pystysuunnassa tai vaakasuunnassa.

::u-timeline
---
color: primary
size: md
orientation: vertical
items:
  - date: 15.3.2026
    title: Projektin aloitus
    description: Tiimi sopi tavoitteista ja laajuudesta.
    icon: i-lucide-rocket
  - date: 2.4.2026
    title: Ensimmäinen prototyyppi
    description: Varhainen versio jaettiin palautetta varten.
    icon: i-lucide-flask-conical
  - date: 20.5.2026
    title: Julkaisu
    description: Projekti meni tuotantoon.
    icon: i-lucide-party-popper
---
::

::tabs
  :::tabs-item{label="Inline-attribuutit" icon="i-lucide-code"}
  ```md
  ::u-timeline{orientation="vertical" :items='[{"date":"15.3.2026","title":"Projektin aloitus","description":"Tiimi sopi tavoitteista ja laajuudesta.","icon":"i-lucide-rocket"},{"date":"2.4.2026","title":"Ensimmäinen prototyyppi","description":"Varhainen versio jaettiin palautetta varten.","icon":"i-lucide-flask-conical"}]'}
  ::
  ```
  :::

  :::tabs-item{label="YAML-propsit" icon="i-lucide-file-text"}
  ```md
  ::u-timeline
  ---
  orientation: vertical
  items:
    - date: 15.3.2026
      title: Projektin aloitus
      description: Tiimi sopi tavoitteista ja laajuudesta.
      icon: i-lucide-rocket
    - date: 2.4.2026
      title: Ensimmäinen prototyyppi
      description: Varhainen versio jaettiin palautetta varten.
      icon: i-lucide-flask-conical
  ---
  ::
  ```
  :::
::

### Propsit

- `items`: näytettävät tapahtumat.
- `orientation`: `vertical` tai `horizontal`. Oletus on `vertical`.
- `color`: teeman väri. Oletus on `primary`.
- `size`: `3xs`-`3xl`. Oletus on `md`.
- `reverse`: kääntää kohteiden järjestyksen.
- `defaultValue`, `modelValue`: aktiivinen kohde, joka yhdistetään kunkin kohteen `value`-arvoon (määritetään `valueKey`-propsilla).
- `valueKey`: kohteen avain, jota käytetään arvona. Oletus on `value`.
- `as`: elementti, jona komponentti renderöidään. Oletus on `div`.

### Slotit

- `indicator`, `wrapper`, `date`, `title`, `description`: mukauta kutakin osaa. Ne saavat `item`-arvon.

## Edistymisryhmä

Yksi palkki, joka on jaettu segmentteihin, joiden summa on `max`. Jokainen kohde on yksi segmentti ja mukana voi olla selitelista.

::u-progress-group
---
max: 100
status: true
color: primary
size: md
items:
  - label: Suunnittelu
    value: 40
    color: info
  - label: Kehitys
    value: 35
    color: success
  - label: Katselmointi
    value: 15
    color: warning
---
::

::tabs
  :::tabs-item{label="Inline-attribuutit" icon="i-lucide-code"}
  ```md
  ::u-progress-group{:max="100" status size="md" :items='[{"label":"Suunnittelu","value":40,"color":"info"},{"label":"Kehitys","value":35,"color":"success"},{"label":"Katselmointi","value":15,"color":"warning"}]'}
  ::
  ```
  :::

  :::tabs-item{label="YAML-propsit" icon="i-lucide-file-text"}
  ```md
  ::u-progress-group
  ---
  max: 100
  status: true
  size: md
  items:
    - label: Suunnittelu
      value: 40
      color: info
    - label: Kehitys
      value: 35
      color: success
    - label: Katselmointi
      value: 15
      color: warning
  ---
  ::
  ```
  :::
::

### Propsit

- `items`: piirrettävät segmentit. Jokainen vie osuuden palkista.
- `max`: arvo, johon kaikkien kohteiden summa asettuu. Oletus on `100`.
- `status`: näyttää edistymisarvojen summan.
- `size`: `2xs`-`2xl`. Oletus on `md`.
- `color`: teeman väri tai mikä tahansa CSS-väri. Oletus on `primary`.
- `orientation`: `horizontal` tai `vertical`. Oletus on `horizontal`.
- `as`: elementti, jona komponentti renderöidään. Oletus on `div`.

### Slotit

- `status`: mukautettu tilasisältö, saa `percent`-arvon.
- `item`, `item-leading`, `item-label`, `item-trailing`: mukauta kutakin selitteen riviä. Ne saavat `item`-, `index`- ja `percent`-arvot.

## Datatapaukset

::kind
---
title: Helpota elämääsi
knownTitle: Mitä tiedämme sinusta
empty: Ei vielä mitään. Kokeile kytkintä.
denial: Emme pisteytä sinua. Meillä on vain tosiasioita.
moods:
  - Tuntematon
  - Tuttu
  - Hyvin ymmärretty
  - Ennustettava
  - Täysin luettavissa
perks:
  - label: Nopeammat reitit
    description: Jaa sijaintisi
    infers: Koti, työpaikka, päivärytmi
  - label: Löydä ystäväsi
    description: Synkronoi yhteystietosi
    infers: Sosiaalinen piiri, keneen luotat
  - label: Hyvinvointivinkit
    description: Yhdistä terveysdata
    infers: Sairaudet, uni, stressi
  - label: Älykkäät säästöt
    description: Yhdistä pankkisi
    infers: Tulot, tavat, luotettavuus
---
::
