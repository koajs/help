#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var md = require( "markdown" ).markdown;

var wikis = ['https://github.com/koajs/koa.wiki',
  'https://github.com/visionmedia/co.wiki'];

function parse (file) {
  var source = fs.readFileSync(file).toString();
  var tree = md.parse(source);
  return tree;
}

function prepend (wiki) {
  return function (file) {
    return wiki + '/' + file;
  };
}

function index (wiki) {
  return function () {
    var files = fs.readdirSync(wiki).filter(onlyMd).map(prepend(wiki));
    var db = files.map(parse);
    fs.writeFileSync('data.json', JSON.stringify(db));
  };
}

function onlyMd (file) {
  return file.slice(-3) == '.md';
}

function clone (wiki) {
  var base = 'wikis/' + path.basename(wiki);
  var git = exec('git clone ' + wiki + ' ' + base, index(base));
  git.stderr.pipe(process.stdout);
}

function error (err) {
  console.error(err);
  process.exit(1);
}

function start (wiki) {
  wikis.map(clone);
}

exec('rm -rf wikis', start);
