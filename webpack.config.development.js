
const path      = require('path');
const externals = require('webpack-node-externals');
const mode      = 'development';
const devtool   = 'inline-source-map';

module.exports = {
    mode: mode,
    target: 'node',
    externals: [externals()],
    entry: {
        'client/script.js': './src/client/script.js',
        'server/main.js': './src/server/main.js'
    },
    output: {
        path: path.resolve(__dirname, 'app/'),
        filename: '[name]'
    },
    module: {
        rules: [{
            test: /\.js$/,
            include: path.resolve(__dirname, 'src'),
            exclude: /node_modules/,
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: [
                        ['env']
                    ]
                }
            }]
        }]
    },
    cache: true,
    devtool: devtool
};
