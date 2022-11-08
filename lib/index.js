const DEFAULT_CHARS = {
  complete: '=',
  incomplete: '-',
};

function MixedProgress({
  total: _total = 100,
  title: _title = '',
  current: _current = 0,
  renderThrottle: _renderThrottle = 16,
  clear: _clear = false,
  chars: _chars = DEFAULT_CHARS,
  format: _format = ':title [:bar] :etas',
} = {}) {
  this.total = _total;
  this.title = _title;
  this.current = _current;
  this.renderThrottle = _renderThrottle;
  this.clear = _clear;
  this.chars = _chars;
  this.format = _format;
  this.isStarted = false;
  this.isComplete = false;

  this.tick = () => {
    this.current += 1;

    if (!this.isStarted) {
      this.isStarted = true;
      this.statedAt = Date.now();
      MixedProgress.runingProgressList.push(this);
    }

    if (this.current > this.total) {
      this.isComplete = true;
      this.completedAt = Date.now();
      MixedProgress.runingProgressList.splice(
        MixedProgress.runingProgressList.indexOf(this),
        1,
      );
    }

    MixedProgress.render();
  };
}

MixedProgress.runingProgressList = [];
MixedProgress.stream = process.stderr;

MixedProgress.render = () => {
  // compute the available space (non-zero) for the bar

  // MixedProgress.stream.columns;
  // MixedProgress.stream.rows;

  const now = Date.now();

  MixedProgress.runingProgressList.forEach((runingProgress, i) => {
    const {
      total,
      current,
      statedAt,
      format,
      title,
    } = runingProgress;

    const ratio = Math.min(Math.max(current / total, 0), 1);
    const percent = Math.floor(ratio * 100);
    const elapsed = now - statedAt;
    const eta = (percent >= 100) ? 0 : elapsed * (total / current - 1);
    const rate = current / (elapsed / 1000);

    const strWithoutBar = format
      .replace(':current', current)
      .replace(':total', total)
      .replace(':elapsed', (elapsed / 1000).toFixed(1))
      .replace(':eta', (Number.isNaN(eta) || !Number.isFinite(eta)) ? '0.0' : (eta / 1000)
        .toFixed(1))
      .replace(':percent', `${percent.toFixed(0)}%`)
      .replace(':rate', Math.round(rate))
      .replace(':title', title);

    // compute the available space (non-zero) for the bar
    const availableSpace = Math.max(0, MixedProgress.stream.columns - strWithoutBar.replace(':bar', '').length);

    const completeLength = Math.round(availableSpace * ratio);

    const complete = Array(Math.max(0, completeLength + 1))
      .join(runingProgress.chars.complete);
    const incomplete = Array(Math.max(0, availableSpace - completeLength + 1))
      .join(runingProgress.chars.incomplete);

    const str = strWithoutBar.replace(':bar', `${complete}${incomplete}`);

    MixedProgress.stream.cursorTo(0, MixedProgress.stream.rows - i - 1);
    MixedProgress.stream.write(str);
    MixedProgress.stream.clearLine(1);
  });
};

module.exports = MixedProgress;
