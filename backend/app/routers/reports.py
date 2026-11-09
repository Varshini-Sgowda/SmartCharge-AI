from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from ..services.report_service import generate_pdf_report, generate_excel_report, generate_csv_report

router = APIRouter(prefix="/reports", tags=["Reports & Exports"])

@router.get("/pdf")
def download_pdf_report():
    """
    Generates and downloads a publication-grade PDF report with executive summary,
    model metrics, station overload risks, and decarbonization trends.
    """
    buffer = generate_pdf_report()
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=SmartCharge_AI_Forecast_Report.pdf"}
    )

@router.get("/excel")
def download_excel_report():
    """
    Generates and downloads a multi-tab Microsoft Excel (.xlsx) workbook.
    """
    buffer = generate_excel_report()
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=SmartCharge_AI_Analytics.xlsx"}
    )

@router.get("/csv")
def download_csv_report():
    """
    Generates and downloads an RFC 4180 compliant CSV file of the 24-hour demand series.
    """
    buffer = generate_csv_report()
    return StreamingResponse(
        buffer,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=SmartCharge_Hourly_Demand_Forecast.csv"}
    )
