---
title: Suomi.fi
description: The Suomi.fi platform, its services, and the agency systems behind it.
navigation:
  icon: i-lucide-landmark
---

## Architecture

Suomi.fi has four layers.

| Layer | What it is |
|---|---|
| Data | National registries (Population Register, Incomes Register, Business Register, etc.) |
| Service | The shared platform (8 services) |
| Interface | APIs (api.suomi.fi, avoindata.fi) and web UI |
| Consumer | Citizens, organizations, EU entities |

## Platform services

| Service | What it does | Backend |
|---|---|---|
| e-Identification | SSO login. 200M+ authentications per year, ~245 services use it. Methods: bank credentials, mobile certificate, ID card, Authenticator app (for non-Finns) | Open source, .NET + Docker, REST APIs |
| e-Authorizations | Mandate register: who is authorized to act on behalf of a company or person | Same infrastructure |
| Data Exchange Layer | X-Road (Estonian solution). The backbone connecting all 1,488 subsystems. Many-to-many interoperability instead of point-to-point | Open source (X-Road) |
| Finnish Service Catalogue | 26,000+ public services, 70,900 channels, ~358M API requests per year, 130+ integrated services. Mandatory for the whole public sector by law (571/2016) | .NET, Docker, PostgreSQL, ReactJS frontend |
| Messages | Official communication channel. Default for government-to-citizen since April 2026 | — |
| Maps | Geospatial data service | — |
| Payments | Government payments (taxes, fees) | State Treasury backend (now on Oracle Cloud) |
| Quality Tools | Service quality measurement | — |

## Subsystems

1,488 subsystems are connected to the Data Exchange Layer. Each one is an individual agency's backend.

| Agency | System | What it handles |
|---|---|---|
| Tax Administration (Vero) | ilmoitin.fi, Tulli services | Tax filing, customs (WSDL interfaces, Tulli-EMCS, Tulli-FINTARIC, etc.) |
| Kela | Own system | Social benefits, healthcare reimbursements |
| Digital and Population Data Services Agency (DVV) | PIS | Population data, identity codes, residence |
| Social Insurance Institution (SVH) | Own system | Pension, social security |
| Finnish Environment Institute (Syke) | Ryhti, Veeti | Land use, construction, environmental data |
| National Archives | sapa | Electronic archiving (REST) |
| Legal Register Centre | Public Notice Register | Court notices, legal publications |
| Municipalities (~300) | EVAKA, Mutpa, local systems | Childcare, social services, local administration |
| State Treasury | Claims and payments | Grants, subsidies (now on OCI + Azure) |
| Customs (Tulli) | EMCS, HTSY, FINSEED | Trade, excise, commodity codes |

## How a service call works

Example: a citizen files a tax return through Suomi.fi.

::steps{level="4"}

#### e-Identification authenticates the user

Bank login or mobile certificate.

#### The user lands on verohallinto.fi

This is the Tax Administration's own portal.

#### verohallinto.fi calls the Data Exchange Layer

It uses X-Road to pull population data, income data, etc.

#### The user fills in the form

The form is in verohallinto.fi's UI.

#### The agency backend processes the submission

Verohallinto's backend does the processing.

#### Messages delivers the confirmation

The confirmation arrives through the official channel.
::

::note
Suomi.fi never renders the tax form. It is the authentication, data routing and service discovery layer. The actual service is always the agency's own system.
::

## ARNG Intelligence

| Authority / Org | What they're running | Model | Biggest problem |
|---|---|---|---|
| **Ministry for Foreign Affairs** + **Valtori** | UMAI — secure AI assistant, classified level IV | Not disclosed | **Opacity.** You can't audit, evaluate, or even confirm it works. "We don't say where it's hosted" is not a security posture, it's a press release. |
| **City of Helsinki** | M365 Copilot, ~1,000 staff | GPT-4o / GPT-5.x via Azure | **Vendor lock-in.** The entire AI capability is one SaaS subscription. Microsoft changes pricing or model, and 1,000 staff lose their tool overnight. No local fallback. |
| **CGI** (platform) | KATAKRI sovereign platform, Apr 2026 | Model-agnostic, OpenAI-compatible API | **Nobody's actually using it yet.** It's a platform with no workload. "Model-agnostic" means "we haven't decided." The KATAKRI cert is real but the pipeline is empty. |
| **Sitra** (pilot) | Law-drafting experiment | FinGPT-3, Poro | **It failed and the follow-up is "try again in 2028."** The models were too small, the data wasn't pre-trained for legal text. No budget for v2 yet. |
| **Syke** | AI Vesi360, AIWaterBio | Traditional ML (CNNs, time-series) | **Not LLMs, so the "AI strategy" doesn't apply.** They're running 2018-era ML on satellite data. The 2031 platform will eventually subsume them, but until then they're a legacy island. |
| **FINe-Health Foundry** | National healthcare foundation model | Being built from scratch | **It doesn't exist yet.** 3-year project, 5.6M people's data, no model, no deployment. The "world first" is a press release for a thing that's in month 8 of 36. |
| **Finnish Defence Forces** | Data and AI Strategy (Oct 2025) | None | **It's a strategy document.** No model, no deployment, no timeline. "We will consider AI in the long term" is not a capability. |
| **2031 unified platform** | Shared AI platform for all public sector | "Most advanced available" | **It's 5 years away and the spec is a sentence.** "Most advanced available" is a procurement placeholder, not an architecture. Every agency will interpret it differently, and by 2031 "most advanced" will have moved twice. |

