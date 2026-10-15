// Sound effects, synthesized with the Web Audio API (no audio files). The audio context starts on the
// first click or key press, as browsers require. Mute and volume are saved in this browser.
(function () {
  const PREF_KEY = 'rootdishes-sound';
  let pref = { muted: false, volume: 0.6, weather: 0.5, music: 0.5 };
  try { Object.assign(pref, JSON.parse(localStorage.getItem(PREF_KEY)) || {}); } catch (e) { /* keep defaults */ }
  let ctx = null, master = null, noiseBuf = null, ambBus = null;
  const last = {}; // per-sound time of last play, so bursts of events don't stack into noise

  function savePref() { try { localStorage.setItem(PREF_KEY, JSON.stringify(pref)); } catch (e) { /* private mode */ } }
  function ensure() {
    // Safari on iPhone also leaves a context 'interrupted' (calls, the music starting, the app going away), and only
    // a resume() lets it play again.
    if (ctx) {
      if (ctx.state !== 'running' && ctx.state !== 'closed') { const r = ctx.resume(); if (r) r.catch(() => {}); }
      return ctx;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    // iPhone: one 'playback' audio session for effects and music alike. Otherwise the music starting switches the
    // session and silences the effects (they then also follow the silent switch while the music doesn't).
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* older Safari */ }
    ctx = new AC();
    // Interrupted while the page is on screen (the music just started, a notification): try to carry straight on.
    ctx.addEventListener('statechange', () => { if (ctx.state === 'interrupted' && !document.hidden) ensure(); });
    master = ctx.createGain();
    master.gain.value = pref.muted ? 0 : pref.volume;
    // A gentle compressor keeps chords and overlapping sounds from clipping.
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    master.connect(comp); comp.connect(ctx.destination);
    // 3 s of noise, long enough that the looped weather beds don't audibly repeat.
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    ambBus = ctx.createGain();
    ambBus.gain.value = pref.weather;
    ambBus.connect(master);
    applyAmbient();
    return ctx;
  }
  // ---------- Background music ----------
  // Original tracks, in two playlists: the farm's and the Town's, plus one track of its own for the finale. Each playlist is shuffled: a track plays to its end,
  // then a random other one follows (never the same one twice in a row). Switching between farm and Town fades the
  // old playlist out first, then fades the other in, dropping in 30 s into a random track. The very first track
  // after loading starts from its beginning. They play through plain <audio> elements (a Web Audio source would
  // come out silent when the game is opened as a local file). Tracks load by relative path from assets/music/; the
  // single-file download sets window.ROOTDISHES_MUSIC = { farm: [...], town: [...], finale: [...] } to the files tools/build.js found
  // there (and copies them next to it). All tracks are 96 kbps and levelled to about -17.5 LUFS. Each ends with its
  // own fade and about 2.5 s of silence, the gap before the next.
  const MUSIC_BASE = 0.35; // the tracks are mastered loud; this keeps them under the game sounds
  const MUSIC_FILES = {
    farm: ['kitchen-pickin', 'kitchen-pickin-2', 'pantry-pickin', 'pantry-pickin-2'],
    town: ['town-downtown-strut', 'town-main-street-groove', 'town-main-street-strut', 'town-sidewalk-shuffle'],
    finale: ['finale-high-score-hoedown'], // only while the end screen is open; loops
  };
  // Farm <-> Town switch: the old playlist fades out over FADE_OUT s; the new one waits IN_DELAY s, then starts DROP_IN s
  // into a random track and fades in over FADE_IN s. Both fades follow a squared curve (the old one drops fast, the new
  // one rises slowly), so the two are hardly ever loud together (hearing both at once was disturbing).
  const FADE_OUT = 4, IN_DELAY = 2.5, FADE_IN = 5, DROP_IN = 30;
  // The finale cuts in at once instead: its track starts right away, past its 2.7 s of opening silence (its own intro
  // swells up), while the old playlist drops over 1.5 s, so the music lands with the title.
  const FINALE = { out: 1.5, at: 2.5 };
  let scene = 'farm', lists = null, musicTimer = 0;
  function musicLevel() { return pref.muted ? 0 : MUSIC_BASE * pref.music * pref.volume; }
  function musicOn() { return musicLevel() > 0 && !document.hidden; }
  function musicSrcs(name) {
    const m = window.ROOTDISHES_MUSIC && window.ROOTDISHES_MUSIC[name];
    return Array.isArray(m) && m.length ? m : MUSIC_FILES[name].map((f) => `assets/music/${f}.mp3`);
  }
  // Load a random track (not the one just played) into a playlist's player; at: where to start, in seconds.
  function nextTrack(L, at) {
    const srcs = musicSrcs(L.name);
    let i = Math.floor(Math.random() * srcs.length);
    if (srcs.length > 1 && i === L.track) i = (i + 1 + Math.floor(Math.random() * (srcs.length - 1))) % srcs.length;
    L.track = i;
    if (L.a.getAttribute('src') !== srcs[i]) L.a.src = srcs[i]; // the same track again (or preloaded): no reload
    L.fadeIn = 0; L.a.volume = 0;
    const seek = () => { L.a.currentTime = Math.min(at, L.a.duration / 2); };
    if (at) L.a.readyState >= 1 ? seek() : L.a.addEventListener('loadedmetadata', seek, { once: true });
    if (musicOn()) L.a.play().catch(() => {});
  }
  function applyMusic() {
    if (!lists) return;
    for (const L of Object.values(lists)) {
      if (!musicOn() || (L.mix <= 0 && (L.name !== scene || L.pending))) L.a.pause();
      else if (L.a.paused && L.a.src) { L.fadeIn = 0; L.a.volume = 0; L.a.play().catch(() => {}); }
    }
  }
  function musicTick() {
    if (!lists || !musicOn()) return;
    const lvl = musicLevel();
    for (const L of Object.values(lists)) {
      const want = L.name === scene ? 1 : 0;
      if (L.pending) { // switched to: wait for the old playlist to drop away first
        if (!want) { L.pending = false; continue; }
        if ((L.wait -= 0.05) > 0) continue;
        L.pending = false;
        nextTrack(L, DROP_IN);
        L.fadeIn = 1; // the scene fade is the fade-in
      }
      if (L.mix !== want) {
        const fin = scene === 'finale';
        L.mix = want ? Math.min(1, L.mix + 0.05 / FADE_IN) : Math.max(0, L.mix - 0.05 / (fin ? FINALE.out : FADE_OUT));
        if (!L.mix) L.a.pause(); // faded out: stop; switching back later starts a fresh track
      }
      L.fadeIn = Math.min(1, L.fadeIn + 0.05 / 3); // 3 s fade-in after starting, unmuting or a new track
      if (L.mix > 0) L.a.volume = lvl * L.fadeIn * L.mix * L.mix;
    }
  }
  function playlist(name) {
    const L = { name, a: new Audio(), track: -1, mix: name === scene ? 1 : 0, fadeIn: 0, pending: false, wait: 0 };
    L.a.preload = 'auto';
    L.a.addEventListener('ended', () => nextTrack(L, 0));
    return L;
  }
  function startMusic() {
    if (lists) return;
    lists = { farm: playlist('farm'), town: playlist('town'), finale: playlist('finale') };
    lists.finale.a.src = musicSrcs('finale')[0]; // preloaded, so it starts the moment the finale opens
    musicTimer = setInterval(musicTick, 50);
    nextTrack(lists[scene], 0);
  }
  // 'farm', 'town' or 'finale': cross-fade to that playlist.
  function setMusicScene(name) {
    if (!MUSIC_FILES[name] || name === scene) return;
    scene = name;
    if (!lists) return;
    const L = lists[name];
    if (L.mix > 0 && !L.a.paused) return; // still fading out from a moment ago: just fade it back up
    if (name === 'finale') { L.pending = false; L.mix = 1; nextTrack(L, FINALE.at); L.fadeIn = 1; L.a.volume = musicLevel(); return; }
    L.pending = true; L.wait = IN_DELAY; // musicTick starts it once the old playlist has mostly faded
  }
  // Every tap, click or key press wakes the sound up again if the browser stopped it. Mobile Safari pauses the music
  // and interrupts the effects when the app goes to the background, and refuses to restart them without a tap; on the
  // desktop both are already running, so this does nothing there.
  const unlock = () => {
    ensure();
    if (window.ROOTDISHES_NO_MUSIC === true) return;
    if (!lists) startMusic(); else applyMusic();
  };
  // No weather or effects while the tab is in the background.
  const wake = () => { if (ctx) document.hidden ? ctx.suspend() : ensure(); applyMusic(); };
  document.addEventListener('visibilitychange', wake);
  window.addEventListener('pageshow', wake); // Safari restoring the page from its cache
  // pointerdown alone doesn't count as a tap that may start sound on iPhone; touchend and click do.
  for (const ev of ['pointerdown', 'touchend', 'click', 'keydown']) window.addEventListener(ev, unlock, true);

  // A tone with a quick attack and exponential decay. f may be [from, to] for a pitch slide.
  function tone({ f, type = 'sine', at = 0, dur = 0.15, vol = 0.3, attack = 0.005, dest }) {
    const t = ctx.currentTime + at;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    const [f0, f1] = Array.isArray(f) ? f : [f, f];
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || master);
    o.start(t); o.stop(t + dur + 0.02);
  }
  // Filtered noise burst (thuds, rustles, swooshes).
  function noise({ at = 0, dur = 0.2, vol = 0.3, filter = 'lowpass', freq = 800, to, q = 1, dest }) {
    const t = ctx.currentTime + at;
    const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf;
    fl.type = filter; fl.Q.value = q;
    fl.frequency.setValueAtTime(freq, t);
    if (to) fl.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(dest || master);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }
  const note = (n) => 440 * Math.pow(2, (n - 69) / 12); // MIDI note number to Hz
  const chord = (notes, at, dur, vol, type = 'triangle') => notes.forEach((n) => tone({ f: note(n), type, at, dur, vol }));

  const SOUNDS = {
    // Soft wooden tick for buttons and menus.
    click: () => { tone({ f: [1800, 1100], type: 'triangle', dur: 0.045, vol: 0.12 }); },
    // Placing a building: a low thump with a hollow wooden knock on top.
    plonk: () => {
      tone({ f: [190, 70], type: 'sine', dur: 0.22, vol: 0.55 });
      tone({ f: [420, 300], type: 'triangle', dur: 0.09, vol: 0.18 });
      noise({ dur: 0.12, vol: 0.18, freq: 600, to: 150 });
    },
    // Moving a building: a lift swoosh, then a lighter plonk.
    move: () => {
      noise({ dur: 0.18, vol: 0.12, filter: 'bandpass', freq: 500, to: 2500, q: 2 });
      tone({ f: [240, 100], type: 'sine', at: 0.14, dur: 0.18, vol: 0.4 });
    },
    // Demolishing: a crumbly rumble with falling planks.
    demolish: () => {
      noise({ dur: 0.5, vol: 0.4, freq: 900, to: 90 });
      [0.04, 0.13, 0.24].forEach((at, k) => tone({ f: [300 - k * 60, 120], type: 'triangle', at, dur: 0.1, vol: 0.2 }));
    },
    // Selling: two bright coin pings.
    sell: () => {
      tone({ f: 1975, type: 'square', dur: 0.08, vol: 0.06 });
      tone({ f: 2637, type: 'square', at: 0.07, dur: 0.25, vol: 0.06 });
      tone({ f: 2637 * 2, type: 'sine', at: 0.07, dur: 0.2, vol: 0.05 });
    },
    // Order delivered: a cash register, bell plus drawer.
    // Order delivered (a big payment): a full mechanical cash register. Two key presses, the drawer mechanism
    // ratchets, the bell rings (a real bell's partials are not whole multiples, which is what makes it sound like
    // metal and not a beep), the drawer shoots open with a thunk, and coins jingle in the tray.
    register: () => {
      // key presses: short plastic clacks
      [0, 0.09].forEach((at) => { noise({ at, dur: 0.03, vol: 0.175, filter: 'bandpass', freq: 2200, q: 2 }); tone({ f: [900, 600], type: 'square', at, dur: 0.025, vol: 0.028 }); });
      // ratchet: a quick run of clicks
      for (let k = 0; k < 7; k++) noise({ at: 0.2 + k * 0.018, dur: 0.012, vol: 0.084, filter: 'bandpass', freq: 3200, q: 4 });
      // the bell: "ching"
      const b = 0.33, f = 2350;
      [[1, 0.15, 1.4], [2.0, 0.056, 0.9], [2.76, 0.07, 0.8], [5.4, 0.035, 0.4], [8.93, 0.018, 0.25]].forEach(([r, v, d]) => tone({ f: f * r, type: 'sine', at: b, dur: d, vol: v, attack: 0.002 }));
      noise({ at: b, dur: 0.02, vol: 0.126, filter: 'highpass', freq: 5000 }); // the hammer strike
      // drawer slides out and hits the stop
      noise({ at: b + 0.05, dur: 0.22, vol: 0.098, filter: 'bandpass', freq: 500, to: 900, q: 1.5 });
      tone({ f: [160, 70], type: 'sine', at: b + 0.26, dur: 0.16, vol: 0.245 });
      noise({ at: b + 0.26, dur: 0.06, vol: 0.126, filter: 'lowpass', freq: 1200 });
      // coins rattling in the tray
      for (let k = 0; k < 9; k++) {
        const at = b + 0.3 + Math.random() * 0.45, cf = 3800 + Math.random() * 3500;
        tone({ f: cf, type: 'sine', at, dur: 0.06 + Math.random() * 0.12, vol: 0.0175 + Math.random() * 0.03, attack: 0.001 });
        tone({ f: cf * 1.47, type: 'sine', at, dur: 0.05, vol: 0.0105, attack: 0.001 });
      }
    },
    // Buying (imports, shop packs, loans): a soft coin drop.
    buy: () => { tone({ f: [1400, 900], type: 'triangle', dur: 0.12, vol: 0.12 }); tone({ f: 700, type: 'sine', at: 0.05, dur: 0.12, vol: 0.1 }); },
    // New dish discovered: a short brass-like fanfare in C major.
    fanfare: () => {
      const seq = [[67, 0, 0.12], [72, 0.12, 0.12], [76, 0.24, 0.12], [79, 0.36, 0.5]];
      for (const [n, at, d] of seq) { tone({ f: note(n), type: 'sawtooth', at, dur: d + 0.1, vol: 0.07 }); tone({ f: note(n), type: 'triangle', at, dur: d + 0.15, vol: 0.18 }); }
      chord([60, 64, 67, 72], 0.36, 1.1, 0.07);
      for (let k = 0; k < 6; k++) tone({ f: note(84 + [0, 4, 7, 12, 7, 16][k]), type: 'sine', at: 0.5 + k * 0.06, dur: 0.2, vol: 0.04 });
    },
    // Secret dish: a longer fanfare with a crackling fire.
    secret: () => {
      SOUNDS.fanfare();
      chord([65, 69, 72, 77], 0.95, 1.4, 0.07);
      chord([67, 71, 74, 79, 84], 1.35, 1.8, 0.07);
      for (let k = 0; k < 14; k++) noise({ at: 0.3 + Math.random() * 2.2, dur: 0.04, vol: 0.12, filter: 'highpass', freq: 2500 });
    },
    // The Legacy won: the secret fanfare, a rising run to a big final chord and a shower of coins.
    legacy: () => {
      SOUNDS.secret();
      [72, 76, 79, 84, 88, 91].forEach((n, k) => tone({ f: note(n), type: 'triangle', at: 2.2 + k * 0.09, dur: 0.3, vol: 0.12 }));
      chord([60, 67, 72, 76, 79, 84], 2.8, 2.6, 0.08);
      for (let k = 0; k < 24; k++) tone({ f: [2600 + Math.random() * 1400, 1800], type: 'triangle', at: 1 + Math.random() * 3, dur: 0.08, vol: 0.05 });
    },
    // A dish milestone (25 dishes, every dish): the fanfare, a drum roll into a rising run, a big chord and a few coins.
    milestone: () => {
      SOUNDS.fanfare();
      for (let k = 0; k < 10; k++) noise({ at: 0.9 + k * 0.045, dur: 0.05, vol: 0.05 + k * 0.008, filter: 'bandpass', freq: 900, q: 1.2 });
      [72, 76, 79, 84, 88].forEach((n, k) => tone({ f: note(n), type: 'triangle', at: 1.35 + k * 0.08, dur: 0.3, vol: 0.12 }));
      chord([60, 64, 67, 72, 76, 84], 1.8, 2.2, 0.07);
      for (let k = 0; k < 10; k++) tone({ f: [2600 + Math.random() * 1400, 1800], type: 'triangle', at: 1.9 + Math.random() * 1.4, dur: 0.08, vol: 0.045 });
    },
    // Goal complete: a rising three-note chime.
    goal: () => { [72, 76, 79, 84].forEach((n, k) => tone({ f: note(n), type: 'sine', at: k * 0.09, dur: 0.5, vol: 0.16 })); },
    // New buildings or production steps unlocked: a sparkly arpeggio.
    unlock: () => { [79, 83, 86, 91, 95].forEach((n, k) => tone({ f: note(n), type: 'triangle', at: k * 0.05, dur: 0.35, vol: 0.09 })); },
    // First time an ingredient is made: a little bubble pop.
    pop: () => { tone({ f: [500, 1300], type: 'sine', dur: 0.09, vol: 0.14 }); },
    // Test Kitchen: a near miss (warm) or a flop.
    warm: () => { tone({ f: note(69), type: 'triangle', dur: 0.14, vol: 0.12 }); tone({ f: note(74), type: 'triangle', at: 0.1, dur: 0.2, vol: 0.12 }); },
    flop: () => { tone({ f: [330, 200], type: 'triangle', dur: 0.25, vol: 0.14 }); tone({ f: [247, 150], type: 'triangle', at: 0.12, dur: 0.3, vol: 0.12 }); },
    // Not allowed (not enough money, can't build here): a short low buzz.
    error: () => { tone({ f: 150, type: 'square', dur: 0.12, vol: 0.06 }); tone({ f: 140, type: 'square', at: 0.13, dur: 0.12, vol: 0.06 }); },
    // Opening and closing windows: a faint paper swoosh.
    open: () => { noise({ dur: 0.12, vol: 0.05, filter: 'bandpass', freq: 1200, to: 3200, q: 1.5 }); },
    close: () => { noise({ dur: 0.1, vol: 0.04, filter: 'bandpass', freq: 3000, to: 1100, q: 1.5 }); },
    // New season: a soft bell.
    season: () => { tone({ f: note(81), type: 'sine', dur: 1.4, vol: 0.12 }); tone({ f: note(81) * 2.76, type: 'sine', dur: 0.7, vol: 0.03 }); tone({ f: note(76), type: 'sine', at: 0.25, dur: 1.4, vol: 0.1 }); },
    // A new order comes in: a light double ding.
    order: () => { tone({ f: note(88), type: 'sine', dur: 0.3, vol: 0.07 }); tone({ f: note(84), type: 'sine', at: 0.12, dur: 0.4, vol: 0.07 }); },
  };
  const GAP = { click: 0.03, pop: 0.25, sell: 0.06, error: 0.25, unlock: 0.4, goal: 0.4, order: 1 };

  // ---------- Weather ambience ----------
  // Quiet looping beds that follow the weather and crossfade when it changes:
  // rain (hiss + drops), storm (heavy rain + thunder on each lightning flash), blizzard (winter storm), snow (gusting wind), frost (faint wind).
  const FADE = 2.5;
  let ambWant = null, amb = null; // amb = { kind, out, stop() }
  // Season background on calm days, a separate layer under the weather: birds, crickets, falling leaves.
  let natWant = null, nat = null;
  function loopNoise(dest, type, freq, q = 0.7) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter();
    s.buffer = noiseBuf; s.loop = true; s.loopStart = 0; s.loopEnd = noiseBuf.duration;
    f.type = type; f.frequency.value = freq; f.Q.value = q;
    s.connect(f); f.connect(dest);
    s.start(ctx.currentTime, Math.random() * 2);
    return { src: s, filter: f };
  }
  function lfo(rate, depth, param) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = rate; g.gain.value = depth;
    o.connect(g); g.connect(param); o.start();
    return o;
  }
  function rainBed(out, level, dropsPerSec) {
    const bed = ctx.createGain(); bed.gain.value = 0.11 * level; bed.connect(out);
    const hiss = loopNoise(bed, 'bandpass', 2600, 0.5);
    const low = ctx.createGain(); low.gain.value = 0.09 * level; low.connect(out);
    const patter = loopNoise(low, 'lowpass', 500);
    const timer = setInterval(() => {
      // Drops on leaves and roofs: tiny filtered clicks spread over the next 100 ms.
      const n = Math.round(dropsPerSec / 10 * (0.5 + Math.random()));
      for (let k = 0; k < n; k++) noise({ at: Math.random() * 0.1, dur: 0.02 + Math.random() * 0.03, vol: (0.02 + Math.random() * 0.05) * level, filter: 'bandpass', freq: 1500 + Math.random() * 4000, q: 4, dest: out });
    }, 100);
    return { srcs: [hiss.src, patter.src], timers: [timer] };
  }
  // Starts right away so it lands on the lightning flash drawn by render.js (which calls SFX.thunder).
  function thunder(out, close) {
    const dur = 3 + Math.random() * 3;
    if (close) noise({ dur: 0.35, vol: 0.2, filter: 'lowpass', freq: 2500, to: 300, dest: out });
    noise({ dur, vol: close ? 0.5 : 0.32, filter: 'lowpass', freq: 260, to: 50, q: 0.8, dest: out });
    noise({ at: close ? 0.3 : 0.5, dur: dur * 0.7, vol: 0.2, filter: 'lowpass', freq: 160, to: 45, dest: out });
  }
  function windBed(out, level) {
    const g = ctx.createGain(); g.gain.value = 0.1 * level; g.connect(out);
    const w = loopNoise(g, 'bandpass', 450, 1.2);
    // Two slow, unrelated LFOs make the wind rise and fall in gusts and whistle a little.
    const o1 = lfo(0.07, 0.06 * level, g.gain), o2 = lfo(0.13, 260, w.filter.frequency);
    const hi = ctx.createGain(); hi.gain.value = 0.02 * level; hi.connect(out);
    const whistle = loopNoise(hi, 'bandpass', 1400, 8);
    const o3 = lfo(0.05, 300, whistle.filter.frequency);
    return { srcs: [w.src, whistle.src, o1, o2, o3], timers: [] };
  }
  // Each little sound comes from a random spot in the stereo field.
  function spot(out, width = 0.8) {
    const p = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
    if (p.pan) p.pan.value = (Math.random() * 2 - 1) * width;
    p.connect(out);
    return p;
  }
  function spotAt(out, pan) {
    const p = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
    if (p.pan) p.pan.value = Math.max(-1, Math.min(1, pan));
    p.connect(out);
    return p;
  }
  // Calls again after a random pause, until stopped.
  function every(min, max, fn) {
    const h = { t: 0 };
    const next = () => { h.t = setTimeout(() => { if (ctx.state === 'running') fn(); next(); }, (min + Math.random() * (max - min)) * 1000); };
    next();
    return { srcs: [], timers: [], stop: () => clearTimeout(h.t) };
  }
  // Spring: a few birds, each a different kind of call.
  function birdCall(out) {
    const d = spot(out), r = Math.random(), v = 0.03 + Math.random() * 0.025;
    if (r < 0.45) { // tweets: quick rising whistles
      const base = 2600 + Math.random() * 1400, n = 2 + Math.floor(Math.random() * 4);
      for (let k = 0; k < n; k++) tone({ f: [base, base * 1.5], at: k * 0.13, dur: 0.07, vol: v, attack: 0.01, dest: d });
    } else if (r < 0.8) { // trill: fast alternating notes
      const a = 3200 + Math.random() * 1200, n = 6 + Math.floor(Math.random() * 8);
      for (let k = 0; k < n; k++) tone({ f: [k % 2 ? a : a * 1.12, k % 2 ? a * 0.95 : a * 1.18], at: k * 0.05, dur: 0.04, vol: v * 0.8, attack: 0.005, dest: d });
    } else if (r < 0.93) { // song: falling then rising phrase
      const a = 2200 + Math.random() * 800;
      [[1.6, 1.2], [1.5, 1.1], [1.1, 1.4], [1.3, 1.8]].forEach(([x, y], k) => tone({ f: [a * x, a * y], at: k * 0.11, dur: 0.09, vol: v, attack: 0.01, dest: d }));
    } else { // a distant cuckoo
      const dc = spot(out, 0.5);
      tone({ f: [700, 690], dur: 0.25, vol: 0.04, attack: 0.03, dest: dc });
      tone({ f: [580, 570], at: 0.3, dur: 0.35, vol: 0.035, attack: 0.03, dest: dc });
    }
  }
  // Summer: two or three crickets, each chirping in its own rhythm and resting now and then.
  function cricket(out) {
    const d = spot(out), f = 4200 + Math.random() * 900, pulses = 3 + Math.floor(Math.random() * 2);
    const gap = 0.35 + Math.random() * 0.45, v = 0.015 + Math.random() * 0.01;
    let on = true;
    const t = setInterval(() => {
      if (Math.random() < (on ? 0.015 : 0.08)) on = !on; // rests are rarer and shorter
      if (!on || ctx.state !== 'running') return;
      for (let k = 0; k < pulses; k++) tone({ f, type: 'sine', at: k * 0.045, dur: 0.03, vol: v, attack: 0.004, dest: d });
    }, gap * 1000);
    return { srcs: [], timers: [t] };
  }
  // Autumn: a soft rustle of a leaf gust, with a few dry crackles.
  function rustle(out) {
    const d = spot(out, 0.9), dur = 0.4 + Math.random() * 0.7, v = 0.035 + Math.random() * 0.025;
    const t = ctx.currentTime, s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; fl.type = 'bandpass'; fl.Q.value = 0.9;
    fl.frequency.setValueAtTime(2500 + Math.random() * 1500, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + dur * 0.4); // swells in, unlike a click
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(d);
    s.start(t, Math.random() * 2); s.stop(t + dur + 0.05);
    const n = 2 + Math.floor(Math.random() * 4);
    for (let k = 0; k < n; k++) noise({ at: Math.random() * dur, dur: 0.012, vol: 0.03, filter: 'highpass', freq: 4000, dest: d });
  }
  function startAmbient(kind) {
    const out = ctx.createGain(); out.connect(ambBus);
    out.gain.setValueAtTime(0.0001, ctx.currentTime);
    // Weather sits at 40% of its original mix (it was too loud), rain and storm (thunder included) at 25%
    // (still too loud, 2026-10-10); the season background stays at full level.
    const NATURE_KINDS = ['birds', 'crickets', 'leaves'];
    out.gain.exponentialRampToValueAtTime(NATURE_KINDS.includes(kind) ? 1 : kind === 'rain' || kind === 'storm' ? 0.25 : 0.4, ctx.currentTime + FADE);
    const parts = [];
    if (kind === 'rain') parts.push(rainBed(out, 1, 30));
    if (kind === 'storm') parts.push(rainBed(out, 1.4, 55), windBed(out, 0.6));
    // A winter storm falls as snow on the map, so it sounds like a blizzard: strong wind, no rain.
    if (kind === 'blizzard') parts.push(windBed(out, 1.6));
    if (kind === 'snow') parts.push(windBed(out, 1));
    if (kind === 'frost') parts.push(windBed(out, 0.45));
    if (kind === 'birds') { birdCall(out); parts.push(every(0.6, 3, () => { birdCall(out); if (Math.random() < 0.3) setTimeout(() => birdCall(out), 300 + Math.random() * 700); })); } // sometimes a second bird answers
    if (kind === 'crickets') { const n = 3 + Math.floor(Math.random() * 3); for (let k = 0; k < n; k++) parts.push(cricket(out)); }
    if (kind === 'leaves') parts.push(every(0.8, 3.5, () => rustle(out)));
    return {
      kind, out,
      stop() {
        out.gain.cancelScheduledValues(ctx.currentTime);
        out.gain.setValueAtTime(Math.max(0.0001, out.gain.value), ctx.currentTime);
        out.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + FADE);
        for (const p of parts) { p.timers.forEach(clearInterval); if (p.stop) p.stop(); }
        setTimeout(() => { for (const p of parts) p.srcs.forEach((x) => { try { x.stop(); } catch (e) { /* already stopped */ } }); out.disconnect(); }, FADE * 1000 + 100);
      },
    };
  }
  const AMBIENT = new Set(['rain', 'storm', 'blizzard', 'snow', 'frost']);
  function applyAmbient() {
    if (!ctx) return;
    const want = !pref.muted && pref.weather > 0 && AMBIENT.has(ambWant) ? ambWant : null;
    if ((amb && amb.kind) !== want) {
      if (amb) amb.stop();
      amb = want ? startAmbient(want) : null;
    }
    const wantN = !pref.muted && pref.weather > 0 ? natWant : null;
    if ((nat && nat.kind) !== wantN) {
      if (nat) nat.stop();
      nat = wantN ? startAmbient(wantN) : null;
    }
  }
  // Season sounds only on calm days: rain, storms, snow and frost have their own sound.
  const NATURE = { spring: 'birds', summer: 'crickets', autumn: 'leaves' };
  const CALM = new Set(['sunny', 'drought']);

  // ---------- Farmyard animals ----------
  // Simple source-filter voices, the way real animal calls are made: a buzzy glottal source (with natural pitch wobble,
  // roughness and breath) shaped by several mouth resonances (formants) that move as the mouth opens and closes.
  const waves = {};
  function glottal(tilt) { // a pulse train whose harmonics fall off by 1/n^tilt; lower tilt = brighter, buzzier
    if (!waves[tilt]) {
      const n = 60, re = new Float32Array(n + 1), im = new Float32Array(n + 1);
      for (let k = 1; k <= n; k++) im[k] = 1 / Math.pow(k, tilt);
      waves[tilt] = ctx.createPeriodicWave(re, im);
    }
    return waves[tilt];
  }
  // curve: a number, or [[time, value], ...] with linear ramps between points.
  function setCurve(param, curve, t) {
    if (typeof curve === 'number') { param.setValueAtTime(curve, t); return; }
    curve.forEach(([dt, v], i) => (i ? param.linearRampToValueAtTime(v, t + dt) : param.setValueAtTime(v, t + dt)));
  }
  const first = (curve) => (typeof curve === 'number' ? curve : curve[0][1]);
  function wobble(t, end, rate, depth, param) { // a sine LFO added to param; depth may be a curve
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = rate; setCurve(g.gain, depth, t);
    o.connect(g); g.connect(param); o.start(t); o.stop(end);
  }
  function voice(dest, { at = 0, pitch, tilt = 1.1, jitter = 0.02, formants, breath = 0.1, env, vol, vib = 0, vibRate = 6, trem = 0, rough = 0, roughRate = 40, mouth }) {
    const t = ctx.currentTime + at, end = t + env[env.length - 1][0] + 0.05, p0 = first(pitch);
    const o = ctx.createOscillator();
    o.setPeriodicWave(glottal(tilt));
    setCurve(o.frequency, pitch, t);
    // Jitter: slow random wander of the pitch, so it never sounds like a synth.
    if (jitter) {
      const n = ctx.createBufferSource(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
      n.buffer = noiseBuf; n.loop = true; lp.type = 'lowpass'; lp.frequency.value = 25; g.gain.value = p0 * jitter * 50;
      n.connect(lp); lp.connect(g); g.connect(o.frequency); n.start(t, Math.random() * 2); n.stop(end);
    }
    if (vib) wobble(t, end, vibRate, p0 * vib, o.frequency);
    const src = ctx.createGain(); src.gain.value = 1;
    if (trem) wobble(t, end, vibRate, trem, src.gain); // the pulsing of a bleat
    if (rough) wobble(t, end, roughRate, rough, src.gain); // rasp / growl
    o.connect(src);
    const bank = ctx.createGain(); bank.gain.value = 1;
    src.connect(bank);
    if (breath) {
      const n = ctx.createBufferSource(), g = ctx.createGain();
      n.buffer = noiseBuf; g.gain.value = breath;
      n.connect(g); g.connect(bank); n.start(t, Math.random() * 2); n.stop(end);
    }
    const out = ctx.createGain();
    for (const fm of formants) {
      const f = ctx.createBiquadFilter(), g = ctx.createGain();
      f.type = 'bandpass'; f.Q.value = fm.q; setCurve(g.gain, fm.g, t);
      setCurve(f.frequency, fm.f, t);
      bank.connect(f); f.connect(g); g.connect(out);
    }
    out.gain.setValueAtTime(0.0001, t);
    for (const [dt, v] of env) out.gain.exponentialRampToValueAtTime(Math.max(0.0001, v * vol), t + dt);
    // mouth: a low-pass curve for how far the mouth is open (closed = only the low hum gets out).
    if (mouth) { const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.7; setCurve(lp.frequency, mouth, t); out.connect(lp); lp.connect(dest); } else out.connect(dest);
    o.start(t); o.stop(end);
  }
  const rnd = (a, b) => a + Math.random() * (b - a);
  const scale = (curve, s) => (typeof curve === 'number' ? curve * s : curve.map(([t, v]) => [t, v * s]));
  const ANIMALS = {
    // Cow v2 (kept for comparison, see COW_VERSION below), built from how cattle actually make the sound rather than from a human vowel. A cow's vocal tract is about
    // 70 cm long, so its resonances sit close together and low: roughly every 250 Hz (125, 375, 625, ... Hz), where a
    // person's are 1000 Hz apart. That dense, low resonance comb is what makes a moo sound big. The call starts with the
    // mouth closed (only a low "mmm" gets out), the mouth opens and lets the bright harmonics through ("mmm-WAAAH"),
    // the pitch climbs and holds, then falls away at the end as the mouth closes again. A calf has a shorter
    // tract (wider spacing) and a higher voice.
    mooV2(d, v, calf) {
      const L = calf ? rnd(0.8, 1.2) : rnd(1.3, 2), p = calf ? rnd(210, 250) : rnd(135, 160);
      const dF = calf ? rnd(320, 350) : rnd(230, 260), open = calf ? 0.2 : 0.3;
      const formants = [];
      for (let i = 1; i <= 10; i++) {
        const f = (2 * i - 1) * dF / 2; // closed-open tube: odd multiples of a quarter wavelength
        // Bandwidth grows with frequency (about 80 Hz low down, 250 Hz up high); higher resonances are weaker.
        formants.push({ f: [[0, f * 0.95], [open, f], [L, f * 0.97]], q: f / (80 + f * 0.06), g: 1 / Math.sqrt(i) });
      }
      voice(d, {
        pitch: [[0, p * 0.72], [open, p * 0.95], [open + 0.25, p], [L * 0.6, p * 1.03], [L * 0.85, p * 0.94], [L, p * 0.78]],
        tilt: 0.85, jitter: 0.025, breath: 0.08, vib: 0.012, vibRate: 4.5,
        rough: [[0, 0.25], [open, 0.08], [L * 0.85, 0.08], [L, 0.2]], roughRate: p / 2, // a little period-doubling at the edges
        formants,
        mouth: [[0, 380], [open, 3200], [L * 0.85, 2800], [L, 500]],
        env: [[0.12, 0.45], [open + 0.05, 1], [L * 0.88, 0.95], [L, 0.0001]], vol: calf ? v * 1.3 : v,
      });
    },
    // Cow v3 (tuba-like, kept for comparison): a different technique. Instead of a voice through resonances, a bellow built like an analog synth patch:
    // two slightly detuned buzzy oscillators (the two vocal folds never vibrate quite alike, which gives the thick,
    // beating tone), a sub-oscillator an octave down (cattle voices often "double" their period, the rough low growl),
    // all through a resonant low-pass that opens and closes like the mouth ("mm-WAAA-oo"), a nasal dip around 1 kHz,
    // a little saturation for the raw loudness of a real bellow, and a breathy puff at the start.
    // Pitch: a quick scoop up, a held, slightly drifting middle, then it falls away at the end.
    mooV3(d, v, calf) {
      const L = calf ? rnd(0.8, 1.2) : rnd(1.3, 1.9), p = calf ? rnd(200, 240) : rnd(110, 130);
      const t = ctx.currentTime, end = t + L + 0.1;
      const pitch = [[0, p * 0.78], [0.15, p], [L * 0.45, p * 1.03], [L * 0.7, p * 0.98], [L, p * 0.78]];
      const mix = ctx.createGain(); mix.gain.value = 1;
      const osc = (type, mult, detune, gain) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type; o.detune.value = detune; g.gain.value = gain;
        setCurve(o.frequency, pitch.map(([dt, f]) => [dt, f * mult]), t);
        o.connect(g); g.connect(mix); o.start(t); o.stop(end);
        return o;
      };
      const a = osc('sawtooth', 1, -7, 0.5), b = osc('sawtooth', 1, 8, 0.5);
      // Sub-octave growl, strongest at the start and the end.
      const sub = ctx.createOscillator(), sg = ctx.createGain();
      sub.type = 'triangle'; setCurve(sub.frequency, pitch.map(([dt, f]) => [dt, f / 2]), t);
      setCurve(sg.gain, [[0, 0.5], [0.3, 0.2], [L * 0.7, 0.2], [L, 0.45]], t);
      sub.connect(sg); sg.connect(mix); sub.start(t); sub.stop(end);
      // Slow drift, so the held note is never machine-steady.
      const drift = ctx.createOscillator(), dg = ctx.createGain();
      drift.frequency.value = rnd(2.5, 4); dg.gain.value = p * 0.012;
      drift.connect(dg); [a, b, sub].forEach((o) => dg.connect(o.frequency)); drift.start(t); drift.stop(end);
      // The mouth: resonant low-pass sweep.
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 5;
      const m = calf ? 1.35 : 1;
      setCurve(lp.frequency, [[0, 220 * m], [0.25, 650 * m], [L * 0.5, 900 * m], [L * 0.8, 600 * m], [L, 260 * m]], t);
      const nasal = ctx.createBiquadFilter(); nasal.type = 'peaking'; nasal.frequency.value = 1000 * m; nasal.Q.value = 1.5; nasal.gain.value = -9;
      const sat = ctx.createWaveShaper(), curve = new Float32Array(1024);
      for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; curve[i] = Math.tanh(x * 2.2) / Math.tanh(2.2); }
      sat.curve = curve;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(v * 0.6, t + 0.08);
      env.gain.exponentialRampToValueAtTime(v, t + 0.3);
      env.gain.setValueAtTime(v, t + L * 0.75);
      env.gain.exponentialRampToValueAtTime(0.0001, t + L);
      mix.connect(sat); sat.connect(lp); lp.connect(nasal); nasal.connect(env); env.connect(d);
      noise({ dur: 0.25, vol: v * 0.35, filter: 'bandpass', freq: 700 * m, q: 1, dest: d }); // breath puff
    },
    // Cow v4: computed sample by sample, like a speech synthesizer, so every single vocal-fold pulse can differ.
    // v3 sounded like a tuba because its tone was perfectly regular; real animal voices are not. Here each glottal
    // pulse gets its own small random length (jitter) and loudness (shimmer), alternate pulses differ in strength
    // (the rough "doubled" cattle growl), and breath noise is pushed through in time with each pulse. The pulses then
    // pass through a chain of resonators set to an open cattle mouth, with a low nasal "mmm" while the mouth is still
    // closed. Pitch scoops up, holds and falls away at the end.
    mooV4(d, v, calf) {
      const sr = ctx.sampleRate, L = calf ? rnd(0.8, 1.2) : rnd(1.3, 1.9), n = Math.floor(L * sr);
      const p = calf ? rnd(210, 250) : rnd(135, 160), fs = calf ? 1.3 : 1, open = calf ? 0.18 : 0.28;
      const buf = ctx.createBuffer(1, n, sr), out = buf.getChannelData(0);
      const lerp = (pts, x) => { for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; return y0 + (y1 - y0) * (x - x0) / (x1 - x0); } return pts[pts.length - 1][1]; };
      const F0 = [[0, 0.78], [open, 0.97], [0.5 * L, 1.04], [0.75 * L, 1], [L, 0.76]];
      const MOUTH = [[0, 0], [open, 1], [0.8 * L, 0.9], [L, 0.2]]; // 0 closed .. 1 open
      const AMP = [[0, 0], [0.06, 0.4], [open, 0.85], [open + 0.15, 1], [0.8 * L, 0.9], [L, 0]];
      const ROUGH = [[0, 0.35], [open, 0.12], [0.75 * L, 0.12], [L, 0.4]];
      // Resonators: [frequency when open, bandwidth]; closed they sit 15% lower.
      const FORM = [[230, 80], [650, 90], [1050, 110], [1450, 130], [1950, 160], [2500, 190], [3000, 220]].map(([f, b]) => [f * fs, b * fs]);
      const res = FORM.map(() => ({ y1: 0, y2: 0 }));
      const nas = { y1: 0, y2: 0 };
      const reson = (st, x, f, bw) => { // Klatt 2-pole resonator, unity gain at DC
        const c = -Math.exp(-2 * Math.PI * bw / sr), b = 2 * Math.exp(-Math.PI * bw / sr) * Math.cos(2 * Math.PI * f / sr), a = 1 - b - c;
        const y = a * x + b * st.y1 + c * st.y2; st.y2 = st.y1; st.y1 = y; return y;
      };
      let phase = 1, T = 1, amp = 1, odd = false, prevG = 0, prevX = 0, prevY = 0, lp = 0, peak = 1e-9;
      for (let i = 0; i < n; i++) {
        const t = i / sr;
        if (phase >= 1) { // a new glottal pulse: its own period, loudness and (alternating) strength
          phase -= 1;
          const f = p * lerp(F0, t) * (1 + (Math.random() - 0.5) * 0.05);
          T = sr / f;
          odd = !odd;
          amp = (1 + (Math.random() - 0.5) * 0.25) * (odd ? 1 : 1 - lerp(ROUGH, t));
        }
        // Rosenberg glottal pulse (open 55%, closing 20%), differentiated for lip radiation.
        const ph = phase;
        const g = ph < 0.55 ? 0.5 * (1 - Math.cos(Math.PI * ph / 0.55)) : ph < 0.75 ? Math.cos(Math.PI * (ph - 0.55) / 0.4) : 0;
        let x = (g - prevG) * amp * 6; prevG = g;
        x += (Math.random() * 2 - 1) * (0.06 + 0.22 * g) * amp; // breath, strongest while the folds are open
        { const e = x - 0.9 * prevX; prevX = x; x = e * 4; } // pre-emphasis: the resonator chain darkens a lot, this keeps the bright edge
        phase += 1 / T;
        const m = lerp(MOUTH, t);
        let y = x;
        for (let k = 0; k < res.length; k++) y = reson(res[k], y, FORM[k][0] * (0.85 + 0.15 * m), FORM[k][1]);
        const hum = reson(nas, x, 260 * fs, 80); // nasal "mmm" while the mouth is closed
        { const e = y - 0.95 * prevY; prevY = y; y = e * 6; } // stands in for the resonances above 3 kHz the chain leaves out
        y = y * (0.15 + 0.85 * m) + hum * (1 - m) * 1.5;
        lp += (y - lp) * (0.08 + 0.6 * m); // the closed mouth also muffles the highs
        const s = lp * lerp(AMP, t);
        out[i] = s; if (Math.abs(s) > peak) peak = Math.abs(s);
      }
      for (let i = 0; i < n; i++) out[i] /= peak;
      const src = ctx.createBufferSource(), g = ctx.createGain();
      src.buffer = buf; g.gain.value = v;
      src.connect(g); g.connect(d); src.start();
    },
    // Sheep: "b-aaa-a-a". A pulsing bleat (pitch and loudness wobble together) on an "æ" vowel. Goats: higher, faster, harsher.
    baa(d, v, goat) {
      const L = rnd(0.7, 1.1), p = goat ? rnd(290, 360) : rnd(170, 230), rate = goat ? rnd(11, 14) : rnd(8, 10.5), s = goat ? 1.15 : 1;
      voice(d, {
        pitch: [[0, p * 0.92], [0.12, p * 1.08], [L, p * 0.9]], tilt: goat ? 0.9 : 1, jitter: 0.02, breath: goat ? 0.3 : 0.22,
        vib: 0.06, vibRate: rate, trem: 0.55, rough: goat ? 0.25 : 0, roughRate: 63,
        formants: [
          { f: 300, q: 3, g: 0.3 },
          { f: scale([[0, 450], [0.1, 850], [L, 780]], s), q: 5, g: 1 },
          { f: scale([[0, 1300], [0.1, 1750], [L, 1650]], s), q: 7, g: 0.6 },
          { f: 2700 * s, q: 9, g: 0.25 },
        ],
        env: [[0.04, 0.5], [0.12, 1], [L * 0.7, 0.75], [L, 0.0001]], vol: goat ? v * 1.4 : v,
      });
    },
    // Pig: two to four short, croaky, nasal grunts with plenty of breath, the last one often a rising "oink".
    oink(d, v) {
      const n = 2 + Math.floor(Math.random() * 3), p = rnd(75, 100);
      let at = 0;
      for (let k = 0; k < n; k++) {
        const len = rnd(0.16, 0.28), up = k === n - 1 && Math.random() < 0.6 ? 1.45 : 1.15;
        voice(d, {
          at, pitch: [[0, p], [len * 0.4, p * up], [len, p * 1.02]], tilt: 1, jitter: 0.08, breath: 0.55,
          rough: 0.6, roughRate: p / 2,
          formants: [
            { f: 350, q: 3, g: 1 },
            { f: [[0, 700], [len, up > 1.3 ? 1250 : 950]], q: 5, g: 0.6 },
            { f: 2200, q: 8, g: 0.12 },
          ],
          env: [[0.02, 1], [len * 0.5, 0.8], [len, 0.0001]], vol: v,
        });
        if (k === 0 && Math.random() < 0.5) noise({ at, dur: 0.15, vol: v * 0.6, filter: 'lowpass', freq: 900, to: 300, dest: d }); // a snort
        at += len + rnd(0.06, 0.18);
      }
    },
    // Hen: "buk ... buk buk ... bu-KAAAWK". Short bright clucks with a falling pitch, sometimes ending in a long rasping squawk.
    cluck(d, v) {
      // "buk": a dark, throaty "o" that starts with a little knock and drops fast, in quick runs with pauses between.
      const n = 3 + Math.floor(Math.random() * 5), p = rnd(260, 320);
      let at = 0;
      for (let k = 0; k < n; k++) {
        const len = rnd(0.05, 0.08), q = p * rnd(0.93, 1.07);
        noise({ at, dur: 0.015, vol: v * 0.5, filter: 'bandpass', freq: 1400, q: 2, dest: d });
        voice(d, {
          at, pitch: [[0, q * 1.3], [len * 0.4, q], [len, q * 0.75]], tilt: 1.1, jitter: 0.04, breath: 0.25, rough: 0.3, roughRate: q / 2,
          formants: [{ f: [[0, 520], [len, 420]], q: 3, g: 1 }, { f: 1100, q: 4, g: 0.4 }, { f: 2600, q: 6, g: 0.1 }],
          env: [[0.006, 1], [len * 0.5, 0.6], [len, 0.0001]], vol: v,
        });
        at += Math.random() < 0.25 ? rnd(0.35, 0.6) : rnd(0.12, 0.18);
      }
      if (Math.random() < 0.4) {
        const L = rnd(0.35, 0.5);
        voice(d, {
          at: at + 0.05, pitch: [[0, p], [0.07, p * 1.75], [L, p * 1.35]], tilt: 0.85, jitter: 0.03, breath: 0.2, rough: 0.4, roughRate: 85,
          formants: [{ f: [[0, 700], [0.07, 1050], [L, 950]], q: 4, g: 1 }, { f: [[0, 1700], [0.07, 2000], [L, 1800]], q: 6, g: 0.7 }, { f: 3100, q: 8, g: 0.3 }],
          env: [[0.02, 0.8], [0.08, 1], [L * 0.7, 0.8], [L, 0.0001]], vol: v * 1.75, // same loudness as before the clucks were redone
        });
      }
    },
    // Duck: "QUACK quack quack". Very bright, nasal and raspy, each quack a little lower and softer, like a laugh.
    quack(d, v) {
      const n = 1 + Math.floor(Math.random() * 4), p = rnd(320, 400);
      for (let k = 0; k < n; k++) {
        const len = rnd(0.17, 0.24), q = p * (1 - k * 0.05);
        voice(d, {
          at: k * rnd(0.26, 0.32), pitch: [[0, q * 1.05], [len * 0.3, q], [len, q * 0.8]], tilt: 0.7, jitter: 0.03, breath: 0.2,
          rough: 0.6, roughRate: q / 2,
          formants: [{ f: 700, q: 5, g: 0.6 }, { f: [[0, 1650], [len, 1300]], q: 8, g: 1 }, { f: 3000, q: 10, g: 0.6 }],
          env: [[0.015, 1], [len * 0.6, 0.7], [len, 0.0001]], vol: v * (1 - k * 0.15),
        });
      }
    },
    // Turkey: the gobble, a fast gurgling warble (about 15 wobbles a second) that tumbles down in pitch.
    // The pitch and loudness flutter together, which is what makes it gargle rather than trill.
    // Now and then a hen's yelps instead: a few short, falling "keouk" calls.
    gobble(d, v) {
      if (Math.random() < 0.3) {
        const n = 3 + Math.floor(Math.random() * 4), p = rnd(620, 760);
        for (let k = 0; k < n; k++) {
          const len = rnd(0.1, 0.14);
          voice(d, {
            at: k * rnd(0.2, 0.26), pitch: [[0, p * 1.1], [len * 0.3, p * 1.15], [len, p * 0.75]], tilt: 0.8, jitter: 0.03, breath: 0.15,
            rough: 0.3, roughRate: 70,
            formants: [{ f: [[0, 1000], [len, 800]], q: 5, g: 1 }, { f: 2000, q: 7, g: 0.5 }, { f: 3200, q: 9, g: 0.2 }],
            env: [[0.01, 1], [len * 0.5, 0.8], [len, 0.0001]], vol: v * YELP,
          });
        }
        return;
      }
      const n = Math.random() < 0.35 ? 2 : 1;
      for (let k = 0; k < n; k++) {
        const L = k ? rnd(0.45, 0.6) : rnd(0.7, 1), p = rnd(480, 580) * (k ? 0.92 : 1), rate = rnd(13, 17);
        voice(d, {
          at: k * 1.15, pitch: [[0, p * 1.2], [0.08, p * 1.3], [L * 0.5, p], [L, p * 0.72]], tilt: 0.75, jitter: 0.04, breath: 0.18,
          vib: 0.16, vibRate: rate, trem: 0.85, rough: 0.35, roughRate: p / 2,
          formants: [{ f: [[0, 1150], [L, 850]], q: 4, g: 1 }, { f: [[0, 2300], [L, 1900]], q: 6, g: 0.55 }, { f: 3300, q: 8, g: 0.25 }],
          mouth: [[0, 1800], [0.06, 4500], [L * 0.8, 3500], [L, 1200]],
          env: [[0.03, 1], [L * 0.6, 0.85], [L, 0.0001]], vol: v,
        });
      }
    },
    // Goose: a loud, nasal "a-HONK", rising into the honk then dropping off; one to three in a row.
    honk(d, v) {
      const n = 1 + Math.floor(Math.random() * 3), p = rnd(380, 460);
      let at = 0;
      for (let k = 0; k < n; k++) {
        const len = rnd(0.2, 0.3), q = p * rnd(0.95, 1.05);
        voice(d, {
          at, pitch: [[0, q * 0.75], [0.05, q * 1.12], [len * 0.7, q], [len, q * 0.85]], tilt: 0.7, jitter: 0.025, breath: 0.12,
          rough: 0.35, roughRate: q / 2,
          formants: [{ f: 520, q: 4, g: 0.5 }, { f: [[0, 1000], [0.05, 1350], [len, 1150]], q: 6, g: 1 }, { f: 2600, q: 8, g: 0.55 }],
          env: [[0.02, 0.6], [0.06, 1], [len * 0.7, 0.8], [len, 0.0001]], vol: v,
        });
        at += len + rnd(0.15, 0.35);
      }
    },
  };
  const YELP = 2; // turkey yelps vs gobble loudness
  // ---------- Sounds of a place: bees at an apiary, gulls and lapping water at the shore ----------
  const PLACES = {
    // A small cloud of bees drifting past: several buzzing wings, each its own pitch, wandering and swelling.
    bees(d, v) {
      const L = rnd(1.8, 3), t = ctx.currentTime;
      const out = ctx.createGain(); out.gain.setValueAtTime(0.0001, t);
      out.gain.exponentialRampToValueAtTime(v, t + L * 0.35); out.gain.exponentialRampToValueAtTime(0.0001, t + L);
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 0.8;
      out.connect(bp); bp.connect(d);
      for (let k = 0; k < 5; k++) {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sawtooth'; o.frequency.value = rnd(200, 260);
        g.gain.value = 0.2;
        wobble(t, t + L, rnd(0.5, 1.5), rnd(6, 14), o.frequency); // each bee rises and falls as it flies
        wobble(t, t + L, rnd(1, 3), 0.15, g.gain); // and comes and goes
        o.connect(g); g.connect(out); o.start(t); o.stop(t + L + 0.05);
      }
    },
    // Gulls over the water: a few "kee-ow" cries, a high glide up and then down, bright and a little raspy.
    gulls(d, v) {
      const n = 2 + Math.floor(Math.random() * 4), p = rnd(900, 1100);
      let at = 0;
      for (let k = 0; k < n; k++) {
        const len = k ? rnd(0.18, 0.26) : rnd(0.35, 0.5), q = p * (k ? rnd(1.05, 1.15) : 1);
        voice(d, {
          at, pitch: [[0, q], [len * 0.25, q * 1.45], [len, q * 0.95]], tilt: 0.7, jitter: 0.03, breath: 0.15,
          rough: 0.25, roughRate: 90,
          formants: [{ f: [[0, 1700], [len * 0.25, 2300], [len, 1800]], q: 5, g: 1 }, { f: 3400, q: 8, g: 0.4 }],
          env: [[0.03, 1], [len * 0.6, 0.8], [len, 0.0001]], vol: v * (k ? 0.75 : 1),
        });
        at += len + rnd(0.05, 0.12);
      }
    },
    // Water lapping at the posts. Each little wave is three things heard on a real jetty: a splashy wash (many tiny
    // noise grains at random pitches, which reads as water where smooth noise reads as wind), a scatter of bubbles
    // (short sine blips that glide up in pitch, the way a popping air pocket rings) and sometimes a hollow knock on the wood.
    water(d, v) {
      const n = 2 + Math.floor(Math.random() * 2);
      let at = 0;
      for (let k = 0; k < n; k++) {
        const len = rnd(0.45, 0.75), lvl = v * rnd(0.7, 1);
        const grains = Math.floor(len * rnd(40, 60));
        for (let i = 0; i < grains; i++) {
          const x = Math.random(), env = Math.sin(Math.PI * Math.pow(x, 0.6)); // swells quickly, drains away slower
          noise({ at: at + x * len, dur: rnd(0.015, 0.05), vol: lvl * 0.5 * env * rnd(0.4, 1), filter: 'bandpass', freq: rnd(500, 2600), q: rnd(2, 5), dest: d });
        }
        noise({ at, dur: len, vol: lvl * 0.25, filter: 'bandpass', freq: 400, to: 900, q: 0.8, dest: d }); // body of the wash
        const bubbles = 3 + Math.floor(Math.random() * 7);
        for (let i = 0; i < bubbles; i++) {
          const f = rnd(450, 1400), dur = rnd(0.03, 0.08);
          tone({ f: [f, f * rnd(1.4, 1.9)], type: 'sine', at: at + len * rnd(0.3, 1.1), dur, vol: lvl * rnd(0.3, 0.7), attack: 0.003, dest: d });
        }
        if (Math.random() < 0.4) tone({ f: [rnd(130, 170), 95], type: 'sine', at: at + len * 0.15, dur: 0.14, vol: lvl * 0.6, attack: 0.004, dest: d });
        at += len + rnd(0.5, 1.1);
      }
    },
  };
  const PLACE_GAIN = { bees: 4.5, gulls: 22, water: 3.7 }; // a touch quieter than the animals: background, not calls
  // Evens out the voices so a hen is about as present as a cow.
  // Which cow the game uses. The preview page (sounds.html) can play both.
  const COW_VERSION = 'mooV4';
  const ANIMAL_GAIN = { mooV2: 11, mooV3: 4, mooV4: 5.5, baa: 8, oink: 6, cluck: 8, quack: 16, gobble: 11, honk: 19 };
  const ANIMAL_VOICE = { cattle: 'moo', water_buffalo: 'moo', calf: 'moo', sheep: 'baa', goat: 'baa', pig: 'oink', broiler_chicken: 'cluck', duck: 'quack', goose: 'honk', turkey: 'gobble' };

  window.SFX = {
    play(name) {
      if (pref.muted || !SOUNDS[name] || !ensure() || ctx.state !== 'running') return;
      const now = ctx.currentTime;
      if (now - (last[name] || -1) < (GAP[name] ?? 0.08)) return;
      last[name] = now;
      SOUNDS[name]();
    },
    get muted() { return pref.muted; },
    get volume() { return pref.volume; },
    setMuted(m) { pref.muted = !!m; savePref(); if (master) master.gain.value = pref.muted ? 0 : pref.volume; applyAmbient(); applyMusic(); },
    get music() { return pref.music; },
    setMusicVolume(v) { pref.music = Math.max(0, Math.min(1, v)); savePref(); applyMusic(); },
    // Which playlist plays: 'farm', 'town' or 'finale'. Cross-fades slowly on a change.
    setMusicScene,
    get weather() { return pref.weather; },
    // The current weather kind; call as often as you like, it only acts on changes.
    // Also takes the season id for the calm-day background (birds, crickets, leaves).
    setAmbient(kind, season) {
      const n = CALM.has(kind) ? NATURE[season] || null : null;
      if (kind === ambWant && n === natWant) return;
      ambWant = kind; natWant = n; applyAmbient();
    },
    // An animal call from a farm on screen. near: 0 (zoomed far out) to 1 (zoomed in close); pan: -1 left to 1 right.
    // Uses the Weather & nature volume.
    // version: 'mooV2' / 'mooV3' to pick a cow on the preview page.
    animal(id, near, pan, version) {
      let kind = version || ANIMAL_VOICE[id];
      if (kind === 'moo') kind = COW_VERSION;
      if (!kind || pref.muted || !pref.weather || !ensure() || ctx.state !== 'running') return false;
      const v = 0.004 + 0.02 * near * near; // very faint from afar, clearly there when zoomed in
      ANIMALS[kind](spotAt(ambBus, pan), v * ANIMAL_GAIN[kind], id === 'goat' || id === 'calf');
      return true;
    },
    // A place on screen making its sound: 'bees' (apiary), 'gulls' or 'water' (shore). Same loudness rules as animal().
    place(kind, near, pan) {
      if (!PLACES[kind] || pref.muted || !pref.weather || !ensure() || ctx.state !== 'running') return false;
      const v = 0.004 + 0.02 * near * near;
      PLACES[kind](spotAt(ambBus, pan), v * PLACE_GAIN[kind]);
      return true;
    },
    // Called by the renderer on each lightning flash.
    thunder(close) { if (amb && (amb.kind === 'storm' || amb.kind === 'blizzard') && ctx.state === 'running') thunder(amb.out, close); },
    setWeatherVolume(v) { pref.weather = Math.max(0, Math.min(1, v)); savePref(); if (ambBus) ambBus.gain.value = pref.weather; applyAmbient(); },
    setVolume(v) { pref.volume = Math.max(0, Math.min(1, v)); if (pref.volume > 0) pref.muted = false; savePref(); if (master) master.gain.value = pref.muted ? 0 : pref.volume; applyAmbient(); applyMusic(); },
    names: Object.keys(SOUNDS),
  };
})();
