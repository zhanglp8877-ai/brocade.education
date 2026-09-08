#!/usr/bin/env python3
"""将 QS 排名 Excel 转换为前端使用的 JSON 数据文件。"""

import argparse
import json
import openpyxl

SPECIAL_IDS = {"帝国理工学院": "imperial", "牛津大学": "oxford", "哈佛大学": "harvard", "新加坡国立大学": "nus", "墨尔本大学": "melbourne", "多伦多大学": "toronto"}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("source", help="QS Excel 文件路径")
    parser.add_argument("--output", default="public/qs2026.json")
    parser.add_argument("--sheet", default="QS2026总榜")
    args = parser.parse_args()
    sheet = openpyxl.load_workbook(args.source, read_only=True, data_only=True)[args.sheet]
    records = []
    for order, row in enumerate(sheet.iter_rows(min_row=2, values_only=True), start=1):
        rank, name, english, country, continent, score, previous, url = row
        if not name:
            continue
        records.append({"id": SPECIAL_IDS.get(str(name), f"qs-{order}"), "order": order, "rank": str(rank or ""), "name": str(name), "en": str(english or ""), "country": str(country or ""), "continent": str(continent or ""), "score": str(score or ""), "prev": str(previous or ""), "official": str(url or "")})
    with open(args.output, "w", encoding="utf-8") as target:
        json.dump(records, target, ensure_ascii=False, separators=(",", ":"))
    print(f"Imported {len(records)} universities into {args.output}")

if __name__ == "__main__":
    main()
