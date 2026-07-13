module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      url: process.env.LIGHTHOUSE_URL || 'http://localhost:3000',
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
