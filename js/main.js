// Boot and main loop.
(function () {
  FS.finalize();
  Game.initGoals();
  Render.init(document.getElementById('map'));
  UI.init();
  if (!Game.load()) { Game.newGame(); Game.S.speed = 0; UI.open('welcome'); }
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    Game.tick(dt);
    Render.draw(now, dt);
    UI.frame(dt, now);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  setInterval(() => Game.save(true), 30000);
  window.addEventListener('beforeunload', () => Game.save(true));
})();
