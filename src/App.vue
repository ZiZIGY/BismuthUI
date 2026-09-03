<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { Icon } from '@iconify/vue';
  import BButton from './components/button/Button.vue';
  import BAutocomplete from './components/autocomplete/Autocomplete.vue';
  import BDivider from './components/divider/Divider.vue';
  import BDropdown from './components/dropdown/Dropdown.vue';
  import BOption from './components/option/Option.vue';
  import BScrollArea from './components/scroll-area/ScrollArea.vue';
  import BSelect from './components/select/Select.vue';
  import BOptionGroup from './components/option/OptionGroup.vue';
  import BFieldAddon from './components/field/FieldAddon.vue';
  import BTextarea from './components/textarea/Textarea.vue';
  import BInput from './components/input/Input.vue';
  import BProgress from './components/progress/Progress.vue';
  import BSlider from './components/slider/Slider.vue';
  import BSwitch from './components/switch/Switch.vue';
  import BThemeToggle from './components/theme-toggle/ThemeToggle.vue';
  import type { TButtonVariant } from './components/button';
  import type { IOption } from './components/option';
  import type { TSize } from './theme/types';
  import BLoader from './components/loader/Loader.vue';
  import BThumb from './components/thumb/Thumb.vue';
  import { motion } from 'motion-v';

  const variants: TButtonVariant[] = ['spectrum', 'plain', 'outline', 'ghost'];
  const sizes: TSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

  const clicks = ref(0);

  const elements = [
    'Bismuth',
    'Antimony',
    'Tellurium',
    'Germanium',
    'Selenium',
    'Gallium',
    'Indium',
    'Thallium',
  ];
  const element = ref('');
  const lookup = ref('');

  const symbols: Record<string, string> = {
    Bismuth: 'Bi',
    Antimony: 'Sb',
    Tellurium: 'Te',
    Germanium: 'Ge',
    Selenium: 'Se',
    Gallium: 'Ga',
    Indium: 'In',
    Thallium: 'Tl',
  };

  const families: Record<string, string[]> = {
    Металлоиды: ['Antimony', 'Tellurium', 'Germanium'],
    Постпереходные: ['Bismuth', 'Gallium', 'Indium', 'Thallium'],
    Халькогены: ['Selenium'],
  };

  const suggestion = ref('');
  const picked = ref<IOption | null>(null);

  const familyGroups = computed(
    () =>
      Object.entries(families)
        .map(([family, names]) => [
          family,
          names.filter((name) =>
            name.toLowerCase().includes(suggestion.value.trim().toLowerCase())
          ),
        ])
        .filter(([, names]) => names.length) as [string, string[]][]
  );

  const familyMatches = computed(() =>
    familyGroups.value.reduce((total, [, names]) => total + names.length, 0)
  );

  const people = [
    { value: 'anna', label: 'Анна Крылова', role: 'Химик' },
    { value: 'oleg', label: 'Олег Батищев', role: 'Металлург' },
    { value: 'vera', label: 'Вера Смирнова', role: 'Инженер' },
    { value: 'ilya', label: 'Илья Терентьев', role: 'Лаборант' },
  ];
  const assignee = ref('');
  const assigneeOpen = ref(false);

  const group = ref<string | number>('');
  const groups = ['Металлоиды', 'Постпереходные', 'Халькогены', 'Пниктогены'];
  const traits = ref<(string | number)[]>(['Хрупкий']);
  const many = ref<(string | number)[]>([
    'Хрупкий',
    'Диамагнетик',
    'Низкая теплопроводность',
    'Нетоксичный',
  ]);
  const traitList = [
    'Хрупкий',
    'Диамагнетик',
    'Низкая теплопроводность',
    'Нетоксичный',
    'Кристаллический',
    'Тяжёлый',
  ];
  const note = ref('');
  const amount = ref('');
  const query = ref('');
  const reagent = ref('');

  const solvent = ref<string | number>('');
  const solventQuery = ref('');
  const solvents = {
    Полярные: ['Вода', 'Метанол', 'Ацетон'],
    Неполярные: ['Гексан', 'Толуол', 'Бензол'],
  };
  const solventGroups = computed(
    () =>
      Object.entries(solvents)
        .map(([group, names]) => [
          group,
          names.filter((name) =>
            name.toLowerCase().includes(solventQuery.value.trim().toLowerCase())
          ),
        ])
        .filter(([, names]) => names.length) as [string, string[]][]
  );
  const currency = ref<string | number>('RUB');

  const progress = ref(40);
  const volume = ref(35);
  const balance = ref(2);
  const range = ref([25, 70]);
  const notifications = ref(true);
  const beta = ref(false);
  const login = ref('');
  const search = ref('');
  const email = ref('');
  const phone = ref('');
