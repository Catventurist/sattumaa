---
title: Suomi.fi
description: Suomi.fi-alusta, palvelut ja viranomaisjärjestelmät sen takana.
navigation:
  icon: i-lucide-landmark
---

## Arkkitehtuuri

Suomi.fi koostuu neljästä kerroksesta.

| Kerros | Mitä se on |
|---|---|
| Data | Kansalliset rekisterit (väestötietojärjestelmä, tulorekisteri, kaupparekisteri jne.) |
| Palvelu | Yhteinen alusta (8 palvelua) |
| Rajapinta | Rajapinnat (api.suomi.fi, avoindata.fi) ja verkkokäyttöliittymä |
| Käyttäjä | Kansalaiset, organisaatiot, EU-toimijat |

## Alustan palvelut

| Palvelu | Mitä se tekee | Taustajärjestelmä |
|---|---|---|
| Suomi.fi-tunnistus | Kertakirjautuminen (SSO). Yli 200 milj. tunnistautumista vuodessa, noin 245 palvelun käyttäjää. Tunnistustavat: pankkitunnukset, mobiilivarmenne, henkilökortti, Auth-sovellus (ulkomaalaisille) | Avoin lähdekoodi, .NET + Docker, REST-rajapinnat |
| Suomi.fi-valtuudet | Valtuusrekisteri: kuka saa toimia yrityksen tai henkilön puolesta | Sama infrastruktuuri |
| Palveluväylä | X-Road (virolainen ratkaisu). Runko, joka yhdistää kaikki 1 488 alijärjestelmää. Moni-moneen-yhteentoimivuus pisteestä pisteeseen-integraatioiden sijaan | "Avoin lähdekoodi" (X-Road) |
| Palvelutietovaranto | Yli 26 000 julkista palvelua, 70 900 asiointikanavaa, noin 358 milj. API-kutsua vuodessa, yli 130 integroitua palvelua. Pakollinen koko julkiselle sektorille lain nojalla (571/2016) | .NET, Docker, PostgreSQL, ReactJS-käyttöliittymä |
| Suomi.fi-viestit | Viranomaisten virallinen viestintäkanava. Oletuskanava viranomaisilta kansalaisille huhtikuusta 2026 alkaen | — |
| Suomi.fi-kartat | Paikkatietopalvelu | — |
| Suomi.fi-maksut | Valtion maksut (verot, maksut) | Valtiokonttorin taustajärjestelmä (nykyisin Oracle Cloudissa) |
| Laatutyökalut | Palvelujen laadun mittaus | — |

## Alijärjestelmät

Palveluväylään on liitetty 1 488 alijärjestelmää. Jokainen niistä on yksittäisen viranomaisen taustajärjestelmä.

| Viranomainen | Järjestelmä | Mitä se käsittelee |
|---|---|---|
| Verohallinto | ilmoitin.fi, Tullin palvelut | Veroilmoitukset, tulli (WSDL-rajapinnat, Tulli-EMCS, Tulli-FINTARIC jne.) |
| Kela | Oma järjestelmä | Sosiaalietuudet, sairaanhoitokorvaukset |
| Digi- ja väestötietovirasto (DVV) | PIS | Väestötiedot, henkilötunnukset, kotipaikka |
| Sosiaalivakuutuslaitos (SVH) | Oma järjestelmä | Eläkkeet, sosiaaliturva |
| Suomen ympäristökeskus (Syke) | Ryhti, Veeti | Maankäyttö, rakentaminen, ympäristötiedot |
| Kansallisarkisto | sapa | Sähköinen arkistointi (REST) |
| Oikeusrekisterikeskus | Julkinen kuulutusrekisteri | Oikeudelliset kuulutukset ja julkaisut |
| Kunnat (~300) | EVAKA, Mutpa, paikalliset järjestelmät | Varhaiskasvatus, sosiaalipalvelut, paikallishallinto |
| Valtiokonttori | Saatavat ja maksut | Avustukset, tuet (nykyisin OCI + Azure) |
| Tulli | EMCS, HTSY, FINSEED | Kauppa, valmisteverot, tavarakoodit |

## Miten palvelukutsu toimii

Esimerkki: kansalainen täyttää veroilmoituksen Suomi.fi:n kautta.

