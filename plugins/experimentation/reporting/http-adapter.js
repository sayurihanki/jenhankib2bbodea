export function createHttpReportingAdapter(baseUrl = '/api/experiments') {
  return {
    async recordEvent(event) {
      await fetch(`${baseUrl}/events`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(event),
      });
      return event;
    },

    async getPortfolio() {
      const response = await fetch(`${baseUrl}/portfolio`);
      return response.json();
    },

    async getExperimentReport(experimentId) {
      const response = await fetch(`${baseUrl}/experiments/${experimentId}`);
      return response.json();
    },

    async getSegmentBreakdown(experimentId, dimension) {
      const response = await fetch(`${baseUrl}/experiments/${experimentId}/segments/${dimension}`);
      return response.json();
    },
  };
}
