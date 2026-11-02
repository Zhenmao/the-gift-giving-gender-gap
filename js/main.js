import barChart from "./bar-chart.js";
import groupedBarChart from "./grouped-bar-chart.js";
import butterflyBarChart from "./butterfly-bar-chart.js";
import gapChart from "./gap-chart.js";

Promise.all([
  d3.csv("data/relationships.csv", d3.autoType),
  d3.csv("data/factors.csv", d3.autoType),
  d3.csv("data/gifts.csv", d3.autoType),
]).then(([relationships, factors, gifts]) => {
  barChart({
    el: document.querySelector("#relationshipsOriginal"),
    data: relationships,
  });

  gapChart({
    el: document.querySelector("#relationshipsAlternative"),
    data: relationships,
  });

  groupedBarChart({
    el: document.querySelector("#factorsOriginal"),
    data: factors,
  });

  gapChart({
    el: document.querySelector("#factorsAlternative"),
    data: factors,
  });

  butterflyBarChart({
    el: document.querySelector("#giftsOriginal"),
    data: gifts,
  });

  gapChart({
    el: document.querySelector("#giftsAlternative"),
    data: gifts,
  });
});
