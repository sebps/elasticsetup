# Elasticsetup
Lightweight library to quickly setup an Elasticsearch index from settings, analyzer, normalizer, tokenizer and mapping. Optionally reindex data from the same or another index of the same cluster.

<!--TOC-->
* [Usage](#usage)
  * [CLI](#CLI)
  * [LIB](#LIB)
* [Note](#Note)  
* [License](#license)
<!--TOC-->

# Usage

## CLI

### Install CLI
```npm install -g elasticsetup```

### Setup without reindexing
```elasticsetup -h 192.168.0.10 -i products -s settings.json -a analyzer.json -n normalizer.json -t tokenizer.json -m mapping.json```

### Setup with data reindexing from distinct index
```elasticsetup -h 192.168.0.10 -i products -s settings.json -a analyzer.json -n normalizer.json -t tokenizer.json -m mapping.json -o products_old```

### Setup with data reindexing from same index
```elasticsetup -h 192.168.0.10 -i products -s settings.json -a analyzer.json -n normalizer.json -t tokenizer.json -m mapping.json -o products```

### Setup using credentials
```elasticsetup -h 192.168.0.10 -i products -c credentials.json -a analyzer.json mapping.json```

### Setup with local data directory reindexing
```elasticsetup -h 192.168.0.10-i products -s settings.json -a analyzer.json -m mapping.json -d ./data```

### Setup with local data file reindexing
```elasticsetup -h 192.168.0.10-i products -s settings.json -a analyzer.json -m mapping.json -d ./data/products.ndjson```

### Setup with local data directory and data reindexing from other index
```elasticsetup -h 192.168.0.10-i products -s settings.json -a analyzer.json -m mapping.json -d ./data -o products_old```

### Setup using local data as index source
```elasticsetup -h 192.168.0.10-i products -s settings.json -a analyzer.json -m mapping.json -d ./data```

### File format and examples 

#### Credentials example
```json
{
  "username": "user",
  "password": "password"
}
```

#### Settings example
```json
{
  "max_ngram_diff": 10
}
```

#### Analyzer example
```json
{
  "lowercase_analyzer": {
    "type": "custom", 
    "tokenizer": "standard",
    "filter": [
      "lowercase"
    ]
  },
  "lowercase_asciifolding_analyzer": {
    "type": "custom", 
    "tokenizer": "standard",
    "filter": [
      "lowercase",
      "asciifolding"
    ]
  }  
}
```

#### Normalizer example
```json
  {
    "lowercase_asciifolding_normalizer": {
      "type": "custom",
      "char_filter": [],
      "filter": ["lowercase", "asciifolding"]
    }
  }
```

#### Tokenizer example
```json
{
  "edge_ngram": {
      "type": "edge_ngram",
      "min_gram": 2,
      "max_gram": 10,
      "token_chars": [
          "letter"
      ]
  },
  "edge_ngram_whitespace": {
      "type": "edge_ngram",
      "min_gram": 2,
      "max_gram": 10,
      "token_chars": [
          "letter",
          "whitespace"
      ]
  }
}
```

#### Mapping example
```json
{
  "properties": {
    "title": {
      "type": "keyword"
    },
    "description": {
      "type": "text",
      "analyzer": "lowercase_asciifolding_analyzer"
    },
    "price": {
      "type": "float"
    },
    "category": {
      "properties": {
        "title": {
          "type": "keyword"
        },
        "description": {
          "type": "text",
          "analyzer": "lowercase_asciifolding_analyzer"
        }
      }
    },
    "excerpt": {
      "type": "text",
      "fields": {
        "keyword": {
          "type": "keyword"
        }
      }
    } 
  }
} 
```

## LIB

```npm install --save elasticsetup```

```js
  const { setup } = require('elasticsetup')
  const host = ' 192.168.0.10'
  const index = 'products' 
  const otherIndex = 'oldProducts'
  const dataDirPath = './data'
  const dataDirPath = './data/products.json'

  // if authorization required
  const username = "user"
  const password = "password"
  process.env.ELASTICSEARCH_AUTHORIZATION_TOKEN = Buffer.from(`${username}:${password}`).toString('base64');
 }

  const settings = {
    "max_ngram_diff": 10
  }

  const analyzer = {
    "lowercase_analyzer": {
        "type": "custom", 
        "tokenizer": "standard",
        "filter": [
            "lowercase"
        ]
    },
    "lowercase_asciifolding_analyzer": {
        "type": "custom", 
        "tokenizer": "standard",
        "filter": [
            "lowercase",
            "asciifolding"
        ]
    }    
  }

  const normalizer = {
    "lowercase_asciifolding_normalizer": {
      "type": "custom",
      "char_filter": [],
      "filter": ["lowercase", "asciifolding"]
    }
  }

  const tokenizer = {
    "edge_ngram": {
        "type": "edge_ngram",
        "min_gram": 2,
        "max_gram": 10,
        "token_chars": [
            "letter"
        ]
    },
    "edge_ngram_whitespace": {
        "type": "edge_ngram",
        "min_gram": 2,
        "max_gram": 10,
        "token_chars": [
            "letter",
            "whitespace"
        ]
    }
  }

  const mapping = {
    "properties": {
      "title": {
        "type": "keyword",
      },
      "description": {
        "type": "text",
        "analyzer": "lowercase_asciifolding_analyzer"
      },
      "price": {
        "type": "float"
      },
      "category": {
        "properties": {
          "title": {
            "type": "keyword"
          },
          "description": {
            "type": "text",
            "analyzer": "lowercase_asciifolding_analyzer"
          }
        }
      },
      "excerpt": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword"
          }
        }
      }
    }
  }

  (async function() {
    // setup index without reindexing
    await setup(host, index, settings, analyzer, normalizer, tokenizer, mapping)

    // setup index with data reindexing from distinct index
    await setup(host, index, settings, analyzer, normalizer, tokenizer, mapping, otherIndex)

    // setup index with data reindexing from same index
    await setup(host, index, settings, analyzer, normalizer, tokenizer, mapping, index)

    // setup index with data reindexing from local data file path
    await setup(host, index, settings, analyzer, normalizer, tokenizer, mapping, null, dataFilePath)

    // setup index with data reindexing from local data dir path
    await setup(host, index, settings, analyzer, normalizer, tokenizer, mapping, null, dataDirPath)

    // setup index with data reindexing from distinct index and local data path
    await setup(host, index, settings, analyzer, normalizer, tokenizer, mapping, otherIndex, data)
  })()
```

# Notes

## Basic Authorization 
In order for the basic authorization to be properly handled by the lib http calls to the Elasticsearch cluster, the environment variable ELASTICSEARCH_AUTHORIZATION_TOKEN must be set to the base64 encoded value of "username:password" string. 
- In CLI usage, the path to a valid credentials.json ( { username: <username>, password: <password> } ) must be provided as a -c argument.
- In LIB usage, the variable must be set either coming from an loaded env file or at runtime.
  
## Reindexing data
In case of data reindexing ( ie the name of the index containing the origin data passed as the last parameter to the setup method ) the following situation might occur :

- Distinct origin index
The index to setup will be deleted ( if already existing ) and created with the settings and mapping provided. At the end of the process, the data stored in the origin index will be indexed into the newly created index

- Same origin index 
A new temporary index will be firstly created and the original data will then be indexed into that temporary index. The original index will then be deleted and recreated with the settings and mapping provided. At the end of the process, the data stored into the temporary index will be indexed back into the newly created index and the temporary index will be ultimately deleted.

- Local data file or directory
Local data files are expected to be formatted as ndjson. Both file path and dir path can be passed as a data argument to the setup function. In case of dir path argument, all of the directory files will be parsed one by one and their records indexed.
Local record indexation is performed through the use of the _bulk elasticsearch endpoint. Each batch is 1000 records big by default.

Notes : 
- Both reindexing from existing index and local data can be performed during the same index setup. If so, local data indexing will be done last ( potentially overwritting any previously indexed records having overlapping id )  
- More on ndjson format at http://ndjson.org 

# License

ISC

[npm-url]: https://www.npmjs.com/package/elasticsetup
