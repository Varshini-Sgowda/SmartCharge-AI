import io
import csv
from datetime import datetime
from typing import Dict, Any
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from .ml_engine import ml_engine
from .data_pipeline import STATION_METADATA
from .optimizer_service import get_smart_charging_recommendations
from .carbon_service import get_carbon_intelligence

def generate_pdf_report() -> io.BytesIO:
    """
    Generates an executive-level PDF report containing forecast summaries,
    model metrics, station overload risks, optimization recommendations, and carbon analytics.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    forecast = ml_engine.predict_future(horizon_hours=24, model_type="RandomForest")
    metrics = forecast["metrics"]
    st_forecasts = forecast["station_forecasts"]
    carbon_data = get_carbon_intelligence()
    opt_data = get_smart_charging_recommendations()

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=6
    )
    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        textColor=colors.HexColor("#475569"),
        spaceAfter=14
    )
    section_title = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        textColor=colors.HexColor("#0284c7"),
        spaceBefore=10,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        "ReportBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        textColor=colors.HexColor("#334155"),
        leading=13
    )

    story = []

    # Title & Header
    story.append(Paragraph("SmartCharge AI — Executive Energy & Demand Forecast Report", title_style))
    story.append(Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')} | Network Operator Digest", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0284c7"), spaceAfter=12))

    # Executive Summary Card Table
    exec_data = [
        ["Forecast Horizon", "Peak Demand Forecast", "Peak Time Window", "Total 24h Energy", "Model R² Score"],
        [
            f"{forecast['horizon_hours']} Hours",
            f"{forecast['peak_demand_kw']} kW",
            forecast["peak_demand_window"],
            f"{forecast['total_energy_forecast_kwh']:,.0f} kWh",
            f"{metrics['r2_score']:.4f} (RandomForest)"
        ]
    ]
    t_exec = Table(exec_data, colWidths=[100, 110, 110, 110, 110])
    t_exec.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0f172a")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8.5),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor("#f1f5f9")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_exec)
    story.append(Spacer(1, 12))

    # Section 1: ML Model Evaluation Metrics
    story.append(Paragraph("1. Machine Learning Forecasting Engine Performance", section_title))
    story.append(Paragraph("Models evaluated on a chronological 80/20 train-test split across historical EV session aggregates:", body_style))
    story.append(Spacer(1, 4))

    all_models = forecast["all_models_metrics"]
    model_rows = [["Model Architecture", "MAE (kW)", "RMSE (kW)", "R² Score", "MAPE (%)", "Training Samples"]]
    for m in all_models:
        model_rows.append([
            m["model_name"],
            f"{m['mae']:.2f}",
            f"{m['rmse']:.2f}",
            f"{m['r2_score']:.4f}",
            f"{m['mape']:.2f}%",
            str(m["samples_trained"])
        ])
    t_model = Table(model_rows, colWidths=[140, 80, 80, 80, 80, 80])
    t_model.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e293b")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_model)
    story.append(Spacer(1, 12))

    # Section 2: Station Overload Risk Analysis
    story.append(Paragraph("2. Station Capacity & Overload Risk Assessment", section_title))
    st_table_data = [["Station ID", "Station Hub Name", "Region", "Rated (kW)", "Forecast Peak", "Util %", "Risk Level"]]
    for s in st_forecasts:
        st_table_data.append([
            s["station_id"],
            s["name"][:28],
            s["region"],
            f"{s['capacity_kw']:.0f}",
            f"{s['forecasted_peak_kw']:.1f}",
            f"{s['predicted_utilization']:.1f}%",
            s["risk_level"]
        ])
    t_st = Table(st_table_data, colWidths=[55, 160, 95, 60, 65, 50, 55])
    t_st.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e293b")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 7.5),
        ('ALIGN', (3, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_st)
    story.append(Spacer(1, 12))

    # Section 3: Tariff & Cost Optimization Recommendations
    story.append(Paragraph("3. Smart Charging & Cost Reduction Recommendations", section_title))
    rec_text = (
        f"• <b>Tariff Arbitrage</b>: Lowest rate available is <b>${opt_data['cheapest_rate_per_kwh']:.2f}/kWh</b> during {opt_data['cheapest_window']}. "
        f"Shifting flexible charging out of peak ({opt_data['peak_window']} @ ${opt_data['peak_rate_per_kwh']:.2f}/kWh) saves <b>{opt_data['savings_percentage']}%</b> in electricity costs.<br/>"
        f"• <b>Clean Charging Window</b>: Grid carbon intensity drops to <b>{opt_data['cleanest_carbon_intensity']:.3f} kg CO2/kWh</b> during {opt_data['cleanest_green_window']} due to regional solar surplus.<br/>"
        f"• <b>Estimated Net ICE Carbon Avoidance</b>: <b>{carbon_data['net_carbon_avoided_kg']:,.0f} kg CO2</b> avoided over baseline internal combustion mileage."
    )
    story.append(Paragraph(rec_text, body_style))
    story.append(Spacer(1, 14))

    # Footer note
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#94a3b8"), spaceAfter=8))
    story.append(Paragraph("SmartCharge AI Platform • Confidential Energy Infrastructure Report • Built for Grid Operators & Fleet Managers", ParagraphStyle(
        "Footer", parent=styles["Normal"], fontSize=7, textColor=colors.HexColor("#64748b"), alignment=1
    )))

    doc.build(story)
    buffer.seek(0)
    return buffer

def generate_excel_report() -> io.BytesIO:
    """
    Generates a multi-sheet formatted Excel workbook (.xlsx) containing:
    1. Executive Summary & ML Metrics
    2. 24-Hour Demand Forecast
    3. Charging Station Capacity & Risks
    4. Carbon & Tariff Intelligence
    """
    wb = openpyxl.Workbook()
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="0F172A", end_color="0F172A", fill_type="solid")
    subhead_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
    thin_border = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='thin', color='CBD5E1')
    )

    forecast = ml_engine.predict_future(horizon_hours=24, model_type="RandomForest")
    metrics = forecast["metrics"]
    hourly = forecast["hourly_forecast"]
    st_forecasts = forecast["station_forecasts"]
    carbon_data = get_carbon_intelligence()

    # Sheet 1: Hourly Demand Forecast
    ws1 = wb.active
    ws1.title = "24h Hourly Demand Forecast"
    headers1 = [
        "Timestamp", "Hour", "Day of Week", "Predicted Demand (kW)",
        "Actual Demand (kW)", "Lower 95% Bound (kW)", "Upper 95% Bound (kW)",
        "Is Peak Hour", "Tariff Period", "Tariff Rate ($/kWh)", "Grid Carbon Intensity (kg CO2/kWh)"
    ]
    ws1.append(headers1)
    for col_idx in range(1, len(headers1) + 1):
        cell = ws1.cell(row=1, column=col_idx)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center")

    for r in hourly:
        ws1.append([
            r["timestamp"],
            r["hour"],
            r["day_name"],
            r["predicted_demand_kw"],
            r["actual_demand_kw"] if r["actual_demand_kw"] is not None else "N/A",
            r["lower_bound_kw"],
            r["upper_bound_kw"],
            "Yes" if r["is_peak_hour"] else "No",
            r["tariff_period"],
            r["tariff_rate"],
            r["carbon_intensity_kg_kwh"]
        ])

    for row in ws1.iter_rows(min_row=2, max_row=len(hourly)+1, min_col=1, max_col=len(headers1)):
        for cell in row:
            cell.border = thin_border

    # Sheet 2: Station Risk & Capacity
    ws2 = wb.create_sheet(title="Station Capacity & Risks")
    headers2 = ["Station ID", "Station Hub Name", "Region", "Max Power Capacity (kW)", "Current Load (kW)", "Forecasted Peak (kW)", "Utilization (%)", "Risk Level", "Recommended Action"]
    ws2.append(headers2)
    for col_idx in range(1, len(headers2) + 1):
        cell = ws2.cell(row=1, column=col_idx)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center")

    for s in st_forecasts:
        ws2.append([
            s["station_id"],
            s["name"],
            s["region"],
            s["capacity_kw"],
            s["current_demand_kw"],
            s["forecasted_peak_kw"],
            s["predicted_utilization"],
            s["risk_level"],
            s["recommended_action"]
        ])

    for row in ws2.iter_rows(min_row=2, max_row=len(st_forecasts)+1, min_col=1, max_col=len(headers2)):
        for cell in row:
            cell.border = thin_border

    # Sheet 3: ML Model Benchmarks
    ws3 = wb.create_sheet(title="Model Evaluation Metrics")
    headers3 = ["Model Architecture", "MAE (kW)", "RMSE (kW)", "R² Score", "MAPE (%)", "Training Samples", "Inference Time (ms)"]
    ws3.append(headers3)
    for col_idx in range(1, len(headers3) + 1):
        cell = ws3.cell(row=1, column=col_idx)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center")

    for m in forecast["all_models_metrics"]:
        ws3.append([
            m["model_name"],
            m["mae"],
            m["rmse"],
            m["r2_score"],
            m["mape"],
            m["samples_trained"],
            m["training_time_ms"]
        ])

    for row in ws3.iter_rows(min_row=2, max_row=len(forecast["all_models_metrics"])+1, min_col=1, max_col=len(headers3)):
        for cell in row:
            cell.border = thin_border

    # Auto-adjust column widths
    for sheet in [ws1, ws2, ws3]:
        for col in sheet.columns:
            max_len = max(len(str(cell.value or '')) for cell in col)
            col_letter = openpyxl.utils.get_column_letter(col[0].column)
            sheet.column_dimensions[col_letter].width = max(max_len + 3, 12)

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer

def generate_csv_report() -> io.BytesIO:
    """
    Generates a standard RFC 4180 CSV export of the hourly forecasted demand series.
    """
    buffer = io.StringIO()
    writer = csv.writer(buffer)

    forecast = ml_engine.predict_future(horizon_hours=24, model_type="RandomForest")
    hourly = forecast["hourly_forecast"]

    headers = [
        "timestamp", "hour", "day_of_week", "predicted_demand_kw",
        "actual_demand_kw", "lower_bound_95_kw", "upper_bound_95_kw",
        "is_peak_hour", "tariff_period", "tariff_rate_usd_kwh", "carbon_intensity_kg_co2_kwh"
    ]
    writer.writerow(headers)

    for r in hourly:
        writer.writerow([
            r["timestamp"],
            r["hour"],
            r["day_name"],
            r["predicted_demand_kw"],
            r["actual_demand_kw"] if r["actual_demand_kw"] is not None else "",
            r["lower_bound_kw"],
            r["upper_bound_kw"],
            1 if r["is_peak_hour"] else 0,
            r["tariff_period"],
            r["tariff_rate"],
            r["carbon_intensity_kg_kwh"]
        ])

    bytes_buffer = io.BytesIO(buffer.getvalue().encode('utf-8'))
    bytes_buffer.seek(0)
    return bytes_buffer
