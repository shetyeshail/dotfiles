var globalForce;
var globalSVG;
var globalNetwork;
var globalD3Network;
var network;

var globalZoom;
d3.selection.prototype.moveToFront = function () {
  return this.each(function () {
    this.parentNode.appendChild(this);
  });
};

function openInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}

function placeBubble(board, refX, refY, textContent) {

  var bubbleAngle = -50;
  var radius = 100;

  var radAngle = bubbleAngle / 180 * Math.PI;
  var posX = refX + radius * Math.cos(radAngle);
  var posY = refY + radius * Math.sin(radAngle);

  var styles = {
    board: {width: 1000, height: 1000},
    callout: {stroke: "black", "stroke-width": 1, fill: "snow"}
  };

  function callout(parameters) {

    //define angle of direction based on ref point
    var dx = parameters.xRef - parameters.x0;
    var dy = parameters.yRef - parameters.y0;

    var angle = Math.atan2(dy, dx);

    parameters.angle = angle * 360 / (2 * Math.PI);
    parameters.angle = (parameters.angle + 360) % 360;
    console.log(parameters.angle);
    parameters.l = Math.sqrt(dx * dx + dy * dy);

    var w = parameters.width,
      h = parameters.height,
      a = w / 2,
      b = h / 2,
      o_x = parameters.x0,
      o_y = parameters.y0,
      m_r = parameters.l,
      m_w = 10,
      m_q = parameters.angle * Math.PI / 180 || 50 * Math.PI / 180,
      m_q_delta = Math.atan(m_w / (2 * Math.min(w, h)));

    var d = "M", x, y,
      d_q = Math.PI / 30; // 1/30 -- precision of drawing

    // now, we are drawing the path step by step
    for (var alpha = 0; alpha < 2 * Math.PI; alpha += d_q) {

      if (alpha > m_q - m_q_delta && alpha < m_q + m_q_delta) { //edge
        x = o_x + m_r * Math.cos(m_q);
        y = o_y + m_r * Math.sin(m_q);
        d += "L" + x + "," + y;
        alpha = m_q + m_q_delta;
      } else { // ellipse
        x = a * Math.cos(alpha) + o_x;
        y = b * Math.sin(alpha) + o_y;
        d += "L" + x + "," + y + " ";
      }
    }
    d += "Z";
    return (d.replace(/^ML/, "M").replace(/ Z$/, "Z"));
  }


//    function setTextBubble(text,x,y)
  board.s

  var board = board.append('g', ":last-child").attr("transform", "scale(" + 0.7 + ")");

  var text = board.append('text', ":last-child").text(textContent).attr('x', posX).attr('y', posY).attr('fill', 'black').attr('text-anchor', 'middle');
  wrap(text, 60);
  var bbox = text[0][0].getBBox();
  var w = bbox.width * 1.6;
  var h = bbox.height * 1.6;

  var centerX = bbox.x + bbox.width / 2;
  var centerY = bbox.y + bbox.height / 2;

  var callout_params = {
    width: w,
    height: h,
    x0: centerX,
    y0: centerY,
    xRef: refX,
    yRef: refY,

  };

  var callout = board.insert("svg:path", ":first-child").attr(styles.callout).attr("d", callout(callout_params));

}

function wrap(text, width) {
  text.each(function () {
    var text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      x = text.attr("x"),
      y = text.attr("y"),
      dy = 0, //parseFloat(text.attr("dy")),
      tspan = text.text(null)
        .append("tspan")
        .attr("x", x)
        .attr("y", y)
        .attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", ++lineNumber * lineHeight + dy + "em")
          .text(word);
      }
    }
  });
}


var setupView = function (error, graph) {
  var w = document.getElementById("mainSVG").offsetWidth;
  var h = window.innerHeight;
  var svg = d3.select("div#mainSVG")
    .append("div")
    .classed("svg-container", true) //container class to make it responsive
    .append("svg")
    //responsive SVG needs these 2 attributes and no width and height attr
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + w + " " + h)
    .attr("id", "networkSVG")
    //class to make it responsive
    .classed("svg-content-responsive", true);

  globalSVG = svg;
  var g = svg.append("g");
  svg.style("cursor", "move");

  //
  //var chart = $("#networkSVG"),
  //    aspect = chart.width() / chart.height(),
  //    container = chart.parent();
  //$(window).on("resize", function() {
  //    //var targetWidth = container.width();
  //    //
  //    var mainDiv=$(".mainDiv");
  //    chart.attr("viewBox", "0 0 "+mainDiv.width()+" "+mainDiv.height());
  //
  //    //    chart.attr("width", targetWidth);
  //    //chart.attr("height", Math.round(targetWidth / aspect));
  //}).trigger("resize");


  var nodeWidth = 10;

