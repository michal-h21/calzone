

function browserAssistTypeset(identifier, type, tolerance, options) {
  var hiddenCopy = function(identifier){
    return $(identifier).clone().css({
      visibility: 'hidden', position: 'absolute',
      top: '-8000px', width: 'auto',
      "text-indent": "0px",
      display: 'inline', left: '-8000px'
    })
  };
  var walkDOM = function (main) {
    // based on http://stackoverflow.com/a/8747184
    var arr = [];
    console.log(main);
    var loop = function(main) {
      var curr = hiddenCopy(main);
      do {
        if(main.nodeType == 3){
          var text = main.data;
          console.log(text);

        }
        if(main.hasChildNodes())
          loop(main.firstChild);
      }
      while (main = main.nextSibling);
    }
    loop(main.firstChild);
    return arr;
  };
  walkDOM(identifier);
  var ruler = hiddenCopy(identifier)
  $('body').append(ruler);
  var spacewidth = ruler.html('&#160;').width();
  var format = formatter(function (str) {
    if (str !== ' ') {
      return ruler.text(str).width();
    } else {
      return spacewidth; 
    }
  });

  var text = $(identifier)[0]._originalText ? $(identifier)[0]._originalText : $(identifier).text();
  if (!$(identifier)[0]._originalText) $(identifier)[0]._originalText = text;
  var width = $(identifier).width();
  var ti    = parseFloat($(identifier).css("text-indent"));
  var nodes = format[type](text),
  breaks = linebreak(nodes, [width-ti, width], {tolerance: tolerance}),
    lines = [],
    i, point, r, lineStart;
  if (!breaks.length) return; 
  $(identifier).empty();
  // Iterate through the line breaks, and split the nodes at the
  // correct point.
  for (i = 1; i < breaks.length; i += 1) {
    point = breaks[i].position,
      r = breaks[i].ratio;

    for (var j = lineStart; j < nodes.length; j += 1) {
      // After a line break, we skip any nodes unless they are boxes or forced breaks.
      if (nodes[j].type === 'box' || (nodes[j].type === 'penalty' && nodes[j].penalty === -linebreak.defaults.infinity)) {
        lineStart = j;
        break;
      }
    }
    lines.push({ratio: r, nodes: nodes.slice(lineStart, point + 1), position: point});
    lineStart = point;
  }

  lines.forEach(function (line, index,array) {
    var spaceShrink = spacewidth * 3 / 9;
    spaceStretch = spacewidth * 3 / 6;
    ratio = line.ratio * (line.ratio < 0 ? spaceShrink : spaceStretch);

    var output = '<span style="text-indent:0; word-spacing: ' + ratio.toFixed(3) + 'px; display: inline-block; white-space: nowrap;">'; 
    line.nodes.forEach(function (n,index,array) { 
      if (n.type === 'box') output += n.value;
      else if (n.type === 'glue') output += " ";
      else if (n.type === 'penalty' && n.penalty ==
          linebreak.defaults.hyphenpenalty && index ==
          array.length -1) output += '<span class="discretionary">-</span>';
    });
    output += '</span>';
    //console.log(output);
    $(identifier).append(output);
  });
  ruler.remove();
}
function Calzone(sel, options) {
  if (!options) { options = { widow: 2, orphan: 2 } }
  $(document).ready(function(){
    $(sel).each(function(i,el) { browserAssistTypeset(el, 'justify', 2, options) });
    $(sel).resize(function() { browserAssistTypeset(this, 'justify', 2, options); });
  });
}

