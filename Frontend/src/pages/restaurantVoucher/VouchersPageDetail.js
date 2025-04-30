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
import { useState, useEffect } from "react";
import "./VouchersPageDetail.css";
import axios from "axios";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

const API_URL = "http://localhost:5000/api/vouchers";

function VouchersPageDetail({ voucherType, voucherId, onBack }) {

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
        Cell: `
          white-space: normal;
          word-break: break-word;
          overflow-wrap: break-word;
        `,
    };
    const theme = useTheme(THEME)

    const [details, setDetails] = useState([]);
    useEffect(() => {
      const fetchDetails = async () => {
          try {
              const response = await axios.get(`${API_URL}/voucher_detail/${voucherId}`);
              setDetails(Array.isArray(response.data) ? response.data : [response.data]);
          } catch (error) {
              console.error("Error fetching voucher details:", error);
          }
      };
    
      fetchDetails();
    }, [voucherId]);

    const [vouchers, setVouchers] = useState([]);
    useEffect(() => {
      const fetchCollector = async () => {
        try {
          const response = await axios.get(`${API_URL}/collector/${voucherId}`); // your endpoint
          setVouchers(response.data); // assume it includes populated collector
        } catch (err) {
          console.error("Error fetching vouchers:", err);
        }
      };
    
      fetchCollector();
    }, [voucherId]);

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
                        <Table data={{ nodes: details }}
                            theme={theme}
                            style={{marginLeft: "10px"}}
                        >
                        {(tableList) => (
                        <>
                            <Header>
                                <HeaderRow sx={{ position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 1 }}>
                                    <HeaderCell>Code</HeaderCell>
                                    <HeaderCell>Name</HeaderCell>
                                    <HeaderCell>In stock</HeaderCell>
                                    <HeaderCell>Description</HeaderCell>
                                    <HeaderCell>Release day</HeaderCell>
                                    <HeaderCell>Expiration day</HeaderCell>
                                    <HeaderCell>State</HeaderCell>
                                </HeaderRow>
                            </Header>
                    
                            <Body>
                                {tableList.map((data, index) => (
                                    <Row key={data.id} data={data}>
                                    <Cell>{data.code}</Cell>
                                    <Cell>{data.name}</Cell>
                                    <Cell>{data.quantity}</Cell>
                                    <Cell>{data.description}</Cell>
                                    <Cell>{data.release_day}</Cell>
                                    <Cell>{data.expire_day}</Cell>
                                    <Cell>
                                        {data.status === "available" ? (
                                            <Chip label={data.status} color="success" />
                                        ) : ( <Chip label={data.status} color="error" />)}
                                    </Cell>
                                    </Row>
                                ))}
                            </Body>
                        </>
                        )}
                        </Table>
                    </Box>
                    <Box>
                      <Typography variant="h6" style={{marginLeft: "10px", padding: "10px", fontWeight: "bold"}}>Collectors</Typography>
                    {vouchers.map((voucher) => (
                      <List key={voucher._id} sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar alt={voucher.username} src={voucher.username} />
                          </ListItemAvatar>
                          <ListItemText
                            primary={voucher.username}
                          />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </List>
                    ))}
                    </Box>
                </div>
        </div>
    );
}

export default VouchersPageDetail