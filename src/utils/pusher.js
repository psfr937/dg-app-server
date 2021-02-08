const Pusher = require("pusher");

const thePusher =  new Pusher({
  appId: "1150137",
  key: "e7ce629500e0a1ea020f",
  secret: "ea5626c2b350beaf244f",
  cluster: "us3",
  useTLS: true
});

export default thePusher
