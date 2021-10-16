'use strict'

const IS_ENV_WITH_DOM = typeof window === 'object' && typeof document === 'object' && document.nodeType === 9
// @ts-ignore

// @ts-ignore - we either ignore worker scope or dom scope
const IS_WEBWORKER = typeof importScripts === 'function' && typeof self !== 'undefined' && typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope
const IS_TEST = typeof process !== 'undefined' && typeof process.env !== 'undefined' && process.env.NODE_ENV === 'test'

module.exports = {
  isTest: IS_TEST,
  isElectron: false,
  isElectronMain: false,
  isElectronRenderer: false,
  isNode: false,
  /**
   * Detects browser main thread  **NOT** web worker or service worker
   */
  isBrowser: true,
  isWebWorker: IS_WEBWORKER,
  isEnvWithDom: IS_ENV_WITH_DOM,
  isReactNative: false
}
