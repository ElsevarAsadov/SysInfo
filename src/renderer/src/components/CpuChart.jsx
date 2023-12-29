import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import SystemInformationService from "../../../services/systemInformationService";

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
        data: [0, 0, 0],
        backgroundColor: '#d3cdcd',
      },
    ],
  });

  useEffect(() => {
      // re-render data
    const intervalId = setInterval(() => {
        SystemInformationService.getCpuTemprature().then(x=>setData(c=>{
            return {...c, datasets:[{data:x.cores, backgroundColor: "#d3cdcd"}]}
        }))
    }, 2000);



    return () => clearInterval(intervalId);
  }, []);

  return <Bar  options={ options } data={data} />

}

