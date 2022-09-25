loadVisualizations = async () => {
  var margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  let svg = d3
    .select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.left + margin.right)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  let svg1 = svg.append("g");
  let svg2 = svg.append("g");

  var lowColor = "#fee0d2";
  var highColor = "#de2d26";

  // Reading Data
  let usData = await d3.json("https://unpkg.com/us-atlas@3/counties-10m.json");
  let GunDeaths = await d3.csv("freq.csv");
  

  let projection = d3.geoAlbersUsa();
  let path = d3.geoPath().projection(projection);
  // let state = topojson.feature(usData, usData.objects.states);

  let dataArray = [];

  //Adding Rectangle box
  let canvas = d3
    .select("#my_dataviz")
    .append("svg")
    .attr("width", 300)
    .attr("height", 400)
    .append("g")
    .attr("transform", "translate(10,10)");



  function update_rbox(data) {
    canvas.selectAll("text").remove();

    canvas
      .append("text")
      .attr("dy","0em") 
      .attr("font-size", "2em")
      .attr("font-weight", "bold")
      .attr("color", "#aa00ff")
      .text(function (d) {
        return (
          data.properties.NAME 
        );
      }).attr("transform", "translate(0,40)");

      canvas
      .append("text")
      //.attr()
      .attr("font-size", "20px")
      .attr("dy","1em")
      .attr("font-weight", "bold")
      .attr("color", "black")
      .text(function (d) {
        return (
          "Total Deaths-" +
          data.properties.value 
        );
      }).attr("transform", "translate(0,50)");

      canvas
      .append("text")
      //.attr()
      .attr("font-size", "15px")
      .attr("dy","2em")
      .attr("font-weight", "bold")
      .attr("color", "black")
      .text(function (d) {
        return (
          "Male-" +
          data.properties.malevalue 
        );
      }).attr("transform", "translate(0,60)");

      canvas
      .append("text")
      //.attr()
      .attr("font-size", "15px")
      .attr("dy","3em")
      .attr("font-weight", "bold")
      .attr("color", "black")
      .text(function (d) {
        return (
          "Female-" +
          data.properties.femalevalue 
        );
      }).attr("transform", "translate(0,60)");


      // .attr("transform", "translate(0,100)");
  }
  // Adding annotations
  let shootingBarTip = d3
    .tip()
    .attr("class", "d3-tip")
    .style("background-color", "#262626")
    .style("opacity","0.5")
    .style("border", "solid")
    .style("color", "white")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .html(function (d) {
      return `
              <strong>Name:</strong> <span style='color:red; margin-top: 5px'>
              ${d.city_state}
              </span><br/>
              <strong>Male:</strong> <span style='color:red; margin-top: 5px'>
              ${d.males}
              </span><br/>
              <strong>Female:</strong> <span style='color:red; margin-top: 5px'>
              ${d.females}
              </span><br/>
              <strong>Total:</strong> <span style='color:red; margin-top: 5px'>
              ${Number(d.males) + Number(d.females)}
              </span>
              `;
    });

  function update(selectedGroup) {
    //var column = selectedGroup
    var dataFilter = GunDeaths.filter(function (d) {
      if (selectedGroup == "Cities") {
        return d;
      }
      // else{
      //   return d.females > 1;
      // }
      // return d;
    });

    //console.log(1)
    GunDeathPoints = svg2
      .selectAll("circle")
      .data(dataFilter)
      .join(
        function (enter) {
          return enter
            .append("circle")
            .attr("cx", (d) => {
              return projection([d.lng, d.lat])[0];
            })
            .attr("cy", (d) => {
              return projection([d.lng, d.lat])[1];
            })
            .attr("r", (d) => {
              return 0.5 + 0.1 * (Number(d.males) + Number(d.females));
            })
            .style("opacity", 0);
        },
        function (update) {
          return update;
        },
        function (exit) {
          return (
            exit
              //  .transition()
              //  .duration(3000)
              .attr("cy", 0)
              .remove()
          );
        }
      )
      .attr("cx", (d) => {
        return projection([d.lng, d.lat])[0];
      })
      .attr("cy", (d) => {
        return projection([d.lng, d.lat])[1];
      })
      .attr("fill", "#08306b")
      .style("opacity", 0.6)
      .on("mouseover", shootingBarTip.show)
      .on("mouseout", shootingBarTip.hide);
  }

  d3.selectAll("input[name='dropdownButton']").on("change", function () {
    var selectedOption = d3.select(this).property("value");
    update(selectedOption);
  });

  let mouseOver = function (d) {
    d3.selectAll(".State")
      .transition()
      .duration(200);

    d3.select(this).transition().duration();
  };

  let mouseLeave = function (d) {
    d3.selectAll(".State").transition().duration(200);
    d3.select(this).transition().duration(200);
  };

  // let stateColored = svg.append("g");

  function update_map() {
    d3.csv("freq_by.csv").then(function (data) {
      for (var d = 0; d < data.length; d++) {
        dataArray.push(Number(data[d].males) + Number(data[d].females));
      }
      var minVal = d3.min(dataArray);
      var maxVal = d3.max(dataArray);

      var ramp = d3
        .scaleLinear()
        .domain([minVal, maxVal])
        .range([lowColor, highColor]);

      console.log(dataArray);
      d3.json("us-states.geojson").then(function (json) {
        
        for (var i = 0; i < data.length; i++) {
          // Grab State Name
          var dataState = data[i].NAME;
          

          // Grab data value
          var dataValue = [
            Number(data[i].males),
            Number(data[i].females),
            Number(data[i].males) + Number(data[i].females),
          ];

          //   console.log(dataValue)

          // Find the corresponding state inside the GeoJSON
          for (var j = 0; j < json.features.length; j++) {
            //console.log(json.features[j])
            var jsonState = json.features[j].properties.NAME;

            //console.log(jsonState)
            //console.log(dataState)
            if (dataState == jsonState) {
              // Copy the data value into the JSON
              json.features[j].properties.value = dataValue[2];
              json.features[j].properties.malevalue = dataValue[0];
              json.features[j].properties.femalevalue = dataValue[1];
              // Stop looking through the JSON
              break;
            }
          }
        }

        // Bind the data to the SVG and create one path per GeoJSON feature
        svg1
          .selectAll("path")
          .data(json.features)
          .enter()
          .append("path")
          .attr("d", path)
          .style("stroke", "Black")
          .style("stroke-width", "1")
          .attr("class", function (d) {
            return "State";
          })
          .style("fill", function (d) {
            return ramp(d.properties.value);
          })
          .on("mouseover", function(){ d3.select(this).style("opacity","0.3")})
          .on("mouseleave", function(){ d3.select(this).style("opacity","1")})
          .on("click", function (data) {
            update_rbox(data);
          });
        // add a legend
        var w = 700,
          h = 50;

        var key = d3
          .select("body")
          .append("svg")
          .attr("width", w)
          .attr("height", h)
          .attr("class", "legend");
        
            
        
        var legend = key
          .append("defs")
          .append("svg:linearGradient")
          .attr("id", "gradient")
          .attr("x1", "0%")
          .attr("y1", "0%")
          .attr("x2", "100%")
          .attr("y2", "0%")
          .attr("spreadMethod", "pad");

        legend
          .append("stop")
          .attr("offset", "0%")
          .attr("stop-color", lowColor)
          .attr("stop-opacity", 1);

        legend
          .append("stop")
          .attr("offset", "100%")
          .attr("stop-color", highColor)
          .attr("stop-opacity", 1);

        key
          .append("rect")
          .attr("width", w - 100)
          .attr("height", h)
          .style("fill", "url(#gradient)")
          .attr("transform", "translate(40,10)");

        var y = d3
          .scaleLinear()
          .range([0, w - 100])
          .domain([minVal, maxVal]);

        var yAxis = d3.axisBottom(y);

        key
          .append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(40,10)")
          .call(yAxis);
      });
    });
  }

  svg.call(shootingBarTip);
  update_map();
  //await delay(1000)
  update("Cities");
};

window.onload = () => {
  loadVisualizations();
};
