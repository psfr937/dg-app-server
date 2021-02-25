const supertest = require('supertest');
const app = require('../app');
describe('Post Endpoints', done => {
  it('should create a new post', async () => {
      console.log(app._router.stack
        .filter(r => r.route)
        .map(r => r.route.path))
      const res = await supertest(app).get('/api/ping')
        .end((err, res) => {
          if(err) {
            throw err;
          } else {
            return res;
          }
        });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('get');
    done();
      // .send({
      //   userId: 1,
      //   title: 'test is cool',
      // })
     // console.log(res)
  })
});