import React from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { DataGridColumn } from "./DataGrid";

interface DataGridExportProps<T> {
  columns: DataGridColumn<T>[];
  data: T[];
  filename?: string;
}

export function DataGridExport<T>({
  columns,
  data,
  filename = "data_export",
}: DataGridExportProps<T>) {
  const handleExportCSV = () => {
    try {
      if (data.length === 0) {
        toast.error("No data available to export");
        return;
      }

      // Filter headers
      const exportCols = columns.filter((col) => col.key !== "checkbox" && col.key !== "actions");
      const headers = exportCols.map((col) => col.label);

      const rows = data.map((row) => {
        return exportCols.map((col) => {
          const val = (row as any)[col.key];
          // Basic sanitization
          if (val === undefined || val === null) return "";
          if (typeof val === "object") return JSON.stringify(val).replace(/"/g, '""');
          return `"${val.toString().replace(/"/g, '""')}"`;
        });
      });

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV report exported successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to generate export file.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleExportCSV}
      className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-350 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer"
    >
      <Download className="w-3.5 h-3.5" />
      <span>Export CSV</span>
    </button>
  );
}

export default DataGridExport;
