---
title: Lyhyesti
description: Mikä Sattuma on, sen takana olevat komponentit sekä muokkain.
navigation:
  icon: i-lucide-info
layout: default
---

::u-page-hero
---
headline: Tietoa
title: Sattumaa
description: Nuxt-sovellus, jossa on monipuolisia markdown-komponentteja, työpöytäkäyttöliittymä ja sisäänrakennettu muokkain.
links:
  - label: Avaa muokkain
    to: /edit
    icon: i-lucide-square-play
  - label: Yleisiä aiheita
    to: /help
    color: neutral
    variant: subtle
    trailingIcon: i-lucide-arrow-right
---
::

::u-page-section
---
id: win
icon: i-lucide-info
headline: Win
title: Mikä on Win?
description: Windows XP:stä inspiroitunut käyttöliittymä.
features:
  - title: Nopea
    description: Toimii hyvin nykyaikaisissa selaimissa.
    icon: i-lucide-zap
    to: /win
  - title: Monikielinen
    description: Englanti ja suomi.
    icon: i-lucide-languages
  - title: Vaalea ja tumma
    description: Muokkaa värejä ja muita asetuksia.
    icon: i-lucide-sun-moon
---
::

::::u-page-section
---
id: vue-components
icon: i-simple-icons-vuedotjs
headline: Vue
title: Vue-komponentit
description: Interaktiiviset komponentit, joita käytät Vue-sivuillasi.
---

:::u-page-grid
::u-page-card{title="Työnkulkurakentaja" description="Vedä, haaruta ja toista vaiheita automatisoidaksesi tervetuloviestit." icon="i-lucide-workflow" to="/demo?tab=workflow" variant="outline" spotlight spotlight-color="primary"}
::

::u-page-card{title="Persoonat" description="Näe, miten tiheys, tunnisteet ja ilmoitukset mukautuvat käyttäjien määrän kasvaessa." icon="i-lucide-users" to="/demo?tab=personas" variant="outline" spotlight spotlight-color="primary"}
::

::u-page-card{title="Ääni ja maine" description="Säädä sävyä, mediaa ja moderointia ja näe mainepisteet yhdellä silmäyksellä." icon="i-lucide-megaphone" to="/demo?tab=profile" variant="outline" spotlight spotlight-color="primary"}
::

:::
::::

::::u-page-section
---
id: markdown-components
icon: i-lucide-file-text
headline: Markdown
title: Markdown-komponentit
description: Komponentit, joita voit kirjoittaa suoraan markdown-dokumentteihin.
---

:::u-page-grid
::u-page-card{title="Kaaviot" description="Data visualisoituna työkaluvihjeillä." icon="i-lucide-chart-column" to="/components/markdown#charts" variant="outline" spotlight spotlight-color="primary"}
::

::u-page-card{title="Aikajana" description="Näytä tapahtumat tai vaiheet järjestyksessä pysty- tai vaakasuunnassa." icon="i-lucide-history" to="/components/markdown#timeline" variant="outline" spotlight spotlight-color="primary"}
::

::u-page-card{title="Edistymisryhmä" description="Yksi palkki, joka on jaettu segmentteihin, joiden summa on maksimiarvo." icon="i-lucide-gauge" to="/components/markdown#progress-group" variant="outline" spotlight spotlight-color="primary"}
::
:::
::::

::u-page-section
---
id: editor
icon: i-lucide-pencil-line
headline: Editori
title: Kirjoita ja lisää komponentteja
description: Markdown-editori, josta löytyy komentovalikko ja komponenttipätkiä.
features:
  - title: Komentovalikko
    description: Kirjoita / lisätäksesi lohkoja nopeasti.
    icon: i-lucide-slash
    to: /edit
  - title: Komponentit
    description: Lisää kaavioita, aikajanoja ja edistymisryhmiä.
    icon: i-lucide-blocks
    to: /components/markdown
  - title: Vienti
    description: Lataa työsi markdown-tiedostona.
    icon: i-lucide-download
---
::
