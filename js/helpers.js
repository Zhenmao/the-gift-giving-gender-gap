// Modified from https://observablehq.com/@jtrim-ons/svg-text-wrapping
export function wrap(
  text,
  { width, lineHeightEms = 1.1, centerVertically = true },
) {
  text.each(function () {
    const text = d3.select(this);
    const x = text.attr("x");
    const y = text.attr("y");

    const words = [];
    text
      .text()
      .split(/\s+/)
      .forEach((w) => words.push(w + " "));

    text.text(null); // Empty the text element

    let tspan = text.append("tspan"); // The tspan element that is currently being added to
    let line = ""; // The current value of the line
    let prevLine = ""; // The value of the line before the last word was added
    let nWordsInLine = 0; // Number of words in the line
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      prevLine = line;
      line += word;
      ++nWordsInLine;
      tspan.text(line.trim());
      if (tspan.node().getComputedTextLength() > width && nWordsInLine > 1) {
        // The tspan is too long, and it contains more than one word.
        // Remove the last word and add it to a new tspan.
        tspan.text(prevLine.trim());
        prevLine = "";
        line = word;
        nWordsInLine = 1;
        tspan = text.append("tspan").text(word.trim());
      }
    }

    const tspans = text.selectAll("tspan");
    tspans.each(function (_, i) {
      // Calculate the y offset (dy) for each tspan so that the vertical centre
      // of the tspans roughly aligns with the text element's y position.
      let dy = i * lineHeightEms;
      if (centerVertically) dy -= ((tspans.size() - 1) * lineHeightEms) / 2;
      d3.select(this)
        .attr("y", y)
        .attr("x", x)
        .attr("dy", dy + "em");
    });
  });
}
