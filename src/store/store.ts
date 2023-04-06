import { Store } from "tauri-plugin-store-api";

const appStore = new Store(".tiles-settings.dat");
export default appStore;
