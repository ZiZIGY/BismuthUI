import { fileURLToPath, URL } from 'node:url';
import Components from 'unplugin-vue-components/vite';
import MotionResolver from 'motion-v/resolver';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

/*
 * One config, two products: the demo stand and the package. `--mode lib`
 * switches, so the components are built by the same pipeline they are
 * developed under and nothing can drift between the two.
 */
export default defineConfig(({ mode }) => {
  const lib = mode === 'lib';

  return {
    plugins: [
      vue(),
      tailwindcss(),
      /* devtools and the component resolver are the stand's, not the package's */
      ...(lib
        ? []
        : [vueDevTools(), Components({ dts: true, resolvers: [MotionResolver()] })]),
    ],

    build: lib
      ? {
          lib: {
            entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
            name: 'Bismuth',
            formats: ['es', 'cjs'],
            fileName: (format) => `bismuth.${format === 'es' ? 'js' : 'cjs'}`,
            /*
             * The stylesheet is an entry of its own so it comes out under a
             * name a consumer can import, rather than as whatever hash the
             * bundler would have given a side-effect import.
             */
            cssFileName: 'style',
          },
          rollupOptions: {
            /*
             * Everything with a runtime of its own stays outside the bundle.
             * Two copies of Vue in one page is a broken page, and the same
             * goes for motion's animation registry and VueUse's effect scopes.
             */
            external: ['vue', '@vueuse/core', 'motion-v'],
            output: { globals: { vue: 'Vue' } },
          },
          sourcemap: true,
          /* the demo's favicons and drawings are not the package's business */
          copyPublicDir: false,
        }
      : {
          /*
           * The stand goes somewhere else entirely. Both builds writing to
           * `dist` means whichever ran last is what gets published, and the
           * one that runs on `npm run build` is the demo.
           */
          outDir: 'dist-demo',
        },
  };
});
