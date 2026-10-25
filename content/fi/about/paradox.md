---
title: Byrokratian paradokseja
description: Absurdeja tilanteita, joissa asiat muuttuu yhä epätodellisemmaksi.
navigation:
  icon: i-lucide-scale
---

::u-alert{title="Juonipaljastus" description="Mitä alemmas listalla mennään, sitä hullummaksi menee." icon="i-lucide-triangle-alert" color="warning" variant="subtle"}
::

| # | Tilanne | Mitä verotetaan | Miksi se on absurdia |
|---|---|---|---|
| 1 | :u-button{label="Tue meitä" size="xs" variant="outline"} | :u-badge{label="Maksu" color="success" variant="subtle"} | Oikeaa rahaa liikkuu. ALV pätee. Verotettava tapahtuma on ainakin todellinen. |
| 2 | Vaihtokauppa (koodia palvelintilaa vastaan) | :u-badge{label="Palvelun markkina-arvo" color="warning" variant="subtle"} | Rahaa ei liikkunut. Verotettava tapahtuma on itse *vaihto*. |
| 3 | Lahjavero saadusta avusta | :u-badge{label="Saadun avun arvo" color="warning" variant="subtle"} | Sait apua, joten maksat 19–33 %. Veronmaksaja on *vastaanottaja*. |
| 4 | Aikapankki :u-button{label="Kirjaa tovi" size="xs" variant="outline"} | :u-badge{label="Kirjanpitomerkintä" color="warning" variant="subtle"} | Työtä ei ole vielä saatu. Rahaa ei ole. *Tietokannan numero* on palkkaa. |
| 5 | Naapuriavun raja | :u-badge{label="Riittävän pieni" color="error" variant="subtle"} | Oven pitäminen auki = ok. Lumen auraus = verotettava palvelu. Raja on se, että tarkastaja päättää. |
| 6 | **Talkoot** :u-button{label="Osallistu talkoisiin" size="xs" variant="outline"} | :u-badge{label="Työsi + syömäsi makkara" color="error" variant="subtle"} | Autoit rakentamaan latoa viikonlopun ajan. Maksat veroa siitä, mitä ammattilainen veloittaisi, JA isäntä maksaa lahjaveroa sinulle tarjotusta ruoasta. *Sosiaalinen velka* (he auttavat minua myöhemmin) on vastike. Makkara on verotettava luovutus. |
| 7 | DSA-sähköpostikehä :u-button{label="Lähetä sähköposti" size="xs" variant="outline"} | :u-badge{label="Vaatimustenmukaisuus itse" color="error" variant="subtle"} | Laki vaatii sähköpostin. Sähköposti laukaisee GDPR:n. Vaatimuksia ei voi täyttää laukaisematta sitä. |
| 8 | EAA-huomautus (Abmahnung) | :u-badge{label="Kontrastisuhde 4.2:1" color="error" variant="subtle"} | *Lakimies* (ei viranomainen) lähettää sinulle 3 500 € laskun. Ei ennakkovaroitusta. Rikkomus on kynnysarvon alittava luku. |
| 9 | AI Act ja ilmaisuus :u-button{label="Julkaise ilmaiseksi" size="xs" variant="outline"} | :u-badge{label="Painot hintaan 0 €" color="error" variant="subtle"} | Ilmainen ei ole oikeudellinen käsite. Hintalappu on 15 M€. Poikkeus vapauttaa vain helpoista kohdista. |
| 10 | Suomi 2031 :u-button{label="Tee valitus" size="xs" variant="outline"} | :u-badge{label="Sääntelijä on sääntelyn kohde" color="neutral" variant="soft"} | Lain on kirjoittanut se, mitä laki sääntelee. Kielellä, joka ei ole kieltä nähnytkään. Perusteena oleva luku ei perustu laskelmiin. Valituksen käsittelee sama malli. |

::tip
Laki kutsuu tätä järjestykseksi. Diskordiaanit kutsuvat sitä *aneristiseksi harhaksi*: ruudukko kaaoksen päällä ja sitten siitä vielä verotetaan. Kymmenen riviä ja viidennellä "tarkastaja päättää".
::

**Mitä säilyy**

::u-page-grid{class="lg:grid-cols-2"}
  :::u-page-card{title="Vain luettava sisältö" icon="i-lucide-book-open" variant="subtle"}
  #description
  Pylväskaavio, aikajana ja taulukot. Ei tilaa, dataa tai käyttäjien sisältöä.
  :::

  :::u-page-card{title="Staattiset sivut" icon="i-lucide-file-text" variant="subtle"}
  #description
  UKK, Tietoa, Lisenssi ja Ehdot. Pelkkää HTML:ää. Ei vuorovaikutusta.
  :::

  :::u-page-card{title="Ilmoita virheestä" icon="i-lucide-bug" to="https://github.com" target="_blank" variant="subtle"}
  #description
  Linkki GitHub Issuesiin. Käyttäjien sisältö on *GitHubin* alustalla. GitHub on DSA:n mukainen vastuutaho.
  :::

  :::u-page-card{title="Osallistu" icon="i-lucide-git-pull-request" to="https://github.com" target="_blank" variant="subtle"}
  #description
  Fork + PR. Ei sähköpostia, lomaketta eikä tiliä. Vuorovaikutus tapahtuu GitHubin kanssa.
  :::

  :::u-page-card{title="Tue" icon="i-lucide-heart" to="https://github.com/sponsors" target="_blank" variant="subtle"}
  #description
  Linkki GitHub Sponsorsiin. GitHub käsittelee maksun. Et ole kauppias.
  :::

  :::u-page-card{title="Tietosuojaseloste" icon="i-lucide-shield-check" variant="subtle"}
  #description
  Yksi lause: "emme kerää mitään". Ei dataa, ei selostetta, mutta se **ehkä** torjuu Abmahnung-lakimiehen.
  :::
::

::collapsible{name="Ennen kuin käytät Githubia"}

**Älä tallenna mitään arkaluonteista.** Ei salasanoja, API-avaimia, henkilötietoja tai yksityisiä asiakirjoja.

- **Julkinen oletuksena.** Kaikki työnnetty. Ongelmat, PR:t ja vanhat tuonnit näkyvät kaikille ja pysyvät historiassa, vaikka poistaisit ne myöhemmin.
- **Ei varmuuskopio.** Repon voi pyyhkiä, nimetä uudelleen, lukita tai poistaa milloin tahansa, tekijänä GitHub tai viranomaispyyntö.
- **Pidä oma kopio.** Jos data on sinulle tärkeää, tallenna se myös muualle.

::

::note
**Riitasointu**

- Hyväksymisprosessin hyväksymisessä hyväksytty hyvike hyvitetään hyvin hyljeksimällä hyötyohjelmia. - Suomi 2031

- Järjestelmä on vitsi, joka ei tiedä olevansa vitsi, kerrottuna yhden hengen yleisölle kielellä, joka ei ole ymmärrettävissä, sellaisen mallin toimesta, joka ei osaa lukea saatika tuottaa kieltä.
::