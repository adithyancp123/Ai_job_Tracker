const healthService = {
  getStatus: () => ({
    status: "ok",
    timestamp: new Date().toISOString()
  })
};

export default healthService;
