import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, } from 'chart.js';
import { Bar } from 'react-chartjs-2';

//plugins see chartjs docs I do not have any clue wtf happens here :)))
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const options = {
  responsive: true,
  plugins: {
    legend: false,
  },
  maintainAspectRatio: false, //important
};

const labels = ['Core 1', 'Core 2',  'Core 3',];

export default function CpuChart() {
  const [data, setData] = useState({
    labels,
    datasets: [
      {
        data: [69, 69, 69],
        backgroundColor: '#d3cdcd',
      },
    ],
  });

  useEffect(() => {
    // re-render data
    const intervalId = setInterval(() => {
      setData((prevData) => (
        {
          ...prevData,

        datasets: prevData.datasets.map((dataset) => ({
          ...dataset,
          data: dataset.data.map(() => Math.random()),
        }
        )),

      }
      ));
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  return <Bar  options={ options } data={data} />

}

