#!/usr/bin/env node

const yargs = require("yargs")
const core = require("./core")
const { readFileSync } = require("fs")

let { host, index, analyzer, mapping, origin, settings } = yargs
 .usage("Usage: elasticsetup -h <host> -i <index_name> -s <settings_json_path> -a <analyzer_json_path> -n <normalizer_json_path> -t <tokenizer_json_path> -m <mapping_json_path> -o <origin_index_name>")
 .option("h", { alias: "host", describe: "Host", type: "string", demandOption: true }) 
 .option("i", { alias: "index", describe: "Index name", type: "string", demandOption: true })
 .option("s", { alias: "settings", describe: "Index settings", type: "string", demandOption: false })
 .option("a", { alias: "analyzer", describe: "Index analyzer", type: "string", demandOption: false })
 .option("n", { alias: "normalizer", describe: "Index normalizer", type: "string", demandOption: false })
 .option("t", { alias: "tokenizer", describe: "Index tokenizer", type: "string", demandOption: false })
 .option("m", { alias: "mapping", describe: "Index mapping", type: "string", demandOption: false })
 .option("o", { alias: "origin", describe: "Origin index name", type: "string", demandOption: false })
 .argv;

const analyzerRawdata = readFileSync(analyzer.trim());
analyzer = JSON.parse(analyzerRawdata);

const settingsRawdata = readFileSync(settings.trim());
settings = JSON.parse(settingsRawdata);

const normalizerRawdata = readFileSync(normalizer.trim());
normalizer = JSON.parse(normalizerRawdata);

const tokenizerRawdata = readFileSync(tokenizer.trim());
tokenizer = JSON.parse(tokenizerRawdata);

const mappingRawdata = readFileSync(mapping.trim());
mapping = JSON.parse(mappingRawdata);

core.setup(host, index, settings, analyzer, normalizer, tokenizer, mapping, origin)