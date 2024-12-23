'use client'

import React, { useState, useEffect } from 'react';
import getAllUrlsService from '@/lib/getAllUrlsService';  
import Table from '@/components/Table/Table';   
import Pagination from '@/components/Pagination/Pagination';  
import PageSize from '@/components/Pagesize/Pagesize';   
import Filter from '@/components/filter/filter';
import DownloadCsv from '@/components/DownloadComponents/DownloadComponents';
const GetAllUrls = () => {
  const [urls, setUrls] = useState([]);  
  const [currentPage, setCurrentPage] = useState(1);   
  const [pageSize, setPageSize] = useState(4);  
  const [totalCount, setTotalCount] = useState(0);  
  const [allData,setAllData] = useState(null);
 

  const [filters, setFilters] = useState({
    username: '',
    shortUrl: '',
    actualUrl: '',
    fromClicksLeft: null,
    toClicksLeft: null,
    fromTotalClicks: null,
    toTotalClicks: null,
    isCustom: null,  
  });

  const [applyFilters, setApplyFilters] = useState(false);

   
  const fetchUrls = async (filters = {}) => {
    try {
      const { data, totalCount } = await getAllUrlsService(currentPage, pageSize, filters);
      const getAllData = await getAllUrlsService(1,1000,{});
      setAllData(getAllData.data);
      setUrls(data);
      setTotalCount(totalCount);
      
    } catch (error) {
      console.error('Error fetching URLs:', error);
    }
  };

  // Effect hook to fetch URLs on page size or page number change
  useEffect(() => {
    fetchUrls(filters); 
  }, [currentPage, pageSize]); // Only run fetch on page size and page change, not on filter change directly.

  // Effect hook to fetch URLs when filters are applied
  useEffect(() => {
    if (applyFilters) {
      fetchUrls(filters); 
      setApplyFilters(false); // Reset the applyFilters state to avoid multiple requests
    }
  }, [applyFilters, filters]); // Fetch URLs when filters are applied

  const tableHeaders = ['Sr. No.', 'Username', 'Short URL', 'Actual URL', 'Is Custom', 'Total Clicks', 'Clicks Left'];

  // Format data for the table
  const tableData = urls.map((url, index) => ({
    srNo: (currentPage - 1) * pageSize + index + 1, // Calculating serial number
    username: url.username,
    shortUrl: url.shortUrl,
    actualUrl: url.actualUrl,
    isCustom: url.isCustom ? 'True' : 'False',
    totalClicks: url.totalClicks,
    clicksLeft: url.clicksLeft,
  }));

  // Handle filter input changes
  const handleFilterChange = (attribute, value) => {
    setFilters(prev => ({
      ...prev,
      [attribute]: value
    }));
  };

  // Apply filters (only fetch data after clicking the button)
  const handleApplyFilters = () => {
    setApplyFilters(true);  
  };

  // Remove filters and reset state
  const handleRemoveFilters = () => {
    setFilters({
      username: '',
      shortUrl: '',
      actualUrl: '',
      fromClicksLeft: null,
      toClicksLeft: null,
      fromTotalClicks: null,
      toTotalClicks: null,
      isCustom: null, // Reset isCustom filter to null
    });
    setApplyFilters(false);  
    fetchUrls();  
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);   
  };

  const clicksLeftOptions = [
    { label: '1-10', value: '1-10' },
    { label: '10-100', value: '10-100' },
    { label: '100-1000', value: '100-1000' },
    { label: '>1000', value: '>1000' }
  ];

  const totalClicksOptions = [
    { label: '1-10', value: '1-10' },
    { label: '10-100', value: '10-100' },
    { label: '100-1000', value: '100-1000' },
    { label: '>1000', value: '>1000' }
  ];

  // Handle range filter changes (for Clicks Left and Total Clicks)
  const handleRangeFilterChange = (type, range) => {
    let from = null, to = null;

    switch(range) {
      case '1-10':
        from = 1; to = 10;
        break;
      case '10-100':
        from = 10; to = 100;
        break;
      case '100-1000':
        from = 100; to = 1000;
        break;
      case '>1000':
        from = 1000; to = null;
        break;
      default:
        break;
    }

    if (type === 'clicksLeft') {
      setFilters(prev => ({
        ...prev,
        fromClicksLeft: from,
        toClicksLeft: to
      }));
    } else if (type === 'totalClicks') {
      setFilters(prev => ({
        ...prev,
        fromTotalClicks: from,
        toTotalClicks: to
      }));
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="admin-urls-container min-h-screen bg-gradient-to-r from-blue-500 to-teal-500 text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-white">All URLs</h1>

      {/* Common Container for Everything */}
      <div className="w-full max-w-6xl bg-white p-6 rounded-lg shadow-lg mb-8">
        {/* Filters Row */}
        <div className="flex flex-wrap justify-start gap-4 items-center mb-6">
          <Filter 
            label="Username" 
            attribute="username" 
            value={filters.username} 
            onFilterChange={handleFilterChange} 
          />
          <Filter 
            label="Short URL" 
            attribute="shortUrl" 
            value={filters.shortUrl} 
            onFilterChange={handleFilterChange} 
          />
          <Filter 
            label="Actual URL" 
            attribute="actualUrl" 
            value={filters.actualUrl} 
            onFilterChange={handleFilterChange} 
          />
          
          <div className="flex flex-col items-start gap-1 text-xs">
            <label htmlFor="clicksLeft" className="font-medium text-gray-600 text-[10px]">Clicks Left:</label>
            <select
              id="clicksLeft"
              value={filters.fromClicksLeft && filters.toClicksLeft ? `${filters.fromClicksLeft}-${filters.toClicksLeft}` : ''}
              onChange={(e) => handleRangeFilterChange('clicksLeft', e.target.value)}
              className="w-32 p-1 text-[10px] text-black border border-gray-300 rounded bg-gray-50 focus:border-teal-500 focus:outline-none"
            >
              <option value="">Select Range</option>
              {clicksLeftOptions.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col items-start gap-1 text-xs">
            <label htmlFor="totalClicks" className="font-medium text-gray-600 text-[10px]">Total Clicks:</label>
            <select
              id="totalClicks"
              value={filters.fromTotalClicks && filters.toTotalClicks ? `${filters.fromTotalClicks}-${filters.toTotalClicks}` : ''}
              onChange={(e) => handleRangeFilterChange('totalClicks', e.target.value)}
              className="w-32 p-1 text-[10px] text-black border border-gray-300 rounded bg-gray-50 focus:border-teal-500 focus:outline-none"
            >
              <option value="">Select Range</option>
              {totalClicksOptions.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Checkbox for isCustom */}
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="isCustom" 
              checked={filters.isCustom || false} // Ensure null does not cause a warning
              onChange={(e) => handleFilterChange('isCustom', e.target.checked ? true : null)} 
              className="text-teal-500 focus:ring-teal-500"
            />
            <label htmlFor="isCustom" className="text-xs font-medium text-gray-600">Is Custom</label>
          </div>
        </div>

        {/* Apply/Remove Filters Buttons */}
        <div className="flex mb-6">
          <button 
            onClick={handleApplyFilters}
            className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 text-xs"
          >
            Apply Filters
          </button>
          <button 
            onClick={handleRemoveFilters} 
            className="bg-red-500 text-white px-4 py-2 text-xs rounded-md ml-2"
          >
            Remove Filters
          </button>
        </div>

        {/* Table Container */}
        <div>
          {urls && urls.length === 0 ? (
            <div className="text-center text-lg text-black italic mt-4">No URLs found</div>
          ) : (
            <>

            <div className="flex items-center gap-4 ml-auto">
              <DownloadCsv
                data={allData}   
                headers={['username', 'shortUrl', 'actualUrl','isCustom','totalClicks','clicksLeft']}  
                fileName="urls.csv"
              />
            </div>
              <Table headers={tableHeaders} tableData={tableData} />

              {/* Pagination */}
              <div className="flex justify-between items-center mt-6">
                <div className="flex justify-start w-1/2">
                  <PageSize pageSize={pageSize} onPageSizeChange={handlePageSizeChange} />
                </div>

                <div className="flex justify-center w-1/2">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}  
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GetAllUrls;
