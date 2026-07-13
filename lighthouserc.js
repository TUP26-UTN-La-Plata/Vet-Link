module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      startServerCommand: 'echo "Skipping server start"',
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
