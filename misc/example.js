[
  new ProgressBar({ title: 'Potatoes', total: 100 }),
  new ProgressBar({ title: 'Tomatoes', total: 1000 }),
  new ProgressBar({ title: 'Carrots', total: 300 }),
].forEach((progressBar) => {
  const intervalId = setInterval(() => {
    progressBar.tick();
    if (progressBar.isComplete) {
      clearInterval(intervalId);
    }
  }, 100);
});
