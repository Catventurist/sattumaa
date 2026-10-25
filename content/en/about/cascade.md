---
title: The Failure Cascade
description: Seven layers between a Finn and authorities, and what fails at each one.
navigation:
  icon: i-lucide-workflow
---

::u-stepper
---
class: w-full
color: error
items:
  - title: The man
    description: Sawmill closed, on unemployment, has a mortgage
    icon: i-lucide-user
    content: Failure mode, "I'll just check Suomi.fi later". Next, he taps his phone.
  - title: Suomi.fi mobile app
    description: 13.6 MB WebView wrapper, not native
    icon: i-lucide-smartphone
    content: Play Store review, "Write simple native app (it is more painful than webview, but webview simplest apps start for ages)". Failure mode, 40s to load, crashes on Android 15.
  - title: WebView (Chromium)
    description: Renders the Suomi.fi web UI inside the app shell
    icon: i-lucide-globe
    content: Failure mode, "some authentications didn't work" (Feb 2025, 6.5 hours). Next, an HTTPS request.
  - title: Suomi.fi portal
    description: e-ID + Data Exchange + Messages + e-Authorizations
    icon: i-lucide-landmark
    content: '"You are not entitled to refuse". Failure modes, DNS record typo (May 2024, all down); "message just says there''s a message"; wage garnishment notice, missed.'
  - title: Microsoft Azure (EU region)
    description: ~80% of EU public sector on MS infrastructure
    icon: i-lucide-cloud
    content: '"Sovereign" = EU IP address, US parent company. Failure mode, regional outage, no Finnish fallback.'
  - title: US data center
    description: CLOUD Act jurisdiction
    icon: i-lucide-server
    content: Data "in EU region" but the US company controls it. CLOUD Act, regardless of where stored. No Finnish judicial review required. No notification to the data subject. Failure mode, US warrant, Finnish court never sees it.
  - title: US authority
    description: Receives health, tax, criminal, employment, messages, e-Authorizations, everything
    icon: i-lucide-flag
    content: The old man is never notified. Finland is never notified. The forest is still there. He can't bring himself to go in anymore.
---
::

**Failure cascade** (real, from 2024-2026)

| Layer | Incident | Result |
|---|---|---|
| App | 40s load, crash | "I'll try again tomorrow" |
| WebView | Auth fails (Feb 2025) | Can't log in, calls support |
| Portal | DNS typo (May 2024) | Support line is a form on Suomi.fi. Suomi.fi is down. |
| Portal | Message doesn't link | Misses wage garnishment notice |
| Cloud | Regional outage | No paper fallback (Digital First, April 2026) |
| US DC | CLOUD Act warrant | Data gone. Nobody in Finland knows. |

**The 13.6 MB** that controls everything

- Total code the old man wrote: **0 lines.**
- Total code that controls his life: **~13.6 MB of wrapper + a web page.**
- Total outages that have cost him money: **at least 1 (wage garnishment).**
- Total times he was notified: **0.**

::u-alert{title="GovTech Prize 2025" description="The app won." icon="i-lucide-trophy" color="warning" variant="subtle"}
::

**The pyramid scheme** in one piece

::::u-page-grid{class="lg:grid-cols-4"}
:::u-page-card{title="The tax" description="Takes the money." icon="i-lucide-coins" variant="subtle"}
:::

:::u-page-card{title="The fine" description="Takes the risk." icon="i-lucide-gavel" variant="subtle"}
:::

:::u-page-card{title="The step" description="Takes the time." icon="i-lucide-hourglass" variant="subtle"}
:::

:::u-page-card{title="The surveillance" description="Takes the data." icon="i-lucide-eye" variant="subtle"}
:::
::::

- The old man is the only one who pays all four. The sawmill that closed was "structurally adjusted." 
- He is now a compliance entity, a biometric record, a digital mail recipient, and a fine that never expires.

**The past**

::u-alert{title="Before (2022)" description="Run sawmill → sell wood → done" icon="i-lucide-check" color="success" variant="subtle"}
::

