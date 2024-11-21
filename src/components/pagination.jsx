import { Button } from "@/components/ui/button";

export function Pagination({ currentPage, totalPages, onPageChange }) {
  const handlePrevPage = () => {
    onPageChange(Math.max(currentPage - 1, 1));
  };

  const handleNextPage = () => {
    onPageChange(Math.min(currentPage + 1, totalPages));
  };

  return (
    <div className="flex justify-between items-center mt-4">
      <Button onClick={handlePrevPage} disabled={currentPage === 1}>
        Previous
      </Button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <Button onClick={handleNextPage} disabled={currentPage === totalPages}>
        Next
      </Button>
    </div>
  );
}
