const { CronJob } = require('cron'),
  { deleteTokenByCron } = require('../services/user.service')
const job = new CronJob(
  '0 1 * * *',
  () => {
    deleteTokenByCron()
    console.log('CronJob')
  },
  null,
  true,
  'Asia/Bangkok'
)
job.start()
