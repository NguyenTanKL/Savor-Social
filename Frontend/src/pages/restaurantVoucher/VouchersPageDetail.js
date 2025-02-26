import React from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField'
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import FastfoodIcon from '@mui/icons-material/Fastfood';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import CoffeeIcon from '@mui/icons-material/Coffee';
import { Table, Row, Header, HeaderCell, HeaderRow, Body, Cell } from "@table-library/react-table-library";
import { useTheme } from "@table-library/react-table-library/theme";
import { styled } from '@mui/material/styles';
import "./VouchersPageDetail.css";

function VouchersPageDetail({ voucherType, onBack }) {
    const voucherData = {
        voucherTet: [
            {
                id: "1",
                code: "01",
                name: "Voucher Tết",
                description: "Giảm 50%",
                release_day: "20/01/2025",
                expiration_day: "09/02/2025",
                state: "Đã sử dụng",
                by: "_nguyentan",
            },
            {
                id: '2',
                code: "02",
                name: "Voucher Tết",
                description: "Giảm 50%",
                release_day: "20/01/2025",
                expiration_day: "09/02/2025",
                state: "Đã thu thập",
                by: "_nguyentan",
            },
            {
                id: "3",
                code: "03",
                name: "Voucher Tết",
                description: "Giảm 50%",
                release_day: "20/01/2025",
                expiration_day: "09/02/2025",
                state: "Chưa thu thập",
                by: "",
            }
        ],
        voucherChrist: [
            {
                id: "1",
                code: "01",
                name: "Voucher giáng sinh",
                description: "Giảm 50%",
                release_day: "20/12/2024",
                expiration_day: "26/12/2024",
                state: "Đã sử dụng",
                by: "_nguyentan",
            },
            {
                id: '2',
                code: "02",
                name: "Voucher giáng sinh",
                description: "Giảm 50%",
                release_day: "20/12/2024",
                expiration_day: "26/12/2024",
                state: "Đã sử dụng",
                by: "_nguyentan",
            },
            {
                id: "3",
                code: "03",
                name: "Voucher giáng sinh",
                description: "Giảm 50%",
                release_day: "20/12/2024",
                expiration_day: "26/12/2024",
                state: "Đã thu thập",
                by: "_nguyentan",
            }
        ],
        voucherVal: [
            {
                id: "1",
                code: "01",
                name: "Voucher Valentine",
                description: "Giảm 50%",
                release_day: "12/02/2025",
                expiration_day: "16/02/2025",
                state: "Đã sử dụng",
                by: "_nguyentan",
            },
            {
                id: '2',
                code: "02",
                name: "Voucher Valentine",
                description: "Giảm 50%",
                release_day: "12/02/2025",
                expiration_day: "16/02/2025",
                state: "Đã sử dụng",
                by: "_nguyentan",
            },
            {
                id: "3",
                code: "03",
                name: "Voucher Valentine",
                description: "Giảm 50%",
                release_day: "12/02/2025",
                expiration_day: "16/02/2025",
                state: "Đã thu thập",
                by: "_nguyentan",
            }
        ]
    };
    const vouchers = voucherData[voucherType] || [];

    const THEME = {
        Table: `
        --data-table-library_grid-template-columns:  30% repeat(2, minmax(0, 1fr)) 25% 100px;
        `,
        Header: ``,
        Body: ``,
        BaseRow: `
          background-color: var(--theme-ui-colors-background);
      
          &.row-select-selected, &.row-select-single-selected {
            background-color: var(--theme-ui-colors-background-secondary);
            color: var(--theme-ui-colors-text);
          }
        `,
        HeaderRow: `
          font-size: 15px;
          color: var(--theme-ui-colors-text-light);
      
          .th {
            border-bottom: 1px solid var(--theme-ui-colors-border);
          }
        `,
        Row: `
          font-size: 15px;
          color: var(--theme-ui-colors-text);
      
          &:not(:last-of-type) .td {
            border-bottom: 1px solid var(--theme-ui-colors-border);
          }
      
          &:hover {
            color: var(--theme-ui-colors-text-light);
          }
        `,
        BaseCell: `
          border-bottom: 1px solid transparent;
          border-right: 1px solid transparent;
      
          padding: 8px;
          height: 52px;
      
          svg {
            fill: var(--theme-ui-colors-text);
          }
        `,
        HeaderCell: ``,
        Cell: ``,
    };
    const theme = useTheme(THEME)

    return (
        <div className="voucherlistpage">
            <Button style={{marginLeft: "10px"}} variant="outlined" onClick={onBack}>Back</Button>
                <div>
                    <div style={{marginLeft: "20px", padding: "10px", textAlign: "center"}}>
                        <TextField id="outlined-basic" size="small" label="Search" variant="outlined" style={{width: "400px", marginRight: "10px"}}/>
                        <Button variant="outlined" startIcon={<FastfoodIcon />} color="dark" style={{marginRight: "10px"}}> Food </Button>
                        <Button variant="outlined" startIcon={<CoffeeIcon />} color="dark" style={{marginRight: "10px"}}> Drink </Button>
                        <Button variant="outlined" startIcon={<SwapVertIcon />} color="dark" style={{marginRight: "10px"}}> Sort by date </Button>
                    </div>
                    <Box sx={{ maxHeight: "320px", overflowY: "auto" }}>
                        <Table data={{ nodes: vouchers }}
                            theme={theme}
                            style={{marginLeft: "10px"}}
                        >
                        {(tableList) => (
                        <>
                            <Header>
                                <HeaderRow sx={{ position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 1 }}>
                                    <HeaderCell>Code</HeaderCell>
                                    <HeaderCell>Name</HeaderCell>
                                    <HeaderCell>Description</HeaderCell>
                                    <HeaderCell>Release day</HeaderCell>
                                    <HeaderCell>Expiration day</HeaderCell>
                                    <HeaderCell>State</HeaderCell>
                                    <HeaderCell>By</HeaderCell> 
                                </HeaderRow>
                            </Header>
                    
                            <Body>
                                {tableList.map((data, index) => (
                                    <Row key={data.id} data={data}>
                                    <Cell>{data.code}</Cell>
                                    <Cell>{data.name}</Cell>
                                    <Cell>{data.description}</Cell>
                                    <Cell>{data.release_day}</Cell>
                                    <Cell>{data.expiration_day}</Cell>
                                    <Cell>
                                        {data.state === "Đã sử dụng" ? (
                                            <Chip label={data.state} color="success" />
                                        ) : data.state === "Đã thu thập" ? (
                                            <Chip label={data.state} color="warning" />
                                        ) : (<Chip label={data.state} color="error" />)}
                                        
                                    </Cell>
                                    <Cell>{data.by}</Cell>
                                    </Row>
                                ))}
                            </Body>
                        </>
                        )}
                        </Table>
                    </Box>
                </div>
        </div>
    );
}

export default VouchersPageDetail