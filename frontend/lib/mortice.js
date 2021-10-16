const EventEmitter = require('events').EventEmitter
const { nanoid } = require('nanoid')
const {
    WORKER_REQUEST_READ_LOCK,
    WORKER_RELEASE_READ_LOCK,
    MASTER_GRANT_READ_LOCK,
    WORKER_REQUEST_WRITE_LOCK,
    WORKER_RELEASE_WRITE_LOCK,
    MASTER_GRANT_WRITE_LOCK
} = {
    WORKER_REQUEST_READ_LOCK: 'lock:worker:request-read',
    WORKER_RELEASE_READ_LOCK: 'lock:worker:release-read',
    MASTER_GRANT_READ_LOCK: 'lock:master:grant-read',

    WORKER_REQUEST_WRITE_LOCK: 'lock:worker:request-write',
    WORKER_RELEASE_WRITE_LOCK: 'lock:worker:release-write',
    MASTER_GRANT_WRITE_LOCK: 'lock:master:grant-write'
}
const observer = require('observable-webworkers')

const handleWorkerLockRequest = (emitter, masterEvent, requestType, releaseType, grantType) => {
    return (worker, event) => {
        if (!event || !event.data || event.data.type !== requestType) {
            return
        }

        const requestEvent = {
            type: event.data.type,
            name: event.data.name,
            identifier: event.data.identifier
        }

        emitter.emit(masterEvent, requestEvent.name, () => {
            // grant lock to worker
            worker.postMessage({
                type: grantType,
                name: requestEvent.name,
                identifier: requestEvent.identifier
            })

            // wait for worker to finish
            return new Promise((resolve) => {
                const releaseEventListener = (event) => {
                    if (!event || !event.data) {
                        return
                    }

                    const releaseEvent = {
                        type: event.data.type,
                        name: event.data.name,
                        identifier: event.data.identifier
                    }

                    if (releaseEvent && releaseEvent.type === releaseType && releaseEvent.identifier === requestEvent.identifier) {
                        worker.removeEventListener('message', releaseEventListener)
                        resolve()
                    }
                }

                worker.addEventListener('message', releaseEventListener)
            })
        })
    }
}

const makeWorkerLockRequest = (name, requestType, grantType, releaseType) => {
    return () => {
        const id = nanoid()

        globalThis.postMessage({
            type: requestType,
            identifier: id,
            name
        })

        return new Promise((resolve) => {
            const listener = (event) => {
                if (!event || !event.data) {
                    return
                }

                const responseEvent = {
                    type: event.data.type,
                    identifier: event.data.identifier
                }

                if (responseEvent && responseEvent.type === grantType && responseEvent.identifier === id) {
                    globalThis.removeEventListener('message', listener)

                    // grant lock
                    resolve(() => {
                        // release lock
                        globalThis.postMessage({
                            type: releaseType,
                            identifier: id,
                            name
                        })
                    })
                }
            }

            globalThis.addEventListener('message', listener)
        })
    }
}

const browser = (options) => {
    options = Object.assign({}, {
        singleProcess: false
    }, options)
    const isMaster = !!globalThis.document || options.singleProcess

    if (isMaster) {
        const emitter = new EventEmitter()

        observer.addEventListener('message', handleWorkerLockRequest(emitter, 'requestReadLock', WORKER_REQUEST_READ_LOCK, WORKER_RELEASE_READ_LOCK, MASTER_GRANT_READ_LOCK))
        observer.addEventListener('message', handleWorkerLockRequest(emitter, 'requestWriteLock', WORKER_REQUEST_WRITE_LOCK, WORKER_RELEASE_WRITE_LOCK, MASTER_GRANT_WRITE_LOCK))

        return emitter
    }

    return {
        isWorker: true,
        readLock: (name) => makeWorkerLockRequest(name, WORKER_REQUEST_READ_LOCK, MASTER_GRANT_READ_LOCK, WORKER_RELEASE_READ_LOCK),
        writeLock: (name) => makeWorkerLockRequest(name, WORKER_REQUEST_WRITE_LOCK, MASTER_GRANT_WRITE_LOCK, WORKER_RELEASE_WRITE_LOCK)
    }
}
const { default: Queue } = require('p-queue')
const { timeout } = require('promise-timeout')
const observe = require('observable-webworkers')

const mutexes = {}
let implementation

function createReleaseable(queue, options) {
    let res

    const p = new Promise((resolve) => {
        res = resolve
    })

    queue.add(() => timeout((() => {
        return new Promise((resolve) => {
            res(() => {
                resolve()
            })
        })
    })(), options.timeout))

    return p
}

const createMutex = (name, options) => {
    if (implementation.isWorker) {
        return {
            readLock: implementation.readLock(name, options),
            writeLock: implementation.writeLock(name, options)
        }
    }

    const masterQueue = new Queue({ concurrency: 1 })
    let readQueue = null

    return {
        readLock: () => {
            // If there's already a read queue, just add the task to it
            if (readQueue) {
                return createReleaseable(readQueue, options)
            }

            // Create a new read queue
            readQueue = new Queue({
                concurrency: options.concurrency,
                autoStart: false
            })
            const localReadQueue = readQueue

            // Add the task to the read queue
            const readPromise = createReleaseable(readQueue, options)

            masterQueue.add(() => {
                // Start the task only once the master queue has completed processing
                // any previous tasks
                localReadQueue.start()

                // Once all the tasks in the read queue have completed, remove it so
                // that the next read lock will occur after any write locks that were
                // started in the interim
                return localReadQueue.onIdle()
                    .then(() => {
                        if (readQueue === localReadQueue) {
                            readQueue = null
                        }
                    })
            })

            return readPromise
        },
        writeLock: () => {
            // Remove the read queue reference, so that any later read locks will be
            // added to a new queue that starts after this write lock has been
            // released
            readQueue = null

            return createReleaseable(masterQueue, options)
        }
    }
}

export default (name, options) => {
    if (!options) {
        options = {}
    }

    if (typeof name === 'object') {
        options = name
        name = 'lock'
    }

    if (!name) {
        name = 'lock'
    }

    options = Object.assign({}, {
        concurrency: Infinity,
        timeout: 84600000,
        singleProcess: false
    }, options)

    if (!implementation) {
        implementation = browser(options)

        if (!implementation.isWorker) {
            // we are master, set up worker requests
            implementation.on('requestReadLock', (name, fn) => {
                if (!mutexes[name]) {
                    return
                }

                mutexes[name].readLock()
                    .then(release => fn().finally(() => release()))
            })

            implementation.on('requestWriteLock', async (name, fn) => {
                if (!mutexes[name]) {
                    return
                }

                mutexes[name].writeLock()
                    .then(release => fn().finally(() => release()))
            })
        }
    }

    if (!mutexes[name]) {
        mutexes[name] = createMutex(name, options)
    }

    return mutexes[name]
}

export const Worker = function (script, Impl) {
    Impl = Impl || globalThis.Worker
    let worker

    try {
        worker = new Impl(script)
    } catch (error) {
        if (error.message.includes('not a constructor')) {
            worker = Impl(script)
        }
    }

    if (!worker) {
        throw new Error('Could not create Worker from', Impl)
    }

    observe(worker)

    return worker
}