</script>

<template>
  <main class="mx-auto max-w-4xl px-6 py-16">
    <header class="mb-16 flex items-center justify-between">
      <h1 class="text-[21px] font-medium tracking-[0.3em] uppercase"
        >Bismuth</h1
      >
      <BThemeToggle />
    </header>

    <motion.div
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
    >
      Test
    </motion.div>

    <section class="mb-14">
      <h2 class="mb-6 text-xs tracking-[0.3em] text-bone-mute uppercase">
        On a picture
      </h2>

      <div
        class="flex flex-col gap-10 bg-cover bg-center px-10 py-12"
        style="
          background-image: url('https://picsum.photos/seed/glass/1200/700');
        "
      >
        <div class="flex flex-wrap items-center gap-6">
          <BButton variant="outline">Outline</BButton>
          <BButton
            variant="outline"
            size="lg"
            >Крупная</BButton
          >
          <BButton>Spectrum</BButton>
          <BButton variant="plain">Plain</BButton>
          <BButton variant="ghost">Ghost</BButton>
        </div>

        <BSlider
          v-model="volume"
          label="Громкость"
        />

        <BSlider
          v-model="range"
          size="lg"
          label="Диапазон"
        />
      </div>
    </section>

    <section class="mb-14">
      <h2 class="mb-6 text-xs tracking-[0.3em] text-bone-mute uppercase">
        Crystal
      </h2>

      <svg
        class="b-crystal"
        viewBox="-10 -10 276 252"
        fill="none"
        role="img"
        aria-label="Vue"
      >
        <defs>
          <linearGradient
            id="b-crystal-iris"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop
              class="b-crystal__hue"
              offset="0"
            />
            <stop
              class="b-crystal__hue"
              offset="0.25"
            />
            <stop
              class="b-crystal__hue"
              offset="0.5"
            />
            <stop
              class="b-crystal__hue"
              offset="0.75"
            />
            <stop
              class="b-crystal__hue"
              offset="1"
            />
          </linearGradient>

          <linearGradient
            id="b-crystal-core"
            x1="0.15"
            y1="0"
            x2="0.85"
            y2="1"
          >
            <stop
              class="b-crystal__leaf"
              offset="0"
            />
            <stop
              class="b-crystal__deep"
              offset="1"
            />
          </linearGradient>

          <filter
            id="b-crystal-glow"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>

        <polygon
          class="b-crystal__glow"
          points="0.0,0.0 128.0,220.8 256.0,0.0 204.8,0.0 128.0,132.5 51.2,0.0"
          fill="url(#b-crystal-iris)"
          filter="url(#b-crystal-glow)"
        />

        <polygon
          points="0.0,0.0 128.0,220.8 256.0,0.0 204.8,0.0 128.0,132.5 51.2,0.0"
          fill="currentColor"
          fill-opacity="0.07"
        />

        <g class="b-crystal__facets">
          <polygon
            points="0.0,0.0 41.0,70.7 83.5,55.6"
            fill="url(#b-crystal-iris)"
            fill-opacity="0.5"
          />
          <polygon
            points="0.0,0.0 83.5,55.6 51.2,0.0"
            fill="url(#b-crystal-iris)"
            fill-opacity="0.22"
          />
          <polygon
            points="41.0,70.7 87.0,150.1 111.1,103.3"
            fill="url(#b-crystal-iris)"
            fill-opacity="0.34"
          />
          <polygon
            points="41.0,70.7 111.1,103.3 83.5,55.6"
            fill="url(#b-crystal-iris)"
            fill-opacity="0.16"
          />
          <polygon
            points="87.0,150.1 128.0,220.8 128.0,132.5"
            fill="url(#b-crystal-iris)"
            fill-opacity="0.46"
          />
          <polygon
            points="87.0,150.1 128.0,132.5 111.1,103.3"
            fill="url(#b-crystal-iris)"
            fill-opacity="0.26"
          />
          <polygon
            points="256.0,0.0 215.0,70.7 172.5,55.6"
            fill="url(#b-crystal-iris)"
            fill-opacity="0.42"
          />
          <polygon
            points="256.0,0.0 172.5,55.6 204.8,0.0"
            fill="url(#b-crystal-iris)"
            fill-opacity="0.3"
          />
          <polygon
            points="215.0,70.7 169.0,150.1 144.9,103.3"
            fill="url(#b-crystal-iris)"
            fill-opacity="0.2"
          />
          <polygon
            points="215.0,70.7 144.9,103.3 172.5,55.6"
            fill="url(#b-crystal-iris)"
            fill-opacity="0.38"
          />
          <polygon
            points="169.0,150.1 128.0,220.8 128.0,132.5"
            fill="url(#b-crystal-iris)"
            fill-opacity="0.28"
          />
          <polygon
            points="169.0,150.1 128.0,132.5 144.9,103.3"
            fill="url(#b-crystal-iris)"
            fill-opacity="0.5"
          />
        </g>

        <g class="b-crystal__facets">
          <polygon
            points="51.2,0.0 89.6,66.6 113.0,25.6"
            fill="url(#b-crystal-core)"
            fill-opacity="0.95"
          />
          <polygon
            points="51.2,0.0 113.0,25.6 97.9,0.0"
            fill="url(#b-crystal-core)"
            fill-opacity="0.7"
          />
          <polygon
            points="89.6,66.6 128.0,133.1 128.0,51.2"
            class="b-crystal__shade"
            fill-opacity="1"
          />
          <polygon
            points="89.6,66.6 128.0,51.2 113.0,25.6"
            fill="url(#b-crystal-core)"
            fill-opacity="0.8"
          />
          <polygon
            points="204.8,0.0 166.4,66.6 143.0,25.6"
            fill="url(#b-crystal-core)"
            fill-opacity="0.75"
          />
          <polygon
            points="204.8,0.0 143.0,25.6 158.1,0.0"
            fill="url(#b-crystal-core)"
            fill-opacity="0.55"
          />
          <polygon
            points="166.4,66.6 128.0,133.1 128.0,51.2"
            class="b-crystal__shade"
            fill-opacity="0.82"
          />
          <polygon
            points="166.4,66.6 128.0,51.2 143.0,25.6"
            fill="url(#b-crystal-core)"
            fill-opacity="0.62"
          />
        </g>

        <polygon
          points="0.0,0.0 128.0,220.8 256.0,0.0 204.8,0.0 128.0,132.5 51.2,0.0"
          stroke="url(#b-crystal-iris)"
          stroke-width="2.2"
        />

        <polygon
          class="b-crystal__edge"
          points="51.2,0.0 128.0,133.1 204.8,0.0 157.4,0.0 128.0,51.2 97.9,0.0"
          stroke-width="1.4"
        />
      </svg>
    </section>

    <section class="mb-14">
      <h2 class="mb-6 text-xs tracking-[0.3em] text-bone-mute uppercase">
        Variants
      </h2>
      <div class="flex flex-wrap items-center gap-6">
        <BButton
          v-for="v in variants"
          :key="v"
          :variant="v"
          @click="clicks++"
        >
          {{ v }}
        </BButton>
      </div>
    </section>

    <section class="mb-14">
      <h2 class="mb-6 text-xs tracking-[0.3em] text-bone-mute uppercase">
        Accent
      </h2>
      <div class="flex max-w-md flex-col gap-6">
        <BSlider
          :model-value="60"
          size="sm"
          label="по умолчанию"
        />
        <BSlider
          :model-value="60"
          size="sm"
          label="--b-tone на элементе"
          style="--b-tone: #f0397f"
        />
        <div
          class="flex flex-col gap-6"
          style="--b-tone: #00b073"
        >
          <BSlider
            :model-value="60"
            size="sm"
            label="--b-tone на родителе"
          />
          <BSwitch
            :model-value="true"
            label="наследуется вниз"
          />
        </div>
      </div>
    </section>

    <section class="mb-14">
      <h2 class="mb-6 text-xs tracking-[0.3em] text-bone-mute uppercase">
        Autocomplete
      </h2>
      <BAutocomplete
        v-model="element"
        :options="elements"
        label="Элемент"
        class="max-w-md"
      >
        <template #option="{ option }">
          <Icon
            icon="lucide:atom"
            class="text-(--b-muted)"
          />
          <span>{{ option.label }}</span>
          <span class="ml-auto text-xs text-(--b-muted)">
            {{ symbols[option.label] }}
          </span>
        </template>

        <template #empty>Ничего не найдено</template>
      </BAutocomplete>
    </section>

    <section class="mb-14">
      <h2 class="mb-6 text-xs tracking-[0.3em] text-bone-mute uppercase">
        Composed autocomplete
      </h2>

      <BAutocomplete
        v-model="suggestion"
        :options="elements"
        label="Элемент"
        class="max-w-md"
        @select="picked = $event"
      >
        <template #left>
          <Icon icon="lucide:search" />
        </template>

        <template #head>
          <span class="text-xs tracking-widest text-(--b-muted) uppercase">
            {{ familyMatches }} из {{ elements.length }}
          </span>
        </template>

        <template #options="{ choose }">
          <BOptionGroup
            v-for="[family, names] in familyGroups"
            :key="family"
            :label="family"
          >
            <BOption
              v-for="name in names"
              :key="name"
              :selected="name === suggestion"
              @click="choose({ value: name, label: name })"
            >
              <span>{{ name }}</span>
              <span class="ml-auto text-xs text-(--b-muted)">
                {{ symbols[name] }}
              </span>
            </BOption>
          </BOptionGroup>
        </template>

        <template #foot>
          <div class="flex items-center justify-between gap-4">
            <span class="text-xs text-(--b-muted)">
              {{ picked ? `Выбран ${picked.label}` : 'Ничего не выбрано' }}
            </span>

            <BButton
              size="xs"
              variant="ghost"
              :caps="false"
              @click="((suggestion = ''), (picked = null))"
            >
              Очистить
            </BButton>
          </div>
        </template>
      </BAutocomplete>
    </section>

    <section class="mb-14">
      <h2 class="mb-6 text-xs tracking-[0.3em] text-bone-mute uppercase">
        Dropdown
      </h2>

      <BDropdown v-model:open="assigneeOpen">
        <template #trigger>
          <BButton variant="plain">
            {{ assignee || 'Исполнитель' }}
          </BButton>
        </template>

        <BScrollArea>
          <BOption
            v-for="person in people"
            :key="person.value"
            :selected="person.label === assignee"
            @click="((assignee = person.label), (assigneeOpen = false))"
          >
            <Icon icon="lucide:user-round" />
            <span>{{ person.label }}</span>
            <span class="ml-auto text-xs text-(--b-muted)">{{
              person.role
            }}</span>
          </BOption>
        </BScrollArea>
      </BDropdown>
    </section>

    <section class="mb-14">
      <h2 class="mb-6 text-xs tracking-[0.3em] text-bone-mute uppercase">
        Select
      </h2>
      <div class="flex max-w-md flex-col gap-8">
        <BSelect
          v-model="group"
          :options="groups"
          label="Группа"
        />

        <BSelect
          v-model="traits"
          multiple
          :options="[
            'Хрупкий',
            'Диамагнетик',
            'Низкая теплопроводность',
            'Нетоксичный',
          ]"
          label="Свойства"
        >
          <template #value="{ option }">
            <span class="border border-(--b-line) px-2 py-0.5 text-xs">
              {{ option.label }}
            </span>
          </template>
        </BSelect>

        <BSelect
          v-model="many"
          multiple
          :options="traitList"
          label="Растёт в высоту"
        >
          <template #value="{ option }">
            <span class="border border-(--b-line) px-2 py-0.5 text-xs">
              {{ option.label }}
            </span>
          </template>
        </BSelect>

        <BSelect
          v-model="many"
          multiple
          :options="traitList"
          label="С потолком: max-height"
          style="max-height: 4.5em"
        >
          <template #value="{ option }">
            <span class="border border-(--b-line) px-2 py-0.5 text-xs">
              {{ option.label }}
            </span>
          </template>
        </BSelect>

        <BSelect
          v-model="many"
          multiple
          :options="traitList"
          label="Своя сводка вместо перебора"
          style="max-height: 4.5em"
        >
          <template #value="{ option }">
            <span
              v-if="option.value === many[0]"
              class="text-xs"
            >
              Выбрано: {{ many.length }}
            </span>
          </template>
        </BSelect>
      </div>
    </section>

    <section class="mb-14">
      <h2 class="mb-6 text-xs tracking-[0.3em] text-bone-mute uppercase">
        Composed list
      </h2>

      <BSelect
        v-model="solvent"
        :options="[]"
        label="Растворитель"
        class="max-w-md"
      >
        <template #head>
          <BInput
            v-model="solventQuery"
            variant="line"
            size="sm"
            placeholder="Поиск"
          />
        </template>

        <template #options="{ choose, picked }">
          <BOptionGroup
            v-for="[group, names] in solventGroups"
            :key="group"
            :label="group"
          >
            <BOption
              v-for="name in names"
              :key="name"
              :selected="picked.includes(name)"
              @click="choose({ value: name, label: name })"
            >
              {{ name }}
            </BOption>
          </BOptionGroup>
        </template>

        <template #foot>
          <BButton
            size="xs"
            variant="ghost"
            @click="((solvent = ''), (solventQuery = ''))"
          >
            Сбросить
          </BButton>
        </template>
      </BSelect>
    </section>

    <section class="mb-14">
      <h2 class="mb-6 text-xs tracking-[0.3em] text-bone-mute uppercase">
        Long label
      </h2>

      <BInput
        v-model="reagent"
        required
        label="Основной реагент для последующей перекристаллизации"
        class="max-w-md"
      />
    </section>

    <section class="mb-14">
      <h2 class="mb-6 text-xs tracking-[0.3em] text-bone-mute uppercase">
        Textarea
      </h2>
      <BTextarea
        v-model="note"
        label="Заметка"
        class="max-w-md"
      >
        <template #right>
          <BButton
            square
            size="xs"
            variant="ghost"
            aria-label="Очистить"
            @click="note = ''"
          >
            <Icon icon="lucide:x" />
          </BButton>
        </template>

        <BFieldAddon
          align="block-end"
          class="w-full justify-between"
        >
          <span class="text-xs tracking-widest uppercase">
            {{ note.length }} симв.
          </span>

          <BButton
            size="xs"
            variant="outline"
            @click="note = note.trim()"
          >
            Обрезать
          </BButton>
        </BFieldAddon>
      </BTextarea>
    </section>

    <section class="mb-14">
      <h2 class="mb-6 text-xs tracking-[0.3em] text-bone-mute uppercase">
        Composition
      </h2>

      <div class="flex max-w-md flex-col gap-10">
        <BInput
          v-model="query"
          label="Поиск"
        >
          <template #left>
            <Icon icon="lucide:search" />
          </template>
          <template #right>
            <span class="text-xs tracking-widest uppercase">⌘K</span>
          </template>
        </BInput>

        <BInput
          v-model="amount"
          label="Сумма"
          inputmode="decimal"
        >
          <template #right>
            <BButton
              square
              size="xs"
              variant="ghost"
              aria-label="Меньше"
              @click="amount = String(Number(amount || 0) - 100)"
            >
              <Icon icon="lucide:minus" />
            </BButton>
            <BButton
              square
              size="xs"
              variant="ghost"
              aria-label="Больше"
              @click="amount = String(Number(amount || 0) + 100)"
            >
              <Icon icon="lucide:plus" />
            </BButton>
          </template>

          <BFieldAddon
            align="block-start"
            class="w-full justify-between"
          >
            <span class="text-xs tracking-widest uppercase">Перевод</span>
            <span class="text-xs">без комиссии</span>
          </BFieldAddon>
        </BInput>

        <BSelect
          v-model="currency"
          :options="['RUB', 'USD', 'EUR', 'CNY']"
          label="Валюта"
        >
          <template #left>
            <Icon icon="lucide:coins" />
          </template>

          <BFieldAddon
            align="block-end"
            class="w-full"
          >
            <span class="text-xs">Курс обновлён минуту назад</span>
          </BFieldAddon>
        </BSelect>

        <BAutocomplete
          v-model="lookup"
          :options="elements"
          label="Элемент"
        >
          <template #right>
            <span class="text-xs tracking-widest uppercase">
              {{ lookup.length }}
            </span>
          </template>

          <BFieldAddon
            align="block-end"
            class="w-full"
          >
            <span class="text-xs">Начните вводить название</span>
          </BFieldAddon>
        </BAutocomplete>
      </div>
    </section>

    <section class="mb-14">
      <h2 class="mb-6 text-xs tracking-[0.3em] text-bone-mute uppercase">
        Scroll area
      </h2>
      <div class="flex max-w-md flex-col gap-8">
        <div>
          <span class="mb-2 block text-xs text-bone-mute">
            vertical · visibility=auto
          </span>
          <BScrollArea
            class="border border-(--b-line)"
            style="
              --scroll-area-height: 9em;
              --scroll-area-pad-block-start: 0.6em;
              --scroll-area-pad-block-end: 0.6em;
              --scroll-area-pad-inline: 0.8em;
            "
          >
            <p
              v-for="line in 9"
              :key="line"
              class="text-sm"
            >
              {{ line }}. Висмут — постпереходный металл
            </p>
          </BScrollArea>
        </div>

        <div>
          <span class="mb-2 block text-xs text-bone-mute">
            horizontal · visibility=always
          </span>
          <BScrollArea
            axis="horizontal"
            visibility="always"
            class="border border-(--b-line)"
            style="
              --scroll-area-pad-block-start: 0.6em;
              --scroll-area-pad-block-end: 0.6em;
              --scroll-area-pad-inline: 0.8em;
            "
          >
            <div class="flex gap-3">
              <BButton
                v-for="name in elements"
                :key="name"
                size="xs"
                variant="plain"
                :caps="false"
              >
                {{ name }}
              </BButton>
            </div>
          </BScrollArea>
        </div>

        <div>
          <span class="mb-2 block text-xs text-bone-mute">
            both · visibility=hover
          </span>
          <BScrollArea
            axis="both"
            visibility="hover"
            class="border border-(--b-line)"
            style="
              --scroll-area-height: 9em;
              --scroll-area-pad-block-start: 0.6em;
              --scroll-area-pad-block-end: 0.6em;
              --scroll-area-pad-inline: 0.8em;
            "
          >
            <p
              v-for="line in 9"
              :key="line"
              class="text-sm whitespace-nowrap"
            >
              {{ line }}. Висмут — постпереходный металл с самой низкой
              теплопроводностью после ртути
            </p>
          </BScrollArea>
        </div>
      </div>
    </section>

    <section class="mb-14">
      <h2 class="mb-6 text-xs tracking-[0.3em] text-bone-mute uppercase">
        Sizes
      </h2>
      <div class="flex flex-wrap items-center gap-6">
        <BButton
          v-for="s in sizes"
          :key="s"
          :size="s"
        >
          {{ s }}
        </BButton>
      </div>
    </section>

    <section class="mb-14">
      <h2 class="mb-6 text-xs tracking-[0.3em] text-bone-mute uppercase">
        States
      </h2>
      <div class="flex flex-wrap items-center gap-6">
        <BButton @click="clicks++">Кликов: {{ clicks }}</BButton>
        <BButton loading>Загрузка</BButton>
        <BButton disabled>Недоступно</BButton>
        <BButton speed="none">Статичный</BButton>
        <BButton :caps="false">Без капса</BButton>
        <BButton
          href="https://vuejs.org"
          target="_blank"
          variant="ghost"
          >Ссылка</BButton
        >
      </div>
    </section>

    <section class="mb-14">
      <h2 class="mb-6 text-xs tracking-[0.3em] text-bone-mute uppercase">
        Icons
      </h2>
      <div class="flex flex-wrap items-center gap-6">
        <BButton>
          Дальше
          <svg
            class="size-[1.15em] fill-current"
            viewBox="0 0 16 16"
          >
            <path d="M1 7h10.5L7.8 3.3 9.2 2l6 6-6 6-1.4-1.3L11.5 9H1z" />
          </svg>
        </BButton>

        <BButton
          variant="plain"
          blunt
        >
          Срезанные концы
        </BButton>

        <BButton variant="plain">
          <svg
            class="size-[1.15em] fill-current"
            viewBox="0 0 16 16"
          >
            <path d="M8 0l2.2 5.3L16 6l-4 4 1 6-5-3-5 3 1-6-4-4 5.8-.7z" />
          </svg>
          В избранное
        </BButton>

        <BButton
          square
          variant="plain"
          aria-label="Закрыть"
        >
          <svg
            class="size-[0.8em] fill-current"
            viewBox="0 0 16 16"
          >
            <path
              d="M8 6.6L13.4 1.2l1.4 1.4L9.4 8l5.4 5.4-1.4 1.4L8 9.4l-5.4 5.4-1.4-1.4L6.6 8 1.2 2.6l1.4-1.4z"
            />
          </svg>
        </BButton>
      </div>
    </section>

    <section class="mb-14">
      <h2 class="mb-6 text-xs tracking-[0.3em] text-bone-mute uppercase">
        Spectrum
      </h2>
      <div class="flex flex-wrap items-center gap-6">
        <BButton :colors="['#ff2d6f', '#7b5cff', '#2fc9ff', '#ff2d6f']"
          >Cold</BButton
        >
        <BButton
          :colors="['#f7e04d', '#ff9b2f', '#ff2d6f', '#f7e04d']"
          speed="fast"
          >Fast</BButton
        >
        <BButton
          size="lg"
          speed="slow"
          >Wide band</BButton
        >
      </div>
    </section>

    <section class="mb-14">
      <h2 class="mb-6 text-xs tracking-[0.3em] text-bone-mute uppercase">
        Input
      </h2>
      <div class="flex max-w-md flex-col gap-14">
        <BInput
          v-model="login"
          label="Логин"
        />

        <BInput
          v-model="email"
          label="Почта"
          placeholder="name@example.com"
          size="lg"
        />

        <BInput
          v-model="phone"
          label="Телефон"
          required
        />

        <BInput
          label="Без значения"
          size="sm"
        />

        <BInput
          v-model="search"
          placeholder="Поиск"
        >
          <template #left>
            <svg
              class="size-[1.15em] fill-current"
              viewBox="0 0 16 16"
            >
              <path
                d="M7 1a6 6 0 014.7 9.7l3.8 3.8-1.3 1.3-3.8-3.8A6 6 0 117 1zm0 2a4 4 0 100 8 4 4 0 000-8z"
              />
            </svg>
          </template>
          <template #right>
            <BButton
              size="xs"
              variant="ghost"
              :caps="false"
              @click="search = ''"
            >
              Очистить
            </BButton>
          </template>
        </BInput>

        <BInput
          size="lg"
          placeholder="Сумма"
        >
          <template #right>
            <span class="text-sm">₽</span>
          </template>
        </BInput>

        <BInput
          size="sm"
          placeholder="Недоступно"
          disabled
        />
      </div>
    </section>

    <section class="mb-14">
      <h2 class="mb-6 text-xs tracking-[0.3em] text-bone-mute uppercase">
        Ripple
      </h2>
      <div class="flex flex-wrap items-center gap-8">
        <BButton>От курсора</BButton>
        <BButton :ripple="{ center: true }">Из центра</BButton>
        <BButton
          variant="plain"
          :ripple="false"
        >
          Без волны
        </BButton>
      </div>
    </section>

    <section class="mb-14">
      <h2 class="mb-6 text-xs tracking-[0.3em] text-bone-mute uppercase">
        Switch
      </h2>
      <div class="flex flex-col items-start gap-5">
        <BSwitch
          v-model="notifications"
          label="Уведомления"
        />
        <BSwitch
          v-model="beta"
          size="sm"
          label="Бета-функции"
        />
        <BSwitch
          v-model="notifications"
          size="lg"
          label="Крупный"
        />
        <BSwitch
          v-model="beta"
          disabled
          label="Недоступно"
        />
      </div>
    </section>

    <section class="mb-14">
      <h2 class="mb-6 text-xs tracking-[0.3em] text-bone-mute uppercase">
        Slider
      </h2>
      <div class="flex max-w-md flex-col gap-8">
        <BSlider
          v-model="volume"
          label="Громкость"
        />
        <BSlider
          v-model="volume"
          size="sm"
          label="Тонкий"
        />
        <BSlider
          v-model="balance"
          :min="-5"
          :max="5"
          :step="0.5"
          size="lg"
          label="Баланс"
        />
        <BSlider
          v-model="range"
          label="Диапазон"
        />
        <BSlider
          v-model="volume"
          disabled
          label="Недоступно"
        />

        <BSlider
          v-model="volume"
          thumb-label="drag"
          label="С подсказкой"
        />

        <BSlider
          v-model="range"
          thumb-label="always"
          size="lg"
          label="Всегда видна"
        />

        <BSlider
          v-model="balance"
          :min="-5"
          :max="5"
          :step="0.5"
          thumb-label="drag"
          label="Свой шаблон"
        >
          <template #thumb-label="{ value }">
            {{ value > 0 ? `+${value}` : value }} дБ
          </template>
        </BSlider>

        <BSlider
          v-model="volume"
          :step="10"
          ticks
          thumb-label="drag"
          label="Шаги по 10"
        />

        <BSlider
          v-model="balance"
          :min="-5"
          :max="5"
          :step="0.5"
          :ticks="2"
          size="lg"
          label="Метка через шаг"
        />

        <BSlider
          v-model="volume"
          :ticks="[0, 25, 50, 75, 100]"
          thumb-label="drag"
          label="Свои метки"
        />

        <BSlider
          v-model="range"
          :ticks="[0, 50, 100]"
          thumb-label="active"
          size="lg"
          label="Только активная подсказка"
        />
        <span class="text-xs text-bone-mute">
          громкость {{ volume }} · баланс {{ balance }} · диапазон
          {{ range.join('–') }}
        </span>
      </div>
    </section>

    <section class="mb-14">
      <h2 class="mb-6 text-xs tracking-[0.3em] text-bone-mute uppercase">
        Progress
      </h2>
      <div class="flex max-w-md flex-col gap-6">
        <BProgress :value="progress" />
        <BProgress
          :value="progress"
          size="lg"
        />
        <BProgress
          :value="progress"
          reverse
        />
        <BProgress :value="95" />

        <BProgress
          :value="progress"
          ticks
        />

        <BProgress
          :value="progress"
          :ticks="25"
          size="lg"
        />

        <BProgress
          :value="progress"
          :ticks="[30, 45, 80]"
          size="lg"
        />

        <div class="flex items-center gap-4">
          <BButton
            size="xs"
            variant="plain"
            @click="progress = Math.max(progress - 15, 0)"
            >−15</BButton
          >
          <BButton
            size="xs"
            variant="plain"
            @click="progress = Math.min(progress + 15, 100)"
            >+15</BButton
          >
          <span class="text-xs text-bone-mute">{{ progress }}%</span>
        </div>
      </div>
    </section>

    <section class="mb-14">
      <h2 class="mb-6 text-xs tracking-[0.3em] text-bone-mute uppercase">
        Divider
      </h2>
      <div class="flex flex-col gap-10">
        <BDivider
          v-for="s in sizes"
          :key="s"
          :size="s"
        />

        <BDivider
          size="lg"
          label="Свойства"
          style="--divider-line: var(--b-text)"
        />
      </div>
    </section>

    <section class="mb-14">
      <h2 class="mb-6 text-xs tracking-[0.3em] text-bone-mute uppercase">
        Loader
      </h2>
      <div class="flex flex-wrap items-center gap-10">
        <BLoader class="text-[13px]" />
        <BLoader
          class="text-[18px]"
          :count="4"
        />
        <BLoader class="text-[24px] text-(--b-muted)" />
      </div>
    </section>

    <section class="mb-14">
      <h2 class="mb-6 text-xs tracking-[0.3em] text-bone-mute uppercase">
        Thumb
      </h2>
      <div class="flex flex-wrap items-center gap-8">
        <BThumb tabindex="0" />
        <BThumb
          tabindex="0"
          style="--thumb-size: 34px"
        />
        <BThumb
          tabindex="0"
          style="--thumb-size: 44px"
        />
        <BThumb disabled />
      </div>
    </section>

    <section class="mb-24">
      <h2 class="mb-6 text-xs tracking-[0.3em] text-bone-mute uppercase">
        Block
      </h2>
      <BButton
        block
        size="lg"
        >Оформить подписку</BButton
      >
      <BLoader />
    </section>
  </main>
