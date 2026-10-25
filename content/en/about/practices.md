---
title: Practices
description: What you can and can't run on your own domain in the EU, and what each feature triggers.
navigation:
  icon: i-lucide-gavel
---

::tip
The only rule is the Golden Rule. FOSS principles. Nothing is saved on server.
::

**EU and Finland Limitations**

| Function | Trigger | Why |
|---|---|---|
| Login / auth | :u-badge{label="GDPR" color="info" variant="subtle"} | Session ID + user ID = personal data. No escape. |
| Comments / UGC on your domain | :u-badge{label="DSA" color="warning" variant="subtle"} | You're a "platform." Need ToS, complaint mechanism, transparency report. |
| "Report a bug" form on your domain | :u-badge{label="GDPR" color="info" variant="subtle"} | Captures name/email. You're a controller. |
| Contact form | :u-badge{label="GDPR" color="info" variant="subtle"} | Same. The form *is* the data collection. |
| "Sponsor" / "tip" button on your domain | :u-badge{label="VAT + EAA" color="error" variant="subtle"} | Payment flow. You're a merchant. WCAG applies. |
| Newsletter signup | :u-badge{label="GDPR" color="info" variant="subtle"} | Email = personal data. Consent required. |
| "Remember me" / theme preference in localStorage | :u-badge{label="GDPR" color="info" variant="subtle"} | Persistent ID linked to a person. |
| Any cookie (even "functional") | :u-badge{label="GDPR" color="info" variant="subtle"} | *Breyer*: IP + cookie = personal data. |
| Time bank / tovi ledger | :u-badge{label="Income tax (2013 ruling)" color="error" variant="subtle"} | The *ledger entry* is a wage at market value. No work received yet. Still taxable. |
| Barter (code for hosting, design for domain) | :u-badge{label="VAT" color="error" variant="subtle"} | "Supply of services for consideration." No money needed. |
| Talkoot / community work with social debt | :u-badge{label="Gift tax (recipient) + income tax (provider)" color="error" variant="subtle"} | The makkara is a transfer. The "they'll help me later" is consideration. |
| AI chatbot on your domain | :u-badge{label="AI Act (deployer)" color="primary" variant="subtle"} | Transparency notice, usage logs. "You're talking to a bot." |
| Hosting other people's content | :u-badge{label="NIS2" color="warning" variant="subtle"} | "Important entity." Incident reporting, risk management. |
| Email address in footer | :u-badge{label="GDPR" color="info" variant="subtle"} | People will email you. Their email = personal data. You're a controller. |
| "Welcome back" banner (localStorage) | :u-badge{label="GDPR" color="info" variant="subtle"} | Persistent identifier. |
| User-generated content of any kind on your domain | :u-badge{label="DSA" color="warning" variant="subtle"} | The moment a human writes something on your page, you're a platform. |


::note
Bureaucracy
- Forced to use `useState` instead of `localStorage`, if visitors are from **EU**. _Commented out from code_.
- No server functions or API:s, except for md document route query `[...slug].md.get.ts`.
- `colorMode` and `i18n` used cookies by default.
- **GDPR-viable** Bunny fonts.
::

```ts
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxtjs/i18n'],
  devtools: { enabled: false },
  telemetry: false,
  colorMode: {
    preference: 'dark',
    fallback: 'light',
    storage: 'sessionStorage'
  },
  fonts: {
    provider: 'bunny',
    defaults: {
      preload: true
    },
    families: [
      { name: 'Finlandica' }
    ]
  },
  i18n: {
    defaultLocale: 'en',
    strategy: 'prefix',
    locales: [
      { code: 'en', name: 'English', language: 'en-US', flag: '🇺🇸', dir: 'ltr', file: 'en.yml' },
      { code: 'fi', name: 'Suomi', language: 'fi-FI', flag: '🇫🇮', dir: 'ltr', file: 'fi.yml' }
    ],
    detectBrowserLanguage: {
      useCookie: false,
      redirectOn: 'root'
    }
  }
})
```
