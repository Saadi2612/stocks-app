from fastapi import FastAPI
import traceback
import logging
from fastapi.middleware.cors import CORSMiddleware

from stocks_services import StockService

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/stocks")
def get_all_stocks():

    stock_service = StockService()
    logging.info("Fetching all stock data")

    # try:
    #     stock_data = stock_service.fetch_all_stock_data()
    # except Exception as e:
    #     logging.exception(f"Failed to fetch stocks: {e}")
    #     return {"error": "Failed to fetch stocks."}

    try:
        analyzed_data = stock_service.analyze_stock_data()
    except Exception as e:
        logging.exception(f"Error analyzing stocks: {e}")
        return {"error": f"Failed to analyze stocks."}
    

    return analyzed_data


@app.get("/stocks/{symbol}")
async def stocks(symbol: str):
    stock_service = StockService()

    if not symbol:
        return {"error": "Stock symbol is required"}

    logging.info(f"Fetching stock data for {symbol}")

    # try:
    #     stocks = stock_service.fetch_stock_data(symbol)
    #     if not stocks:
    #         return {"error": f"No stock data found for {symbol}"}
    # except ValueError:
    #     logging.error(f"Invalid stock symbol: {symbol}")
    #     return {"error": f"Invalid stock symbol: {symbol}"}
    # except Exception as e:
    #     logging.exception(f"Failed to fetch stock data for {symbol}")
    #     return {"error": f"Could not retrieve stock data for {symbol}."}
    

    try:
        analyzed_data = stock_service.analyze_stock_data(symbol)
    except Exception as e:
        logging.exception(f"Error analyzing stock data for {symbol}: {e}")
        return {"error": f"Failed to analyze stock data for {symbol}."}
    

    return analyzed_data
