export default app => {
  app.get('/ping',
    (req, res) => {
      console.log(res.header()._headers)
      return res.status(200).json({
        status: 200,
        result: 'pong'
      })
    }
  )

};
