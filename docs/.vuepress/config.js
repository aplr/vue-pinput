module.exports = ctx => ({
    locales: {
        '/': {
            lang: 'en-US',
            title: 'VuePinput',
            description: ''
        }
    },
    head: [
        // ['link', { rel: 'icon', href: `/logo.png` }],
        // ['link', { rel: 'manifest', href: '/manifest.json' }],
        // ['meta', { name: 'theme-color', content: '#3eaf7c' }],
        // ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
        // ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
        // ['link', { rel: 'apple-touch-icon', href: `/icons/apple-touch-icon-152x152.png` }],
        // ['link', { rel: 'mask-icon', href: '/icons/safari-pinned-tab.svg', color: '#3eaf7c' }],
        // ['meta', { name: 'msapplication-TileImage', content: '/icons/msapplication-icon-144x144.png' }],
        // ['meta', { name: 'msapplication-TileColor', content: '#000000' }]
    ],
    serviceWorker: true,
    base: ctx.isProd ? '/vue-pinput/' : '/',
    themeConfig: {
        repo: 'aplr/vue-pinput',
        smoothScroll: true,
        docsDir: 'docs',
        locales: {
            '/': {
                label: 'English',
                selectText: 'Languages',
                editLinkText: 'Edit this page on GitHub',
                nav: [
                    {
                        text: 'Guide',
                        link: '/guide/'
                    },
                    {
                        text: 'Demo',
                        link: 'https://aplr.github.io/vue-pinput/demo'
                    },
                    {
                        text: 'Release Notes',
                        link: 'https://github.com/vuejs/vue-router/releases'
                    }
                ],
                sidebar: [
                    '/en/installation.md',
                    '/en/',
                    {
                        title: 'Essentials',
                        collapsable: false,
                        children: [
                            '/en/guide/',
                        ]
                    }
                ]
            }
        }
    },
    plugins: [
        ['@vuepress/back-to-top', true],
        ['@vuepress/pwa', {
            serviceWorker: true,
            updatePopup: true
        }],
        ['@vuepress/medium-zoom', true],
        ['@vuepress/google-analytics', {
            ga: 'UA-128189152-1'
        }],
    ]
})
