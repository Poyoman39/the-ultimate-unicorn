[
  new MixedProgress({ title: 'Potatoes', total: 100 }),
  new MixedProgress({ title: 'Tomatoes', total: 1000 }),
  new MixedProgress({ title: 'Carrots', total: 300 }),
].forEach((progressBar) => {
  const intervalId = setInterval(() => {
    progressBar.tick();
    if (progressBar.isComplete) {
      clearInterval(intervalId);
    }
  }, 100);
});
