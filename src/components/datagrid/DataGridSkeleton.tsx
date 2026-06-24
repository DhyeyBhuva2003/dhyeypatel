import React from "react";

interface DataGridSkeletonProps {
  columnsCount: number;
  rowCount?: number;
}

export const DataGridSkeleton: React.FC<DataGridSkeletonProps> = ({
  columnsCount,
  rowCount = 5,
}) => {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rIdx) => (
        <tr key={rIdx} className="animate-pulse">
          {Array.from({ length: columnsCount }).map((_, cIdx) => (
            <td key={cIdx} className="px-6 py-4">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-full max-w-[85%]"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default DataGridSkeleton;
