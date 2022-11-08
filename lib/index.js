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
  format: _format = ':title [:bar] :etas',
  completeFormat: _completeFormat = '✔ :title in :elapseds',
} = {}) {
  // --- args
  this.total = _total;
  this.title = _title;
  this.current = _current;
  this.clear = _clear;
  this.chars = _chars;
  this.format = _format;
  this.completeFormat = _completeFormat;

  // --- states
  this.isStarted = false;
  this.isComplete = false;

  // --- methods
  this.tick = () => {
    this.current += 1;

    if (!this.isStarted) {
      this.isStarted = true;
      this.startedAt = Date.now();
      ProgressBar.runingProgressList.push(this);
    }

    if (this.current >= this.total) {
      this.isComplete = true;
      this.completedAt = Date.now();
      ProgressBar.runingProgressList.splice(
        ProgressBar.runingProgressList.indexOf(this),
        1,
      );
      ProgressBar.stream.write(`${this.renderString()}\n`);
    }

    ProgressBar.render();
  };

  this.renderString = (_now = null) => {
    const now = _now || Date.now();

    const {
      total,
      current,
      startedAt,
      format,
      completeFormat,
      title,
      chars,
      isComplete,
    } = this;

    const ratio = Math.min(Math.max(current / total, 0), 1);
    const percent = Math.floor(ratio * 100);
    const elapsed = now - startedAt;
    const eta = (percent >= 100) ? 0 : elapsed * (total / current - 1);
    const rate = current / (elapsed / 1000);

    const strWithoutBar = (isComplete
      ? completeFormat
      : format
    )
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

    const completeLength = Math.round(availableSpace * ratio);

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

  const now = Date.now();
  const delta = now - ProgressBar.lastRender;

  if (delta < ProgressBar.renderThrottle) {
    return;
  }

  ProgressBar.lastRender = now;

  if (ProgressBar.runingProgressList.length > 1) {
    ProgressBar.stream.cursorTo(0, 0);
  }

  ProgressBar.runingProgressList.forEach((runingProgress) => {
    const str = runingProgress.renderString(now);

    ProgressBar.stream.cursorTo(0);
    ProgressBar.stream.write(str);
    ProgressBar.stream.clearLine(1);

    if (ProgressBar.runingProgressList.length > 1) {
      ProgressBar.stream.moveCursor(0, 1);
    }
  });

  if (ProgressBar.runingProgressList.length > 1) {
    ProgressBar.stream.cursorTo(0);
    ProgressBar.stream.write(`${ProgressBar.renderSeparationString()}`);
    ProgressBar.stream.clearLine(1);
  }

  ProgressBar.stream.cursorTo(0, ProgressBar.stream.rows);
};

module.exports = ProgressBar;
