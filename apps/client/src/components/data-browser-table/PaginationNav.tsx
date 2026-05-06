type PaginationNavProps = {
  page: number;
  totalPages: number;
  onChange: (next: number) => void;
};

export function PaginationNav({ page, totalPages, onChange }: PaginationNavProps) {
  return (
    <nav aria-label="Table pagination" className="data-browser-pagination-nav">
      <button
        aria-label="First page"
        className="data-browser-pagination-nav__btn"
        disabled={page <= 1}
        type="button"
        onClick={() => onChange(1)}
      >
        «
      </button>
      <button
        aria-label="Previous page"
        className="data-browser-pagination-nav__btn"
        disabled={page <= 1}
        type="button"
        onClick={() => onChange(page - 1)}
      >
        ‹
      </button>
      <span className="data-browser-pagination-nav__current">{page}</span>
      <button
        aria-label="Next page"
        className="data-browser-pagination-nav__btn"
        disabled={page >= totalPages}
        type="button"
        onClick={() => onChange(page + 1)}
      >
        ›
      </button>
      <button
        aria-label="Last page"
        className="data-browser-pagination-nav__btn"
        disabled={page >= totalPages}
        type="button"
        onClick={() => onChange(totalPages)}
      >
        »
      </button>
    </nav>
  );
}
