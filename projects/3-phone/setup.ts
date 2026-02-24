import type { VylosPlugin } from '@vylos/core';
import PhoneShell from './components/ui/PhoneShell.vue';
import PhoneTopBar from './components/ui/PhoneTopBar.vue';
import PhoneDialogue from './components/ui/PhoneDialogue.vue';

/**
 * Phone game plugin — overrides the default VN UI with phone-style components.
 * "Locations" in this game map to phone apps/screens.
 */
const plugin: VylosPlugin = {
  components: {
    GameShell: PhoneShell,
    TopBar: PhoneTopBar,
    DialogueBox: PhoneDialogue,
  },
};

export default plugin;
