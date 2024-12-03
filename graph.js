// Graph data
const data = {
    nodes: [
        { id: "Andy McCune", group: 1 },
        { id: "Mom", group: 2 },
        { id: "Dad", group: 2 },
        { id: "Alfonso Cobo", group: 3 },
        { id: "Lauren Piscione", group: 4 },
        { id: "Allie Fitzpatrick", group: 4 },
        { id: "Stacey McCune", group: 2 },
        { id: "Michael McCune", group: 2 },
        { id: "Benjamin McCune", group: 2 }
    ],
    links: [
        { source: "Andy McCune", target: "Mom", value: 1, relationship: "Family" },
        { source: "Andy McCune", target: "Dad", value: 1, relationship: "Family" },
        { source: "Andy McCune", target: "Alfonso Cobo", value: 2, relationship: "Business Partner (Unfold)" },
        { source: "Andy McCune", target: "Lauren Piscione", value: 3, relationship: "Professional Network" },
        { source: "Andy McCune", target: "Allie Fitzpatrick", value: 3, relationship: "Professional Network" },
        { source: "Andy McCune", target: "Stacey McCune", value: 1, relationship: "Family" },
        { source: "Stacey McCune", target: "Michael McCune", value: 1, relationship: "Family" },
        { source: "Stacey McCune", target: "Benjamin McCune", value: 1, relationship: "Family" }
    ]
};

// Set up the SVG container
const width = document.getElementById('relationship-graph').clientWidth;
const height = document.getElementById('relationship-graph').clientHeight;

const svg = d3.select("#relationship-graph")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Create a group for the graph
const g = svg.append("g");

// Add zoom behavior
const zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .on("zoom", (event) => {
        g.attr("transform", event.transform);
    });

svg.call(zoom);

// Create the force simulation
const simulation = d3.forceSimulation(data.nodes)
    .force("link", d3.forceLink(data.links).id(d => d.id).distance(100))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collision", d3.forceCollide().radius(50));

// Create the links
const link = g.append("g")
    .selectAll("line")
    .data(data.links)
    .join("line")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .attr("stroke-width", d => Math.sqrt(d.value));

// Create the nodes
const node = g.append("g")
    .selectAll("g")
    .data(data.nodes)
    .join("g")
    .call(drag(simulation));

// Add circles to nodes
node.append("circle")
    .attr("r", 20)
    .attr("fill", d => {
        switch(d.group) {
            case 1: return "#0984e3"; // Andy
            case 2: return "#00b894"; // Family
            case 3: return "#e17055"; // Business Partners
            case 4: return "#6c5ce7"; // Professional Network
            default: return "#636e72";
        }
    });

// Add labels to nodes
node.append("text")
    .text(d => d.id)
    .attr("x", 25)
    .attr("y", 5)
    .style("font-size", "12px")
    .style("font-weight", "bold");

// Add relationship labels
const linkLabels = g.append("g")
    .selectAll("text")
    .data(data.links)
    .join("text")
    .text(d => d.relationship)
    .attr("font-size", "10px")
    .attr("text-anchor", "middle")
    .attr("dy", -5);

// Update positions on each tick
simulation.on("tick", () => {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("transform", d => `translate(${d.x},${d.y})`);

    linkLabels
        .attr("x", d => (d.source.x + d.target.x) / 2)
        .attr("y", d => (d.source.y + d.target.y) / 2);
});

// Drag behavior
function drag(simulation) {
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
} 