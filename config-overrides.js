const path = require('path');
module.exports = function override(config, env) {
  config.module.rules.push({
    test: /\.(js|mjs|jsx|ts|tsx)$/,
    include: path.resolve(__dirname, 'node_modules'),
    use: [
      {
        loader: require.resolve('babel-loader'),
        options: {
          presets: [require.resolve('@babel/preset-react')],
          plugins: [
            require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
            require.resolve('@babel/plugin-proposal-optional-chaining'),
          ],
        },
      },
    ],
  });

  return config;
};
