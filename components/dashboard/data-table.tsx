import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function DataTable({
  columns,
  rows
}: {
  columns: string[];
  rows: string[][];
}) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b bg-muted/50 text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.join("-")} className="border-b last:border-0">
                {row.map((cell, index) => (
                  <td key={`${cell}-${index}`} className="px-4 py-4">
                    {index === 2 ? (
                      <Badge variant={cell === "LIVE" ? "default" : "outline"}>{cell}</Badge>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
