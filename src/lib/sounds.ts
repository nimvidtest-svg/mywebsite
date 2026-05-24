let _ctx: AudioContext | null = null;

const ac = () => {
  if (!_ctx) {
    _ctx = new (window.AudioContext ?? (window as never as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  if (_ctx.state === "suspended") _ctx.resume();
  return _ctx;
};

const ding = (ctx: AudioContext, t: number, freq: number, vol = 0.28, dur = 0.55) => {
  const osc1 = ctx.createOscillator(); // fundamental
  const osc2 = ctx.createOscillator(); // metallic harmonic
  const gain = ctx.createGain();

  osc1.type = "sine";
  osc1.frequency.value = freq;
  osc2.type = "sine";
  osc2.frequency.value = freq * 2.756; // adds a coin-like ring

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  osc1.start(t); osc1.stop(t + dur);
  osc2.start(t); osc2.stop(t + dur);
};

/** Play a two-note cash-register "ching-ching" */
export function playNewOrder() {
  try {
    const ctx = ac();
    const now = ctx.currentTime;
    ding(ctx, now,        1318.5); // E6  — first ching
    ding(ctx, now + 0.13, 1760);   // A6  — second ching
  } catch {
    // audio blocked (no user gesture yet) — fail silently
  }
}
