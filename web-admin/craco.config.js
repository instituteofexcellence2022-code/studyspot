const path = require('path');

module.exports = {
  eslint: {
    enable: false,  // Disabled due to plugin conflicts
  },
  jest: {
    configure: (jestConfig) => {
      // Ignore E2E tests in unit test runs
      jestConfig.testPathIgnorePatterns = [
        ...(jestConfig.testPathIgnorePatterns || []),
        '<rootDir>/src/__tests__/e2e/',
      ];
      // Allow transforming axios ESM package
      jestConfig.transformIgnorePatterns = [
        'node_modules/(?!(axios)/)'
      ];
      // Help resolver find monorepo root node_modules if needed
      jestConfig.moduleDirectories = [
        'node_modules',
        '<rootDir>/node_modules',
        path.resolve(__dirname, '..', 'node_modules')
      ];
      return jestConfig;
    },
  },
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Memory optimization: Reduce parallelism
      webpackConfig.parallelism = 1;
      
      // Optimize for large codebases
      if (env === 'production') {
        // Disable source maps to reduce memory usage
        webpackConfig.devtool = false;
        
        // Optimize chunk splitting for better performance and reduced memory
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          minimize: true,
          // Add module concatenation for smaller bundles
          concatenateModules: true,
          // Remove empty chunks
          removeEmptyChunks: true,
          // Merge duplicate chunks
          mergeDuplicateChunks: true,
          splitChunks: {
            chunks: 'all',
            minSize: 30000,       // Increased from 20000
            maxSize: 244000,      // Reduced from 350000 to save memory
            maxAsyncRequests: 10, // Reduced from 15
            maxInitialRequests: 8, // Reduced from 15
            cacheGroups: {
              // React and core libraries
              react: {
                test: /[\\/]node_modules[\\/](react|react-dom|react-router)[\\/]/,
                name: 'react-core',
                chunks: 'all',
                priority: 30,
                enforce: true,
                reuseExistingChunk: true,
              },
              // Material-UI components - split into smaller chunks
              muiCore: {
                test: /[\\/]node_modules[\\/]@mui[\\/]material[\\/]/,
                name: 'mui-material',
                chunks: 'all',
                priority: 25,
                enforce: true,
                reuseExistingChunk: true,
              },
              muiIcons: {
                test: /[\\/]node_modules[\\/]@mui[\\/]icons-material[\\/]/,
                name: 'mui-icons',
                chunks: 'async',
                priority: 24,
                reuseExistingChunk: true,
              },
              // Redux and state management
              redux: {
                test: /[\\/]node_modules[\\/](@reduxjs|redux|react-redux|redux-persist)[\\/]/,
                name: 'redux-state',
                chunks: 'all',
                priority: 20,
                enforce: true,
                reuseExistingChunk: true,
              },
              // Charts - lazy load by default
              charts: {
                test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
                name: 'charts',
                chunks: 'async',
                priority: 15,
                reuseExistingChunk: true,
              },
              // Other vendor libraries
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
                priority: 10,
                minChunks: 2,
                maxSize: 200000, // Limit vendor chunk size
                reuseExistingChunk: true,
              },
              // Common components
              common: {
                name: 'common',
                minChunks: 2,
                chunks: 'all',
                priority: 5,
                maxSize: 150000,
                reuseExistingChunk: true,
              },
            },
          },
        };

        // Optimize performance limits
        webpackConfig.performance = {
          hints: 'warning',
          maxEntrypointSize: 244000, // Reduced from 512KB
          maxAssetSize: 244000,      // Reduced from 512KB
        };
      } else {
        // Development mode optimizations
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          removeAvailableModules: false,
          removeEmptyChunks: false,
          splitChunks: false, // Disable in dev for faster builds
        };
      }

      // Optimize resolve
      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        alias: {
          ...webpackConfig.resolve.alias,
          '@': path.resolve(__dirname, 'src'),
        },
        // Fix Material-UI module resolution issues
        fallback: {
          ...webpackConfig.resolve.fallback,
        },
        // Add extensions to handle Material-UI utils
        extensions: [
          ...webpackConfig.resolve.extensions,
          '.js',
          '.jsx',
          '.ts',
          '.tsx',
        ],
      };

      // Fix Material-UI module resolution - only for specific problematic modules
      webpackConfig.module = {
        ...webpackConfig.module,
        rules: [
          ...webpackConfig.module.rules,
          {
            test: /\.m?js$/,
            include: /node_modules\/@mui/,
            resolve: {
              fullySpecified: false,
            },
          },
        ],
      };

      return webpackConfig;
    },
  },
  babel: {
    // Normalize react-refresh plugin options to skip env check in prod
    loaderOptions: (babelLoaderOptions) => {
      const existing = babelLoaderOptions.plugins || [];
      babelLoaderOptions.plugins = existing.map((p, idx) => {
        // Handle different plugin forms: string name, tuple [name, options], or resolved path
        const name = Array.isArray(p) ? p[0] : p;
        const isReactRefresh =
          name === 'react-refresh/babel' ||
          (typeof name === 'string' && name.includes('react-refresh'));
        if (isReactRefresh) {
          return ['react-refresh/babel', { skipEnvCheck: true }, `rr-safe-${idx}`];
        }
        return p;
      });
      // Force react-app preset to production mode explicitly
      babelLoaderOptions.presets = [['react-app', { development: false }]];
      return babelLoaderOptions;
    },
  },
};





