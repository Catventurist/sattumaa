---
title: EU-vaatimustenmukaisuuskerros
description: Mikä muuttuu EU-tilassa ja mikä ei.
navigation:
  icon: i-lucide-hammer
---

## Yhteenveto

EU-vaatimustenmukaisuus sisältää kokonaisen kerroksen. 

::tip
Kallein osa on juridinen tarkistus **(~5 000 €)**.
::

## Käyttöliittymä

| Alue | EU | Ei-EU |
|---|---|---|
| Evästesuostumus | Opt-in-ikkuna ennen ei-välttämättömiä evästeitä | Ei banneria tai passiivistan alaviitettä |
| Tekoälyn läpinäkyvyys | "Tämä toiminto käyttää tekoälyä" (AI Act) | Ei mitään |
| Tietosuojaseloste | Käsittelyperuste, säilytysaika, rekisteröintioikeudet, DPO | Yleinen "arvostamme yksityisyyttäsi" |

## Palvelin

| Alue | EU | Ei-EU |
|---|---|---|
| Datan sijainti | Vain EU-alue | Missä tahansa |
| Rekisteröidyt rajapinnat | `/api/me/data`, `/api/me/delete`, `/api/me/portability` | Ohitetaan tai parhaan yrityksen periaate |
| Lokitus | Jokainen käsittelytoimi (kuka, mitä, milloin, peruste) | Tavalliset sovelluslokit |
| Säilytys | Kova poisto ilmoitetun ajan jälkeen | "Saatamme säilyttää" |
| Tietoturvaloukkausilmoitus | 72 tunnin variotusaika valvontaviranomaiselle | "Lähetämme sähköpostia" |

## Konfiguraatio / infra

| Alue | EU | Ei-EU |
|---|---|---|
| DPA-sopimukset | Allekirjoitettu DPA jokaiselle kolmannelle osapuolelle | Käyttöehdot riittävät |
| ePrivacy | Ei seurantaa tai "sormenjälkiä" ilman suostumusta | GA4 latautuu heti |

::note
Vain 4 maailman 50 suurimmasta teknologiayhtiöstä on EU-pohjaisia. 80 % EU:ssa käytetyistä digitaaliteknologioista tuodaan Yhdysvalloista ja Kiinasta.

- Pilvipalvelut ~15% **SAP**
- Hakukoneet 0%
- Nettikauppa 1% **PrestaShop**
::

## Mikä ei muutu

### Ensi silmäyksellä

- Nuxt-konfiguraatio, reititys, komponentit, API-rakenne
- Tietokantaskeema
- Autentikointilogiikka
- Toimintalogiikat

### Byrokratia

| Mitä rakennetaan | Juridinen luokka | Laukaisija |
|---|---|---|
| Staattinen sivu, ei evästeitä | Ei mitään | — |
| Staattinen sivu + analytiikkaeväste | "Tietoyhteiskunnan palvelu" | ePrivacy |
| Sivu + kirjautuminen (mikä tahansa tunniste) | **Rekisterinpitäjä** (GDPR) | `userId` on olemassa |
| Kirjautuminen + käyttäjien tuottama sisältö | **Verkkoalusta** (DSA) | Käyttäjä tallentaa tai jakaa dataa |
| Alusta + 45 milj. kuukausittaista aktiivikäyttäjää | **Portinvartija** (DMA) | Kokorajan ylittyminen |
| Alusta + mikä tahansa LLM-ominaisuus | **Tekoälyjärjestelmä** (AI Act) | Mallin päättely |

## Uudet rajoitteet

| Uusi velvoite | Mitä rakentaa |
|---|---|
| CRA (kyberkestävyysasetus) | Haavoittuvuuksien raportointiputki (tai ainakin prosessit ja yhteystiedot) |
| EAA (saavutettavuusdirektiivi) | Saavutettavuusauditointi, näppäimistökäyttö, kontrastikorjaukset, ruudunlukijatuki |
| AI Act, 50 artikla | Koneluettava merkintä tekoälyn tuotoksiin (metadatakenttä, C2PA jne.) |
| Data Act (datasäädös) | Toimiva vienti- ja siirtorajapinta, ei lukkimista |

::warning
Koodi on helpoin osa. Tämä ei ole juridinen neuvo.
::