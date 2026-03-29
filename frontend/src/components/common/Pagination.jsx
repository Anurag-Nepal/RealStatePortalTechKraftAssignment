import React from 'react';
import { Box, Pagination as MuiPagination, Typography, MenuItem, Select, FormControl } from '@mui/material';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 12,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  itemsPerPageOptions = [6, 12, 24, 48],
  size = "medium"
}) => {
  const handlePageChange = (event, value) => {
    if (onPageChange && value !== currentPage) {
      onPageChange(value);
    }
  };

  const handleItemsPerPageChange = (event) => {
    const newItemsPerPage = event.target.value;
    if (onItemsPerPageChange && newItemsPerPage !== itemsPerPage) {
      onItemsPerPageChange(newItemsPerPage);
    }
  };

  
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  
  if (totalItems === 0 || totalPages <= 1) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        py: 3,
        px: 1
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        flexDirection: { xs: 'column', sm: 'row' }
      }}>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ whiteSpace: 'nowrap' }}
        >
          Showing {startItem}-{endItem} of {totalItems.toLocaleString()} items
        </Typography>

        {showItemsPerPage && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
              Items per page:
            </Typography>
            <FormControl size="small" variant="outlined">
              <Select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                sx={{
                  minWidth: 70,
                  '& .MuiSelect-select': {
                    py: 0.5,
                    fontSize: '0.875rem'
                  }
                }}
              >
                {itemsPerPageOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </Box>

      <MuiPagination
        count={totalPages}
        page={currentPage}
        onChange={handlePageChange}
        size={size}
        color="primary"
        shape="rounded"
        showFirstButton
        showLastButton
        sx={{
          '& .MuiPagination-ul': {
            justifyContent: 'center'
          }
        }}
      />
    </Box>
  );
};

export default Pagination;
