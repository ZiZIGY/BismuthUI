import Components from 'unplugin-vue-components/vite';
import MotionResolver from 'motion-v/resolver';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    vueDevTools(),
    Components({
      dts: true,
      resolvers: [MotionResolver()],
    }),
  ],
});
