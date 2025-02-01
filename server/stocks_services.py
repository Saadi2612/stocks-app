import requests
from bs4 import BeautifulSoup
import pandas as pd
import numpy as np
import os
import traceback

class StockService:
    def __init__(self):
        self.stocks_file_path = "stocks.csv"
        self.analyzed_stocks_file_path = "analyzed_stocks.csv"
        self.stock_symbols = ["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA", "AMZN", "DIS"]

    def save_stock_data(self, stock_data, file_path):
        
        # Check if the file exists
        if os.path.isfile(file_path):
            df = pd.read_csv(file_path)

            # Ensure "Symbol" column exists
            if "Symbol" not in df.columns:
                raise ValueError("CSV file missing required 'Symbol' column.")

            # Check if stock already exists
            if stock_data["Symbol"] in df["Symbol"].values:
                for key, value in stock_data.items():
                    if key in ["Current Price", "Previous Close", "Volume"]:  # Numeric columns
                        stock_data[key] = float(str(value).replace(",", "").strip())
                # Update existing stock row
                df.loc[df["Symbol"] == stock_data["Symbol"], stock_data.keys()] = stock_data.values()
            else:
                # Append new stock
                df = pd.concat([df, pd.DataFrame([stock_data])], ignore_index=True)
        else:
            # Create new DataFrame if file does not exist
            df = pd.DataFrame([stock_data])

        # Save back to CSV
        df.to_csv(file_path, index=False)

        print(f"Stock data saved/updated for {stock_data['Symbol']}")

    def fetch_stock_data(self, symbol: str):
        url = f"https://finance.yahoo.com/quote/{symbol}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
        }

        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            return {"error": "Failed to fetch stock data."}

        soup = BeautifulSoup(response.text, "html.parser")

        # ✅ Extract stock details safely
        stock_name = soup.find("h1", {"class": "yf-xxbei9"})
        stock_price = soup.find("span", {"class": "yf-ipw1h0"})
        prev_close = soup.find("fin-streamer", {"data-field": "regularMarketPreviousClose"})
        market_cap = soup.find("fin-streamer", {"data-field": "marketCap"})
        volume = soup.find("fin-streamer", {"data-field": "regularMarketVolume"})

        # ✅ Get text safely using `.get_text(strip=True)`
        if not stock_name:
            raise requests.HTTPError(404, ValueError(f"Stock with symbol '{symbol}' not found. Stock symbol maybe invalid."))
        
        stock_data = {
            "Stock": stock_name.get_text(strip=True) if stock_name else "Not Found",
            "Symbol": symbol,
            "Current Price": stock_price.get_text(strip=True) if stock_price else "Not Found",
            "Previous Close": prev_close.get_text(strip=True) if prev_close else "Not Found",
            "Market Cap": market_cap.get_text(strip=True) if market_cap else "Not Found",
            "Volume": volume.get_text(strip=True) if volume else "Not Found"
        }

        print(stock_data)

        # ✅ Save data to CSV
        self.save_stock_data(stock_data, self.stocks_file_path)

        return stock_data
    
    def fetch_all_stock_data(self):
        stock_data_list = []
        for symbol in self.stock_symbols:
            try:
                stock_data = self.fetch_stock_data(symbol)
                stock_data_list.append(stock_data)
            except Exception as e:
                print(f"Failed to fetch data for {symbol}: {e}")
                traceback.print_exc()

        return stock_data_list   

    def clean_numeric_column(self, df, column_name):
        """Check if any value contains commas, then clean and convert to numeric."""
        if df[column_name].astype(str).str.contains(",").any():
            df[column_name] = pd.to_numeric(df[column_name].str.replace(",", "", regex=True), errors="coerce")
        else:
            df[column_name] = pd.to_numeric(df[column_name], errors="coerce")
            
    def analyze_stock_data(self, symbol: str = None):
        df = pd.read_csv(self.stocks_file_path)
        
        # Clean numeric columns
        self.clean_numeric_column(df, "Current Price")
        self.clean_numeric_column(df, "Previous Close")
        self.clean_numeric_column(df, "Volume")

        # Convert Market Cap to numeric (handling M/B/T suffixes)
        def convert_market_cap(value):
            if isinstance(value, str):
                value = value.replace(",", "").strip()
                if value.endswith("B"):
                    return float(value[:-1]) * 1e9
                elif value.endswith("T"):
                    return float(value[:-1]) * 1e12
                elif value.endswith("M"):
                    return float(value[:-1]) * 1e6
                elif value.endswith("K"):
                    return float(value[:-1]) * 1e3
                    
            return pd.NA
        
        def format_large_number(value):
            if isinstance(value, float):
                if value >= 1e12:
                    return f"{value / 1e12:.3f}T"
                elif value >= 1e9:
                    return f"{value / 1e9:.3f}B"
                elif value >= 1e6:
                    return f"{value / 1e6:.3f}M"
                elif value >= 1e3:
                    return f"{value / 1e3:.3f}K"
            return str(value)

        df["Market Cap"] = df["Market Cap"].apply(convert_market_cap)

        if symbol:
            df = df[df["Symbol"].str.upper() == symbol.upper()]
            if df.empty:
                return {"error": f"Stock with symbol '{symbol}' not found."}


        avg_current_price = df["Current Price"].mean()
        avg_prev_close = df["Previous Close"].mean()
        # print(f"avg current price: {avg_current_price}, avg prev close: {avg_prev_close}")

        highest_volume_stock = df.loc[df["Volume"].idxmax(), ["Stock", "Volume"]]
        stock_name, volume = highest_volume_stock.values[0], int(highest_volume_stock.values[1])
        # print(f"highest volume stock: {stock_name} ({volume})")

        df["% Change"] = (((df["Current Price"] - df["Previous Close"]) / df["Previous Close"]) * 100).round(2)
        # print(f"percentage change: {df['% Change']}")


        high_market_cap_stocks = df[df["Market Cap"] > 100e9]

        print(f"high market cap stocks: {high_market_cap_stocks}")


        def categorize_trend(change):
            if pd.isna(change):
                return "Unknown"
            elif change > 0:
                return "Up"
            elif change < 0:
                return "Down"
            return "Stable"

        df["Trend"] = df["% Change"].apply(categorize_trend)

        analyzed_stocks = df.to_dict(orient="records")


        for stock in analyzed_stocks:
            self.save_stock_data(stock, self.analyzed_stocks_file_path)

        column_mapping = {
            "Stock": "stock_name",
            "Symbol": "stock_symbol",
            "Current Price": "current_price",
            "Previous Close": "previous_close",
            "Market Cap": "market_cap",
            "Volume": "trade_volume",
            "% Change": "percentage_change",
            "Trend": "stock_trend",
            "Average Current Price": "average_current_price",
            "Average Previous Close": "average_previous_close"
        }
        
        formatted_stocks = [
            {column_mapping.get(k, k): v for k, v in stock.items()} 
            for stock in analyzed_stocks
        ]

        for stock in formatted_stocks:
            stock["market_cap"] = format_large_number(stock["market_cap"])

        response = {
            "stocks": formatted_stocks,
            "average_current_price": avg_current_price.round(2),
            "average_previous_close": avg_prev_close.round(2),
            "highest_volume_stock": f"{stock_name}, {volume:,}",
        }

        return response