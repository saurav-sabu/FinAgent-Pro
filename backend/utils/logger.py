"""
Logging configuration module for FinAgent-Pro.

This module sets up logging with both console and file handlers,
using rotating file handlers to manage log file sizes.
"""

import logging
import sys
import os
from logging.handlers import RotatingFileHandler


def setup_logging(level: int = logging.INFO):
    """
    Configure logging for the application with console and file handlers.
    
    Creates a logs directory in the backend folder and sets up:
    - Console handler: Outputs logs to stdout
    - Rotating file handler: Writes logs to FinAgent.log with rotation
      (max 5MB per file, keeps 3 backup files)
    
    Args:
        level (int): Logging level (default: logging.INFO)
                    Options: logging.DEBUG, INFO, WARNING, ERROR, CRITICAL
    """
    # Create logs directory in the backend folder (parent of utils)
    log_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "logs")
    
    # Create logs directory if it doesn't exist
    os.makedirs(log_dir, exist_ok=True)
    
    # Define log file path
    log_file_path = os.path.join(log_dir, "FinAgent.log")
    
    # Console handler: outputs logs to standard output
    console_handler = logging.StreamHandler(sys.stdout)
    
    # Rotating file handler: automatically rotates log files when they reach maxBytes
    # maxBytes: 5MB (5 * 1024 * 1024 bytes)
    # backupCount: keeps 3 backup files (FinAgent.log.1, FinAgent.log.2, FinAgent.log.3)
    # encoding: UTF-8 to support international characters
    file_handler = RotatingFileHandler(
        log_file_path, maxBytes=5 * 1024 * 1024, backupCount=3, encoding="utf-8"
    )
    
    # Configure root logger with format and handlers
    # Format includes: timestamp, logger name, log level, and message
    logging.basicConfig(
        level=level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[console_handler, file_handler]
    )


# Initialize logging when module is imported
setup_logging()

# Create and export logger instance for use throughout the application
logger = logging.getLogger("FinAgent")