module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      staticDistDir: './dist/Vet-Link',
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
