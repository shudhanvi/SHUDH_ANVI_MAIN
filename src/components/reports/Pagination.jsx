import React from 'react';

export const Pagination = ({ currentPage, totalPages, onNext, onPrev, firstItemIndex, lastItemIndex, totalItems }) => {
  return (
    <div className="flex items-center justify-end pt-4 mt-4 ">
      <span className="text-sm text-gray-700">
        {firstItemIndex + 1}-{Math.min(lastItemIndex, totalItems)} of {totalItems}
      </span>
      <div className="ml-4">
        <button
          onClick={onPrev}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous Page"
        >
          &lt;
        </button>
        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded-md ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next Page"
        >
          &gt;
        </button>
      </div>
    </div>
  );
};