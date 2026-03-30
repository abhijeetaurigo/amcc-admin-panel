import { Box, Button, InputAdornment, Stack, TextField } from '@mui/material';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import type { ReactNode } from 'react';

export type SearchFilterBarProps = {
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  filters?: ReactNode;
  actions?: ReactNode;
};

export function SearchFilterBar({
  searchValue,
  searchPlaceholder = 'Search',
  onSearchChange,
  filters,
  actions,
}: SearchFilterBarProps) {
  return (
    <Box
      sx={{
        p: { xs: 1.25, md: 1.1 },
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        gap={1}
        alignItems={{ xs: 'stretch', lg: 'center' }}
      >
        <Box sx={{ flex: { xs: '1 1 100%', lg: '0 1 380px' }, minWidth: 0 }}>
          <TextField
            fullWidth
            size="small"
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder={searchPlaceholder}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        {filters ? (
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', flex: '0 0 auto' }}>{filters}</Box>
        ) : null}
        <Box sx={{ flex: 1 }} />
        {actions ?? (
          <Button
            variant="outlined"
            startIcon={<FilterListRoundedIcon />}
            size="small"
            sx={{ minWidth: 102, borderRadius: 1 }}
          >
            Filters
          </Button>
        )}
      </Stack>
    </Box>
  );
}
