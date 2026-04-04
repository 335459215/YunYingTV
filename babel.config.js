module.exports = function (api) {
  api.cache(true);
  
  const plugins = [];
  
  // 在生产环境移除console调用以优化性能
  if (process.env.NODE_ENV === 'production') {
    plugins.push('transform-remove-console');
  }

  // Reanimated plugin must stay last for release bundle stability.
  plugins.push('react-native-reanimated/plugin');
  
  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
