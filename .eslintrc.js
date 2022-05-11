
module.exports = {
  root: true,

  env: {
    node: true
  },

  parserOptions: {
    parser: 'babel-eslint'
  },
  /** @type {import('eslint/rules').ESLintRules} */
  rules: {
    'no-console':                              process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger':                             process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'standard/computed-property-even-spacing': 'off',
    'array-element-newline':                   [
      'error',
      'always'
    ],
    'array-bracket-newline': [
      'error',
      {
        multiline: true
      }
    ],
    'new-cap':                                    'warn',
    camelcase:                                    'off',
    'vue/return-in-computed-property':            'off',
    'vue/require-prop-types':                     'off',
    'vue/no-side-effects-in-computed-properties': 'off',
    'func-call-spacing':                          2,
    'no-multi-spaces':                            [
      'error',
      {
        exceptions: {
          Property:           true,
          ImportDeclaration:  true,
          VariableDeclarator: true
        }
      }
    ],
    'object-property-newline': [
      'error',
      {
        allowAllPropertiesOnSameLine: false
      }
    ],
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: 1,
        multiline:  1
      }
    ],
    // 'vue/first-attribute-linebreak': [
    //   'error',
    //   {
    //     singleline: 'ignore',
    //     multiline:  'beside'
    //   }
    // ],
    'vue/html-closing-bracket-newline': [
      'error',
      {
        singleline: 'never',
        multiline:  'never'
      }
    ],
    'no-mixed-spaces-and-tabs': 'error',
    'key-spacing':              [
      'error',
      {
        singleLine: {
          beforeColon: false,
          afterColon:  true
        },
        multiLine: {
          beforeColon: false,
          afterColon:  true
        },
        align: {
          beforeColon: false,
          afterColon:  true,
          on:          'value'
        }
      }
    ],
    'comma-spacing': [
      'error',
      {
        before: false,
        after:  true
      }
    ],
    'no-tabs':                     0,
    'space-before-function-paren': 0,
    'space-in-parens':             0,
    'arrow-parens':                0,
    'valid-jsdoc':                 [
      0,
      {
        requireReturn:     false,
        requireReturnType: false
      }
    ],
    'comma-dangle': [
      'error',
      'never'
    ],
    'generator-star-spacing': 0,
    indent:                   [
      'error',
      2
    ],
    quotes: [
      'error',
      'single'
    ],
    'quote-props': [
      'error',
      'as-needed'
    ],
    eqeqeq: [
      'error',
      'always',
      {
        null: 'ignore'
      }
    ],
    'prefer-arrow-callback': [
      'error',
      {
        allowNamedFunctions: false,
        allowUnboundThis:    true
      }
    ],
    'no-inner-declarations': [
      'error',
      'both'
    ],
    'no-var':         'error',
    'no-unused-vars': [
      'error',
      {
        vars:               'all',
        args:               'after-used',
        ignoreRestSiblings: false,
        argsIgnorePattern:  '^_'
      }
    ],
    'object-shorthand': [
      'error',
      'always'
    ],
    'no-func-assign': 'error',
    semi:             [
      'error',
      'never'
    ],
    'no-trailing-spaces': [
      2,
      {
        skipBlankLines: false
      }
    ],
    'prefer-promise-reject-errors': 'off',
    'vue/attributes-order':         'error',
    'vue/no-confusing-v-for-v-if':  'error',
    'vue/no-v-html':                0,
    'vue/order-in-components':      'error',
    'vue/this-in-template':         'error',
    'vue/array-bracket-spacing':    'error',
    'vue/arrow-spacing':            'error',
    'vue/block-spacing':            'error',
    'vue/brace-style':              'error',
    'vue/comma-dangle':             'error',
    'vue/eqeqeq':                   [
      'error',
      'always',
      {
        null: 'ignore'
      }
    ],
    'vue/require-default-prop':      0,
    'vue/key-spacing':               'error',
    'vue/match-component-file-name': 'error',
    'multiline-ternary':             [
      'error',
      'always-multiline'
    ],
    'no-extra-parens': [
      'error',
      'all'
    ],
    'max-len': [
      'error',
      {
        code: 120
      }
    ]
  },
  "globals": {
    "globalThis": false, // means it is not writeable
  },

  extends: [
    'plugin:vue/strongly-recommended',
    '@vue/standard'
  ]
}
