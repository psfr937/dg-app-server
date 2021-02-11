const asyncRoute = route =>
  (req, res, next = console.error) =>
  {
    console.log(next)
    Promise.resolve(route(req, res, next)).catch(next)
  }

export default asyncRoute;
