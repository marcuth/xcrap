import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import glob from 'glob';
import path from 'path';

const entries = glob.sync('src/**/*.ts').map(file => ({
    input: path.resolve(file),
    output: [
        {
            file: file.replace('src', 'dist').replace('.ts', '.mjs'),
            format: 'esm',
        },
        {
            file: file.replace('src', 'dist').replace('.ts', '.cjs'),
            format: 'cjs',
        }
    ],
    plugins: [
        resolve(),
        commonjs(),
        typescript()
    ]
}));

export default entries;