::steps{level="4"}

#### Suomi.fi-tunnistus tunnistaa käyttäjän

Pankkitunnukset tai mobiilivarmenne.

#### Käyttäjä siirtyy verohallinto.fi-palveluun

Se on Verohallinnon oma portaali.

#### verohallinto.fi kutsuu Palveluväylää

Se hakee X-Roadin kautta väestötiedot, tulotiedot, yms.

#### Käyttäjä täyttää lomakkeen

Lomake on verohallinto.fi:n käyttöliittymässä.

#### Viranomaisen taustajärjestelmä käsittelee lähetyksen

Verohallinnon taustajärjestelmä hoitaa käsittelyn.

#### Suomi.fi-viestit toimittaa vahvistuksen

Vahvistus saapuu virallista viestikanavaa pitkin.
::

::note
Suomi.fi ei näytä veroilmoituslomaketta itse. Se on tunnistautumisien, datanvälityksen ja palveluiden löytämisen kerros. Varsinainen palvelu on aina viranomaisen oma järjestelmä.
::

## Arpomisäly

| Viranomainen / organisaatio | Mitä ne ajavat | Malli | Suurin ongelma |
|---|---|---|---|
| **Ulkoministeriö** + **Valtori** | UMAI: suojattu tekoälyavustaja, turvaluokka IV | Ei julkistettu | **Läpinäkymättömyys.** Sitä ei voi auditoida, arvioida tai edes varmistaa toimivaksi. "Emme kerro, missä sitä ajetaan" ei ole tietoturvakäytäntö vaan lehdistötiedote. |
| **Helsingin kaupunki** | M365 Copilot, ~1 000 työntekijää | GPT-4o / GPT-5.x Azuren kautta | **Toimittajalukko.** Tekoälykyvykkyys on yksi SaaS-tilaus. Jos Microsoft muuttaa hinnoittelua tai mallia, 1 000 työntekijää menettää työkalunsa yhdessä yössä. Paikallista varajärjestelmää ei ole. |
| **CGI** (alusta) | KATAKRI-suvereeni alusta, huhtikuu 2026 | Mallista riippumaton, OpenAI-yhteensopiva API | **Kukaan ei vielä käytä sitä.** Se on alusta ilman työkuormaa. "Mallista riippumaton" tarkoittaa "emme ole vielä päättäneet". KATAKRI-sertifikaatti on aito, mutta putki on tyhjä. |
| **Sitra** (pilotti) | Lainvalmistelukokeilu | FinGPT-3, Poro | **Se epäonnistui ja jatkoksi luvataan "yritetään uudelleen 2028".** Mallit olivat liian pieniä, eikä dataa ollut esikoulutettu juridiselle tekstille. Versiolle 2 ei ole vielä budjettia. |
| **Syke** | AI Vesi360, AIWaterBio | Perinteinen koneoppiminen (CNN:t, aikasarjat) | **Ei LLM:iä, joten "tekoälystrategia" ei koske niitä.** Ne ajavat vuoden 2018 tason koneoppimista satelliittidatalla. Vuoden 2031 alusta niellee ne aikanaan, mutta siihen asti ne ovat perinnejärjestelmien saareke. |
| **FINe-Health Foundry** | Kansallinen terveydenhuollon perustamalli | Rakennetaan alusta alkaen | **Sitä ei ole vielä olemassa.** Kolmen vuoden hanke, 5,6 miljoonan ihmisen data, ei mallia, ei käyttöönottoa. "Maailman ensimmäinen" on lehdistötiedote asiasta, joka on kuukaudessa 8/36. |
| **Puolustusvoimat** | Data- ja tekoälystrategia (loka 2025) | Ei mitään | **Se on strategia-asiakirja.** Ei mallia, ei käyttöönottoa, ei aikataulua. "Harkitsemme tekoälyä pitkällä aikavälillä" ei ole kyvykkyyttä. |
| **Vuoden 2031 yhtenäinen alusta** | Yhteinen tekoälyalusta koko julkiselle sektorille | "Edistynein saatavilla oleva" | **Se on viiden vuoden päässä ja perusteena on yksi lause.** Hankinnan paikkamerkki arkkitehtuurin sijaan. Jokainen virasto tulkitsee sen eri tavalla ja vuoteen 2031 mennessä "edistynein" on vaihtunut kahdesti. |

