#!/usr/bin/env node

const yargs = require("yargs")
const core = require("./core")
const { readFileSync } = require("fs")

let { host, index, analyzer, mapping, origin, settings } = yargs
 .usage("Usage: -h <host> -n <index_name> -a <analyzer_json_path> -m <mapping_json_path>")
 .option("h", { alias: "host", describe: "Host", type: "string", demandOption: true }) 
 .option("i", { alias: "index", describe: "Index name", type: "string", demandOption: true })
 .option("a", { alias: "analyzer", describe: "Index analyzer", type: "string", demandOption: true })
 .option("s", { alias: "settings", describe: "Index settings", type: "string", demandOption: false })
 .option("n", { alias: "normalizer", describe: "Index normalizer", type: "string", demandOption: true })
 .option("o", { alias: "origin", describe: "Origin index name", type: "string", demandOption: false })
 .option("t", { alias: "tokenizer", describe: "Index tokenizer", type: "string", demandOption: true })
 .option("m", { alias: "mapping", describe: "Index mapping", type: "string", demandOption: true })
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