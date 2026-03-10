import type { Event } from '@game/types';

const intro: Event = {
  id: 'intro',
  conditions: (state) => !state.flags.introDone,
  locked: (state) => state.flags.introDone,

  async execute(engine, state) {
    // --- Opening: alarms, darkness ---
    engine.setBackground('assets/locations/bridge/bg/night.png');
    await engine.say('Warning klaxons blare through the station. Red emergency lights pulse against the walls.');
    await engine.say('The air is thin. The lights flicker. Something went very wrong.');

    // --- Commander wakes up ---
    await engine.say('You open your eyes. The command console in front of you is cracked, sparking intermittently.');
    await engine.say('You are Commander of the Aegis Station — a deep-space research outpost on the edge of charted territory.');
    await engine.say('The last thing you remember is a violent impact. An asteroid? A system failure? The details are hazy.');

    // --- Jax enters ---
    engine.setForeground([
      { path: 'assets/locations/bridge/bg/night.png', scale: 1 },
      { path: 'assets/characters/jax.png', scale: 0.8, x: 25, y: 10 },
    ]);
    await engine.say("Commander! You're awake. Thank god.", { from: state.crews.jax });
    await engine.say("The hull took a serious hit. I've patched what I could, but the reactor's running at half capacity.", { from: state.crews.jax });
    await engine.say("Name's Jax — your chief engineer. Well... your only engineer now.", { from: state.crews.jax });

    // --- Elena enters ---
    engine.setForeground([
      { path: 'assets/locations/bridge/bg/night.png', scale: 1 },
      { path: 'assets/characters/elena.png', scale: 0.8, x: 25, y: 10 },
    ]);
    await engine.say("Commander, please don't move too quickly. You took a nasty hit to the head.", { from: state.crews.elena });
    await engine.say("I'm Elena, station medic. I've checked the crew — we lost contact with the rest of the station.", { from: state.crews.elena });
    await engine.say("It's just the four of us now. We need to hold together.", { from: state.crews.elena });

    // --- Kael enters ---
    engine.setForeground([
      { path: 'assets/locations/bridge/bg/night.png', scale: 1 },
      { path: 'assets/characters/kael.png', scale: 0.8, x: 25, y: 10 },
    ]);
    await engine.say("So sleeping beauty finally wakes up.", { from: state.crews.kael });
    await engine.say("Kael. Scout and pilot. I'd fly us out of here, but the nav system is fried.", { from: state.crews.kael });
    await engine.say("I checked the long-range sensors before they went down. Rescue could reach us in about 10 days — if they know we're here.", { from: state.crews.kael });

    // --- Clear foreground, back to bridge ---
    engine.setForeground(null);
    engine.setBackground('assets/locations/bridge/bg/day.png');

    await engine.say('10 days. That\'s all you have. Keep the station running, keep the crew alive, and hope that someone picks up a distress signal.');
    await engine.say('Oxygen is limited. Energy is draining. The station modules are degrading with every passing shift.');
    await engine.say('Every action you take costs time. Choose wisely, Commander.');

    // --- Mark intro complete ---
    state.flags.introDone = true;
  },
};

export default intro;
