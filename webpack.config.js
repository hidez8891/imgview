const ExtractTextPlugin = require('extract-text-webpack-plugin');

const src_dir = "src/resources/app/static";
const dist_dir = "dist/resources/app/static";

module.exports = [{
        name: "tsc",
        entry: `./${src_dir}/js/index.ts`,
        output: {
            path: `${__dirname}/${dist_dir}/js`,
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
        entry: `./${src_dir}/css/index.scss`,
        output: {
            path: `${__dirname}/${dist_dir}/css`,
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
    }
];