::tip
There is no mechanism to determine if any of this actually works before it's in production with citizens' data.
::

## Surveillance and Control

| System | What's actually running | What's in the pipeline | Deniability layer |
|---|---|---|---|
| **Graph correlation (Gotham)** | **Active.** SuPo, Poliisi, Tulli, Rajavartiolaitos all confirmed users. KRP had a "Palantir-skilled criminal superintendent" job ad (deleted after Yle called). | 2031 unified platform will consolidate all 1,488 subsystems into one graph. SuPo expansion (Oct 22) adds covert collection without suspicion. | "It's a search tool, not a scoring system. The analyst makes the judgment." |
| **Person-level risk scoring** | **Not publicly deployed.** No VPER, no COMPAS, no published risk index. | The *input* is being collected (Gotham graph + SuPo covert data + 315M fields). The model is a procurement contract away. 2031 platform spec says "most advanced available." | "We don't assign numbers. We make case-by-case assessments." |
| **Predictive policing (place)** | **Not deployed.** No PredPol, no HotSpot. Police confirm "not currently in use." | 2031 platform will have it. The legal framework (Police Act 2014) has no provision for it. | "We use data-driven resource allocation." (Meaning: we don't have the tool yet, but we will, and the law hasn't caught up.) |
| **Social credit / behavioral score** | **Does not exist.** No 0-1000, no accumulation, no decay mechanism. Binary credit mark only (disappears 30 days after payment since 2023). | The Gotham graph *is* the substrate. A score is one aggregation query away. The Svea Ekonomi case (2018) proved a private company was already scoring by gender/mother tongue/location — fined €100K, but the *capability* in the public sector is now 10× larger. | "We don't score citizens. We have factual records." (The graph *is* a score that doesn't render as a number.) |
| **Digital twin / full profile** | **Exists, classified.** Yle (June 2026): "detailed profiles using tools like Palantir, combining external data with official records." Whether it's used for target selection: "unknown." 60-year secrecy proposed. | SuPo expansion removes the "suspicion" threshold → profiles built on *everyone*, not just suspects. | "We will disclose nothing." (Yle's information request, 2 months later.) |
| **Mass surveillance without suspicion** | **Not yet law.** Current threshold: "suspicion of a crime." | Government bill (Oct 22, 2026): covert data collection on citizens *without* suspicion, automated harvesting of public info, Border Guard in supporting role. | "This is a proportionate measure for national security." (44 cyber incidents in 2025, 13% readiness — the justification.) |
| **FERMI (disinformation analysis)** | **Active, narrow.** Police University College testbed. AI for *content* analysis (disinformation detection), not person scoring. | Could be extended to person-level "radicalization" scoring. No public plan to do so. | "It's for analyzing information, not people." (True, for now.) |
| **Health data (19 sources, 5.6M)** | **Active, siloed.** 19 national health data sources. FINe-Health Foundry building a foundation model (3-year project, month ~8). | 2031 platform will unify health + tax + social + criminal into one graph. The foundation model will be the inference layer. | "Health data is protected by separate law." (Until the 2031 platform says otherwise.) |

## Dystopias Included

