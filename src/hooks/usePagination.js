import { useState, useMemo } from 'react';

export const usePagination = (data, itemsPerPage = 50) => {
  const [currentPage, setCurrentPage] = useState(1);

  // useMemo ensures calculations only re-run when necessary
  const totalPages = useMemo(() => {
    return Math.ceil(data.length / itemsPerPage);
  }, [data.length, itemsPerPage]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = useMemo(() => {
    return data.slice(indexOfFirstItem, indexOfLastItem);
  }, [data, indexOfFirstItem, indexOfLastItem]);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  return {
    currentPage,
    totalPages,
    currentItems,
    indexOfFirstItem,
    indexOfLastItem,
    handleNextPage,
    handlePrevPage,
  };
};