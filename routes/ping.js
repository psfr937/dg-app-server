export default app => {
  app.get('/api/ping',
    (req, res) => res.status(200).json({
      status: 200,
      result: 'pong'
    })
  )
};
