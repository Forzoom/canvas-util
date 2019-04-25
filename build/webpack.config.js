const path = require('path');

exports.module = {
    mode: 'development',
    entry: [ '../src/index.ts' ],
    output: {
        path: path.join(__dirname, '/../dist/'),
        filename: 'canvas-util.cjs.js',
    },
    resolve: {
        extensions: [ '.ts', '.js' ]
    },
}
