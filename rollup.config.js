import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from  'rollup-plugin-typescript';

export default {
  input: 'src/SimpleSort.ts',
  output: {
    name: 'SimpleSort',
    file: 'dist/SimpleSort.js',
    format: 'umd',
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
  ],
};