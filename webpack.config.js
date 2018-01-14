const ExtractTextPlugin = require('extract-text-webpack-plugin');

const src_dir = "src/resources/app";
const dist_dir = "dist/resources/app";

module.exports = [{
        name: "tsc",
        entry: `./${src_dir}/static/js/index.ts`,
        output: {
            path: `${__dirname}/${dist_dir}/static/js`,
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
            ]
        },
        devtool: 'source-map'
    },
    {
        name: "scss",
        entry: `./${src_dir}/static/css/index.scss`,
        output: {
            path: `${__dirname}/${dist_dir}/static/css`,
            filename: 'index.css'
        },
        module: {
            rules: [{
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    use: [{
                        loader: 'css-loader',
                        options: {
                            url: false
                        }
                    }, {
                        loader: 'sass-loader'
                    }],
                    fallback: 'style-loader'
                })
            }]
        },
        plugins: [
            new ExtractTextPlugin('index.css')
        ]
    },
    {
        name: "html",
        entry: `./${src_dir}/index.html`,
        output: {
            path: `${__dirname}/${dist_dir}`,
            filename: 'index.html'
        },
        module: {
            rules: [{
                test: /\.html$/,
                use: ExtractTextPlugin.extract({
                    use: ['html-loader']
                })
            }]
        },
        plugins: [
            new ExtractTextPlugin('index.html')
        ]
    }
];