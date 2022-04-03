import React, { Component } from 'react'
import Paper from '@mui/material/Paper';
import {
  ArgumentAxis,
  ValueAxis,
  Chart,
  LineSeries,
} from '@devexpress/dx-react-chart-material-ui';

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