</template>

<style>
  /*
   * The mark cut out of glass: flat facets over one iridescent gradient, and
   * the shimmer is the gradient's own stops walking the spectrum. Each stop
   * runs the same pass a beat behind the one before it, so the colours travel
   * along the shape instead of the whole thing changing hue at once — which is
   * what a rotating gradient would cost in layout, and this costs nothing.
   */
  .b-crystal {
    --crystal-leaf: var(--color-spectrum-mint);
    --crystal-deep: #0d6f6a;
    --crystal-shade: #123f52;

    width: 100%;
    max-width: 260px;
    color: var(--b-text);
  }

  /*
   * Colours reach the shape through classes rather than through fill="" and
   * stop-color="": a presentation attribute is not a declaration, and var()
   * inside one is never substituted.
   */
  .b-crystal__leaf {
    stop-color: var(--crystal-leaf);
  }

  .b-crystal__deep {
    stop-color: var(--crystal-deep);
  }

  .b-crystal__shade {
    fill: var(--crystal-shade);
  }

  .b-crystal__edge {
    stroke: var(--crystal-leaf);
    stroke-opacity: 0.5;
  }

  .b-crystal__facets polygon {
    stroke: currentColor;
    stroke-opacity: 0.18;
    stroke-width: 0.8;
  }

  .b-crystal__glow {
    opacity: 0.35;
    animation: b-crystal-breathe 7s ease-in-out infinite;
  }

  /*
   * A stop with no colour of its own is black, and with the animation off that
   * is exactly what would be left. So each one is given the hue it starts on:
   * still, the gradient is a spectrum standing at rest; running, the keyframes
   * take it over and every stop is a beat behind the one before.
   */
  .b-crystal__hue {
    stop-color: var(--color-spectrum-violet);
    animation: b-crystal-hue 9s linear infinite;
  }

  .b-crystal__hue:nth-child(2) {
    stop-color: var(--color-spectrum-rose);
    animation-delay: -1.8s;
  }

  .b-crystal__hue:nth-child(3) {
    stop-color: var(--color-spectrum-lemon);
    animation-delay: -3.6s;
  }

  .b-crystal__hue:nth-child(4) {
    stop-color: var(--color-spectrum-mint);
    animation-delay: -5.4s;
  }

  .b-crystal__hue:nth-child(5) {
    stop-color: var(--color-spectrum-cyan);
    animation-delay: -7.2s;
  }

  @keyframes b-crystal-hue {
    0%,
    100% {
      stop-color: var(--color-spectrum-violet);
    }
    17% {
      stop-color: var(--color-spectrum-rose);
    }
    33% {
      stop-color: var(--color-spectrum-amber);
    }
    50% {
      stop-color: var(--color-spectrum-lemon);
    }
    67% {
      stop-color: var(--color-spectrum-mint);
    }
    83% {
      stop-color: var(--color-spectrum-cyan);
    }
  }

  @keyframes b-crystal-breathe {
    50% {
      opacity: 0.6;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .b-crystal__hue,
    .b-crystal__glow {
      animation: none;
    }
  }
</style>
