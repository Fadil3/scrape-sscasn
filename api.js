require('dotenv').config()
const express = require('express')
const cors = require('cors')
const formasiRoutes = require('./src/routes/formasi')
const rateLimiter = require('./src/utils/rateLimiter')
const cluster = require('cluster')
const numCPUs = require('os').cpus().length
const compression = require('compression')
const NodeCache = require('node-cache')

const port = process.env.PORT || 3000

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`)

  // Fork a dedicated scheduler worker
  const schedulerWorker = cluster.fork({ WORKER_TYPE: 'scheduler' })
  console.log(`Scheduler worker ${schedulerWorker.process.pid} started`)

  // Fork API workers
  for (let i = 0; i < numCPUs - 1; i++) {
    cluster.fork({ WORKER_TYPE: 'api' })
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`)
    if (worker.process.env.WORKER_TYPE === 'scheduler') {
      console.log('Restarting scheduler worker...')
      cluster.fork({ WORKER_TYPE: 'scheduler' })
    } else {
      cluster.fork({ WORKER_TYPE: 'api' })
    }
  })
} else {
  if (process.env.WORKER_TYPE === 'scheduler') {
    require('./scheduler')
  } else {
    const app = express()

    app.use(cors())
    app.use(express.json())
    app.use(rateLimiter)
    app.use(compression())

    app.get('/', (req, res) => {
      res.json({ message: 'API server is running! | SSCASN' })
    })

    app.use('/api/formasi', formasiRoutes)

    app.listen(port, () => {
      console.log(`API Worker ${process.pid} started on port ${port}`)
    })
  }
}
