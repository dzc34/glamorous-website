/* eslint import/no-extraneous-dependencies:0 */
const fs = require('fs')
const webpack = require('webpack')
const marked = require('marked')

const renderer = new marked.Renderer()
const {LOCALE, NODE_ENV} = process.env
const USE_PREFETCH = NODE_ENV !== 'test'

renderer.heading = (text, level) => {
  const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-')

  return `<h${level}><a name="${escapedText}" href="#${escapedText}">${text}</a></h${level}>`
}

const cacheIdentifier = JSON.stringify({
  'babel-loader': require('babel-loader/package.json').version,
  'babel-core': require('babel-core/package.json').version,
  babelrc: fs.readFileSync('./.babelrc', 'utf8'),
  env: process.env.BABEL_ENV || process.env.NODE_ENV || 'development',
  locale: process.env.LOCALE,
})

module.exports = {
  distDir: `dist/${LOCALE || 'dev'}`,
  webpack: config => {
    // Add in prefetch conditionally so we don't break jest snapshot testing
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.USE_PREFETCH': JSON.stringify(USE_PREFETCH),
        'process.env.LOCALE': JSON.stringify(LOCALE),
      })
    )

    config.module.rules.forEach(rule => {
      if (rule.loader === 'babel-loader') {
        if (process.env.DISABLE_CACHE) {
          rule.options.cacheDirectory = false
        } else {
          rule.options.cacheIdentifier = cacheIdentifier
        }
      }
    })

    // Markdown loader so we can use docs as .md files
    config.module.rules.push({
      test: /\.md$/,
      use: [
        {loader: 'html-loader'},
        {loader: 'markdown-loader', options: {pedantic: true, renderer}},
      ],
    })

    config.node = config.node || {}
    Object.assign(config.node, {
      __dirname: true,
      __filename: true,
    })

    // this is useful if you want to see the transpiled
    // version of the code (like if you're working on the
    // babel plugin or something).
    // config.devtool = 'eval'

    return config
  },
  exportPathMap() {
    return {
      '/': {page: '/'},
      '/getting-started': {page: '/getting-started'},
      '/advanced': {page: '/advanced'},
      '/api': {page: '/api'},
      '/basics': {page: '/basics'},
      '/examples': {page: '/examples'},
      '/integrations': {page: '/integrations'},
    }
  },
}

// This is not transpiled
/*
  eslint
  comma-dangle: [
    2,
    {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      functions: 'never'
    }
  ]
 */
