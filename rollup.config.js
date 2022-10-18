import { chromeExtension, simpleReloader } from 'rollup-plugin-chrome-extension'
import { terser } from 'rollup-plugin-terser'

const isProd = process.env.NODE_ENV !== 'development'

export default {
  input: 'src/manifest.json',
  output: {
    dir: isProd ? 'dist' : 'build',
    format: 'esm'
  },
  plugins: [
    chromeExtension(),
    simpleReloader(),
    isProd && terser()
  ]
}
