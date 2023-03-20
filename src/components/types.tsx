

export interface DataRow {
    image_id: string;
    street: string;
    citi: string;
    n_citi: string;
    bed: number;
    bath: number;
    sqft: number;
    price: number;
    price_sqft: number;
    counts_locations: number;
    average_price_price_sqft: number;
  }

  export interface DataTableProps {
    data: DataRow[];
    apiKey: string;
    folderId: string;
    rowsPerPage: number;
    setRowsPerPage: React.Dispatch<React.SetStateAction<number>>
  }
  export interface GoogleDriveImageUrls {
    imageUrls: { [key: string]: string };
    nextPageToken?: string;
  }
  
  
  