# Elastic Setup
Lightweight library to quickly setup an Elasticsearch index from settings, analyzer, normalizer, tokenizer and mapping. Optionally reindex data from the same or another index of the same cluster.

## Usage

### CLI

#### Install CLI
```npm install -g elasticsetup```

#### Setup without reindexing
```elasticsetup -h 192.168.0.10 -i products -a analyzer.json -m mapping.json```

#### Setup with data reindexing from distinct index
```elasticsetup -h 192.168.0.10 -i products -a analyzer.json -m mapping.json -s products_old```

#### Setup with data reindexing from same index
```elasticsetup -h 192.168.0.10 -i products -a analyzer.json -m mapping.json -s products```

#### File format and examples 

##### Settings example
```json
{
  "max_ngram_diff": 10
}
```

##### Analyzer example
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

##### Normalizer example
```json
  {
    "lowercase_asciifolding_normalizer": {
      "type": "custom",
      "char_filter": [],
      "filter": ["lowercase", "asciifolding"]
    }
  }
```

##### Tokenizer example
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

##### Mapping example
```json
{
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
  "excerpt": {
    "type": "text",
    "fields": {
      "keyword": {
        "type": "keyword"
      }
    }
  }
} 
```


### Lib

```npm install --save elasticsetup```

```js
  const { setup } = require('elasticsetup')
  const host = ' 192.168.0.10'
  const index = 'products' 
  const otherIndex = 'oldProducts'

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
    "excerpt": {
      "type": "text",
      "fields": {
        "keyword": {
          "type": "keyword"
        },
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
  })()
```

## Reindexing data
In case of data reindexing ( ie the name of the index containing the source data passed as the last parameter to the setup method ) the following situation might occur :

### Distinct source index
The index to setup will be deleted ( if already existing ) and created with the settings and mapping provided. At the end of the process, the data stored in the source index will be indexed into the newly created index

### Same source index 
A new temporary index will be firstly created and the original data will then be indexed into that temporary index. The original index will then be deleted and recreated with the settings and mapping provided. At the end of the process, the data stored into the temporary index will be indexed back into the newly created index and the temporary index will be ultimately deleted.