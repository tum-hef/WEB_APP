import React, { Component } from 'react'
import Paper from '@mui/material/Paper';
import {
  ArgumentAxis,
  ValueAxis,
  Chart,
  LineSeries,
} from '@devexpress/dx-react-chart-material-ui';

// Fake data for teting purpose only
const data = [
  { argument: 1, value: 10 },
  { argument: 2, value: 20 },
  { argument: 3, value: 30 },
];

type LineChartProps = {
  url: string, 
}

class LineChart extends Component<LineChartProps> {
  getDatastreams(){
    // A function that retrives all datastreams of the given server
  }

  getObservations(datastream: string){
    // A function that GETs all observations for a given datastream
  }

  render(){
    return(
      <Paper>
        <Chart
          data={data}
        >
          <ArgumentAxis />
          <ValueAxis />
  
          <LineSeries 
            name ="DataStream 1"
            valueField="value" 
            argumentField="argument" 
          />
        </Chart>
      </Paper>
    )
  }
}

export default LineChart