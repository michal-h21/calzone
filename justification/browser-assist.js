
var makeLine = function(ratio){
  var span = document.createElement("span");
  span.style["text-indent"]  = 0; 
  span.style["word-spacing"] = ratio.toFixed(3) + 'px';
  span.style["display"]      = "inline-block";
  span.style["white-space"]  = "nowrap";
  return span;
}

var addText = function(p, text){
  var child = document.createTextNode(text);
  p.appendChild(child);
}

var addDiscretionary = function(p){
  var disc = document.createElement("span");
  disc.setAttribute("class", "discretionary");
  var hyphen = document.createTextNode("-");
  disc.appendChild(hyphen);
  p.appendChild(disc);
}

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
    var positions = [];
    console.log(main);
    var pos = 0;
    var loop = function(main) {
      var curr = hiddenCopy(main);
      do {
        if(main.nodeType == 1){

        } else if(main.nodeType == 3){
          var text = main.data;
          arr.push(text);
          pos = pos + text.length;
          console.log(pos);
        }
        if(main.hasChildNodes())
          loop(main.firstChild);
      }
      while (main = main.nextSibling);
    }
    loop(main.firstChild);
    var text = arr.join("");
    console.log(text);
    return text;
  };
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

  //var text = $(identifier)[0]._originalText ? $(identifier)[0]._originalText : $(identifier).text();
  // if (!$(identifier)[0]._originalText) $(identifier)[0]._originalText = text;
  var  text = walkDOM(identifier);
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
    var span = makeLine(ratio);
    line.nodes.forEach(function (n,index,array) { 
      if (n.type === 'box'){ 
        addText(span, n.value);
      }
      else if (n.type === 'glue'){ 
        addText(span, " ");
      }
      else if (n.type === 'penalty' && n.penalty ==
          linebreak.defaults.hyphenpenalty && index ==
          array.length -1){
        addDiscretionary(span);
      }
    });
    console.log(span);
    //console.log(output);
    //$(identifier).append(output);
    identifier.appendChild(span);
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

