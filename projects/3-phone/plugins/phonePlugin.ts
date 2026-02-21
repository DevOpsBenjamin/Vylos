import type { VylosPlugin } from '@vylos/core';
import PhoneShell from '../components/ui/PhoneShell.vue';
import PhoneTopBar from '../components/ui/PhoneTopBar.vue';
import PhoneDialogue from '../components/ui/PhoneDialogue.vue';

/**
 * Phone game plugin — replaces default VN UI components with phone-style UI.
 * The "locations" in this game map to phone apps/screens.
 * Dialogue appears as chat messages instead of a bottom panel.
 */
const phonePlugin: VylosPlugin = {
  components: {
    // Override core components with phone-style versions
    GameShell: PhoneShell,
    TopBar: PhoneTopBar,
    DialogueBox: PhoneDialogue,
  },
};

export default phonePlugin;
