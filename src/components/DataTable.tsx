import React, { useState, useEffect, FunctionComponent,useCallback } from 'react';
import { DataTableProps } from './types';
import getGoogleDriveImageUrls from '../functions/GetGoogleImageDrive';
import {
  TableCell,
  TableRow,
  TableHead,
  TableBody,
  Table,
  TableContainer,
  TablePagination,
  TableFooter,
  TextField,
  TableSortLabel,
} from '@material-ui/core';
import { TablePaginationActions } from './TablePaginationActions';
import { DataRow } from './types';

const DataTable: FunctionComponent<DataTableProps> = ({
  data,
  apiKey,
  folderId,
  rowsPerPage,
  setRowsPerPage,
}) => {
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [selectedCity, setSelectedCity] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ field: keyof DataRow; order: 'asc' | 'desc' } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCity(event.target.value);
  };

  const handleSort = (field: keyof DataRow) => {
    let newOrder: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.field === field && sortConfig.order === 'asc') {
      newOrder = 'desc';
    }

    setSortConfig({ field, order: newOrder });
  };
  const sortedData = React.useMemo(() => {
    if (!sortConfig) {
      return data;
    }

    const sorted = [...data];
    sorted.sort((a: DataRow, b: DataRow) => {
      const aValue: string | number = a[sortConfig.field];
      const bValue: string | number = b[sortConfig.field];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.order === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return sorted;
  }, [data, sortConfig]);
  const filteredAndSlicedData = React.useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedData
      .filter((row) => (selectedCity ? row.citi.toLowerCase().includes(selectedCity.toLowerCase()) : true))
      .slice(start, end+1);
  }, [sortedData, selectedCity, currentPage, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setCurrentPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };
  

  const sortableFields: (keyof DataRow)[] = ['n_citi', 'bed', 'bath', 'sqft', 'price', 'price_sqft'];

  const fetchImageUrls = useCallback(async () => {
    setLoading(true); 
    // Get the imageIds from the filteredAndSlicedData and sort them by index
    const imageIds = filteredAndSlicedData
      .map((row) => row.image_id)
      .filter((id) => id !== undefined)
      .sort((a, b) => parseInt(a.split('.')[0], 10) - parseInt(b.split('.')[0], 10)) as string[];
  
    // Fetch the image URLs using the getGoogleDriveImageUrls function
    const { imageUrls } = await getGoogleDriveImageUrls(apiKey, folderId, imageIds);
  
    setLoading(false);
    setImageUrls(imageUrls);
  }, [filteredAndSlicedData, apiKey, folderId]);

  useEffect(() => {
    if (filteredAndSlicedData.length > 0 ) {
      fetchImageUrls();
    } else {
      setLoading(false);
    }
  }, [fetchImageUrls, filteredAndSlicedData]);
  return (
    <TableContainer style={{ maxWidth: '80%', margin: '0 auto' }}>
      <TextField
        label="Filter by City"
        value={selectedCity}
        onChange={handleCityChange}
        style={{ marginBottom: '16px' }}
      />
      <Table style={{ width: '100%' }}>
        <TableHead>
          <TableRow>
            {[
              { header: 'Street', field: 'street', minWidth: '8%' },
              { header: 'City', field: 'citi', minWidth: '8%' },
              { header: 'n_city', field: 'n_citi', minWidth: '8%' },
              { header: 'Bed', field: 'bed', minWidth: '8%' },
              { header: 'Bath', field: 'bath', minWidth: '8%' },
              { header: 'Sqft', field: 'sqft', minWidth: '8%' },
              { header: 'Price', field: 'price', minWidth: '8%' },
              { header: 'Price/Sqft', field: 'price_sqft', minWidth: '8%' },
              { header: 'Counts Locations', field: 'counts_locations', minWidth: '8%' },
              { header: 'Avg Price/Sqft', field: 'average_price_price_sqft', minWidth: '8%' },
              { header: 'Image', field: 'image_id', minWidth: '20%' },
            ].map(({ header, field }) => (
              <TableCell key={header}>
                {sortableFields.includes(field as keyof DataRow) ? (
                  <TableSortLabel
                    active={sortConfig?.field === field}
                    direction={sortConfig?.order || 'asc'}
                    onClick={() => handleSort(field as keyof DataRow)}
                  >
                    {header}
                  </TableSortLabel>
                ) : (
                  header
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredAndSlicedData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.street}</TableCell>
              <TableCell>{row.citi}</TableCell>
              <TableCell>{row.n_citi}</TableCell>
              <TableCell>{row.bed}</TableCell>
              <TableCell>{row.bath}</TableCell>
              <TableCell>{row.sqft}</TableCell>
              <TableCell>{row.price}</TableCell>
<TableCell>{row.price_sqft}</TableCell>
<TableCell>{row.counts_locations}</TableCell>
<TableCell>{row.average_price_price_sqft}</TableCell>
<TableCell>
  {loading ? (
    'Loading...'
  ) : imageUrls[`${row.image_id}.jpg`] ? (
    <img src={imageUrls[`${row.image_id}.jpg`]} alt={`Property ${index}`} style={{ width: '100%' }} />
  ) : (
    'No Image'
  )}
</TableCell>
</TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
              colSpan={11}
              count={data.length}
              rowsPerPage={rowsPerPage}
              page={currentPage - 1}
              SelectProps={{
                inputProps: { 'aria-label': 'rows per page' },
                native: true,
              }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
};

export default DataTable;



