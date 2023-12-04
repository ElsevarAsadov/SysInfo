import React, { useEffect, useRef } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';

const CanvasJS = CanvasJSReact.CanvasJS;
const CanvasJSChart = CanvasJSReact.CanvasJSChart;
const updateInterval = 500;

const Test = () => {
  const chartRef = useRef(null);

  const updateChart = () => {
    const dpsColor = [];
    let dpsTotal = 0;
    let deltaY, yVal;
    const dps = chartRef.current.options.data[0].dataPoints;
    const chart = chartRef.current;

    for (let i = 0; i < dps.length; i++) {
      deltaY = Math.round(2 + Math.random() * (-2 - 2));
      yVal = deltaY + dps[i].y > 0 ? (deltaY + dps[i].y < 100 ? dps[i].y + deltaY : 100) : 0;
      dpsColor[i] = yVal >= 90 ? "#e40000" : yVal >= 70 ? "#ec7426" : yVal >= 50 ? "#81c2ea" : "#88df86";
      dps[i] = { label: "Core " + (i + 1), y: yVal, color: dpsColor[i] };
      dpsTotal += yVal;
    }

    chart.options.data[0].dataPoints = dps;
    chart.options.title.text = "CPU Usage " + Math.round(dpsTotal / 6) + "%";
    chart.render();
  };

  useEffect(() => {
    const intervalId = setInterval(updateChart, updateInterval);
    return () => clearInterval(intervalId);
  }, []);

  const options = {
    theme: "dark2",
    title: {
      text: "CPU Usage",
    },
    subtitles: [{
      text: "Intel Core i7 980X @ 3.33GHz",
    }],
    data: [{
      type: "column",
      yValueFormatString: "#,###'%'",
      indexLabel: "{y}",
      dataPoints: [
        { label: "Core 1", y: 68 },
        { label: "Core 2", y: 3 },
        { label: "Core 3", y: 8 },
        { label: "Core 4", y: 87 },
        { label: "Core 5", y: 2 },
        { label: "Core 6", y: 6 },
      ],
    }],
    height: 200,
    backgroundColor: "transparent",
    grid: null,
  };

  return (
    <div>
      <CanvasJSChart options={options} onRef={ref => (chartRef.current = ref)} />
      {/* You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods */}
    </div>
  );
};

export default Test;