::tip
Ei ole mitään mekanismia selvittää, toimiiko mikään näistä oikeasti. Ennenkuin se on käytössä kansalaisten datan mukana.
::

## Valvonta ja kontrolli

| Järjestelmä | Mikä oikeasti on käytössä | Mitä on valmisteilla | Kiistämiskerros |
|---|---|---|---|
| **Graafikorrelaatio (Gotham)** | **Aktiivinen.** Supo, poliisi, Tulli ja Rajavartiolaitos ovat kaikki vahvistettuja käyttäjiä. KRP:llä oli "Palantir-osaava rikosylitarkastaja" -työpaikkailmoitus (poistettiin, kun Yle soitti). | Vuoden 2031 yhtenäinen alusta yhdistää kaikki 1 488 alijärjestelmää yhdeksi graafiksi. Supon laajennus (22.10.) lisää peitellyn tiedonhankinnan ilman epäilyä. | "Se on hakutyökalu, ei pisteytysjärjestelmä. Analyytikko tekee arvion." |
| **Henkilötason riskipisteytys** | **Ei julkisesti käytössä.** Ei VPER:iä, ei COMPASia, ei julkaistua riski-indeksiä. | *Syötettä* kerätään (Gotham-graafi + Supon peitelty data + 315 milj. kenttää). Malli on yhden hankintasopimuksen päässä. Vuoden 2031 alustan määrittelyssä lukee "edistynein saatavilla oleva". | "Emme anna numeroita. Teemme tapauskohtaisia arvioita." |
| **Ennakoiva poliisitoiminta (paikka)** | **Ei käytössä.** Ei PredPolia, ei HotSpotia. Poliisi vahvistaa: "ei tällä hetkellä käytössä." | Vuoden 2031 alustalla se on. Lainsäädännössä (poliisilaki 2014) ei ole siitä säännöstä. | "Käytämme dataohjattua resurssien kohdentamista." (Eli: meillä ei ole työkalua vielä, mutta tulee, eikä laki ole pysynyt perässä.) |
| **Sosiaalinen luottoluokitus / käyttäytymispisteet** | **Ei ole olemassa.** Ei asteikkoa 0-1000, ei kertymistä, ei vanhenemismekanismia. Vain binäärinen maksuhäiriömerkintä (poistuu 30 päivää maksun jälkeen vuodesta 2023 alkaen). | Gotham-graafi *on* alusta tälle. Pisteytys on yhden aggregaatiokyselyn päässä. Svea Ekonomin tapaus (2018) osoitti, että yksityinen yritys pisteytti jo sukupuolen, äidinkielen ja asuinpaikan perusteella: sakko 100 000 €, mutta julkisen sektorin *kyvykkyys* on nyt 10 kertaa suurempi. | "Emme pisteytä kansalaisia. Meillä on tosiasiallisia tietoja." (Graafi *on* pisteytys, joka ei näy numerona.) |
| **Digitaalinen kaksonen / täydellinen profiili** | **On olemassa, salainen.** Yle (kesäkuu 2026): "yksityiskohtaisia profiileja Palantirin kaltaisilla työkaluilla, jotka yhdistävät ulkoista dataa viranomaisrekistereihin." Käytetäänkö kohteiden valintaan: "ei tiedossa." Ehdotettu 60 vuoden salassapitoa. | Supon laajennus poistaa "epäilyn" kynnyksen → profiileja rakennetaan *kaikista*, ei vain epäillyistä. | "Emme kerro mitään." (Ylen tietopyyntöön vastattiin kahden kuukauden kuluttua.) |
| **Massavalvonta ilman epäilyä** | **Ei vielä laki.** Nykyinen kynnys: "rikosepäily." | Hallituksen esitys (22.10.2026): peitelty tiedonhankinta kansalaisista *ilman* epäilyä, julkisen tiedon automaattinen kerääminen, Rajavartiolaitos tukirooliin. | "Tämä on oikeasuhteinen toimenpide kansalliseksi turvallisuudeksi." (44 kyberhäiriötä vuonna 2025, 13 % valmius: perustelu.) |
| **FERMI (disinformaatioanalyysi)** | **Aktiivinen, suppea.** Poliisiammattikorkeakoulun testialusta. Tekoäly *sisällön* analysointiin (disinformaation tunnistus), ei henkilöiden pisteytykseen. | Voitaisiin laajentaa henkilötason "radikalisoitumispisteytykseen." Julkista suunnitelmaa ei ole. | "Se on tiedon analysointiin, ei ihmisten." (Totta, toistaiseksi.) |
| **Terveysdata (19 lähdettä, 5,6 milj.)** | **Aktiivinen, siiloutunut.** 19 kansallista terveystietolähdettä. FINe-Health Foundry rakentaa perustamallia (3 vuoden hanke, kuukausi ~8). | Vuoden 2031 alusta yhdistää terveys-, vero-, sosiaali- ja rikostiedot yhdeksi graafiksi. Perustamalli on päättelykerros. | "Terveystietoja suojaa erillinen laki." (Kunnes vuoden 2031 alusta toisin sanoo.) |

