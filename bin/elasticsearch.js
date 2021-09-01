const fetch = require('node-fetch')

const { writeFileSync } = require('fs') 

const countIndex = async (host, index) => {
  let response = await fetch(`${host}/${index}/_count`, {
    method: 'get',
    headers: { 'Authorization': process.env.ELASTICSEARCH_AUTHORIZATION_TOKEN ? `Basic ${process.env.ELASTICSEARCH_AUTHORIZATION_TOKEN}` : undefined }    
  })
    
  let json = await response.json()

  if (!response.ok) {
    throw new Error(json.error.reason ? json.error.reason : json.error ? json.error : "error")
  } else {
    return json
  }
}

const getTask = async (host, id) => {
  let response = await fetch(`${host}/_tasks/${id}`, {
    method: 'get',
    headers: { 'Authorization': process.env.ELASTICSEARCH_AUTHORIZATION_TOKEN ? `Basic ${process.env.ELASTICSEARCH_AUTHORIZATION_TOKEN}` : undefined }   
  })
    
  let json = await response.json()

  if (!response.ok) {
    throw new Error(json.error.reason ? json.error.reason : json.error ? json.error : "error")
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
      'Content-Type': 'application/json',
      'Authorization': process.env.ELASTICSEARCH_AUTHORIZATION_TOKEN ? `Basic ${process.env.ELASTICSEARCH_AUTHORIZATION_TOKEN}` : undefined  
    }
  })
  
  let json = await response.json()

  if (!response.ok) {
    throw new Error(json.error.reason ? json.error.reason : json.error ? json.error : "error")
  } else {
    return json
  }
}

const deleteIndex = async (host, index) => {
  let response = await fetch(`${host}/${index}`, {
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.ELASTICSEARCH_AUTHORIZATION_TOKEN ? `Basic ${process.env.ELASTICSEARCH_AUTHORIZATION_TOKEN}` : undefined    
    }
  })

  let json = await response.json()

  if (!response.ok) {
    // handle alias case : if index passed in parameter is an alias, delete all of the associated indexes
    if (json.error && json.error.reason && json.error.reason.indexOf('matches an alias') !== -1) {
        response = await fetch(`${host}/_alias/${index}`, {
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.ELASTICSEARCH_AUTHORIZATION_TOKEN ? `Basic ${process.env.ELASTICSEARCH_AUTHORIZATION_TOKEN}` : undefined
          }
        })

        json = await response.json()

        if (!response.ok) {
          throw new Error(json.error.reason ? json.error.reason : json.error ? json.error : "error")
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
    headers: { 'Authorization': process.env.ELASTICSEARCH_AUTHORIZATION_TOKEN ? `Basic ${process.env.ELASTICSEARCH_AUTHORIZATION_TOKEN}` : undefined }  
  }).then(res => res.status == 200 ? true : false)
}

const createIndex = async (host, index) => {
  let response = await fetch(`${host}/${index}`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.ELASTICSEARCH_AUTHORIZATION_TOKEN ? `Basic ${process.env.ELASTICSEARCH_AUTHORIZATION_TOKEN}` : undefined
    }
  })

  let json = await response.json()

  if (!response.ok) {
    throw new Error(json.error.reason ? json.error.reason : json.error ? json.error : "error")
  } else {
    return json
  }
}

const closeIndex = async (host, index) => {
  let response = await fetch(`${host}/${index}/_close`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.ELASTICSEARCH_AUTHORIZATION_TOKEN ? `Basic ${process.env.ELASTICSEARCH_AUTHORIZATION_TOKEN}` : undefined
    }
  })

  let json = await response.json()

  if (!response.ok) {
    throw new Error(json.error.reason ? json.error.reason : json.error ? json.error : "error")
  } else {
    return json
  }
}

const openIndex = async (host, index) => {
  let response = await fetch(`${host}/${index}/_open`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.ELASTICSEARCH_AUTHORIZATION_TOKEN ? `Basic ${process.env.ELASTICSEARCH_AUTHORIZATION_TOKEN}` : undefined
    }
  })

  let json = await response.json()

  if (!response.ok) {
    throw new Error(json.error.reason ? json.error.reason : json.error ? json.error : "error")
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
      'Content-Type': 'application/json',
      'Authorization': process.env.ELASTICSEARCH_AUTHORIZATION_TOKEN ? `Basic ${process.env.ELASTICSEARCH_AUTHORIZATION_TOKEN}` : undefined
    }
  })
  
  let json = await response.json()

  if (!response.ok) {
    throw new Error(json.error.reason ? json.error.reason : json.error ? json.error : "error")
  } else {
    return json
  }
}

const updateMapping = async (host, index, mapping) => {
  const body = JSON.stringify(mapping)

  let response = await fetch(`${host}/${index}/_mapping`, {
    method: 'put',
    body,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.ELASTICSEARCH_AUTHORIZATION_TOKEN ? `Basic ${process.env.ELASTICSEARCH_AUTHORIZATION_TOKEN}` : undefined
    }
  })
  
  let json = await response.json()

  if (!response.ok) {
    throw new Error(json.error.reason ? json.error.reason : json.error ? json.error : "error")
  } else {
    return json
  }
}

const indexDocuments = async (host, index, documents) => {
  
  const body = documents.reduce((accumulator, doc, i, array) => {
    return [
      [
        accumulator, 
        [
          JSON.stringify({ "index": { "_index" : index, "_id": doc._id || doc.id || undefined } }),
          JSON.stringify(doc)
        ].join('\n')
      ].join('\n'),
      ""
    ].join(i === array.length - 1 ? '\n':'')
  },'')

  let response = await fetch(`${host}/_bulk`, {
    method: 'post',
    body,
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Authorization': process.env.ELASTICSEARCH_AUTHORIZATION_TOKEN ? `Basic ${process.env.ELASTICSEARCH_AUTHORIZATION_TOKEN}` : undefined
    }
  })
  
  let json = await response.json()

  if (!response.ok) {
    throw new Error(json.error.reason ? json.error.reason : json.error ? json.error : "error")
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
  indexDocuments
}