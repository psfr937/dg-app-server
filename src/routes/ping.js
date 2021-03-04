export default app => {
  app.get('/ping',
    (req, res) => res.status(200).json({
      status: 200,
      result: 'pong'
    })
  )
};