| Work | Author / Director | Year | Why it fits |
|---|---|---|---|
| **We** | Yevgeny Zamyatin | 1924 | The origin. "Mathematics Department" assigns you a number. Green Card = you can watch anyone. The One State is *beautiful.* D-503 is *happy.* |
| **The Trial** | Franz Kafka | 1925 | You're in the system. You don't know the rules. You can't object. The court is *kind.* It just takes a long time. |
| **Brave New World** | Aldous Huxley | 1932 | Soma. "I'm happy, and I have the right to be happy." The control is *comfort.* You don't revolt because the revolt is *inconvenient.* |
| **The Machine Stops** | E.M. Forster | 1909 | You're in your room. The Machine does everything. You've forgotten the outside. The "outside" is a *myth* your grandmother told you. |
| **Fahrenheit 451** | Ray Bradbury | 1953 | The wall screens. The family is the TV. Mildred doesn't know she's in a system. She *prefers* it. |
| **The Time Machine** | H.G. Wells | 1895 | The Eloi are *happy.* They don't know about the Morlocks. The system is *benevolent on the surface.* The horror is in the basement. |
| **Logan's Run** | William F. Nolan & George Clayton Johnson | 1967 | "The Carousel." You run to avoid "the Snap." The city is *beautiful.* Nobody questions why. |
| **Do Androids Dream of Electric Sheep?** | Philip K. Dick | 1968 | Your identity is your empathy score. The "real" you is the one the test says you are. |
| **The Man in the High Castle** | Philip K. Dick | 1962 | You don't know which layer is "real." The book might be a dream. The system is *the book.* |
| **The Stepford Wives** | Ira Levin (novel) / Bryan Forbes | 1975 / 1975 | The system is *kind.* The women are *happy.* You can't tell the difference. The horror is the *smile.* |
| **Never Let Me Go** | Kazuo Ishiguro | 2005 | The "donation." You know what's coming. You comply. Because the alternative is being *inconvenienced.* The caretakers are *nice.* |
| **The Giver** | Lois Lowry | 1993 | "Sameness." No pain. No choice. The memory is *taken.* The system is *kind.* Jonas is the one who *sees,* and he's the only one. |
| **Slaughterhouse-Five** | Kurt Vonnegut | 1969 | "So it goes." You can't opt out. The time loop *is* the system. You just... go with it. |
| **The City & The City** | China Miéville | 2009 | "Selective perception." You *literally cannot see* the other city. The rule is "do not look." The walls are in your *eyes,* not in the street. |
| **The Memory Police** | Yoko Ogawa | 2014 | Things disappear. You don't know what's gone. The system is *quiet.* No one is punished. You just... accept it. |
| **Dark City** | Alex Proyas | 1998 | The city is rebuilt every night. You don't know. The Strangers control everything. They're *almost* benevolent. They just want to find "the man with the light." |
| **The Truman Show** | Peter Weir | 1998 | The system is *kind.* The weather is *nice.* Everyone is *friendly.* You can't see the walls because the walls are *set design.* |
| **The Wind-Up Bird Chronicle** | Haruki Murakami | 1994 | The well. You fall in. You can't see the top. The system is *quiet* and *dry* and *patient.* |
| **1Q84** | Haruki Murakami | 2009-2010 | The "Little People." The alternative reality. You can't prove it. The system is *almost* the same. The difference is *one detail* you can't name. |
| **The Circle** | Dave Eggers | 2013 | "Transparency is freedom." You *voluntarily* feed the graph because it makes your life *easier.* Mae is *happy.* |
| **The Peripheral** | William Gibson | 2014 | The future is watching the present. You don't know. The "peripheral" is the signal you can see but can't *touch.* |
| **Nosedive** (Black Mirror) | Charlie Brooker | 2016 | The 0-1000 score. You smile or you drop. The system is *kind.* Lacie is *happy.* Until she isn't. |
| **Gattaca** | Andrew Niccol | 1997 | Your identity is your genetic data profile. The "you" that matters is the one in the file. Vincent is *happy* in the file. |
| **Abre los Ojos** | Pedro Amenábar | 1997 | Identity rewritten. You can't see the walls. The system is *kind.* You prefer the simulation. |
| **Equilibrium** | Kurt Wimmer | 2002 | Drugs (Thrax) suppress emotion. The system is quiet. John is the one who feels, and he's the only one. |
| **Annihilation** | Alex Garland | 2018 | The "Shimmer." You change and don't know. The system is *beautiful.* The birds are *singing.* You don't know you're different. |
| **Ex Machina** | Alex Garland | 2014 | You think you're the observer. You're in the system. The walls are *glass.* You can see out but you can't *leave.* |
| **The Island** | Michael Bay | 2005 | The clones don't know they're clones. The system is *kind.* The "real" life is a *myth* they're not allowed to believe. |
| **Oryx and Crake** | Margaret Atwood | 2003 | The "pandemic" is the system *working as designed.* The "Crakers" are *happy.* They don't know what they replaced. |
| **Koyaanisqatsi** | Godfrey Reggio (dir.) | 1982 | No plot. No characters. Just the system *running.* You're in it. You don't see it. The music is *Philip Glass.* The cut is *a blade.* |
| **The Dispossessed** | Ursula K. Le Guin | 1974 | "The system is the prison, but it's also the only thing that works." Shevek is *free.* She's also *starving.* The system is *honest* about being a system. That's the problem. |

