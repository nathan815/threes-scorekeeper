module.exports = function override(config) {
  config.mode = 'development';
  config.optimization.minimize = false;
  return config;
};
