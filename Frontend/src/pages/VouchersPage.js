import React from "react";
import "./VouchersPage.css";
import HeaderProfile from "../components/HeaderProfile";
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
const columns = [
    { field: 'code', headerName: 'Code', width: 70 },
    { field: 'name', headerName: 'Name', width: 130 },
    { field: 'description', headerName: 'Description', width: 130 },
    {
      field: 'releaseDate',
      headerName: 'Release Date',
      type: 'number',
      width: 90,
    },
    {
      field: 'expirationDate',
      headerName: 'Expiration Date',
      width: 160,
    },
    {
        field: 'station',
        headerName: 'Station',
        width: 160,
    },
    {
        field:'by',
        headerName: 'By',
        with:150,
    }
  ];
  
  const rows = [
    { id: 1, code:'ABCD' ,name: 'Voucher Tết',description:'Giảm 50%', releaseDate: '20/11/2024', expirationDate: '10/1/2025', station:'Đã sử dụng',by:'Huy Thái' },
    { id: 2, code:'ABDF',name: 'Voucher Tết',description:'Giảm 50%', releaseDate: '20/11/2024', expirationDate: '10/1/2025', station:'Đã sử dụng',by:'Huy Thái' },
    { id: 3, code:'ABFG', name: 'Voucher Tết',description:'Giảm 50%', releaseDate: '20/11/2024', expirationDate: '10/1/2025', station:'Đã sử dụng',by:'Huy Thái' },
    
  ];
  
  const paginationModel = { page: 0, pageSize: 5 };
  
function VouchersPage() {
    const userData = {
        name: 'Hadilao.vn',
        job: 'Nhà hàng lẩu Hadilao',
        followers: 1234,
        following: 567,
        posts: 9,
        socialLinks: [
            { platform: 'Facebook', url: 'https://facebook.com/username' },
            { platform: 'Twitter', url: 'https://twitter.com/username' },
            { platform: 'LinkedIn', url: 'https://linkedin.com/in/username' }
        ]
    };
    return(
        <div>
            <HeaderProfile user={userData}/>
            <Paper sx={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    initialState={{ pagination: { paginationModel } }}
                    pageSizeOptions={[5, 10]}
                    checkboxSelection
                    sx={{ border: 0 }}
                />
            </Paper>
        </div>
    )
}
export default VouchersPage