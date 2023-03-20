import React, { useState } from 'react';
import { VerticalBarSeries, VerticalGridLines, HorizontalGridLines, XAxis, YAxis, FlexibleWidthXYPlot } from 'react-vis';
import { DataRow } from './types';

interface BarChartProps {
  data: DataRow[];
  xAxisTitle: string;
  yAxisTitle: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, xAxisTitle, yAxisTitle }) => {
  const cityCounts = data.reduce((acc, row) => {
    const cityName = row.citi;
    if (!acc[cityName]) {
      acc[cityName] = 0;
    }
    acc[cityName] += row.counts_locations;
    return acc;
  }, {} as Record<string, number>);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const cityCountData = Object.keys(cityCounts)
    .map(cityName => ({ x: cityName, y: cityCounts[cityName] }));

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = cityCountData.slice(startIndex, endIndex);

  const pageCount = Math.ceil(cityCountData.length / itemsPerPage);

  const handlePrevClick = () => {
    setCurrentPage(prevPage => prevPage - 1);
  };

  const handleNextClick = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  return (
    <div className="BarChart" style={{ position: 'relative' }}>
      <FlexibleWidthXYPlot xType="ordinal" height={500} margin={{ left: 100, right: 50, bottom: 100 }}>
        <VerticalGridLines />
        <HorizontalGridLines />
        <XAxis tickLabelAngle={-45} style={{ fontSize: 12 }} />
        <YAxis style={{ fontSize: 12 }} />
        <VerticalBarSeries barWidth={0.5} data={pageData} />
      </FlexibleWidthXYPlot>

      <div className="pagination" style={{  bottom: 0 }}>
        <button onClick={handlePrevClick} disabled={currentPage === 1}>
          Prev
        </button>
        <button onClick={handleNextClick} disabled={currentPage === pageCount}>
          Next
        </button>
      </div>
    </div>
  );
};

export default BarChart;
