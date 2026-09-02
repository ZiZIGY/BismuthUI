/*
 * The package. The stylesheet is pulled in here so the build has something to
 * extract, but it lands beside the bundle rather than inside it — a consumer
 * imports `bismuth-ui/style.css` themselves, which is what lets them drop it
 * for a theme of their own.
 */
import './lib.css';

export { default as BAutocomplete } from './components/autocomplete/Autocomplete.vue';
export { default as BButton } from './components/button/Button.vue';
export { default as BDivider } from './components/divider/Divider.vue';
export { default as BDropdown } from './components/dropdown/Dropdown.vue';
export { default as BField } from './components/field/Field.vue';
export { default as BFieldAddon } from './components/field/FieldAddon.vue';
export { default as BFrame } from './components/frame/Frame.vue';
export { default as BInput } from './components/input/Input.vue';
export { default as BLoader } from './components/loader/Loader.vue';
export { default as BOption } from './components/option/Option.vue';
export { default as BOptionGroup } from './components/option/OptionGroup.vue';
export { default as BProgress } from './components/progress/Progress.vue';
export { default as BScrollArea } from './components/scroll-area/ScrollArea.vue';
export { default as BScrollbar } from './components/scroll-area/Scrollbar.vue';
export { default as BSelect } from './components/select/Select.vue';
export { default as BSlider } from './components/slider/Slider.vue';
export { default as BSwitch } from './components/switch/Switch.vue';
export { default as BTextarea } from './components/textarea/Textarea.vue';
export { default as BThemeToggle } from './components/theme-toggle/ThemeToggle.vue';
export { default as BThumb } from './components/thumb/Thumb.vue';

export {
  buttonVariants,
  type IButtonProps,
  type TButtonVariant,
} from './components/button';

export {
  fieldVariants,
  type IFieldProps,
  type TFieldAlign,
  type TFieldVariant,
} from './components/field';

export {
  progressVariants,
  type IProgressProps,
} from './components/progress';

export type { IAutocompleteProps } from './components/autocomplete';

export {
  toOption,
  type IOption,
  type TOptionSource,
} from './components/option';

export type {
  ISelectProps,
  TSelectValue,
} from './components/select';

export {
  sliderVariants,
  type ISliderProps,
} from './components/slider';

export {
  switchVariants,
  type ISwitchProps,
} from './components/switch';

export type {
  IScrollAreaProps,
  IScrollbarProps,
  TScrollAxis,
  TScrollVisibility,
} from './components/scroll-area';

export { useDismiss } from './components/dropdown/useDismiss';
export { useListCursor } from './components/dropdown/useListCursor';
export { useFieldControl } from './components/field/useFieldControl';

export {
  vRipple,
  type IRippleOptions,
  type TRippleValue,
} from './directives/ripple';

export type { TSize, TSpeed } from './theme/types';

export { cn } from './utils/cn';
