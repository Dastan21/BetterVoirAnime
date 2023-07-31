import terser from '@rollup/plugin-terser'
import { chromeExtension, simpleReloader } from 'rollup-plugin-chrome-extension'
import copy from 'rollup-plugin-copy'
import css from 'rollup-plugin-import-css'
import svg from 'rollup-plugin-svg-import'

const isProd = process.env.NODE_ENV !== 'development'

const builds = [{
  input: 'src/extension.js',
  output: {
    file: 'dist/script.js',
    format: 'esm'
  },
  plugins: [
    copy({
      targets: [
        { src: 'src/manifest.json', dest: 'dist' },
        { src: 'src/public', dest: 'dist', deep: true }
      ]
    }),
    svg({
      stringify: true
    }),
    css({
      output: 'style.css',
      minify: isProd
    }),
    isProd && terser()
  ]
}]

if (!isProd) {
  builds.push({
    input: 'dist/manifest.json',
    output: {
      dir: 'dev',
      format: 'esm'
    },
    plugins: [
      chromeExtension(),
      simpleReloader()
    ]
  })
}

export default builds
