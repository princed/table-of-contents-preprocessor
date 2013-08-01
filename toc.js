#!/usr/bin/env node

var fs = require('fs');

var FOUR_SPACES = "    ";

var leftIndents = [""];

for(var i = 1; i < 10; i++) {
    leftIndents.push(leftIndents[i-1] + FOUR_SPACES);
}

if (require.main === module) {
  fs.readFile(process.argv[2], 'utf-8', function(err, data) {
      if (err) {
          throw err;
      }
      processData(data);
  });
}

function processData(data, out) {
    var lines = data.trimRight().split('\n');

    var uri;
    var title;
    var titles = [];
    var titlesCount = {};

    var depths = [];

    var minDepth = 1000000;
    for(var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var m = line.match(/^\s*(#+)(.*)$/);
        if (!m) continue;
        minDepth = Math.min(minDepth, m[1].length);
        depths.push(m[1].length);

        title = m[2];
        uri = titleToUrl(title);

        if (titlesCount[title]) {
          uri += '-' + titlesCount[title]++;
        } else {
          titlesCount[title] = 1;
        }
        titles.push({
          title: title,
          uri: uri
        });

        lines[i] = line + '<span id="' + uri +'"></span>';
    }

    for(var i = 0; i < depths.length; i++) {
        depths[i] -= minDepth;
    }

    var toc = createTOC(depths, titles).join('\n');

    var tocRegexp = /^\s*@@TOC@@\s*$/;
    for(var i = 0; i <lines.length; i++) {
        var line = lines[i];
        if (tocRegexp.test(line)) {
            lines[i] = toc;
        }
    }

    var result = lines.join('\n');

    if (require.main === module) {
      console.log(result);
    } else if (typeof out == 'string') {
      fs.writeFileSync(result, out);
    } else {
      return result;
    }
}

function createTOC(depths, titles) {
    var ans = [];
    for(var i = 0; i < depths.length; i++) {
        ans.push(tocLine(depths[i], titles[i]));
    }
    return ans;
}

function titleToUrl(title) {
    return title.trim().toLowerCase().replace(/\s/g, '-').replace(/[^-0-9a-z]/g, '');
}

function tocLine(depth, title) {
    return leftIndents[depth] + "- [" + title.title.trim() + "](#" + title.uri + ")";
}

module.exports = processData;