import logging
import sys
import os
from logging.handlers import RotatingFileHandler

def setup_logging(level: int = logging.INFO):

    log_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),"logs")

    os.makedirs(log_dir,exist_ok=True)

    log_file_path = os.path.join(log_dir,"FinAgent.log")

    console_handler = logging.StreamHandler(sys.stdout)

    file_handler = RotatingFileHandler(
        log_file_path,maxBytes=5 * 1024 * 1024,backupCount=3,encoding="utf-8"
    )

    logging.basicConfig(
        level=level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[console_handler,file_handler]
    )

setup_logging()

logger = logging.getLogger("FinAgent")