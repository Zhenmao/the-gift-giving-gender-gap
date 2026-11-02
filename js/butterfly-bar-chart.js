import { wrap } from "./helpers.js";

export default function butterflyBarChart({ el, data }) {
  ///////////////////////////////////////////////////////////
  //// Setup ////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////
  const tickPadding = 8;
  const labelPadding = 4;
  const marginTop = 0;
  const marginRight = 0;
  const marginBottom = 0;
  const marginLeft = 240;
  const width = 600;
  const barHeight = 24;
  const barGap = 8;
  const columnGap = 0;
  const height =
    marginTop + marginBottom + (barHeight + barGap) * data.length - barGap;

  const x1Accessor = (d) => d["Men"];
  const x2Accessor = (d) => d["Women"];
  const yAccessor = (d) => d["Response label"];

  const x1Color = "var(--color-men)";
  const x2Color = "var(--color-women)";

  const formatValue = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format;

  const x1Max = d3.max(data, x1Accessor);
  const x2Max = d3.max(data, x2Accessor);
  const xMax = d3.max([x1Max, x2Max]);
  const unitWidth =
    (width - marginLeft - marginRight - columnGap) / (x1Max + x2Max);
  const xScale = d3
    .scaleLinear()
    .domain([0, xMax])
    .range([0, xMax * unitWidth]);

  const yScale = d3
    .scaleBand()
    .domain(data.map(yAccessor))
    .range([marginTop, height - marginBottom])
    .paddingOuter(0)
    .paddingInner(barGap / (barGap + barHeight));

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
    .attr("y", (d) => yScale(d) + barHeight / 2)
    .text((d) => d)
    .call(wrap, { width: marginLeft - tickPadding });

  //// Bars /////////////////////////////////////////////////
  const rowG = svg
    .append("g")
    .attr("class", "rows")
    .selectChildren()
    .data(data)
    .join("g")
    .attr("class", "row")
    .attr("transform", (d) => `translate(0,${yScale(yAccessor(d))})`);

  const barG = rowG
    .selectChildren()
    .data((d) => [
      {
        value: x1Accessor(d),
        color: x1Color,
        x: marginLeft + xScale(x1Max),
        sign: -1,
      },
      {
        value: x2Accessor(d),
        color: x2Color,
        x: marginLeft + xScale(x1Max) + columnGap,
        sign: 1,
      },
    ])
    .join("g")
    .attr("class", "bar")
    .attr("transform", (d) => `translate(${d.x},0)`);

  barG
    .append("rect")
    .attr("class", "bar__rect")
    .attr("height", barHeight)
    .attr("x", (d) => (d.sign === -1 ? xScale(d.value) * d.sign : 0))
    .attr("width", (d) => xScale(d.value))
    .attr("fill", (d) => d.color);

  barG
    .append("text")
    .attr("class", "bar__value")
    .attr("text-anchor", (d) => (d.sign === -1 ? "end" : "start"))
    .attr("dominant-baseline", "central")
    .attr("y", barHeight / 2)
    .text((d) => formatValue(d.value))
    .each(function (d) {
      const textWidth = this.getBBox().width;
      const availableWidth = xScale(d.value) - labelPadding * 2;
      const outside = textWidth > availableWidth;
      d3.select(this).attr(
        "x",
        outside
          ? (xScale(d.value) + labelPadding) * d.sign
          : labelPadding * d.sign,
      );
    });
}
