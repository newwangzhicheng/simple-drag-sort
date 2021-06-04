import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json';

export default [
  {
    input: 'src/SimpleDragSort.ts',
    output: {
      name: 'SimpleDragSort',
      file: pkg.browser,
      format: 'umd',
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript(),
    ],
  },
  {
    input: 'src/SimpleDragSort.ts',
    external: ['throttle'],
    plugins: [
      typescript(),
    ],
    output: [
      {
        file: pkg.main,
        format: 'cjs'
      },
      {
        file: pkg.module,
        format: 'es'
      }
    ]
  }
];