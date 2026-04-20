const { createApp } = require("../server/index");

let appPromise;

module.exports = async (req, res) => {
  if (!appPromise) {
    appPromise = createApp().then(({ app }) => app);
  }

  const app = await appPromise;
  return app(req, res);
};
