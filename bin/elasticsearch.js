const fetch = require('node-fetch')

const countIndex = async (host, index) => {
  let response = await fetch(`${host}/${index}/_count`, {
    method: 'get',
  })
    
  let json = await response.json()

  if (!response.ok) {
    throw new Error(json.error.reason)
  } else {
    return json
  }
}

const getTask = async (host, id) => {
  let response = await fetch(`${host}/_tasks/${id}`, {
    method: 'get',
  })
    
  let json = await response.json()

  if (!response.ok) {
    throw new Error(json.error.reason)
  } else {
    return json
  }
}

const reIndex = async (host, sourceIndex, targetIndex) => {
  const body = JSON.stringify({ "source": { "index": sourceIndex }, "dest": { "index": targetIndex }})

  let response = await fetch(`${host}/_reindex?wait_for_completion=false`, {
    method: 'post',
    body,
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  let json = await response.json()

  if (!response.ok) {
    throw new Error(json.error.reason)
  } else {
    return json
  }
}

const deleteIndex = async (host, index) => {
  let response = await fetch(`${host}/${index}`, {
    method: 'delete',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  let json = await response.json()

  if (!response.ok) {
    // handle alias case : if index passed in parameter is an alias, delete all of the associated indexes
    if (json.error.reason.indexOf('matches an alias') !== -1) {
        response = await fetch(`${host}/_alias/${index}`, {
          method: 'get',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        json = await response.json()

        if (!response.ok) {
          throw new Error(json.error.reason)
        } else {
          return Promise.all(Object.keys(json).map((aliasIndex) => {
            return deleteIndex(host, aliasIndex)
          }))
        }
    } else {
      throw new Error(json.error.reason)
    }

  } else {  
    return json
  }
}

const existsIndex = async (host, index) => {
  return await fetch(`${host}/${index}`, {
    method: 'head',
  }).then(res => res.status == 200 ? true : false)
}

const createIndex = async (host, index) => {
  let response = await fetch(`${host}/${index}`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  let json = await response.json()

  if (!response.ok) {
    throw new Error(json.error.reason)
  } else {
    return json
  }
}

const closeIndex = async (host, index) => {
  let response = await fetch(`${host}/${index}/_close`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  let json = await response.json()

  if (!response.ok) {
    throw new Error(json.error.reason)
  } else {
    return json
  }
}

const openIndex = async (host, index) => {
  let response = await fetch(`${host}/${index}/_open`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  let json = await response.json()

  if (!response.ok) {
    throw new Error(json.error.reason)
  } else {
    return json
  }
}

const updateSettings = async (host, index, settings = {}, analyzer, normalizer, tokenizer) => {
  const body = JSON.stringify({ ...settings, analysis: { analyzer, normalizer, tokenizer }})

  let response = await fetch(`${host}/${index}/_settings`, {
    method: 'put',
    body,
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  let json = await response.json()

  if (!response.ok) {
    throw new Error(json.error.reason)
  } else {
    return json
  }
}

const updateMapping = async (host, index, properties) => {
  const body = JSON.stringify({ properties, _source: { enabled : true }})

  let response = await fetch(`${host}/${index}/_mapping`, {
    method: 'put',
    body,
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  let json = await response.json()

  if (!response.ok) {
    throw new Error(json.error.reason)
  } else {
    return json
  }
}

module.exports = {
  closeIndex,
  countIndex,
  createIndex,
  deleteIndex,
  existsIndex,
  getTask,
  openIndex,
  reIndex,
  updateSettings,
  updateMapping,
}