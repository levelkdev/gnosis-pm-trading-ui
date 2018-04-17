/* eslint-disable global-require, import/no-dynamic-require, no-console */
const process = require('process')
const fs = require('fs')
const path = require('path')

const env = process.env.INTERFACE_ENV || 'local'

const configsToLoad = ['./config/']

const envConfigFolder = `./config/environments/${env}`

const isValidConfigFolder = (
  fs.existsSync(envConfigFolder) &&
  fs.existsSync(path.join(envConfigFolder, 'config.json')) &&
  fs.existsSync(path.join(envConfigFolder, 'interface.config.json'))
)

if (!isValidConfigFolder) {
  console.warn(`[WEBPACK]: invalid interface configuration selected: '${env}' - using fallback configuration`)
} else {
  console.info(`[WEBPACK]: loaded env configuration: '${env}'`)
  configsToLoad.push(envConfigFolder)
}

let config = {}
let interfaceConfig = {}

configsToLoad.forEach((configPath) => {
  const loadedConfig = require(`./${configPath}/config.json`)
  const loadedInterfaceConfig = require(`./${configPath}/interface.config.json`)

  config = Object.assign(config, loadedConfig)
  interfaceConfig = Object.assign(config, loadedInterfaceConfig)
})

module.exports = {
  config,
  interfaceConfig,
}