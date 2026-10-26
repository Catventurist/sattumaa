---
title: EU compliance layer
description: What changes when EU mode is on, and what does not.
navigation:
  icon: i-lucide-hammer
---

## Summary

EU compliance is a layer. 

::tip
The legal review to confirm it is correct is the expensive part **(~€5K)**.
::

## Frontend

| Area | EU | Non-EU |
|---|---|---|
| Cookie consent | Opt-in modal before any non-essential cookie | No banner, or a passive footer notice |
| AI transparency | "This feature uses AI" disclosure (AI Act) | Nothing |
| Privacy policy | Legal basis, retention, subject rights, DPO contact | Generic "we value your privacy" |

## Backend

| Area | EU | Non-EU |
|---|---|---|
| Data residency | EU region only | Anywhere |
| Data subject endpoints | `/api/me/data`, `/api/me/delete`, `/api/me/portability` | Skip or best-effort |
| Logging | Every processing activity (who, what, when, legal basis) | Standard app logs |
| Retention | Hard delete after stated period | "We might keep it around" |
| Breach notification | 72-hour timer to the DPA | "We'll email you" |

## Config / infra

| Area | EU | Non-EU |
|---|---|---|
| DPA references | Signed DPA for every third-party service | Their ToS is the contract |
| ePrivacy | No tracking or fingerprinting without consent | GA4 on page load |

::note
Only 4 of the world's 50 largest tech companies are EU-based. 80% of digital technologies used in the EU are imported from the US and China. 

- Cloud ~15% **SAP**
- Search 0%
- ECommerce 1% **PrestaShop**
::

## What does not change

### First glance

- Nuxt config, routing, components, API structure
- Database schema
- Auth logic
- Business logic

### Bureaucracy

| What you built | Legal category | Trigger |
|---|---|---|
| Static page, no cookies | Nothing | — |
| Static page + analytics cookie | "Information society service" | ePrivacy |
| Page + login (any ID) | **Controller** (GDPR) | `userId` exists |
| Login + user-generated content | **Online platform** (DSA) | User stores/dissemates data |
| Platform + 45M MAU | **Gatekeeper** (DMA) | Scale threshold |
| Platform + any LLM feature | **AI system** (AI Act) | Model inference |

## New Limitations

| New obligation | What to build |
|---|---|
| CRA | Vulnerability reporting pipeline (or at least a process + contact) |
| EAA | A11y audit, keyboard nav, contrast fixes, screen reader support |
| AI Act Art. 50 | Machine-readable marking on AI outputs (metadata field, C2PA, etc.) |
| Data Act | Working export/switch endpoint, no lock-in |

::warning
The code is the cheap part. This is not legal advice.
::
