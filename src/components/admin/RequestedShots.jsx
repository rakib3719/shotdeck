'use client'
import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useGetRequestedShotQuery } from '@/redux/api/shot';
import Image from 'next/image';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { useSecureAxios } from '@/utils/Axios';
import Button from '@mui/material/Button';
import Swal from 'sweetalert2';

function Row({ row }) {
  const [open, setOpen] = React.useState(false);
  const axiosInstance = useSecureAxios();
  const { refetch } = useGetRequestedShotQuery();

 const handleStatusChange = async (newStatus) => {
    try {
      // Show confirmation dialog
      const result = await Swal.fire({
        title: `Are you sure you want to ${newStatus} this?`,
        text: `${newStatus === 'approved' ? 'This shot will be approved' : 'This shot will be rejected'}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: newStatus === 'approved' ? '#3085d6' : '#d33',
        cancelButtonColor: '#aaa',
        confirmButtonText: `Yes, ${newStatus} it!`,
        cancelButtonText: 'Cancel',
        reverseButtons: true
      });

      if (result.isConfirmed) {
        // Show loading
       Swal.fire({
          title: 'Processing...',
          allowOutsideClick: false,
          didOpen: () => {
           Swal.showLoading();
          }
        });

        const resp = await axiosInstance.patch(`/shot/update-status/${row._id}`, { 
          status: newStatus 
        });
        
        // Close loading
       Swal.close();
        
        // Show success
       Swal.fire({
          title: 'Success!',
          text: `Shot has been ${newStatus}`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });

        refetch();
      }
    } catch (error) {
     Swal.close();
     Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to update status',
        icon: 'error'
      });
    }
  };

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} className='bg-primary  hover:bg-blue-600 transition-colors'>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            sx={{ color: 'white' }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ color: 'white' }}>
          {row.imageUrl && (
            <div className="relative w-16 h-16 rounded-md overflow-hidden">
              <Image
                src={row.imageUrl}
                alt={row.title}
                fill
                className="object-cover"
              />
            </div>
          )}
        </TableCell>
        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{row.title}</TableCell>
        <TableCell sx={{ color: 'white' }}>{row.director}</TableCell>
        <TableCell sx={{ color: 'white' }}>{row.cinematographer}</TableCell>
        <TableCell sx={{ color: 'white' }}>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange('active');
              }}
              disabled={row.status === 'active'}
              sx={{ 
                color: 'white',
                fontWeight: 'bold',
                textTransform: 'none'
              }}
            >
              Approve
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange('rejected');
              }}
              disabled={row.status === 'rejected'}
              sx={{ 
                color: 'white',
                fontWeight: 'bold',
                textTransform: 'none'
              }}
            >
              Reject
            </Button>
          </Stack>
        </TableCell>
      </TableRow>
      {/* Rest of your row implementation remains the same */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6} className='bg-blue-50'>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div" className="text-blue-800">
                Shot Details
              </Typography>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column */}
                <div>
                  <Typography variant="subtitle1" className="font-bold text-blue-700">Description</Typography>
                  <Typography paragraph className="text-gray-700">{row.description}</Typography>
                  
                  <Typography variant="subtitle1" className="font-bold text-blue-700 mt-4">Technical Details</Typography>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Format:</span>
                      <span className="text-gray-800 font-medium">{row.format}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frame Size:</span>
                      <span className="text-gray-800 font-medium">{row.frameSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Aspect Ratio:</span>
                      <span className="text-gray-800 font-medium">{row.aspectRatio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Media Type:</span>
                      <span className="text-gray-800 font-medium">{row.mediaType}</span>
                    </div>
                  </div>
                </div>
                
                {/* Right Column */}
                <div>
                  <Typography variant="subtitle1" className="font-bold text-blue-700">Creative Details</Typography>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Genre:</span>
                      <div className="flex flex-wrap gap-1">
                        {row?.genre?.map((g, i) => (
                          <Chip key={i} label={g} size="small" className="bg-blue-100 text-blue-800" />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Color Style:</span>
                      <div className="flex flex-wrap gap-1">
                        {row.color?.map((c, i) => (
                          <Chip key={i} label={c} size="small" className="bg-purple-100 text-purple-800" />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Period:</span>
                      <span className="text-gray-800 font-medium">{row.timePeriod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Release Year:</span>
                      <span className="text-gray-800 font-medium">{row.releaseYear}</span>
                    </div>
                  </div>
                  
                  {row.youtubeLink && (
                    <>
                      <Typography variant="subtitle1" className="font-bold text-blue-700 mt-4">Video Link</Typography>
                      <a 
                        href={row.youtubeLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Watch Video
                      </a>
                    </>
                  )}
                </div>
              </div>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" className="font-bold text-blue-700">Production Team</Typography>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                <div>
                  <Typography className="text-gray-600">Director</Typography>
                  <Typography className="text-gray-800 font-medium">{row.director}</Typography>
                </div>
                <div>
                  <Typography className="text-gray-600">Cinematographer</Typography>
                  <Typography className="text-gray-800 font-medium">{row.cinematographer}</Typography>
                </div>
                <div>
                  <Typography className="text-gray-600">Production Designer</Typography>
                  <Typography className="text-gray-800 font-medium">{row.productionDesigner}</Typography>
                </div>
              </div>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

// Rest of your component remains the same

Row.propTypes = {
  row: PropTypes.object.isRequired,
};

export default function CollapsibleTable() {
  const { data, isLoading, error, refetch } = useGetRequestedShotQuery();

  const reqData = data?.data;
  console.log(reqData, 'this is -.**') 
  

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error loading data</div>;

  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        bgcolor: 'transparent',
        boxShadow: '0 4px 20px rgba(0, 120, 255, 0.1)',
        borderRadius: '12px',
        overflow: 'hidden'
 
      }}
    >
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow className="bg-gradient-to-r from-blue-600 to-blue-500">
            <TableCell sx={{ color: 'white', width: '50px' }} />
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Thumbnail</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Title</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Director</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cinematographer</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reqData.map((row, idx) => (
            <Row key={idx} row={row} />
          ))}
        </TableBody>
      </Table>
      
      {reqData.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          No shot requests found
        </div>
      )}
    </TableContainer>
  );
}