// Load the data
const iris = d3.csv("iris.csv");

// Once the data is loaded, proceed with plotting
iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // Define the dimensions and margins for the SVG
    let widthScatter = 600,
        heightScatter = 400;
  
    let marginScatter = {
        top: 30,
        bottom: 50,
        left: 50,
        right: 30
    }

    // Create the SVG container for scatter plot
    let scatterSvg = d3.select('#scatterplot')
                .append('svg')
                .attr('width', widthScatter)
                .attr('height', heightScatter)
                .style('background', 'lightblue');

    // Set up scales for x and y axes for scatter plot
    let xScaleScatter = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalLength) - 1, d3.max(data, d => d.PetalLength) + 1])
        .range([marginScatter.left, widthScatter - marginScatter.right]);

    let yScaleScatter = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalWidth) - 1, d3.max(data, d => d.PetalWidth) + 1])
        .range([heightScatter - marginScatter.bottom, marginScatter.top]);

    const colorScale = d3.scaleOrdinal()
        .domain([...new Set(data.map(d => d.Species))])
        .range(d3.schemeCategory10);

    // Add axes to the scatter plot SVG
    scatterSvg.append("g")
       .attr("transform", `translate(0,${heightScatter - marginScatter.bottom})`)
       .call(d3.axisBottom(xScaleScatter))
       .append("text")
       .attr("x", (widthScatter - marginScatter.left - marginScatter.right) / 2 + marginScatter.left)
       .attr("y", marginScatter.bottom - 10)
       .attr("fill", "black")
       .attr("text-anchor", "middle")
       .text("Petal Length");

    scatterSvg.append("g")
       .attr("transform", `translate(${marginScatter.left},0)`)
       .call(d3.axisLeft(yScaleScatter))
       .append("text")
       .attr("transform", "rotate(-90)")
       .attr("x", -(heightScatter - marginScatter.top - marginScatter.bottom) / 2 - marginScatter.top)
       .attr("y", -marginScatter.left + 15)
       .attr("fill", "black")
       .attr("text-anchor", "middle")
       .text("Petal Width");

    // Add circles for each data point in scatter plot
    scatterSvg.selectAll("circle")
       .data(data)
       .enter()
       .append("circle")
       .attr("cx", d => xScaleScatter(d.PetalLength))
       .attr("cy", d => yScaleScatter(d.PetalWidth))
       .attr("r", 5)
       .attr("fill", d => colorScale(d.Species));

    // Add legend to scatter plot
    const scatterLegend = scatterSvg.selectAll(".legend")
        .data(colorScale.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${widthScatter - marginScatter.right - 100}, ${marginScatter.top + i * 20})`);

    // Add legend circles
    scatterLegend.append("circle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", 5)
          .attr("fill", colorScale);

    // Add legend text
    scatterLegend.append("text")
          .attr("x", 10)
          .attr("y", 5)
          .attr("fill", "black")
          .text(d => d);




    // Define the dimensions and margins for the boxplot SVG
    let widthBox = 600,
        heightBox = 400;
  
    let marginBox = {
        top: 30,
        bottom: 50,
        left: 50,
        right: 30
    }

    // Create the SVG container for the box plot
    let boxplotSvg = d3.select('#boxplot')
                .append('svg')
                .attr('width', widthBox)
                .attr('height', heightBox)
                .style('background', 'lightyellow');

    // Set up scales for x and y axes for box plot
    let yScaleBox = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.PetalLength) + 1])
        .range([heightBox - marginBox.bottom, marginBox.top]);

    let xScaleBox = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Species))])
        .range([marginBox.left, widthBox - marginBox.right])
        .padding(0.5);

    // Add axes to the box plot SVG
    boxplotSvg.append("g")
       .attr("transform", `translate(0,${heightBox - marginBox.bottom})`)
       .call(d3.axisBottom(xScaleBox))
       .append("text")
       .attr("x", (widthBox - marginBox.left - marginBox.right) / 2 + marginBox.left)
       .attr("y", marginBox.bottom - 10)
       .attr("fill", "black")
       .attr("text-anchor", "middle")
       .text("Species");

    boxplotSvg.append("g")
       .attr("transform", `translate(${marginBox.left},0)`)
       .call(d3.axisLeft(yScaleBox))
       .append("text")
       .attr("transform", "rotate(-90)")
       .attr("x", -(heightBox - marginBox.top - marginBox.bottom) / 2 - marginBox.top)
       .attr("y", -marginBox.left + 15)
       .attr("fill", "black")
       .attr("text-anchor", "middle")
       .text("Petal Length");

    // Define a function to calculate quartiles and other metrics
    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.PetalLength).sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const iqr = q3 - q1;
        const min = Math.max(q1 - 1.5 * iqr, d3.min(values));
        const max = Math.min(q3 + 1.5 * iqr, d3.max(values));
        return { q1, median, q3, min, max };
    };

    // Group data by species and calculate quartiles
    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.Species);

    // Draw the boxplot for each species
    quartilesBySpecies.forEach((quartiles, species) => {
        const x = xScaleBox(species);
        const boxWidth = xScaleBox.bandwidth();

        // Draw the vertical line from min to max
        boxplotSvg.append("line")
           .attr("x1", x + boxWidth / 2)
           .attr("x2", x + boxWidth / 2)
           .attr("y1", yScaleBox(quartiles.min))
           .attr("y2", yScaleBox(quartiles.max))
           .attr("stroke", "black");

        // Draw the box from q1 to q3
        boxplotSvg.append("rect")
           .attr("x", x)
           .attr("y", yScaleBox(quartiles.q3))
           .attr("width", boxWidth)
           .attr("height", yScaleBox(quartiles.q1) - yScaleBox(quartiles.q3))
           .attr("fill", "#69b3a2")
           .attr("stroke", "black");

        // Draw the horizontal line for the median
        boxplotSvg.append("line")
           .attr("x1", x)
           .attr("x2", x + boxWidth)
           .attr("y1", yScaleBox(quartiles.median))
           .attr("y2", yScaleBox(quartiles.median))
           .attr("stroke", "black");
    });
});
