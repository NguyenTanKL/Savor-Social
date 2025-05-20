import React from "react";
import {  useNavigate,useParams } from "react-router-dom";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField'
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Grid2 from "@mui/material/Grid";
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
import { format } from 'date-fns';
import { BACKENDURL } from "../../utils/const";
const API_URL = `${BACKENDURL}/api/vouchers`;

function VouchersPageDetail({ voucherType, voucherId, onBack }) {
    const navigate = useNavigate();
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

    const handleProfile = (user_id) => {
        navigate(`/profile/${user_id}`);
    };

    return (
        <div className="voucherlistpage">
          <Box sx={{ px: { xs: 2, sm: 4 }, py: 2 }}>
            <Button variant="outlined" onClick={onBack} sx={{ mb: 2 }}>
              Back
            </Button>

            {/* Responsive Grid Container */}
            <Grid2 container spacing={2}>
              {/* Table Section */}
              <Grid2 item xs={12} md={8}>
                <Box sx={{ maxHeight: "320px", overflowY: "auto", overflowX: "auto", bgcolor: "#fff", borderRadius: 1, boxShadow: 1 }}>
                  <Table data={{ nodes: details }} theme={theme}>
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
                            <HeaderCell>Status</HeaderCell>
                          </HeaderRow>
                        </Header>

                        <Body>
                          {tableList.map((data) => (
                            <Row key={data.id} data={data}>
                              <Cell>{data.code}</Cell>
                              <Cell>{data.name}</Cell>
                              <Cell>{data.in_stock}</Cell>
                              <Cell>{data.description}</Cell>
                              <Cell>{format(new Date(data.release_day), 'dd/MM/yyyy')}</Cell>
                              <Cell>{format(new Date(data.expire_day), 'dd/MM/yyyy')}</Cell>
                              <Cell>
                                {data.status === "available" ? (
                                  <Chip label={data.status} color="success" />
                                ) : (
                                  <Chip label={data.status} color="error" />
                                )}
                              </Cell>
                            </Row>
                          ))}
                        </Body>
                      </>
                    )}
                  </Table>
                </Box>
              </Grid2>

              {/* Collectors Section */}
              <Grid2 item xs={12} md={4}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                  Collectors
                </Typography>
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                  {vouchers.map((voucher) => (
                    <React.Fragment key={voucher._id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar alt={voucher.username} src={voucher.avatar} onClick={() => handleProfile(voucher._id)}/>
                        </ListItemAvatar>
                        <ListItemText primary={voucher.username} onClick={() => handleProfile(voucher._id)}/>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </Grid2>
            </Grid2>
          </Box>
        </div>
    );
}

export default VouchersPageDetail