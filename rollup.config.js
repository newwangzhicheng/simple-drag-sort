import typescript from '@rollup/plugin-typescript';
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
      typescript(),
    ],
  },
  {
    input: 'src/SimpleDragSort.ts',
    external: ['ms'],
    plugins: [
      typescript()
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