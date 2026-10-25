export default defineAppConfig({
  ui: {
    colors: {
      primary: 'purple',
      neutral: 'neutral'
    },
    footer: {
      slots: {
        root: 'border-t border-muted',
        left: 'text-sm text-muted'
      }
    },
    button: {
      defaultVariants: {
        variant: 'soft'
      }
    }
  },
  global: {
    picture: {
      dark: '/catbirchdark.webp',
      light: '/catbirch.webp',
      alt: 'S'
    },
    meetingLink: 'https://signal.org/',
    email: 'cat@mail.com',
    available: true
  },
  header: {
    title: 'Sattumaa',
    to: '/',
    logo: {
      alt: 'P',
      light: '/catbirch.webp',
      dark: '/catbirchdark.webp'
    },
    search: true,
    colorMode: true,
    links: [{
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/Catventurist/sattumaa',
      'target': '_blank',
      'aria-label': 'GitHub'
    }]
  },
  footer: {
    credits: `Sattumaa • © ${new Date().getFullYear()}`,
    colorMode: false,
    links: [{
      'icon': 'i-simple-icons-hive-blockchain',
      'to': 'https://ecency.com/@catventurist',
      'target': '_blank',
      'aria-label': 'Hive'
    }, {
      'icon': 'i-simple-icons-youtube',
      'to': 'https://youtube.com/@catventurist',
      'target': '_blank',
      'aria-label': 'Youtube'
    }, {
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/Catventurist/sattumaa',
      'target': '_blank',
      'aria-label': 'GitHub'
    }]
  },
  toc: {
    title: 'TOC',
    bottom: {
      title: '',
      edit: 'https://github.com/Catventurist/sattumaa/edit/main/content',
      links: [{
        icon: 'i-lucide-star',
        label: 'GitHub ⭐',
        to: 'https://github.com/Catventurist/sattumaa',
        target: '_blank'
      }, {
        icon: 'i-lucide-book-open',
        label: 'Nuxt UI',
        to: 'https://ui.nuxt.com/docs/getting-started/installation',
        target: '_blank'
      }]
    }
  },
  social: {
    links: [{
      'icon': 'i-simple-icons-hive-blockchain',
      'to': 'https://ecency.com/@catventurist',
      'target': '_blank',
      'aria-label': 'Hive'
    }, {
      'icon': 'i-simple-icons-youtube',
      'to': 'https://youtube.com/@catventurist',
      'target': '_blank',
      'aria-label': 'Youtube'
    }, {
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/Catventurist/sattumaa',
      'target': '_blank',
      'aria-label': 'GitHub'
    }]
  },
  community: {
    github: 'https://github.com/Catventurist/sattumaa',
    jitsi: 'https://meet.jit.si/sattumaa',
    telegram: 'https://telegram.org/',
    signal: 'https://signal.org/'
  }
})
