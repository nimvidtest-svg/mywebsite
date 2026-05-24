let _ctx: AudioContext | null = null;
let _unlocked = false;

/** Call this once on any user click to satisfy browser autoplay policy */
export function unlockAudio() {
  if (_unlocked) return;
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    _ctx = new Ctor();
    // Play a silent buffer — this "unlocks" the context permanently
    const buf = _ctx.createBuffer(1, 1, 22050);
    const src = _ctx.createBufferSource();
    src.buffer = buf;
    src.connect(_ctx.destination);
    src.start(0);
    _unlocked = true;
  } catch { /* ignore */ }
}

const getCtx = (): AudioContext | null => {
  if (!_ctx) return null;
  if (_ctx.state === "suspended") _ctx.resume();
  return _ctx;
};

const ding = (ctx: AudioContext, t: number, freq: number, vol = 0.3, dur = 0.6) => {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  osc1.type = "sine";  osc1.frequency.value = freq;
  osc2.type = "sine";  osc2.frequency.value = freq * 2.756;
  osc1.connect(gain); osc2.connect(gain); gain.connect(ctx.destination);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc1.start(t); osc1.stop(t + dur);
  osc2.start(t); osc2.stop(t + dur);
};

export function playNewOrder() {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    ding(ctx, now,        1318.5); // E6
    ding(ctx, now + 0.13, 1760);   // A6
  } catch { /* ignore */ }
}
