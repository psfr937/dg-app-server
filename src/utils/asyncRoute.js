const asyncRoute = route =>
  (req, res, next = console.error) =>
  {
    Promise.resolve(route(req, res, next)).catch(next)
  }

export default asyncRoute;
