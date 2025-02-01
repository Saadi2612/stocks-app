import React, { Suspense } from "react";
import { fetchData } from "@/utils";

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
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRightFromSquare,
  LoaderCircle,
} from "lucide-react";
import GraphSection from "@/components/GraphSection";
import Link from "next/link";

export function Loading() {
  return (
    <div className="w-screen h-screen grid place-items-center">
      <div className="flex flex-col items-center gap-2">
        <LoaderCircle className="animate-spin size-8 text-gray-600" />
        <p className="text-gray-600">Loading data, please wait</p>
      </div>
    </div>
  );
}

async function HomeComponent() {
  const apiOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    // cache: "no-store",
  };
  const data = await fetchData("/stocks", apiOptions);
  if (!data) {
    return (
      <div className="text-center text-xl font-medium">
        Something went wrong!
      </div>
    );
  }

  const stocks = data?.stocks;
  const avgCurrentPrice = data?.average_current_price;
  const avgPreviousClose = data?.average_previous_close;
  const highestVolumeStockName = data?.highest_volume_stock?.split(":")[0];
  const highestVolumeStockValue = data?.highest_volume_stock?.split(":")[1];

  // console.log(highestVolumeStockValue);
  // console.log(avgPreviousClose);
  // console.log(highestVolumeStockName);
  // console.log(avgCurrentPrice);
  // console.log(stocks);
  return (
    <main className="w-full min-h-screen bg-white">
      <div className="container mx-auto bg-white px-4 md:px-10 py-6">
        <div className="mb-12 w-full space-y-3">
          <h1 className="text-2xl sm:text-3xl font-medium text-gray-600 ml-0.5">
            Stock with highest volume
          </h1>
          <div className="sm:w-fit w-full rounded-2xl bg-white shadow-[0_3px_10px_rgb(0,0,0,0.15)] hover:bg-gray-50 p-6 duration-200 space-y-2">
            <h1 className="font-bold text-lg sm:text-xl text-gray-600 ">
              {highestVolumeStockName}
            </h1>
            <span className="inline-flex items-end gap-2">
              <p className="text-sm text-gray-600">Volume:</p>{" "}
              <p className="text-xl font-semibold text-gray-800">
                ${highestVolumeStockValue}
              </p>
            </span>
          </div>
        </div>

        <h1 className="text-3xl font-medium text-gray-600 ml-0.5 mb-2">
          All Stocks
        </h1>
        <Table>
          <TableCaption>A list of Stocks</TableCaption>
          <TableHeader className="bg-gray-200 rounded-xl">
            <TableRow className="font-bold">
              <TableHead className="w-fit">Stock Name</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead className="">Current Price ($)</TableHead>
              <TableHead className="">Previous Close ($)</TableHead>
              <TableHead className="">Market Cap ($)</TableHead>
              <TableHead className="">Volume ($)</TableHead>
              <TableHead className="">% Change</TableHead>
              <TableHead className="">Trend</TableHead>
              <TableHead className=""></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stocks?.map((stock) => (
              <TableRow key={stock.stock_name}>
                <TableCell className="font-semibold">
                  {stock.stock_name}
                </TableCell>
                <TableCell>{stock.stock_symbol}</TableCell>
                <TableCell>{stock.current_price}</TableCell>
                <TableCell>{stock.previous_close}</TableCell>
                <TableCell>{stock.market_cap}</TableCell>
                <TableCell>{stock.trade_volume?.toLocaleString()}</TableCell>
                <TableCell>
                  {stock.percentage_change < 0 ? (
                    <p className="text-red-500">{stock.percentage_change}%</p>
                  ) : (
                    <p className="text-green-600">
                      +{stock.percentage_change}%
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  {stock.stock_trend === "Up" ? (
                    <ArrowUp className="stroke-green-600 size-5" />
                  ) : stock.stock_trend === "Down" ? (
                    <ArrowDown className="stroke-red-500 size-5" />
                  ) : (
                    <p>&#9866;</p>
                  )}
                </TableCell>
                <TableCell>
                  <Link href={`/stocks/${stock.stock_symbol}`}>
                    <ArrowUpRightFromSquare className="stroke-gray-600 size-5" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>Average</TableCell>
              <TableCell className="">{avgCurrentPrice}</TableCell>
              <TableCell className="" colSpan={5}>
                {avgPreviousClose}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        <div className="w-full mt-6 space-y-3 ">
          <h1 className="text-2xl sm:text-3xl font-medium text-gray-600 ml-0.5">
            Average
          </h1>
          <div className="flex md:flex-row flex-col gap-4">
            <div className="sm:w-fit w-full rounded-2xl bg-white border hover:bg-gray-50 sm:p-6 p-4 duration-200 shrink-0">
              <h1 className="font-bold text-lg sm:text-xl text-gray-600 ">
                Current Price
              </h1>
              <p className="text-sm text-gray-600">
                Average current price of all stocks
              </p>
              <span className="inline-flex items-end gap-2 mt-3">
                <p className="text-sm text-gray-600">Price:</p>{" "}
                <p className="text-xl font-semibold text-gray-800">
                  ${avgCurrentPrice}
                </p>
              </span>
            </div>

            <div className="sm:w-fit w-full rounded-2xl bg-white border hover:bg-gray-50 sm:p-6 p-4 duration-200 shrink-0">
              <h1 className="font-bold text-xl text-gray-600 ">
                Previous Close
              </h1>
              <p className="text-sm text-gray-600">
                Average previous close of all stocks
              </p>
              <span className="inline-flex items-end gap-2 mt-3">
                <p className="text-sm text-gray-600">Price:</p>{" "}
                <p className="text-xl font-semibold text-gray-800">
                  ${avgPreviousClose}
                </p>
              </span>
            </div>
          </div>
        </div>

        <GraphSection data={stocks} />
        {/* <ul>
          {stocks.map((stock) => (
            <li key={stock.id}>
              {stock?.stock_name} - {stock?.current_price}
            </li>
          ))}
        </ul> */}
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <HomeComponent />
    </Suspense>
  );
}
