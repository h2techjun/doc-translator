/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
        ],
    },
    async redirects() {
        return [
            {
                source: '/inbox',
                destination: '/',
                permanent: true,
            },
            {
                source: '/messages',
                destination: '/',
                permanent: true,
            },
        ];
    },
};

module.exports = nextConfig;
