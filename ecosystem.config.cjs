module.exports = {
  apps: [
    {
      name: 'mhaibaraai.cn',
      script: './.output/server/index.mjs',
      exec_mode: 'cluster',
      instances: 'max',
      env: {
        HOST: '0.0.0.0',
        PORT: '3000',
        NITRO_HOST: '0.0.0.0',
        NITRO_PORT: '3000',
      },
      max_memory_restart: '512M',
      out_file: './.pm2/out.log',
      error_file: './.pm2/error.log',
      time: true,
    },
  ],
}
