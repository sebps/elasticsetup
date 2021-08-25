
const cliProgress = require('cli-progress')
const { reIndex, createIndex, countIndex, deleteIndex, updateMapping, updateSettings, openIndex, closeIndex, existsIndex, getTask } = require('./elasticsearch')
// const { writeFileSync, mkdirSync, unlinkSync } = require('fs')
const { waitFor } = require('./utils')
const { join } = require('path')

const colors = ['\x1b[31m','\x1b[32m','\x1b[33m','\x1b[34m','\x1b[35m','\x1b[36m','\x1b[37m']

// const LOCK_DIR = join('/tmp','elasticsetup','locks')

// const createLock = (name) => {
//   mkdirSync(LOCK_DIR, { recursive: true })
//   writeFileSync(`${LOCK_DIR}/${name}.lock`, 'processing')
// }

// const deleteLock = (name) => {
//   unlinkSync(join(LOCK_DIR,`${name}.lock`))
// }

module.exports = {
  setup: async (host, index, settings, analyzer, normalizer, tokenizer, mapping, source = null) => {
    if(!host) {
      throw new Error('host mandatory')
    }
    if(!index) {
      throw new Error('index mandatory')
    }

    let start = Date.now()
    let random = index + '-' + Date.now() + '-' + Math.floor(100000 * Math.random())
    let response
    let task
    let exists
    let bar
    let count
    let color = colors[Math.floor(colors.length * Math.random())]

    try {
      exists = await existsIndex(host, index)
      console.log(color,`${join(host,index)} : existing index : ${exists}  \n`)
    } catch (err) {
      console.log(color,`${join(host,index)} : error testing index existence \n`)
      console.error(join(host,index) + ' : ' + err)
      throw new Error(err)
    }
    // try {
    //   response = await createLock(random)
    //   console.log(color,'lock created')
    // } catch (err) {
    //   console.log(color,'error creating lock')
    //   console.error(err)
    //   return
    // }

    if(exists && source && source == index) {
      // create a tmp index if source == index and index already existing
      try {
        console.log(color,`${join(host,index)} : open index \n`)
        response = await openIndex(host, index)
        console.log(color,join(host,index) + ' : ' + JSON.stringify(response)+'\n')
      } catch(err){
        console.log(color,`${join(host,index)} : error opening index \n`)
        console.error(err)
        throw new Error(err)
      }
      
      try {
        console.log(color,`${join(host,index)} : create tmp index ${random} \n`)
        response = await createIndex(host, random)
        console.log(color,join(host,index) + ' : ' + JSON.stringify(response)+'\n')
      } catch (err) {
        console.log(color,`${join(host,index)} : error creating tmp index ${random} \n`)
        console.error(err)
        throw new Error(join(host,index) + ' : ' + err)
      }

      try {
        console.log(color,`${join(host,index)} : open tmp index \n`)
        response = await openIndex(host, random)
        console.log(color,join(host,index) + ' : ' + JSON.stringify(response)+'\n')
      } catch(err){
        console.log(color,`${join(host,index)} : error opening tmp index \n`)
        console.error(join(host,index) + ' : ' + err)
        throw new Error(join(host,index) + ' : ' + err)
      }
      
      try {
        response = await countIndex(host, index)
        count = response.count
        console.log(color,`${join(host,index)} : counting ${count} documents in index ${index} : \n`)
      } catch(err) {
        console.log(color,`${join(host,index)} : error counting index ${index} \n`)
        console.error(join(host,index) + ' : ' + err)
        throw new Error(join(host,index) + ' : ' + err)
      }

      try {
        console.log(color,`${join(host,index)} : reindex data in tmp index ${random} \n`)
        response = await reIndex(host, index, random)

        if(response && response.task) {
          // fetch task until its status is completed
          try {
            task = await getTask(host, response.task)

            let { total, completed } = task.task.status
            bar = new cliProgress.SingleBar({
              format: 'reindexation [{bar}] {percentage}% | ELAPSED: {duration}s | ETA: {eta}s | {value}/{total}'
            }, cliProgress.Presets.shades_classic);
            bar.start(total, completed)

            await waitFor(async () => {
              task = await getTask(host, response.task)
              let { created } = task.task.status
              let { completed } = task
              bar.update(created)
              return completed
            }, 1000)

            bar.stop()
            console.log('\n')
            console.log(color,join(host,index) + ' : ' + JSON.stringify(task)+'\n')
          } catch(err) {
            console.log(color,`${join(host,index)} : error fetching task ${response.id} for reindex tmp index \n`)
            console.error(join(host,index) + ' : ' + err)
            throw new Error(join(host,index) + ' : ' + err)
          }
        }
      } catch (err) {
        console.log(color,`${join(host,index)} : error reindexing data in tmp index ${random} \n`)
        console.error(join(host,index) + ' : ' + err)
        throw new Error(join(host,index) + ' : ' + err)
      }

      try {
        console.log(color,`${join(host,index)} : close index \n`)
        response = await closeIndex(host, index)
        console.log(color,join(host,index) + ' : ' + JSON.stringify(response)+'\n')
      } catch(err){
        console.log(color,`${join(host,index)} : error closing index \n`)
        console.error(join(host,index) + ' : ' + err)
        throw new Error(join(host,index) + ' : ' + err)
      }      
    }

    if(exists) {
      try {
        console.log(color,`${join(host,index)} : delete index \n`)
        response = await deleteIndex(host, index)
        console.log(color,join(host,index) + ' : ' + JSON.stringify(response)+'\n')
      } catch (err) {
        console.log(color,`${join(host,index)} : error deleting index \n`)
        console.error(join(host,index) + ' : ' + err)
        throw new Error(join(host,index) + ' : ' + err)
      }
    }

    try {
      console.log(color,`${join(host,index)} : create index \n`)
      response = await createIndex(host, index)
      console.log(color,join(host,index) + ' : ' + JSON.stringify(response)+'\n')
    } catch (err) {
      console.log(color,`${join(host,index)} : error creating index \n`)
      console.error(join(host,index) + ' : ' + err)
      throw new Error(join(host,index) + ' : ' + err)
    }

    try {
      console.log(color,`${join(host,index)} : close index \n`)
      response = await closeIndex(host, index)
      console.log(color,join(host,index) + ' : ' +JSON.stringify(response)+'\n')
    } catch (err) {
      console.log(color,`${join(host,index)} : error closing index \n`)
      console.error(join(host,index) + ' : ' + err)
      throw new Error(join(host,index) + ' : ' + err)
    }

    if(settings || analyzer || normalizer || tokenizer) {      
      try {
        console.log(color,`${join(host,index)} : update settings \n`)
        response = await updateSettings(host, index, settings, analyzer, normalizer, tokenizer)
        console.log(color,join(host,index) + ' : ' + JSON.stringify(response)+'\n')
      } catch (err) {
        console.log(color,`${join(host,index)} : error updating settings \n`)
        console.error(join(host,index) + ' : ' + err)
        throw new Error(join(host,index) + ' : ' + err)
      }
    }

    if(mapping) {
      try {
        console.log(color,`${join(host,index)} : update mapping \n`)
        response = await updateMapping(host, index, mapping)
        console.log(color,join(host,index) + ' : ' + JSON.stringify(response)+'\n')
      } catch (err) {
        console.log(color,`${join(host,index)} : error updating mapping \n`)
        console.error(join(host,index) + ' : ' + err)
        throw new Error(join(host,index) + ' : ' + err)
      }
    }

    try {
      console.log(color,`${join(host,index)} : open index \n`)
      response = await openIndex(host, index)
      console.log(color,join(host,index) + ' : ' + JSON.stringify(response)+'\n')
    } catch(err){
      console.log(color,`${join(host,index)} : error opening index \n`)
      console.error(join(host,index) + ' : ' + err)
      throw new Error(join(host,index) + ' : ' + err)
    }

    if(source) {
      let src = source != index ? source : random

      try {
        response = await countIndex(host, src)
        let { count } = response
        console.log(color,`${join(host,index)} : counting ${count} documents in index ${src} : \n`)
      } catch(err) {
        console.log(color,`${join(host,index)} : error counting index ${src} \n`)
        console.error(join(host,index) + ' : ' + err)
        throw new Error(join(host,index) + ' : ' + err)
      }

      try {
        console.log(color,`${join(host,index)} : reindex data in new index ${index} \n`)
        response = await reIndex(host, src, index)
        console.log(color,join(host,index) + ' : ' + JSON.stringify(response)+'\n')

        if(response && response.task) {
          // fetch task until its status is completed
          try {
            task = await getTask(host, response.task)
            let { total, completed } = task.task.status
            bar = new cliProgress.SingleBar({
              format: 'reindexation [{bar}] {percentage}% | ELAPSED: {duration}s | ETA: {eta}s | {value}/{total}'
            }, cliProgress.Presets.shades_classic);
            bar.start(total, completed)

            await waitFor(async () => {
              task = await getTask(host, response.task)
              let { created } = task.task.status
              let { completed } = task
              bar.update(created)
              return completed
            }, 1000)

            bar.stop()
            console.log('\n')
            console.log(color,join(host,index) + ' : ' + JSON.stringify(task)+'\n')
          } catch(err) {
            console.log(color,`${join(host,index)} : error fetching task ${response.id} for reindex tmp index \n`)
            console.error(join(host,index) + ' : ' + err)
            throw new Error(join(host,index) + ' : ' + err)
          }
        }
      } catch (err) {
        console.log(color,`${join(host,index)} : error reindexing data in tmp index ${random} \n`)
        console.error(join(host,index) + ' : ' + err)
        throw new Error(join(host,index) + ' : ' + err)
      }
      // try {
      //   console.log(color,`${join(host,index)} : reindex data in new index ${index} \n`)
      //   response = await reIndex(host, src, index)
      //   console.log(color,join(host,index) + ' : ' + JSON.stringify(response)+'\n')
      // } catch (err) {
      //   console.log(color,`${join(host,index)} : error reindexing data in new index \n`)
      //   console.error(join(host,index) + ' : ' + err)
      //   throw new Error(join(host,index) + ' : ' + err)
      // }
    }

    if(source && source == index) {
      try {
        console.log(color,`${join(host,index)} : delete tmp index ${random} \n`)
        response = await deleteIndex(host, random)
        console.log(color,join(host,index) + ' : ' + JSON.stringify(response)+'\n')
      } catch (err) {
        console.log(color,`${join(host,index)} : error deleting tmp index \n`)
        console.error(err)
        throw new Error(err)
      }
    }

    // try {
    //   response = await deleteLock(random)
    //   console.log(color,'lock deleted')
    // } catch (err) {
    //   console.log(color,'error deleting lock')
    //   console.error(err)
    //   return
    // }

    let end = Date.now()
    let elapsed = (end - start)/1000
    
    console.log(color,`${join(host,index)} : setup done in ${elapsed}s \n`)
    console.log('\x1b[37m','')
  }
}