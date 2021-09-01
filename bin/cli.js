#!/usr/bin/env node

// const { statSync } = require('fs')
// stats.isDirectory()
// stats.isFile()

const { readFileSync } = require("fs")
const yargs = require("yargs")
const core = require("./core")

let { host, index, settings, analyzer, normalizer, tokenizer, mapping, origin, credentials, data } = yargs
 .usage("Usage: elasticsetup -h <host> -i <index_name> -s <settings_json_path> -a <analyzer_json_path> -n <normalizer_json_path> -t <tokenizer_json_path> -m <mapping_json_path> -o <origin_index_name>")
 .option("h", { alias: "host", describe: "Host", type: "string", demandOption: true }) 
 .option("i", { alias: "index", describe: "Index name", type: "string", demandOption: true })
 .option("s", { alias: "settings", describe: "Index settings file path", type: "string", demandOption: false })
 .option("a", { alias: "analyzer", describe: "Index analyzer file path", type: "string", demandOption: false })
 .option("n", { alias: "normalizer", describe: "Index normalizer file path", type: "string", demandOption: false })
 .option("t", { alias: "tokenizer", describe: "Index tokenizer file path", type: "string", demandOption: false })
 .option("m", { alias: "mapping", describe: "Index mapping file path", type: "string", demandOption: false })
 .option("o", { alias: "origin", describe: "Origin index name", type: "string", demandOption: false })
 .option("c", { alias: "credentials", describe: "Elasticsearch credentials file path ( json format : { username:<username>, password:<password> } )", type: "string", demandOption: false })
 .option("d", { alias: "data", describe: "Data file/dir path", type: "string", demandOption: false })
 .argv;

if(analyzer) {
  const analyzerRawdata = readFileSync(analyzer.trim());
  analyzer = JSON.parse(analyzerRawdata);
}

if(settings) {
  const settingsRawdata = readFileSync(settings.trim());
  settings = JSON.parse(settingsRawdata);
}

if(normalizer) {
  const normalizerRawdata = readFileSync(normalizer.trim());
  normalizer = JSON.parse(normalizerRawdata);
}

if(tokenizer) {
  const tokenizerRawdata = readFileSync(tokenizer.trim());
  tokenizer = JSON.parse(tokenizerRawdata);
}

if(mapping) {
  const mappingRawdata = readFileSync(mapping.trim());
  mapping = JSON.parse(mappingRawdata);
}

if(credentials) {
  const credentialsRawdata = readFileSync(credentials.trim());
  credentials = JSON.parse(credentialsRawdata);
  const { username, password } = credentials;
  process.env.ELASTICSEARCH_AUTHORIZATION_TOKEN = Buffer.from(`${username}:${password}`).toString('base64');
}
  
core.setup(host, index, settings, analyzer, normalizer, tokenizer, mapping, origin, data)