## Dystopiakokonaisuus

| Teos | Tekijä / ohjaaja | Vuosi | Miksi sopii |
|---|---|---|---|
| **Me** | Jevgeni Zamjatin | 1924 | Alkuperä. "Matematiikkaosasto" antaa sinulle numeron. Vihreä kortti = voit tarkkailla ketä tahansa. Yhtenäisvaltio on *kaunis.* D-503 on *onnellinen.* |
| **Oikeusjuttu** | Franz Kafka | 1925 | Olet järjestelmässä. Et tiedä sääntöjä. Et voi vastustaa. Tuomioistuin on *ystävällinen.* Se vain kestää kauan. |
| **Uljas uusi maailma** | Aldous Huxley | 1932 | Soma. "Olen onnellinen, ja minulla on oikeus olla onnellinen." Kontrolli on *mukavuutta.* Et kapinoi, koska kapina on *hankalaa.* |
| **The Machine Stops** | E. M. Forster | 1909 | Olet huoneessasi. Kone tekee kaiken. Olet unohtanut ulkomaailman. "Ulkopuoli" on *myytti*, jonka isoäitisi kertoi. |
| **Fahrenheit 451** | Ray Bradbury | 1953 | Seinänäytöt. Perhe on televisio. Mildred ei tiedä olevansa järjestelmässä. Hän *haluaa* sen. |
| **Aikakone** | H. G. Wells | 1895 | Eloit ovat *onnellisia.* He eivät tiedä morlokeista. Järjestelmä on *pinnalta hyväntahtoinen.* Kauhu on kellarissa. |
| **Logan's Run** | William F. Nolan & George Clayton Johnson | 1967 | "Karuselli." Juokset välttääksesi "napsahduksen." Kaupunki on *kaunis.* Kukaan ei kysy miksi. |
| **Uneksivatko androidit sähkölampaista?** | Philip K. Dick | 1968 | Identiteettisi on empatiapisteesi. "Todellinen" sinä on se, jonka testi sanoo sinun olevan. |
| **Mies korkeassa linnassa** | Philip K. Dick | 1962 | Et tiedä, mikä kerros on "todellinen." Kirja voi olla uni. Järjestelmä on *kirja.* |
| **Stepfordin vaimot** | Ira Levin (romaani) / Bryan Forbes (elokuva) | 1972 / 1975 | Järjestelmä on *ystävällinen.* Naiset ovat *onnellisia.* Eroa ei näe. Kauhu on *hymy.* |
| **Älä päästä minua pois** | Kazuo Ishiguro | 2005 | "Lahjoitus." Tiedät, mitä on tulossa. Tottelet. Koska vaihtoehto on *vaivalloisuus.* Hoitajat ovat *mukavia.* |
| **Lahjoittaja** | Lois Lowry | 1993 | "Samanlaisuus." Ei kipua. Ei valintaa. Muisti *viedään.* Järjestelmä on *ystävällinen.* Jonas on se, joka *näkee*, ja ainoa. |
| **Teurastamo 5** | Kurt Vonnegut | 1969 | "Sellaista on." Et voi jättäytyä pois. Aikasilmukka *on* järjestelmä. Vain... menet mukana. |
| **The City & The City** | China Miéville | 2009 | "Valikoiva havaitseminen." Et *kirjaimellisesti voi nähdä* toista kaupunkia. Sääntö on "älä katso." Muurit ovat *silmissäsi*, eivät kadulla. |
| **The Memory Police** | Yoko Ogawa | 2014 | Asiat katoavat. Et tiedä, mikä on poissa. Järjestelmä on *hiljainen.* Ketään ei rangaista. Vain... hyväksyt sen. |
| **Dark City** | Alex Proyas | 1998 | Kaupunki rakennetaan uudelleen joka yö. Et tiedä sitä. Muukalaiset hallitsevat kaikkea. He ovat *melkein* hyväntahtoisia. He haluavat vain löytää "miehen, jolla on valo." |
| **Truman Show** | Peter Weir | 1998 | Järjestelmä on *ystävällinen.* Sää on *kaunis.* Kaikki ovat *ystävällisiä.* Et näe seiniä, koska seinät ovat *lavastetta.* |
| **The Wind-Up Bird Chronicle** | Haruki Murakami | 1994 | Kaivo. Putoat sinne. Et näe yläreunaa. Järjestelmä on *hiljainen* ja *kuiva* ja *kärsivällinen.* |
| **1Q84** | Haruki Murakami | 2009-2010 | "Little People." Vaihtoehtoinen todellisuus. Et voi todistaa sitä. Järjestelmä on *melkein* sama. Ero on *yksi yksityiskohta*, jota et osaa nimetä. |
| **The Circle** | Dave Eggers | 2013 | "Läpinäkyvyys on vapautta." Syötät graafia *vapaaehtoisesti*, koska se tekee elämästäsi *helpompaa.* Mae on *onnellinen.* |
| **The Peripheral** | William Gibson | 2014 | Tulevaisuus tarkkailee nykyisyyttä. Et tiedä sitä. "Peripheral" on signaali, jonka näet mutta et voi *koskea.* |
| **Nosedive** (Black Mirror) | Charlie Brooker | 2016 | Asteikko 0-1000. Hymyilet tai putoat. Järjestelmä on *ystävällinen.* Lacie on *onnellinen.* Kunnes ei ole. |
| **Gattaca** | Andrew Niccol | 1997 | Identiteettisi on geneettinen dataprofiilisi. Sinä, jolla on merkitystä, on se, joka on tiedostossa. Vincent on *onnellinen* tiedostossa. |
| **Abre los ojos** | Alejandro Amenábar | 1997 | Identiteetti kirjoitetaan uusiksi. Et näe seiniä. Järjestelmä on *ystävällinen.* Pidät simulaatiosta enemmän. |
| **Equilibrium** | Kurt Wimmer | 2002 | Lääkkeet (Thrax) tukahduttavat tunteet. Järjestelmä on *hiljainen.* John on se, joka *tuntee*, ja ainoa. |
| **Annihilation** | Alex Garland | 2018 | "Kajo." Muutut etkä tiedä sitä. Järjestelmä on *kaunis.* Linnut *laulavat.* Et tiedä olevasi erilainen. |
| **Ex Machina** | Alex Garland | 2014 | Luulet olevasi tarkkailija. Olet järjestelmässä. Seinät ovat *lasia.* Näet ulos mutta et pääse *pois.* |
| **The Island** | Michael Bay | 2005 | Kloonit eivät tiedä olevansa klooneja. Järjestelmä on *ystävällinen.* "Oikea" elämä on *myytti*, johon heidän ei sallita uskoa. |
| **Oryx and Crake** | Margaret Atwood | 2003 | "Pandemia" on järjestelmä *toimien suunnitellusti.* "Crakerit" ovat *onnellisia.* He eivät tiedä, mitä korvasivat. |
| **Koyaanisqatsi** | Godfrey Reggio (ohj.) | 1982 | Ei juonta. Ei henkilöitä. Vain järjestelmä *käynnissä.* Olet siinä. Et näe sitä. Musiikki on *Philip Glassin.* Leikkaus on *terä.* |
| **Haltuunotetut** | Ursula K. Le Guin | 1974 | "Järjestelmä on vankila, mutta se on myös ainoa asia, joka toimii." Shevek on *vapaa.* Hän on myös *nälkäinen.* Järjestelmä on *rehellinen* siitä, että se on järjestelmä. Siinä on ongelma. |