**After** (2026): run sawmill

::u-accordion
---
type: multiple
items:
  - label: ETS2
    content: Monitoring plan + annual report
    icon: i-lucide-factory
  - label: EUDR
    content: Geolocation data for every plot
    icon: i-lucide-map-pin
  - label: Packaging Regulation
    content: Register in each EU country you sell to
    icon: i-lucide-package
  - label: Cyber Resilience Act
    content: If your sawmill has connected equipment, vulnerability reporting
    icon: i-lucide-cpu
  - label: AI Act
    content: If you use any AI (even a spreadsheet plugin), risk classification
    icon: i-lucide-bot
  - label: NIS 2
    content: If you're "essential" or "important," cybersecurity obligations
    icon: i-lucide-shield
  - label: Methane Regulation
    content: If you handle any gas, Tukes inspections
    icon: i-lucide-flame
  - label: GDPR
    content: DPO, data mapping, consent
    icon: i-lucide-lock
  - label: Suomi.fi
    content: Digital mail, no paper
    icon: i-lucide-mail
  - label: Police
    content: They can confirm your location via your healthcare provider
    icon: i-lucide-siren
  - label: EU Digital ID
    content: Your face is in the minimum dataset
    icon: i-lucide-scan-face
  - label: Fines
    content: Never expire, public sector now fined too
    icon: i-lucide-gavel
---
::

**The Cage**
 
::::u-page-grid{class="md:grid-cols-3"}
:::u-page-card{title="Pays for the cage" description="€2.1B+" icon="i-lucide-coins" variant="subtle"}
:::

:::u-page-card{title="Can't leave the cage" description="Mandatory, no opt-out" icon="i-lucide-lock" variant="subtle"}
:::

:::u-page-card{title="Can't see the cage" description="Webview, 40s, crashes" icon="i-lucide-eye-off" variant="subtle"}
:::

:::u-page-card{title="Can't delete the cage" description="Data can't be deleted" icon="i-lucide-trash-2" variant="subtle"}
:::

:::u-page-card{title="Gets fined for being in the cage" description="Fines never expire" icon="i-lucide-gavel" variant="subtle"}
:::

:::u-page-card{title="Gets garnished for missing the cage's mail" description="Wage garnishment" icon="i-lucide-mail-x" variant="subtle"}
:::

:::u-page-card{title="Pays for the cage's security" description="€30k bug bounty" icon="i-lucide-shield" variant="subtle"}
:::

:::u-page-card{title="Gets the cage rated below average" description="OECD 0.63" icon="i-lucide-star-half" variant="subtle"}
:::

:::u-page-card{title="Can't complain about the cage" description="The complaint form is on the cage, the cage is down, DNS typo" icon="i-lucide-message-square-x" variant="subtle"}
:::
::::

**How the village is run down**

::u-timeline
---
color: error
size: sm
default-value: 13
class: w-full
items:
  - title: Sawmill closes
    description: ETS2 + EUDR + packaging
    icon: i-lucide-factory
  - title: 60 jobs gone
    icon: i-lucide-briefcase
  - title: Population drops
    icon: i-lucide-users
  - title: School falls below 20 pupils
    icon: i-lucide-school
  - title: School closes
    description: Consolidated 30 km away
    icon: i-lucide-door-closed
  - title: Bus route cut
    icon: i-lucide-bus
  - title: Shop can't sustain foot traffic
    icon: i-lucide-footprints
  - title: Shop closes
    icon: i-lucide-store
  - title: Health center "adjusted"
    description: 200 km away
    icon: i-lucide-hospital
  - title: Post office closes
    icon: i-lucide-mail-x
  - title: Landline already gone
    description: June 2026
    icon: i-lucide-phone-off
  - title: The only way to contact the state is Suomi.fi
    icon: i-lucide-globe
  - title: Suomi.fi is a webview that takes 40 seconds
    icon: i-lucide-loader
  - title: The old man misses the wage garnishment
    icon: i-lucide-triangle-alert
---
::