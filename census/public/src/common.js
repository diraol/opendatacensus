var OpenDataCensus = OpenDataCensus || {};

OpenDataCensus.colorScale = {
  totalColorScale: new chroma.ColorScale({
    colors: ['#dd3d3a', '#8bdd3a'],
    limits: [0, 1000]
  })
};

OpenDataCensus.popoverBody = function(answers, details, url, actionurl, actiontext, submissions, submissionslength, year, yearclass) {

  var makeNot = function(reply){
    var not;

    if (reply === true){
      not = '';
    } else if (reply === false){
      not = 'not ';
    } else {
      not = 'unclear if it\'s ';
    }
    return not;
  };

  var truncate = function(s, l) {
    var o;
    if (l === null || typeof l === 'undefined') {
      l = 50;
    }
    o = s.slice(0, l);
    if (s.length > l) {
      o += "&hellip;";
    }
    return o;
  };

  var out = [], not = '';
  out.push('<ul class="availability icons large">');

  // These match the order of the bars in the table

   not = makeNot(answers.openlicense);
    out.push('<li class="');
    if (not === 'not ') {
        out.push('no');
    }
    else if (not === 'unclear if it\'s ') {
        out.push('maybe');
    }
    else {
        out.push('yes');
    }
    out.push('" title="It\'s ' + not + 'openly licensed" data-toggle="tooltip"><i class="fa fa-unlock-alt"></i><span class="text">It\'s ' + not + 'openly licensed</span></li>');

    not = makeNot(answers.machinereadable);
    out.push('<li class="');
    if (not === 'not ') {
        out.push('no');
    }
    else if (not === 'unclear if it\'s ') {
        out.push('maybe');
    }
    else {
        out.push('yes');
    }
    out.push('" title="It\'s ' + not + 'machine readable" data-toggle="tooltip"><i class="fa fa-keyboard-o"></i><span class="text">It\'s ' + not + 'machine readable</span></li>');

    not = makeNot(answers.free);
    out.push('<li class="');
    if (not === 'not ') {
        out.push('no');
    }
    else if (not === 'unclear if it\'s ') {
        out.push('maybe');
    }
    else {
        out.push('yes');
    }
    out.push('" title="It\'s ' + not + 'free of charge" data-toggle="tooltip"><i class="fa fa-usd"></i><span class="text">It\'s ' + not + 'free of charge</span></li>');

    not = makeNot(answers.bulk);
    out.push('<li class="');
    if (not === 'not ') {
        out.push('no');
    }
    else if (not === 'unclear if it\'s ') {
        out.push('maybe');
    }
    else {
        out.push('yes');
    }
    out.push('" title="It\'s ' + not + ' available in bulk" data-toggle="tooltip"><i class="fa fa-files-o"></i><span class="text">It\'s ' + not + ' available in bulk</span></li>');

    not = makeNot(answers.uptodate);
    out.push('<li class="');
    if (not === 'not ') {
        out.push('no');
    }
    else if (not === 'unclear if it\'s ') {
        out.push('maybe');
    }
    else {
        out.push('yes');
    }
    out.push('" title="It\'s ' + not + 'up-to-date" data-toggle="tooltip"><i class="fa fa-clock-o"></i><span class="text">It\'s ' + not + 'up-to-date</span></li>');

    not = makeNot(answers.online);
    out.push('<li class="');
    if (not === 'not ') {
        out.push('no');
    }
    else if (not === 'unclear if it\'s ') {
        out.push('maybe');
    }
    else {
        out.push('yes');
    }
    out.push('" title="It\'s ' + not + 'online" data-toggle="tooltip">');
    if (answers.online !== false && answers.url) {
      out.push('<a href="' + answers.url + '" target="_blank">');
    }
    out.push('<i class="fa fa-arrow-circle-o-down"></i><span class="text">It\'s ' + not + 'online</span></li>');
    if (answers.online !== false && answers.url) {
      out.push('</a>');
    }
    out.push('</li>');

    not = makeNot(answers.digital);
    out.push('<li class="');
    if (not === 'not ') {
        out.push('no');
    }
    else if (not === 'unclear if it\'s ') {
        out.push('maybe');
    }
    else {
        out.push('yes');
    }
    out.push('" title="It\'s ' + not + 'digital" data-toggle="tooltip"><i class="fa fa-floppy-o"></i><span class="text">It\'s ' + not + 'digital</span></li>');

    not = makeNot(answers.exists );
    out.push('<li class="');
    if (not === 'not ') {
        out.push('no');
    }
    else if (not === 'unclear if it\'s ') {
        out.push('maybe');
    }
    else {
        out.push('yes');
    }
    out.push('" title="Data exists" data-toggle="tooltip"><i class="fa fa-file-o"></i><span class="text">Data exists</span></li>');

    not = makeNot(answers.public);
    out.push('<li class="');
    if (not === 'not ') {
        out.push('no');
    }
    else if (not === 'unclear if it\'s ') {
        out.push('maybe');
    }
    else {
        out.push('yes');
    }
    out.push('" title="It\'s ' + not + 'publicly available" data-toggle="tooltip"><i class="fa fa-eye"></i><span class="text">It\'s ' + not + 'publicly available</span></li>');

  out.push('</ul>');

  if (year) {
    out.push('<p>Last updated <span class="entry-year label ' + yearclass + '">' + year + '</span></p>');
  }
  if (submissions) {
    out.push('<div class="btn-group">');
    if (answers) {
      out.push('<a class="btn btn-primary" href="' + url + '">View</a>');
    }
    if (submissionslength) {
      out.push('<a class="btn btn-warning" href="' + actionurl + '">' + actiontext + ' (' + submissionslength + ')</a>');
    } else {
      out.push('<a class="btn btn-success" href="' + actionurl + '">' + actiontext +'</a>');
    }
    out.push('</div>');
  } else {
    if (answers) {
      out.push('<a class="btn btn-primary" href="' + url + '">View</a>');
    }
  }
  return out.join('');
};
