declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}
declare module "@5stack/ui/plugin.css";
declare module "@5stack/ui/standalone.css";
