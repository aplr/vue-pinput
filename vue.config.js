module.exports = {
    publicPath: process.env.BUILD_DEMO ? './' : '/',
    outputDir: process.env.BUILD_DEMO ? 'docs/demo' : 'dist',
    chainWebpack: config => {
        config.module
            .rule('pegjs')
            .test(/\.pegjs$/)
            .use('pegjs-loader')
            .loader('pegjs-loader')
            .end()
    }
}
