import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Table", () => {
  it("renders table structure", () => {
    render(
      <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>INV001</TableCell>
            <TableCell>Paid</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={1}>Total</TableCell>
            <TableCell>$2,500.00</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(
      screen.getByRole("rowgroup", { name: /table header/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("rowgroup", { name: /table body/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("rowgroup", { name: /table footer/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText("A list of your recent invoices.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /invoice/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: /INV001/i })).toBeInTheDocument();
  });
});
