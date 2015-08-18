
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

var html = function(p, text){
  var t =  document.createTextNode(text);
  while(p.firstChild){
    p.removeChild(p.firstChild);
  }
  p.appendChild(t);
  return p;
}

function browserAssistTypeset(identifier, type, tolerance, options) {
  var hiddenCopy = function(identifier){
    // return $(identifier).clone().css({
    //   visibility: 'hidden', position: 'absolute',
    //   top: '-8000px', width: 'auto',
    //   "text-indent": "0px",
    //   display: 'inline', left: '-8000px'
    // })
    var newnode = identifier.cloneNode();
    var properties = {
      visibility: 'hidden', position: 'absolute',
      top: '-8000px', width: 'auto',
      "text-indent": "0px",
      display: 'inline', left: '-8000px'
    }
    for(var key in properties){
      newnode.style[key] = properties[key];
    }
    return newnode;
  };
  var walkDOM = function (main) {
    // based on http://stackoverflow.com/a/8747184
    var arr = [];
    var positions = [];
    // console.log(main);
    var pos = 0;
    var nodeList = [];
    var loop = function(main, nodes) {
      //var curr = hiddenCopy(main);
      do {
        if(main.nodeType == 1){

        } else if(main.nodeType == 3){
          var text = main.data;
          positions.push({"pos" : pos, "nodes" : nodes.slice()});
          arr.push(text);
          pos = pos + text.length;
        }
        if(main.hasChildNodes()){
          var copy = nodes.slice();
          copy.push(hiddenCopy(main));
          loop(main.firstChild, copy);
        }
      }
      while (main = main.nextSibling);
    }
    loop(main.firstChild, nodeList);
    var text = arr.join("");
    console.log(text);
    var that = {"text":  text, "main":main, "positions" : positions, 
      "index": 0, "nextPos":0,"currPos" : 0};
    that.reset = function(){
      that.index = 0;
      that.nextPos = -1;
    };
    that. nextPos = function(){
      if(that.index > that.nextPos){
        var i = 0;
        var status = that.positions.some(function(a){
          if(a.pos > that.index) {
            that.nextPos = a.pos;
            that.currPos = i;
            console.log("hledame pos " + i);
            return true;
          }
          i++;
        });
      }
    }
    that.getWidth = function(text){
      var index = that.index;
      that.index = that.text.indexOf(text, index);
      that.nextPos();
      var i  = that.currPos;
      var newnode = html(hiddenCopy(that.main), text);
      document.body.appendChild(newnode);
      var width = newnode.clientWidth;
      document.body.removeChild(newnode);
      // console.log(that.positions[i].nodes+ " " + i);
      // console.log(that.index+ " " + text);
      return width;
    };
    that.forPositions = function(){
      that.positions.forEach(function(a){
        console.log(a);
      });
    } 
    return that;
  };

  var textObject = walkDOM(identifier);
  var ruler = hiddenCopy(identifier)
  //  $('body').append(ruler);
  ruler = html(ruler,'\u00A0');
  document.body.appendChild(ruler);
  //var spacewidth = ruler.html('&#160;').width();
  var spacewidth = ruler.clientWidth;
  var format = formatter(function (str) {
    if (str !== ' ') {
      // var oldmethod = html(ruler, str).clientWidth;
      return textObject.getWidth(str);
    } else {
      return spacewidth; 
    }
  });

  //var text = $(identifier)[0]._originalText ? $(identifier)[0]._originalText : $(identifier).text();
  // if (!$(identifier)[0]._originalText) $(identifier)[0]._originalText = text;
  var  text = textObject.text;
  //var width = $(identifier).width();
  var width = identifier.clientWidth;
  var identstyle = window.getComputedStyle(identifier,null);
  var ti = parseFloat(identstyle["text-indent"]);
  //var ti = parseFloat($(identifier).css("text-indent"));
  var nodes = format[type](text),
  breaks = linebreak(nodes, [width-ti, width], {tolerance: tolerance}),
    lines = [],
    i, point, r, lineStart;
  if (!breaks.length) return; 
  //$(identifier).empty();
  html(identifier,"");
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
    //console.log(span);
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

