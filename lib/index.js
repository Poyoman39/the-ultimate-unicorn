const DEFAULT_CHARS = {
  complete: '=',
  incomplete: '-',
};

function ProgressBar({
  total: _total = 100,
  title: _title = '',
  current: _current = 0,
  clear: _clear = false,
  chars: _chars = DEFAULT_CHARS,
  preStartFormat: _preStartFormat = '🦄 :title',
  format: _format = ':title [:bar] :percent :etas',
  completeFormat: _completeFormat = '✔ :title in :elapseds',
} = {}) {
  // --- args
  this.total = _total;
  this.title = _title;
  this.current = _current;
  this.clear = _clear;
  this.chars = _chars;
  this.preStartFormat = _preStartFormat;
  this.format = _format;
  this.completeFormat = _completeFormat;

  // --- states
  this.isStarted = false;
  this.isComplete = false;

  // --- methods
  this.tick = (incr = 1) => {
    this.current += incr;

    if (!this.isStarted) {
      ProgressBar.stream.write(`${this.renderString()}\n`);

      this.isStarted = true;
      this.startedAt = Date.now();
      ProgressBar.runingProgressList.push(this);
    }

    if (this.current >= this.total) {
      this.complete();
    }

    ProgressBar.render();
  };

  this.complete = () => {
    this.isComplete = true;

    const selfIndex = ProgressBar.runingProgressList.indexOf(this);

    if (selfIndex !== -1) {
      this.completedAt = Date.now();

      ProgressBar.runingProgressList.splice(selfIndex, 1);

      ProgressBar.stream.write(`${this.renderString()}\n`);
    }
    // else more ticks than total. Manage ?
  };

  this.renderString = (_now = null) => {
    const now = _now || Date.now();

    const {
      total,
      current,
      startedAt,
      preStartFormat,
      format,
      completeFormat,
      title,
      chars,
      isComplete,
      isStarted,
    } = this;

    const ratio = Math.min(Math.max(current / total, 0), 1);
    const percent = Math.floor(ratio * 100);
    const elapsed = now - startedAt;
    const eta = (percent >= 100) ? 0 : elapsed * (total / current - 1);
    const rate = current / (elapsed / 1000);

    const renderFormat = (() => {
      if (isComplete) {
        return completeFormat;
      }

      if (isStarted) {
        return format;
      }

      return preStartFormat;
    })();

    const strWithoutBar = renderFormat
      .replace(':current', current)
      .replace(':total', total)
      .replace(':elapsed', (elapsed / 1000).toFixed(1))
      .replace(':eta', (Number.isNaN(eta) || !Number.isFinite(eta)) ? '0.0' : (eta / 1000)
        .toFixed(1))
      .replace(':percent', `${percent.toFixed(0)}%`)
      .replace(':rate', Math.round(rate))
      .replace(':title', title);

    // compute the available space (non-zero) for the bar
    const availableSpace = Math.max(0, ProgressBar.stream.columns - strWithoutBar.replace(':bar', '').length);

    const completeLength = Math.min(availableSpace, Math.round(availableSpace * ratio));

    const complete = Array(Math.max(0, completeLength + 1))
      .join(chars.complete);
    const incomplete = Array(Math.max(0, availableSpace - completeLength + 1))
      .join(chars.incomplete);

    const str = strWithoutBar.replace(':bar', `${complete}${incomplete}`);

    return str;
  };
}

ProgressBar.runingProgressList = [];
ProgressBar.renderThrottle = 16;
ProgressBar.stream = process.stderr;

ProgressBar.renderSeparationString = () => (
  Array(Math.floor(ProgressBar.stream.columns / 2))
    .join('🦄')
);

ProgressBar.render = () => {
  if (!ProgressBar.stream.isTTY) {
    return;
  }

  if (ProgressBar.runingProgressList.length === 0) {
    return;
  }

  const now = Date.now();
  const delta = now - ProgressBar.lastRender;

  if (delta < ProgressBar.renderThrottle) {
    return;
  }

  ProgressBar.lastRender = now;

  if (ProgressBar.runingProgressList.length > 0) { // (> 1 was ugly)
    ProgressBar.stream.cursorTo(0, 0);
  }

  ProgressBar.runingProgressList.forEach((runingProgress) => {
    const str = runingProgress.renderString(now);

    ProgressBar.stream.cursorTo(0);
    ProgressBar.stream.write(str);
    ProgressBar.stream.clearLine(1);

    if (ProgressBar.runingProgressList.length > 0) { // (> 1 was ugly)
      ProgressBar.stream.moveCursor(0, 1);
      ProgressBar.stream.cursorTo(0);
    }
  });

  if (ProgressBar.runingProgressList.length > 0) { // (> 1 was ugly)
    ProgressBar.stream.cursorTo(0);
    ProgressBar.stream.write(`${ProgressBar.renderSeparationString()}`);
    ProgressBar.stream.clearLine(1);
  }

  if (ProgressBar.runingProgressList.length > 0) { // (> 1 was ugly)
    ProgressBar.stream.cursorTo(0, ProgressBar.stream.rows);
  }
};

module.exports = ProgressBar;