//var keyc = true, keys = true, keyt = true, keyr = true, keyx = true, keyd = true, keyl = true, keym = true, keyh = true, key1 = true, key2 = true, key3 = true, key0 = true;
  var focus_node = null, highlight_node = null;
  var text_center = false;
  var outline = false;
  var min_score = 0;
  var max_score = 1;

  var color = d3.scale.linear()
    .domain([min_score, (min_score + max_score) / 2, max_score])
    .range(["lime", "yellow", "red"]);
  var highlight_color = "blue";
  var highlight_trans = 0.1;
  var size = d3.scale.pow().exponent(1)
    .domain([1, 100])
    .range([8, 24]);


  var default_node_color = "#ccc";
//var default_node_color = "rgb(3,190,100)";
  var default_link_color = "#888";
  var nominal_base_node_size = 8;
  var nominal_text_size = 10;
  var max_text_size = 12;
  var nominal_stroke = 0.8;
  var max_stroke = 4.5;
  var max_base_node_size = 36;
  var min_zoom = 0.1;
  var max_zoom = 7;
  var zoom = d3.behavior.zoom().scaleExtent([min_zoom, max_zoom]);
  globalZoom = zoom;

//    g.attr("transform","translate("+dx+","+dy+")");


  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  var linkedByIndex = {};
  graph.links.forEach(function (d) {
    linkedByIndex[d.source + "," + d.target] = true;
  });

  function isConnected(a, b) {
    return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
  }

  function hasConnections(a) {
    for (var property in linkedByIndex) {
      s = property.split(",");
      if ((s[0] == a.index || s[1] == a.index) && linkedByIndex[property])
        return true;
    }
    return false;
  }

  var link = g.selectAll(".link")
    .data(graph.links)
    .enter().append("line")
    .attr("class", "link")
    .style("stroke-width", nominal_stroke)
    .style("stroke", function (d) {
      if (isNumber(d.score) && d.score >= 0) return color(d.score);
      else return default_link_color;
    })
    // .style("opacity", function (d) {
    //   if (typeof d.additionalProperties != 'undefined') {
    //     if (!d.additionalProperties.backbone) {
    //       return 0.2;
    //     } else
    //       return 1.0;
    //   } else
    //     return 1.0;
    // })



  var node = g.selectAll(".node")
    .data(graph.nodes)
    .enter().append("g")
    //.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    .attr("class", "node")


  node.on("dblclick", function (d) {
    //d3.event.stopPropagation();
    //var dcx = (window.innerWidth / 2 - d.x * zoom.scale());
    //var dcy = (window.innerHeight / 2 - d.y * zoom.scale());
    //zoom.translate([dcx, dcy]);
    //g.attr("transform", "translate(" + dcx + "," + dcy + ")scale(" + zoom.scale() + ")");


    var currentNode = d3.select(this);


    var textNote = prompt("add a note.", "Awesome friend.");

    var children = currentNode.selectAll("g");
    children.remove();
    if (typeof d.additionalProperties != 'undefined') {
      d.additionalProperties.textNote = {};
    }


    if (textNote != null && textNote != "") {
      placeBubble(currentNode, 6, -6, textNote);
      console.log("adding Note");
      if (typeof d.additionalProperties == 'undefined') {
        d.additionalProperties = {};
      }
      d.additionalProperties.textNote = textNote;
      currentNode.moveToFront();
    }


  });

  node.on("click", function (d) {
    var url = "http://facebook.com/" + d.id;
    //console.log(url);
    openInNewTab(url);
  });

  var mapY = function (d) {
    return d.y;
  };
  var mapX = function (d) {
    return d.x;
  };

  //clip path to make images round
  var defs = svg.append("defs").attr("id", "imgdefs")

  var clipPath = defs.append('clipPath').attr('id', 'clip-circle')
    .append("circle")
    .attr("r", nodeWidth / 2 - 0.5 * nominal_stroke)
    .attr("cy", 0)
    .attr("cx", 0);

  //background circle for node without image.
  node.append("circle")
    .attr("r", nodeWidth / 2 - 0.7 * nominal_stroke)
    .attr("cy", 0)
    .attr("cx", 0)
    .style("fill", "#BCBCBC");

  node.append("image")
    .attr("xlink:href", function (d) {
      return d.dataUrl
    })
    //        .attr("xlink:href", "https://github.com/favicon.ico")
    .attr("x", -nodeWidth / 2)
    .attr("y", -nodeWidth / 2)
    .attr("width", nodeWidth)
    .attr("height", nodeWidth)
    .attr("clip-path", "url(#clip-circle)");
  node.each(function (d) {
    if (typeof d.additionalProperties != 'undefined' && typeof d.additionalProperties.textNote != 'undefined') {
      var currentNode = d3.select(this);
      placeBubble(currentNode, 6, -6, d.additionalProperties.textNote);
      currentNode.moveToFront();
    }
  })
  $('svg image').tipsy({
    gravity: "e",
    html: true,
    delayIn: 1000,
    //delayOut: 100000,
    opacity: 1.0,
    title: function () {

      var d = this.__data__;
      var html = "<html><img style='padding:5px 5px 5px 5px' src='" + d.dataUrl + "' width='200' height='200'>'<br>" + d.name + "</html>";
      return html;
    }
  });

  var tocolor = "fill";
  var towhite = "stroke";
  if (outline) {
    tocolor = "stroke"
    towhite = "fill"
  }


  var circle = node.append("path")
    .attr("d", d3.svg.symbol()
    //                        .size(function(d) { return nodeWidth+2*nominal_stroke;})
      .type(function (d) {
        return d.type;
      }))

    //                .style(tocolor, function(d) {
    //                    if (isNumber(d.score) && d.score>=0) return color(d.score);
    //                    else return default_node_color; })
    .style(tocolor, "none")
    //.attr("r", function(d) { return size(d.size)||nominal_base_node_size; })
    .style("stroke-width", nominal_stroke)
    .style(towhite, "white");

  node.on("mouseover", function (d) {
    set_highlight(d);
  })
    .on("mousedown", function (d) {
      d3.event.stopPropagation();
      focus_node = d;
      set_focus(d)
      if (highlight_node === null) set_highlight(d)

    }).on("mouseout", function (d) {
    exit_highlight();

  });

  d3.select(window).on("mouseup",
    function () {
      if (focus_node !== null) {
        focus_node = null;
        if (highlight_trans < 1) {

          circle.style("opacity", 1);
          link.style("opacity", 1);
        }
      }

      if (highlight_node === null) exit_highlight();
    });

  function exit_highlight() {
    highlight_node = null;
    if (focus_node === null) {
      svg.style("cursor", "move");
      if (highlight_color != "white") {
        circle.style(towhite, "white");
        link.style("stroke", function (o) {
          return (isNumber(o.score) && o.score >= 0) ? color(o.score) : default_link_color
        });

        link.style("display",function(o){
          if (typeof o.additionalProperties === "undefined") return "inline";
          if (typeof o.additionalProperties.backbone === "undefined") return "inline";
          if (typeof o.additionalProperties.backbone !== "undefined" && !o.additionalProperties.backbone) return "none";
          return "inline";
        });

      }

    }
  }

  function set_focus(d) {
    if (highlight_trans < 1) {
      circle.style("opacity", function (o) {
        return isConnected(d, o) ? 1 : highlight_trans;
      });

      link.style("opacity", function (o) {
        return o.source.index == d.index || o.target.index == d.index ? 1 : highlight_trans;
      });
    }
  }


  function set_highlight(d) {
    svg.style("cursor", "pointer");
    if (focus_node !== null) d = focus_node;
    highlight_node = d;

    if (highlight_color != "white") {
      circle.style(towhite, function (o) {
        return isConnected(d, o) ? highlight_color : "white";
      });

      link.style("stroke", function (o) {
        return o.source.index == d.index || o.target.index == d.index ? highlight_color : ((isNumber(o.score) && o.score >= 0) ? color(o.score) : default_link_color);

      });
      link.style("display",function(o){
        if(o.source.index == d.index || o.target.index == d.index){
          return "inline";
        }
        if(typeof o.additionalProperties === "undefined") return "inline";
        if(typeof o.additionalProperties.backbone !== "undefined" && !o.additionalProperties.backbone) return "none";
        return "inline";
      });
    }
  }


  zoom.on("zoom", function () {

    var stroke = nominal_stroke;
    if (nominal_stroke * zoom.scale() > max_stroke) stroke = max_stroke / zoom.scale();
    link.style("stroke-width", stroke);
    circle.style("stroke-width", stroke);

    var base_radius = nominal_base_node_size;
    if (nominal_base_node_size * zoom.scale() > max_base_node_size) base_radius = max_base_node_size / zoom.scale();
    circle.attr("d", d3.svg.symbol()
    //                    .size(function(d) { return Math.PI*Math.pow(size(d.size)*base_radius/nominal_base_node_size||base_radius,2); })
      .type(function (d) {
        return d.type;
      }))

    g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  });
  svg.call(zoom).on("dblclick.zoom", null);


  //zoom.scale(scale);
  //var centerX=bbox.x+bbox.width/2;
  //var centerY=bbox.y+bbox.height/2;
  //var dx=width/2-centerX;
  //var dy=height/2-centerY;


  //resize();
  //window.focus();
  //d3.select(window).on("resize", resize);
  //.on("keydown", keydown);


  function resize() {

    //var width = window.innerWidth, height = window.innerHeight;
    //
    //svg.attr("width", width).attr("height", height);
    //svg.attr("width", "100%").attr("height", "100%");
    //

    //var width=parseInt(d3.select("svg").style("width"));
    //var height=parseInt(d3.select("svg").style("height"));
    //var g=d3.select(globalSVG[0][0].children[0]);
    //var bbox=d3.select("g")[0][0].getBBox();
    //var centerX=bbox.x+bbox.width/2;
    //var centerY=bbox.y+bbox.height/2;
    //var dx=width/2-centerX;
    //var dy=height/2-centerY;
    //g.attr("transform","translate("+dx+","+dy+")");
    ////
    //
    //w = width;
    //h = height;
  }

  var optArray = [];
  for (var i = 0; i < graph.nodes.length - 1; i++) {
    optArray.push(graph.nodes[i].name);
  }
  optArray = optArray.sort();
  $(function () {
    $("#search").autocomplete({
      open: function () {
        $(this).autocomplete('widget').css('z-index', 5000);
        return false;
      },
      source: optArray
    }).keydown(function (e) {
      if (e.keyCode === 13) {
        $("#searchButton").click();
      }
    });

  });
  function searchNode() {
    //find the node
    var selectedVal = document.getElementById('search').value;
    var node = svg.selectAll(".node");
    if (selectedVal == "none") {
      node.style("stroke", "white").style("stroke-width", "1");
    } else {
      var selected = node.filter(function (d, i) {
        return d.name != selectedVal;
      });
      selected.style("opacity", "0");
      var link = svg.selectAll(".link")
      link.style("opacity", "0");
      d3.selectAll(".node, .link").transition()
        .duration(5000)
        .style("opacity", 1);
    }
  }

  document.getElementById("searchButton").onclick = searchNode;

  $("#search").keypress(function (e) {
    if (e.which == 13) {
      searchNode();
    }
  });
}
var applyLayoutForce = function (graph) {

  //d3force layout
  //var force = d3.layout.force()
  //        .linkDistance(60)
  //        .charge(-300)
  //        .size([w,h]);


  var w = window.innerWidth, h = window.innerHeight;
  //stress minimization
  var force = cola.d3adaptor()
    .size([w, h]);
  force
    .nodes(graph.nodes)
    .links(graph.links)
    .symmetricDiffLinkLengths(5);


  var node = d3.selectAll(".node")
    .call(force.drag);

  //d3.select(window).on("resize", resizeForce);

  var link = d3.selectAll(".link");

  force.on("tick", function () {

    node.attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

    link.attr("x1", function (d) {
      return d.source.x;
    })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });

    node.attr("cx", function (d) {
      return d.x;
    })
      .attr("cy", function (d) {
        return d.y;
      });
  });

  force.start(10);
  force.tick();
  force.tick();
  //function resizeForce() {
  //    var width = window.innerWidth, height = window.innerHeight;
  //    force.size([force.size()[0] + (width - w) / zoom.scale(), force.size()[1] + (height - h) / zoom.scale()]).resume();
  //    w=width;
  //    h=height;
  //}

  globalForce = force;

  var width = parseInt(d3.select("svg").style("width"));
  var height = parseInt(d3.select("svg").style("height"));
  var g = d3.select(globalSVG[0][0].children[0]);
  var bbox = d3.select("g")[0][0].getBBox();
  var scalew = (width * 0.9) / bbox.width;
  var scaleh = (height * 0.9) / bbox.height;
  if (scalew < scaleh) {
    globalZoom.translate([(width - bbox.width) / 4 + scalew * (-bbox.x), scalew * (-bbox.y)]);
  } else {
    globalZoom.translate([(width - bbox.width) / 4 + scaleh * (-bbox.x), scaleh * (-bbox.y)]);
  }

  globalZoom.scale(Math.min(scalew, scaleh));
  globalZoom.event(globalSVG);
//force.handleDisconnected(false)

  return force;
}

var applyLayoutPositions = function (graph) {

  //var drag = d3.behavior.drag()
  //
  //    .on('drag', function() {
  //        var n=d3.select(this)
  //        n.attr("transform", "translate(" + d3.event.x + "," + d3.event.y + ")");
  //    });
  //    //.on('dragend', function() { circle.style('fill', 'black'); });
  //
  //
  //var node=d3.selectAll(".node");
  //node.call(drag);

  graph.nodes.forEach(function (v) {
    v.px = v.x;
    v.py = v.y;
    //c.cx= v.x;
    //c.cy= v.y;
    v.fixed = true;
  });

  var force = applyLayoutForce(graph);

  //force.start();
  force.tick();
  force.stop();

}
