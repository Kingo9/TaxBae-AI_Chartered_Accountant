#!/usr/bin/env python3
"""
TaxBae ML Backend Runner
Simple script to start the FastAPI server
"""

import uvicorn
from main import app

if __name__ == "__main__":
    print("🚀 Starting TaxBae ML Backend...")
    print("📊 ML services for expense analysis and investment suggestions")
    print("🔗 Available at: http://localhost:8001")
    print("📖 API documentation: http://localhost:8001/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
