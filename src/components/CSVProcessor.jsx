import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { UploadFile, Clear } from '@mui/icons-material';
import axios from 'axios';
import './CSVProcessor.css';

// FileUpload Component
const FileUpload = ({ onSuccess, onError }) => {
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    onError('');
    onSuccess(null);
  };

  const handleClearFile = () => {
    setFile(null);
    onError('');
    onSuccess(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    onError('');
    onSuccess(null);
    setLoading(true);

    try {
      if (!file) {
        throw new Error('Please select a CSV file');
      }

      if (!columns.trim()) {
        throw new Error('Please enter at least one column name');
      }

      const columnArray = columns
        .split(',')
        .map(col => col.trim())
        .filter(col => col);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('columns', JSON.stringify(columnArray));

      const response = await axios.post('http://localhost:8000/api/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onSuccess(response.data);
    } catch (err) {
      onError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadFile />}
          sx={{ minWidth: '180px' }}
        >
          Choose CSV File
          <input
            type="file"
            accept=".csv"
            hidden
            onChange={handleFileChange}
          />
        </Button>
        {file && (
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              {file.name}
            </Typography>
            <Tooltip title="Remove file">
              <IconButton size="small" onClick={handleClearFile}>
                <Clear fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      <TextField
        fullWidth
        label="Enter column names"
        value={columns}
        onChange={(e) => setColumns(e.target.value)}
        placeholder="e.g., first_name, last_name, email"
        helperText="Enter column names separated by commas"
        sx={{ mb: 3 }}
      />

      <Button
        type="submit"
        variant="contained"
        disabled={loading}
        sx={{ minWidth: '120px' }}
      >
        {loading ? <CircularProgress size={24} /> : 'Process CSV'}
      </Button>
    </Box>
  );
};

// Add this new component for token frequencies
const TokenFrequencies = ({ frequencies }) => {
  if (!frequencies || Object.keys(frequencies).length === 0) return null;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
        Token Frequencies
      </Typography>
      {Object.entries(frequencies).map(([column, tokens]) => (
        <Box key={column} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            {column}
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 2, boxShadow: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Token</TableCell>
                  <TableCell align="right">Frequency</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tokens.map((item, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{item.token}</TableCell>
                    <TableCell align="right">{item.frequency}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </Box>
  );
};

// ResultTable Component
const ResultTable = ({ data, error }) => {
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!data) return null;

  return (
    <Box>
      {data.failureCol.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Columns not found: {data.failureCol.join(', ')}
        </Alert>
      )}

      {data.successCol && Object.keys(data.successCol).length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            Preview Data
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 2, boxShadow: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  {Object.keys(data.successCol).map((column) => (
                    <TableCell key={column} sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                      {column}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[...Array(5)].map((_, rowIndex) => (
                  <TableRow key={rowIndex} hover>
                    {Object.values(data.successCol).map((columnData, colIndex) => (
                      <TableCell key={colIndex}>
                        {columnData[rowIndex] || ''}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <TokenFrequencies frequencies={data.tokenFrequencies} />
    </Box>
  );
};

// Main CSVProcessor Component
const CSVProcessor = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, color: 'primary.main' }}>
          CSV Column Viewer
        </Typography>

        <FileUpload 
          onSuccess={setData} 
          onError={setError}
        />

        <ResultTable 
          data={data} 
          error={error}
        />
      </Paper>
    </Container>
  );
};

export default CSVProcessor; 