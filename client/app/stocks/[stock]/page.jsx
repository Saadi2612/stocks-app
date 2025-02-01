import React, { Suspense } from "react";

import { fetchData } from "@/utils";
import { Separator } from "@/components/ui/separator";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Loading } from "@/app/page";

const StockDetailComponent = async ({ params }) => {
  const apiOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    // cache: "no-store",
  };
  const data = await fetchData(`/stocks/${params.stock}`, apiOptions);
  const stock = data?.stocks[0];
  const difference = stock.current_price - stock.previous_close;

  return (
    <div className="w-full min-h-screen py-6 bg-white">
      <div className="container flex flex-col gap-2 mx-auto px-4 md:px-10 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-black">
          {stock.stock_name}
        </h1>
        <Separator className="my-1" />
        <div className="w-full flex items-end gap-5">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-black">
            {stock.current_price}
          </h1>

          <h2
            className={`text-xl sm:text-2xl font-extrabold ${
              difference >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {difference >= 0 ? "+" : "-"}
            {Math.abs(difference?.toFixed(2))}
          </h2>

          <h2
            className={`text-xl sm:text-2xl font-extrabold ${
              stock.percentage_change >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {`(${stock.percentage_change}%)`}
          </h2>

          <span>
            {stock.stock_trend === "Up" ? (
              <ArrowUp className="stroke-green-600 size-6" />
            ) : stock.stock_trend === "Down" ? (
              <ArrowDown className="stroke-red-500 size-6" />
            ) : (
              <p>&#9866;</p>
            )}
          </span>
        </div>

        <div className="w-auto grid grid-cols-2 sm:grid-cols-3 gap-4 my-10">
          <div className="w-full max-w-[300px]">
            <div className="w-full flex justify-between">
              <p className="text-sm text-gray-500">Previous Close</p>
              <p className="text-sm text-black font-medium">
                {stock.previous_close}
              </p>
            </div>
            <Separator className="w-full mt-1" />
          </div>

          <div className="w-full max-w-[300px]">
            <div className="w-full flex justify-between">
              <p className="text-sm text-gray-500">Market Cap</p>
              <p className="text-sm text-black font-medium">
                {stock.market_cap}
              </p>
            </div>
            <Separator className="w-full mt-1" />
          </div>

          <div className="w-full  max-w-[300px]">
            <div className="w-full flex justify-between">
              <p className="text-sm text-gray-500">Volume</p>
              <p className="text-sm text-black font-medium">
                {stock.trade_volume?.toLocaleString()}
              </p>
            </div>
            <Separator className="w-full mt-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default async function StockDetail({ params }) {
  const { stock } = await params;
  return (
    <Suspense fallback={<Loading />}>
      <StockDetailComponent params={{ stock }} />
    </Suspense>
  );
}
