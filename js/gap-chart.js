import { wrap } from "./helpers.js";

export default function gapChart({ el, data }) {
  ///////////////////////////////////////////////////////////
  //// Setup ////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////
  const tickPadding = 8;
  const labelPadding = 4;
  const labelWidth = 16;
  const circleRadius = 7;
  const marginTop = 0;
  const marginRight = 0;
  const marginBottom = 0;
  const marginLeft = 240;
  const width = 600;
  const rowHeight = 24;
  const rowGap = 8;
  const height =
    marginTop + marginBottom + (rowHeight + rowGap) * data.length - rowGap;

  const x1Accessor = (d) => d["Men"];
  const x2Accessor = (d) => d["Women"];
  const yAccessor = (d) => d["Response label"];

  const x1Color = "var(--color-men)";
  const x2Color = "var(--color-women)";

  const formatValue = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format;

  const [xMin, xMax] = d3.extent([
    ...data.map(x1Accessor),
    ...data.map(x2Accessor),
  ]);
  const xScale = d3
    .scaleLinear()
    .domain([xMin, xMax])
    .range([
      marginLeft + labelWidth + labelPadding + circleRadius,
      width - marginRight - (labelWidth + labelPadding + circleRadius),
    ]);

  const yScale = d3
    .scaleBand()
    .domain(data.map(yAccessor))
    .range([marginTop, height - marginBottom])
    .paddingOuter(0)
    .paddingInner(rowGap / (rowGap + rowHeight));

  ///////////////////////////////////////////////////////////
  //// Render ///////////////////////////////////////////////
  ///////////////////////////////////////////////////////////
  const svg = d3
    .select(el)
    .classed("chart", true)
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height]);

  //// Y axis ///////////////////////////////////////////////
  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${marginLeft},0)`)
    .selectChildren()
    .data(yScale.domain())
    .join("text")
    .attr("text-anchor", "end")
    .attr("dominant-baseline", "central")
    .attr("x", -tickPadding)
    .attr("y", (d) => yScale(d) + rowHeight / 2)
    .text((d) => d)
    .call(wrap, { width: marginLeft - tickPadding });

  //// Rows /////////////////////////////////////////////////
  const rowsData = data.map((d) => {
    const dots = [
      {
        value: x1Accessor(d),
        color: x1Color,
        cx: xScale(x1Accessor(d)),
      },
      {
        value: x2Accessor(d),
        color: x2Color,
        cx: xScale(x2Accessor(d)),
      },
    ].sort((a, b) => d3.ascending(a.value, b.value));
    dots[0].sign = -1;
    dots[1].sign = 1;

    const yOffsetNeeded = dots[1].cx - dots[0].cx < circleRadius / 2;
    dots[0].cy = yOffsetNeeded ? circleRadius / 2 : 0;
    dots[1].cy = yOffsetNeeded ? -circleRadius / 2 : 0;

    return {
      data: d,
      dots,
    };
  });

  const rowG = svg
    .append("g")
    .attr("class", "rows")
    .selectChildren()
    .data(rowsData)
    .join("g")
    .attr("class", "row")
    .attr(
      "transform",
      (d) => `translate(0,${yScale(yAccessor(d.data)) + rowHeight / 2})`,
    );

  rowG
    .append("line")
    .attr("class", "anchor-line")
    .attr("x1", xScale.range()[0])
    .attr("x2", xScale.range()[1]);

  rowG
    .append("line")
    .attr("class", "connector-line")
    .attr("x1", (d) => d.dots[0].cx)
    .attr("y1", (d) => d.dots[0].cy)
    .attr("x2", (d) => d.dots[1].cx)
    .attr("y2", (d) => d.dots[1].cy);

  const dotG = rowG
    .selectChildren(".dot")
    .data((d) => d.dots)
    .join("g")
    .attr("class", "dot");

  dotG
    .append("circle")
    .attr("class", "dot__circle")
    .attr("r", circleRadius)
    .attr("cx", (d) => d.cx)
    .attr("cy", (d) => d.cy)
    .attr("fill", (d) => d.color);

  dotG
    .append("text")
    .attr("class", "dot__value")
    .attr("dominant-baseline", "central")
    .attr("text-anchor", (d) => (d.sign === -1 ? "end" : "start"))
    .attr("x", (d) => d.cx + (circleRadius + labelPadding) * d.sign)
    .attr("y", (d) => d.cy)
    .text((d) => formatValue(d.value));
}
