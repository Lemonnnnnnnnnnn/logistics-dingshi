import { defineConfig } from 'umi';
import routes from './config/routes';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: routes,
  fastRefresh: {},
  base: '/dsBigScreen/',
  hash: true,
  publicPath: '/dsBigScreen/',
  history: {
    type: 'browser',
  },
  links: [{ rel: 'icon', href: 'favicon.png' }],
  dva: {
    immer: { immer: { enableES5: true } },
    hmr: true,
  },
  // mfsu : {},
  cssModulesTypescriptLoader: {},
});
