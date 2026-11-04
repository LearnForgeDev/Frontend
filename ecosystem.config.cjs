const name = process.env.SSR_APP_NAME;
const port = Number(process.env.SSR_PORT);
if (!name || !/^[A-Za-z0-9_-]+$/.test(name) || !Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('Set SSR_APP_NAME to the existing PM2 service and SSR_PORT to its proxy upstream port.');
}
module.exports = {
  apps: [{ name, cwd: __dirname, script: 'server.js', env: { NODE_ENV: 'production', HOSTNAME: '127.0.0.1', PORT: String(port) } }],
};
