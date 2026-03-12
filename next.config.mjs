/** @type {import('next').NextConfig} */
import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: false,
    sw: 'sw.js',
    runtimeCaching: [
        {
            // Cache fonts and static assets - CacheFirst
            urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'static-font-assets',
                expiration: {
                    maxEntries: 4,
                    maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                },
            },
        },
        {
            // Cache images - CacheFirst
            urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'static-image-assets',
                expiration: {
                    maxEntries: 64,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                },
            },
        },
        {
            // Cache JS/CSS - StaleWhileRevalidate
            urlPattern: /\.(?:js|css)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'static-js-css-assets',
                expiration: {
                    maxEntries: 32,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                },
            },
        },
        {
            // Everything else - StaleWhileRevalidate for better perceived speed
            urlPattern: /^https?.*/,
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'others',
                expiration: {
                    maxEntries: 48,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                },
            },
        },
    ],
    fallbacks: {
        document: '/offline',
    },
    buildExcludes: [/middleware-manifest\.json$/],
});

const nextConfig = {
    reactStrictMode: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    async headers() {
        return [
            {
                source: '/sw.js',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=0, must-revalidate',
                    },
                    {
                        key: 'Service-Worker-Allowed',
                        value: '/',
                    },
                ],
            },
            {
                source: '/manifest.json',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=0, must-revalidate',
                    },
                ],
            },
        ];
    },
};

export default withPWA(nextConfig);
