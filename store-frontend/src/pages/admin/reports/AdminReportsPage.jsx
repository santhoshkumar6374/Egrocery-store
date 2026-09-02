import { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import SalesReportTab from './SalesReportTab';
import BestSellingReportTab from './BestSellingReportTab';
import RevenueReportTab from './RevenueReportTab';
import CustomerPurchaseReportTab from './CustomerPurchaseReportTab';

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

const TODAY = new Date();
const THIRTY_DAYS_AGO = new Date(TODAY.getTime() - 29 * 24 * 60 * 60 * 1000);

export default function AdminReportsPage() {
  const [tab, setTab] = useState('sales');
  const [from, setFrom] = useState(toISODate(THIRTY_DAYS_AGO));
  const [to, setTo] = useState(toISODate(TODAY));

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Reports
      </Typography>

      <Tabs value={tab} onChange={(_e, v) => setTab(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile sx={{ mb: 3 }}>
        <Tab label="Sales" value="sales" />
        <Tab label="Best Sellers" value="best-selling" />
        <Tab label="Revenue" value="revenue" />
        <Tab label="Customer Purchases" value="customers" />
      </Tabs>

      {tab === 'sales' && <SalesReportTab from={from} to={to} setFrom={setFrom} setTo={setTo} />}
      {tab === 'best-selling' && <BestSellingReportTab from={from} to={to} setFrom={setFrom} setTo={setTo} />}
      {tab === 'revenue' && <RevenueReportTab from={from} to={to} setFrom={setFrom} setTo={setTo} />}
      {tab === 'customers' && <CustomerPurchaseReportTab from={from} to={to} setFrom={setFrom} setTo={setTo} />}
    </Box>
  );
}