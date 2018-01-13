module.exports = {
    entry: './resources/app/static/js/index.ts',
    output: {
        path: `${__dirname}/output/windows-amd64/resources/app/static/js`,
        filename: 'index.js'
    },
    module: {
        rules: [{
                test: /\.ts$/,
                use: 'awesome-typescript-loader'
            },
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader'
            }
        ]
    },
    resolve: {
        extensions: [
            '.ts'
        ],
        alias: {
            vue: 'vue/dist/vue.js'
        }
    },
    devtool: 'source-map'
};