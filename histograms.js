var margin = {top:20, right:50, bottom:0, left:20},
        width = 600 - margin.left - margin.right,
        height = 560 - margin.top - margin.bottom;

    var histHeight = 90;
    var histHeight1 = 90;

    var format = d3.timeParse("%Y-%m-%d");

    var formatDateIntoYear = d3.timeFormat("%Y");

    var startDate = new Date("2016-01-01"),
        endDate = new Date("2017-01-01");

    var dateArray = d3.timeMonth(startDate, endDate);

    var colours = d3.scaleOrdinal()
        .domain(dateArray)
        .range(["#6f63bb","#8a60b0","#ba43b4","#c7519c","#d63a3a","#ff7f0e","#ffaa0e","#bcbd22","#78a641","#2ca030","#12a2a8","#1f83b4"]);

    // xTime scale for time
    var xTime = d3.scaleTime()
        .domain([startDate, endDate])
        .range([0, width])
        .clamp(true);

    // y scale for histogram
    var y = d3.scaleLinear()
        .range([histHeight+110, 110]);

    // x scale for time
    var x1 = d3.scaleLinear()
        .domain([0,10])
        .range([0, width]);

    // y scale for histogram
    var y1 = d3.scaleLinear()
        .range([histHeight1, 0]);

    var svg = d3.select("#vis")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);


    ////////// histogramNote set up //////////

    // set parameters for histogram
    var histo1 = d3.histogram()
        .value(function(d) { return d.fields.note; })
        .domain(x1.domain())
        .thresholds(x1.ticks(10));;
    
    var brush1 = d3.brushX()
        .extent([[margin.left, margin.top],[width+margin.left, margin.top+histHeight1]])
        .on("start", brushstart1)
        .on("brush", brushmove1)
        .on("end", brushend1);
        

    var gBrush1 = svg.append("h")
        .attr("class", "brush")
        .call(brush1);

    ////////// histogramTime set up //////////

    // set parameters for histogramTime
    var histoTime = d3.histogram()
        .value(function(d) { return format(d.fields.date_debut); })
        .domain(xTime.domain())
        .thresholds(xTime.ticks(d3.timeMonth));

    var histTime = svg.append("g")
        .attr("class", "histogram")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var brushTime = d3.brushX()
        .extent([[margin.left, 110+margin.top],[width+margin.left, 110+margin.top+histHeight]])
        .on("start", brushstartTime)
        .on("brush", brushmoveTime)
        .on("end", brushendTime);
    
    var gBrushTime = svg.append("h")
        .attr("class", "brush")
        .call(brushTime);


    ////////// plot set up //////////

    var dataset = [];

    var plot = svg.append("g")
        .attr("class", "plot")
        .attr("transform", "translate(" + margin.left + "," + 110 + ")");


    ////////// load data //////////

    d3.json("data/dataCompleteFilms.json",function(error,data){
        if (error) throw error;
        // Checking
        var data_triee = data.filter(function(d) {
            console.log();
            return (d.fields.note >= 0);
        });

        var bins1 = histo1(data_triee);
        var bins = histoTime(data_triee);

        y.domain([0, d3.max(bins, function(d) { return d.length; })]);
        
            var lNotes=['NaN',1,2,3,4,5,6,7,8,9,10];
        
            var note1 = histTime.selectAll(".note1")
            .data(lNotes)
            .enter()
            .append("text")
            .attr("class", "note1")
            .attr("transform", function(d,i) {
                return "translate(" + (i*52.5) + "," + (histHeight1+11) + ")";
            })
            .text(function(d){return d;})
            .style ("font-size","11px")
            .style ("fill","grey")
            .style ("font-weight","bold")
            ;
        
            var lMonths=['Jan','Fev','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'];
        
            var mois = histTime.selectAll(".mois")
            .data(lMonths)
            .enter()
            .append("text")
            .attr("class", "mois")
            .attr("transform", function(d,i) {
                return "translate(" + (i*44+12) + "," + ((-30)+d3.max(bins, function(d) { return d.length; }))  + ")";
            })
            .text(function(d){return d;})
            .style ("font-size","11px")
            .style ("fill","grey")
            .style ("font-weight","bold")
            ;
        
            var legende = histTime.selectAll(".legende")
            .data(lMonths)
            .enter()
            .append("text")
            .attr("class", "legend")
            .attr("transform", function(d) {
                return "translate(" + 0 + "," + ((-0)+d3.max(bins, function(d) { return d.length; }))  + ")";
            })
            .text("Visualisation de la répartition des tournages suivant les arrondissements")
            .style ("font-size","15px")
            .style ("fill","grey")
            .style ("font-weight","bold")
            ;
        
            var larrondi=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
            var arrondissements = histTime.selectAll(".arrondissements")
            .data(larrondi)
            .enter()
            .append("text")
            .attr("class", "legend")
            .attr("transform", function(d) { console.log(d);
                return "translate(" + (-15) + "," + (d/22*(300)+(height/2)+(-15))  + ")";
            })
            .text(function(d){return d;})
            .style ("font-size","11px")
            .style ("fill","grey")
            .style ("font-weight","bold")
            ;

        var bar = histTime.selectAll(".barTime")
            .data(bins)
            .enter()
            .append("g")
            .attr("class", "barTime")
            .attr("transform", function(d) {
                return "translate(" + xTime(d.x0) + "," + y(d.length) + ")";
            });

        bar.append("rect")
            .attr("class", "barTime")
            .attr("x", 1)
            .attr("width", function(d) { return xTime(d.x1) - xTime(d.x0) - 1; })
            .attr("height", function(d) { return 110 + histHeight - y(d.length); })
            .attr("fill", function(d) { return colours(d.x0); });

        bar.append("text")
            .attr("dy", ".75em")
            .attr("y", "6")
            .attr("x", function(d) { return (xTime(d.x1) - xTime(d.x0))/2; })
            .attr("text-anchor", "middle")
            .text(function(d) { if (d.length>15) { return d.length; } })
            .style("fill", "white");
        
        
        y1.domain([0, d3.max(bins1, function(d) { return d.length; })]);

        var bar1 = histTime.selectAll(".barNote")
            .data(bins1)
            .enter()
            .append("g")
            .attr("class", "barNote")
            .attr("transform", function(d) {
                return "translate(" + x1(d.x0) + "," + y1(d.length) + ")";
            });

        bar1.append("rect")
            .attr("class", "barNote")
            .attr("x", 1)
            .attr("width", function(d) { return x1(d.x1) - x1(d.x0)-1; })
            .attr("height", function(d) { return histHeight1 - y1(d.length); })
            .attr("fill", function(d){return colours(d.x0)});

        bar1.append("text")
            .attr("dy", ".75em")
            .attr("y", "6")
            .attr("x", function(d) { return (x1(d.x1) - x1(d.x0))/2; })
            .attr("text-anchor", "middle")
            .text(function(d) { if (d.length>15) { return d.length; } })
            .style("fill", "white");
        
        
        dataset=data_triee
        drawPlot(data_triee);

    });

    function plotCirclesMap(date){console.log("waiting for definition")};
    
    function update(dmin,dmax, nmin, nmax, dataset) {
        // filter data set and redraw plot
        var newData = dataset.filter(function(d) {
            return (d.fields.note >= nmin) && (d.fields.note < nmax) && (format(d.fields.date_debut) < dmax) && (format(d.fields.date_debut) > dmin);
        });
        drawPlot(newData);
        // histogram bar colours
        d3.selectAll(".barTime")
            .attr("fill", function(d) {
                if ((d.x0 < dmax) && (d.x0 >= dmin)) {
                    return colours(d.x0);
                } else {
                    return "#eaeaea";
                }
            })
        console.log(nmax);
        console.log(nmin);
        d3.selectAll(".barNote")
            .attr("fill", function(d) {
                if ((d.x0 < nmax) && (d.x0 >= nmin)) {
                    return colours(d.x0);
                } else {
                    return "#eaeaea";
                }
            })
        plotCirclesMap(newData);
    }



    var lMonths=['Jan','Fev','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'];
    
    
    var brushgTime = svg.append("g")
        .attr("class", "brush")
        .call(brushTime);

    var minNote=0;
    var maxNote=10;

    brushgTime.call(brushTime.move, [xTime(startDate)+margin.left, xTime(endDate)+margin.left]);

    brushstartTime();
    brushmoveTime();
    
    var min=margin.left;
    var max=width+margin.left;

    function brushstartTime() {

    }

    function brushmoveTime() {  
        var p = d3.brushSelection(brushgTime.node()),
        s = p.map(xTime.invert);
        startDate=xTime.invert(p[0]-margin.left);
        endDate=xTime.invert(p[1]-margin.left);
        update(startDate,endDate,minNote,maxNote,dataset);
    }

    function brushendTime() {

    }

    console.log("bonjouuuur");


    console.log("bonjouuuur");

    var brushg1 = svg.append("g")
        .attr("class", "brush")
        .call(brush1);

    brushg1.call(brush1.move,[x1(minNote)+margin.left, x1(maxNote)+margin.left]);

    brushstart1();
    brushmove1();
    
    function brushstart1() {

    }

    function brushmove1() {
        var p = d3.brushSelection(brushg1.node()),
        s = p.map(x1.invert);
        minNote=x1.invert(p[0]-margin.left);
        maxNote=x1.invert(p[1]-margin.left);
        update(startDate,endDate,minNote,maxNote,dataset);
    }

    function brushend1() {

    }



    function drawPlot(data) {
        var locations = plot.selectAll(".location")
            .data(data, function(d) { return d.recordid; });

        // if filtered dataset has more circles than already existing, transition new ones in
        locations.enter()
            .append("circle")
            .attr("class", "location")
            .attr("cx", function(d) { return format(d.fields.date_debut).getMonth()*45+(-0)+format(d.fields.date_debut).getDate(); })
            .style("fill", function(d) { return colours(d3.timeMonth(format(d.fields.date_debut))); })
            //.style("stroke", function(d) { return coloursDate(d3.timeYear(d.date)); })
            .style("opacity", 0.3)
            .attr("r", 4)
            .attr("cy", function(d) { return Math.random()*((height/2+150)-(height/2-150))+(height/2-108); })
            .transition()
            .duration(400)
            .attr("cy", function(d) { return (d.fields.ardt-75000)/22*((height/2+150)-(height/2-150))+(height/2-108); });

        

        // if filtered dataset has less circles than already existing, remove excess
        locations.exit()
            .remove();
    }



