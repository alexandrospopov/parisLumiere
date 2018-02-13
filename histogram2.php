<!DOCTYPE html>
<head>
    <meta charset="utf-8">
    <script src="https://d3js.org/d3.v4.min.js"></script>
    <style>
        body {
            font-family:"avenir next", Arial, sans-serif;
            font-size: 12px;
            color: #696969;
        }

        .ticks {
            font-size: 10px;
        }

        .track,
        .track-inset,
        .track-overlay {
            stroke-linecap: round;
        }

        .track {
            stroke: #dcdcdc;
            stroke-width: 10px;
        }

        .track-inset {
            stroke: #dcdcdc;
            stroke-width: 8px;
        }

        .track-overlay {
            pointer-events: stroke;
            stroke-width: 50px;
            stroke: transparent;
            cursor: crosshair;
        }

        .handle {
            fill: #fff;
            stroke: #000;
            stroke-opacity: 0.5;
            stroke-width: 1.25px;
        }
    </style>
</head>


<script>
    var margin = {top:30, right:50, bottom:0, left:50},
        width = 500 - margin.left - margin.right,
        height = 160 - margin.top - margin.bottom;

    var histHeight = height*0.7;

    var format = d3.timeParse("%Y-%m-%d");

    var formatDateIntoYear = d3.timeFormat("%Y");

    var startDate = new Date("2016-01-01"),
        endDate = new Date("2017-01-01");

    var dateArray = d3.timeMonth(startDate, endDate);

    var colours = d3.scaleOrdinal()
        .domain(dateArray)
        .range(['#ffc388','#ffb269','#ffa15e','#fd8f5b','#f97d5a','#f26c58','#e95b56','#e04b51','#d53a4b','#c92c42','#bb1d36','#ac0f29','#9c0418','#8b0000']);

    // x scale for time
    var x = d3.scaleTime()
        .domain([startDate, endDate])
        .range([0, width])
        .clamp(true);

    // y scale for histogram
    var y = d3.scaleLinear()
        .range([histHeight, 0]);


    ////////// histogram set up //////////

    // set parameters for histogram
    var histogram = d3.histogram()
        .value(function(d) { return d.date; })
        .domain(x.domain())
        .thresholds(x.ticks(d3.timeMonth));

    var histo = d3.histogram()
        .value(function(d) { return format(d.fields.date_debut); })
        .domain(x.domain())
        .thresholds(x.ticks(d3.timeMonth));

    var svg = d3.select("#vis")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var hist = svg.append("g")
        .attr("class", "histogram")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    ////////// plot set up //////////

    var dataset;

    var plot = svg.append("g")
        .attr("class", "plot")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    ////////// load data //////////

    d3.json("data/tournagesdefilmsparis2011.json",function(error,data){
        if (error) throw error;
        // Checking
        console.log(data[1500].recordid)
        console.log(format(data[1500].fields.date_debut))
        var m=format(data[1500].fields.date_debut).getDate();
        console.log(m)
        var bins = histo(data);

        y.domain([0, d3.max(bins, function(d) { return d.length; })]);

        var bar = hist.selectAll(".bar")
            .data(bins)
            .enter()
            .append("g")
            .attr("class", "bar")
            .attr("transform", function(d) {
                return "translate(" + x(d.x0) + "," + y(d.length) + ")";
            });

        bar.append("rect")
            .attr("class", "bar")
            .attr("x", 1)
            .attr("width", function(d) { return x(d.x1) - x(d.x0) - 1; })
            .attr("height", function(d) { return histHeight - y(d.length); })
            .attr("fill", function(d) { return colours(d.x0); });

        bar.append("text")
            .attr("dy", ".75em")
            .attr("y", "6")
            .attr("x", function(d) { return (x(d.x1) - x(d.x0))/2; })
            .attr("text-anchor", "middle")
            .text(function(d) { if (d.length>15) { return d.length; } })
            .style("fill", "white");

        dataset=data
        //drawPlot(dataset);

    });

    var slider = svg.append("g")
        .attr("class", "slider")
        .attr("transform", "translate(" + margin.left + "," + (margin.top+histHeight+5) + ")");

    slider.append("line")
        .attr("class", "track")
        .attr("x1", x.range()[0])
        .attr("x2", x.range()[1])
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-inset")
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-overlay")
        .call(d3.drag()
            .on("start.interrupt", function() { slider.interrupt(); })
            .on("start drag", function() {
                currentValue = d3.event.x;
                update(x.invert(currentValue));
            })
        );

    var lMonths=['Jan','Fev','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'];


    slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate("+ - 35+"," + 18 + ")")
        .selectAll("text")
        .data(lMonths)
        .enter()
        .append("text")
        .attr("x", function (d,i) {
            return i*71+74
        })
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .text(function(d,i) { return d });

    var handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9);

/*
    function drawPlot(data) {
        var locations = plot.selectAll(".location")
            .data(data, function(d) { return d.recordid; });

        // if filtered dataset has more circles than already existing, transition new ones in
        locations.enter()
            .append("circle")
            .attr("class", "location")
            .attr("cx", function(d) { return format(d.fields.date_debut).getMonth()*71+35+(-15)+format(d.fields.date_debut).getDate(); })
            .style("fill", function(d) { return colours(d3.timeMonth(format(d.fields.date_debut))); })
            //.style("stroke", function(d) { return colours(d3.timeYear(d.date)); })
            .style("opacity", 0.3)
            .attr("r", 5)
            .attr("cy", function(d) { return Math.random()*((height/2+150)-(height/2-150))+(height/2-150); })
            .transition()
            .duration(400)
            .attr("cy", function(d) { return (d.fields.ardt-75000)/20*((height/2+150)-(height/2-150))+(height/2-150); })
;
        // if filtered dataset has less circles than already existing, remove excess
        locations.exit()
            .remove();
    }*/



    function update(h) {
        handle.attr("cx", x(h));

        // filter data set and redraw plot
        var newData = dataset.filter(function(d) {
            return format(d.fields.date_debut) < h;
        });
        //drawPlot(newData);

        // histogram bar colours
        d3.selectAll(".bar")
            .attr("fill", function(d) {
                if (d.x0 < h) {
                    return colours(d.x0);
                } else {
                    return "#eaeaea";
                }
            })
    }




</script>