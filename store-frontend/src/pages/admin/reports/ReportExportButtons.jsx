import { useState } from 'react';
import { Stack, Button, CircularProgress } from '@mui/material';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import { downloadBlob } from '../../../utils/downloadFile';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMessage } from '../../../utils/apiError';

export default function ReportExportButtons({ exportFn, params, filenameBase }) {
  const { showToast } = useToast();
  const [downloading, setDownloading] = useState(null);

  const handleExport = async (format) => {
    setDownloading(format);
    try {
      const { data } = await exportFn({ ...params, format });
      const extension = format === 'EXCEL' ? 'xlsx' : 'pdf';
      downloadBlob(data, `${filenameBase}.${extension}`);
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not generate that export'), 'error');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Stack direction="row" spacing={1.5}>
      <Button
        variant="outlined"
        size="small"
        startIcon={downloading === 'PDF' ? <CircularProgress size={14} /> : <DownloadOutlinedIcon />}
        onClick={() => handleExport('PDF')}
        disabled={Boolean(downloading)}
      >
        PDF
      </Button>
      <Button
        variant="outlined"
        size="small"
        startIcon={downloading === 'EXCEL' ? <CircularProgress size={14} /> : <DownloadOutlinedIcon />}
        onClick={() => handleExport('EXCEL')}
        disabled={Boolean(downloading)}
      >
        Excel
      </Button>
    </Stack>
  );
}