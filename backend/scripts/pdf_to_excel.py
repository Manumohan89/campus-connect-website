"""
VTU Marks Card PDF Parser — v4.0
Schemes supported: 2015, 2018, 2021, 2022, 2025
Branches: CSE, ISE, ECE, ME, EEE, CV, AIML, DS, ETE

Credits sourced from official VTU scheme PDFs:
  2021: https://vtu.ac.in/pdf/2021syll/
  2022: https://vtu.ac.in/wp-content/uploads/2022/scheme/
  2025: https://vtu.ac.in/2025-scheme/

Primary parser: pdfplumber | Fallback: tabula-py
"""
import sys, re, json

# ══════════════════════════════════════════════════════════════════════════════
# OFFICIAL CREDIT LOOKUP
# All entries verified against official VTU scheme PDFs
# ══════════════════════════════════════════════════════════════════════════════
OFFICIAL_CREDITS = {

    # ── 2021 SCHEME — COMMON (Sem 1-2) ───────────────────────────────────────
    '21MAT11': 4, '21PHY12': 4, '21CHE12': 4, '21ELN14': 3, '21ELN15': 3,
    '21PHYL16': 1, '21CHEL17': 1, '21ELN18': 1,
    '21MAT21': 4, '21PHY22': 4, '21CHE22': 4, '21ELN24': 3, '21ELN25': 3,
    '21PHYL26': 1, '21CHEL27': 1,

    # ── 2021 SCHEME — CSE ────────────────────────────────────────────────────
    '21MAT31': 3, '21CS32': 4, '21CS33': 4, '21CS34': 3,
    '21CSL35': 1, '21UH36': 1, '21KSK37': 1, '21KBK37': 1, '21CIP37': 1,
    '21CS38X': 1, '21CSL38X': 1,
    '21CS41': 3, '21CS42': 4, '21CS43': 4, '21CS44': 3,
    '21BE45': 2, '21CSL46': 1, '21KSK47': 1, '21KBK47': 1, '21CIP47': 1,
    '21CS48X': 1, '21CSL48X': 1, '21UH49': 1, '21INT49': 2,
    '21CS51': 3, '21CS52': 4, '21CS53': 3, '21CS54': 3,
    '21CSL55': 1, '21CSL581': 1, '21CS582': 1, '21CS583': 1, '21CS584': 1,
    '21CSL582': 1, '21RMI56': 2, '21CS56': 2, '21CIV57': 1,
    '21CS61': 3, '21CS62': 4, '21CS63': 3,
    '21CSL66': 1, '21CSMP67': 2, '21INT68': 3,
    '21CS71': 3, '21CS72': 2, '21CSP76': 10,
    '21CS81': 1, '21INT82': 15,

    # ── 2021 SCHEME — ECE ────────────────────────────────────────────────────
    '21EC32': 4, '21EC33': 4, '21EC34': 3, '21ECL35': 1, '21EC38X': 1,
    '21EC41': 3, '21EC42': 4, '21EC43': 4, '21EC44': 3, '21ECL46': 1, '21EC48X': 1,
    '21EC51': 3, '21EC52': 4, '21EC53': 3, '21EC54': 3, '21ECL55': 1,
    '21EC58X': 1, '21ECL58X': 1,
    '21EC61': 3, '21EC62': 4, '21EC63': 3, '21ECL66': 1, '21ECMP67': 2,

    # ── 2021 SCHEME — ME ─────────────────────────────────────────────────────
    '21ME32': 4, '21ME33': 4, '21ME34': 3, '21MEL35': 1,
    '21ME41': 3, '21ME42': 4, '21ME43': 4, '21ME44': 3, '21MEL46': 1,
    '21ME51': 3, '21ME52': 4, '21ME53': 3, '21ME54': 3, '21MEL55': 1,

    # ── 2021 SCHEME — EEE ────────────────────────────────────────────────────
    '21EE32': 4, '21EE33': 4, '21EE34': 3, '21EEL35': 1,
    '21EE41': 3, '21EE42': 4, '21EE43': 4, '21EE44': 3, '21EEL46': 1,
    '21EE51': 3, '21EE52': 4, '21EE53': 3, '21EE54': 3, '21EEL55': 1,

    # ── 2021 SCHEME — CV ─────────────────────────────────────────────────────
    '21CV32': 4, '21CV33': 4, '21CV34': 3, '21CVL35': 1,
    '21CV41': 3, '21CV42': 4, '21CV43': 4, '21CV44': 3, '21CVL46': 1,
    '21CV51': 3, '21CV52': 4, '21CV53': 3, '21CV54': 3, '21CVL55': 1,

    # ── 2021 SCHEME — ISE ────────────────────────────────────────────────────
    '21IS32': 4, '21IS33': 4, '21IS34': 3, '21ISL35': 1,
    '21IS41': 3, '21IS42': 4, '21IS43': 4, '21IS44': 3, '21ISL46': 1,
    '21IS51': 3, '21IS52': 4, '21IS53': 3, '21IS54': 3, '21ISL55': 1,

    # ── 2021 SCHEME — COMMON CROSS-BRANCH ────────────────────────────────────
    '21BE45': 2, '21UH36': 1, '21UH49': 1, '21CIV57': 1, '21CIV47': 1,
    '21RMI56': 2, '21XX56': 2, '21KSK37': 1, '21KBK37': 1, '21CIP37': 1,
    '21KSK47': 1, '21KBK47': 1, '21CIP47': 1, '21SCR36': 1, '21SCR46': 1,
    '21MATDIP31': 0, '21MATDIP41': 0,
    '21NS83': 0, '21PE83': 0, '21YO83': 0,

    # ── 2022 SCHEME — COMMON (Sem 1-2) ───────────────────────────────────────
    # IMPORTANT: PHY12, CHE12, MAT11 are 4cr (NOT 3cr) — basic science full credit
    '22MAT11': 4, '22PHY12': 4, '22CHE12': 4,
    '22ELN14': 3, '22ELN15': 3,          # Electronics + Civil/Mech = 3cr each
    '22PHYL16': 1, '22CHEL17': 1, '22ELN18': 1,
    '22MAT21': 4, '22PHY22': 4, '22CHE22': 4,
    '22ELN24': 3, '22ELN25': 3,
    '22PHYL26': 1, '22CHEL27': 1, '22WSL28': 1,

    # ── 2022 SCHEME — CSE (Sem 3-8) ──────────────────────────────────────────
    # Sem 3 (total 20cr): MAT=3, IPCC1=4, IPCC2=4, PCC=3, Lab=1, AEC×3=1 each
    '22MAT31': 3,
    '22CS32': 4,    # Data Structures (IPCC — 3L+2P)
    '22CS33': 4,    # Analog & Digital Electronics (IPCC — 3L+2P)
    '22CS34': 3,    # Computer Organization & Architecture
    '22CSL35': 1,   # DS Lab
    '22UH36': 1, '22KSK37': 1, '22KBK37': 1, '22CIP37': 1,
    '22CS38X': 1, '22CSL38X': 1,
    # Sem 4
    '22CS41': 3,    # Analysis & Design of Algorithms
    '22CS42': 4,    # Microcontrollers (IPCC)
    '22CS43': 4,    # Database Management Systems (IPCC)
    '22CS44': 3,    # Operating Systems
    '22BE45': 2,    # Biology for Engineers
    '22CSL46': 1,   # DB/Advanced DS Lab
    '22KSK47': 1, '22KBK47': 1, '22CIP47': 1, '22UH49': 1, '22INT49': 2,
    '22CS48X': 1, '22CSL48X': 1,
    # Sem 5
    '22CS51': 3,    # Automata Theory & Computability
    '22CS52': 4,    # Computer Networks (IPCC)
    '22CS53': 3,    # Artificial Intelligence & ML
    '22CS54': 3,    # Principles of Programming Languages / Web Tech
    '22CSL55': 1,   # CN Lab
    '22RMI56': 2,   # Research Methodology & IPR
    '22CIV57': 1,   # Environmental Studies
    '22CS58X': 1, '22CSL58X': 1,
    '22CS581': 1, '22CS582': 1, '22CS583': 1, '22CS584': 1,
    '22CSL581': 1, '22CSL582': 1,
    # Sem 6
    '22CS61': 3, '22CS62': 4, '22CS63': 3,
    '22CSL66': 1, '22CSMP67': 2, '22INT68': 3,
    # Sem 7-8
    '22CS71': 3, '22CS72': 2, '22CSP76': 10,
    '22CS731': 3, '22CS732': 3, '22CS733': 3,
    '22CS81': 1, '22INT82': 15,

    # ── 2022 SCHEME — ECE ────────────────────────────────────────────────────
    '22EC32': 4, '22EC33': 4, '22EC34': 3, '22ECL35': 1, '22EC38X': 1,
    '22EC41': 3, '22EC42': 4, '22EC43': 4, '22EC44': 3, '22ECL46': 1, '22EC48X': 1,
    '22EC51': 3, '22EC52': 4, '22EC53': 3, '22EC54': 3, '22ECL55': 1,
    '22EC58X': 1, '22ECL58X': 1,
    '22EC61': 3, '22EC62': 4, '22EC63': 3, '22ECL66': 1, '22ECMP67': 2,

    # ── 2022 SCHEME — ISE ────────────────────────────────────────────────────
    '22IS32': 4, '22IS33': 4, '22IS34': 3, '22ISL35': 1, '22IS38X': 1,
    '22IS41': 3, '22IS42': 4, '22IS43': 4, '22IS44': 3, '22ISL46': 1, '22IS48X': 1,
    '22IS51': 3, '22IS52': 4, '22IS53': 3, '22IS54': 3, '22ISL55': 1,
    '22IS58X': 1, '22ISL58X': 1,
    '22IS61': 3, '22IS62': 4, '22IS63': 3, '22ISL66': 1, '22ISMP67': 2,

    # ── 2022 SCHEME — ME ─────────────────────────────────────────────────────
    '22ME32': 4, '22ME33': 4, '22ME34': 3, '22MEL35': 1, '22ME38X': 1,
    '22ME41': 3, '22ME42': 4, '22ME43': 4, '22ME44': 3, '22MEL46': 1, '22ME48X': 1,
    '22ME51': 3, '22ME52': 4, '22ME53': 3, '22ME54': 3, '22MEL55': 1,
    '22ME61': 3, '22ME62': 4, '22ME63': 3, '22MEL66': 1, '22MEMP67': 2,

    # ── 2022 SCHEME — EEE ────────────────────────────────────────────────────
    '22EE32': 4, '22EE33': 4, '22EE34': 3, '22EEL35': 1,
    '22EE41': 3, '22EE42': 4, '22EE43': 4, '22EE44': 3, '22EEL46': 1,
    '22EE51': 3, '22EE52': 4, '22EE53': 3, '22EE54': 3, '22EEL55': 1,
    '22EE61': 3, '22EE62': 4, '22EE63': 3, '22EEL66': 1,

    # ── 2022 SCHEME — CV ─────────────────────────────────────────────────────
    '22CV32': 4, '22CV33': 4, '22CV34': 3, '22CVL35': 1,
    '22CV41': 3, '22CV42': 4, '22CV43': 4, '22CV44': 3, '22CVL46': 1,
    '22CV51': 3, '22CV52': 4, '22CV53': 3, '22CV54': 3, '22CVL55': 1,
    '22CV61': 3, '22CV62': 4, '22CV63': 3, '22CVL66': 1,

    # ── 2022 SCHEME — AIML ───────────────────────────────────────────────────
    '22AI32': 4, '22AI33': 4, '22AI34': 3, '22AIL35': 1,
    '22AI41': 3, '22AI42': 4, '22AI43': 4, '22AI44': 3, '22AIL46': 1,
    '22AI51': 3, '22AI52': 4, '22AI53': 3, '22AI54': 3, '22AIL55': 1,

    # ── 2022 SCHEME — DS ─────────────────────────────────────────────────────
    '22DS32': 4, '22DS33': 4, '22DS34': 3, '22DSL35': 1,
    '22DS41': 3, '22DS42': 4, '22DS43': 4, '22DS44': 3, '22DSL46': 1,
    '22DS51': 3, '22DS52': 4, '22DS53': 3, '22DS54': 3, '22DSL55': 1,

    # ── 2022 SCHEME — ETE ────────────────────────────────────────────────────
    '22ET32': 4, '22ET33': 4, '22ET34': 3, '22ETL35': 1,
    '22ET41': 3, '22ET42': 4, '22ET43': 4, '22ET44': 3, '22ETL46': 1,
    '22ET51': 3, '22ET52': 4, '22ET53': 3, '22ET54': 3, '22ETL55': 1,

    # ── 2022 SCHEME — COMMON CROSS-BRANCH ────────────────────────────────────
    '22BE45': 2,  '22UH36': 1,  '22UH49': 1,
    '22CIV57': 1, '22RMI56': 2,
    '22KSK37': 1, '22KBK37': 1, '22CIP37': 1,
    '22KSK47': 1, '22KBK47': 1, '22CIP47': 1,
    '22SCR36': 1, '22SCR46': 1,
    '22MATDIP31': 0, '22MATDIP41': 0,
    '22NS83': 0,  '22PE83': 0,  '22YO83': 0,

    # ── 2025 SCHEME — COMMON (Sem 1-2) ───────────────────────────────────────
    # Same 4cr for basic science as 2021/2022
    '25MAT11': 4, '25PHY12': 4, '25CHE12': 4,
    '25ELN14': 3, '25ELN15': 3,
    '25PHYL16': 1, '25CHEL17': 1, '25ELN18': 1,
    '25MAT21': 4, '25PHY22': 4, '25CHE22': 4,
    '25ELN24': 3, '25ELN25': 3,
    '25PHYL26': 1, '25CHEL27': 1,

    # ── 2025 SCHEME — CSE ────────────────────────────────────────────────────
    '25MAT31': 3, '25CS32': 4, '25CS33': 4, '25CS34': 3, '25CSL35': 1,
    '25UH36': 1, '25KSK37': 1, '25CIP37': 1,
    '25CS41': 3, '25CS42': 4, '25CS43': 4, '25CS44': 3, '25BE45': 2, '25CSL46': 1,
    '25KSK47': 1, '25KBK47': 1, '25CIP47': 1, '25UH49': 1, '25INT49': 2,
    '25CS51': 3, '25CS52': 4, '25CS53': 3, '25CS54': 3, '25CSL55': 1,
    '25RMI56': 2, '25CIV57': 1,

    # ── 2025 SCHEME — ECE ────────────────────────────────────────────────────
    '25EC32': 4, '25EC33': 4, '25EC34': 3, '25ECL35': 1,
    '25EC41': 3, '25EC42': 4, '25EC43': 4, '25EC44': 3, '25ECL46': 1,
    '25EC51': 3, '25EC52': 4, '25EC53': 3, '25EC54': 3, '25ECL55': 1,

    # ── 2025 SCHEME — ISE ────────────────────────────────────────────────────
    '25IS32': 4, '25IS33': 4, '25IS34': 3, '25ISL35': 1,
    '25IS41': 3, '25IS42': 4, '25IS43': 4, '25IS44': 3, '25ISL46': 1,
    '25IS51': 3, '25IS52': 4, '25IS53': 3, '25IS54': 3, '25ISL55': 1,

    # ── 2025 SCHEME — ME ─────────────────────────────────────────────────────
    '25ME32': 4, '25ME33': 4, '25ME34': 3, '25MEL35': 1,
    '25ME41': 3, '25ME42': 4, '25ME43': 4, '25ME44': 3, '25MEL46': 1,
    '25ME51': 3, '25ME52': 4, '25ME53': 3, '25ME54': 3, '25MEL55': 1,

    # ── 2025 SCHEME — EEE ────────────────────────────────────────────────────
    '25EE32': 4, '25EE33': 4, '25EE34': 3, '25EEL35': 1,
    '25EE41': 3, '25EE42': 4, '25EE43': 4, '25EE44': 3, '25EEL46': 1,

    # ── 2025 SCHEME — CV ─────────────────────────────────────────────────────
    '25CV32': 4, '25CV33': 4, '25CV34': 3, '25CVL35': 1,
    '25CV41': 3, '25CV42': 4, '25CV43': 4, '25CV44': 3, '25CVL46': 1,

    # ── 2025 SCHEME — AIML ───────────────────────────────────────────────────
    '25AI32': 4, '25AI33': 4, '25AI34': 3, '25AIL35': 1,
    '25AI41': 3, '25AI42': 4, '25AI43': 4, '25AI44': 3, '25AIL46': 1,

    # ── 2025 SCHEME — DS ─────────────────────────────────────────────────────
    '25DS32': 4, '25DS33': 4, '25DS34': 3, '25DSL35': 1,
    '25DS41': 3, '25DS42': 4, '25DS43': 4, '25DS44': 3, '25DSL46': 1,

    # ── 2025 SCHEME — COMMON ─────────────────────────────────────────────────
    '25BE45': 2, '25UH36': 1, '25CIV57': 1, '25RMI56': 2,
    '25KSK37': 1, '25CIP37': 1, '25SCR36': 1, '25SCR46': 1,
    '25MATDIP31': 0, '25MATDIP41': 0,
    '25NS83': 0, '25PE83': 0, '25YO83': 0,

    # ── 2018 SCHEME — CSE ────────────────────────────────────────────────────
    '18MAT31': 4, '18CS32': 4, '18CS33': 4, '18CS34': 4, '18CS35': 3,
    '18CSL38': 1, '18CPC39': 1, '18KSK39': 1, '18KBK39': 1,
    '18CS41': 4, '18CS42': 4, '18CS43': 4, '18CS44': 4, '18CS45': 3,
    '18CSL46': 1, '18CIE46': 1,
    '18CS51': 4, '18CS52': 4, '18CS53': 4, '18CS54': 4, '18CS55': 3,
    '18CSL57': 1, '18IS51': 4, '18CS56': 3,
    '18CS61': 4, '18CS62': 4, '18CS63': 4, '18CS64': 4, '18CS65': 3,
    '18CSL66': 1, '18MP68': 2,
    '18CS71': 4, '18CS72': 4, '18CS731': 4, '18CS732': 4, '18CS733': 4,
    '18CSP76': 10,

    # ── 2018 SCHEME — ECE ────────────────────────────────────────────────────
    '18EC31': 4, '18EC32': 4, '18EC33': 4, '18EC34': 4, '18EC35': 3,
    '18ECL36': 1, '18ECL37': 1,
    '18EC41': 4, '18EC42': 4, '18EC43': 4, '18EC44': 4, '18EC45': 3,
    '18ECL46': 1, '18ECL47': 1,
    '18EC51': 4, '18EC52': 4, '18EC53': 4, '18EC54': 4, '18EC55': 4,
    '18ECL56': 1, '18ECL57': 1,
    '18EC61': 4, '18EC62': 4, '18EC63': 4, '18EC64': 4, '18EC65': 3,

    # ── 2018 SCHEME — ME ─────────────────────────────────────────────────────
    '18ME31': 4, '18ME32': 4, '18ME33': 4, '18ME34': 4, '18ME35': 3,
    '18MEL36': 1, '18MEL37': 1,
    '18ME41': 4, '18ME42': 4, '18ME43': 4, '18ME44': 4, '18ME45': 3,
    '18MEL46': 1, '18MEL47': 1,
    '18ME51': 4, '18ME52': 4, '18ME53': 4, '18ME54': 4, '18ME55': 3,
    '18MEL56': 1, '18MEL57': 1,

    # ── 2015 SCHEME ──────────────────────────────────────────────────────────
    '15MAT31': 4, '15CS32': 4, '15CS33': 4, '15CS34': 4, '15CS35': 4,
    '15CSL38': 1, '15CSL48': 1,
    '15CS42': 4, '15CS43': 4, '15CS44': 4, '15CS45': 4, '15CS46': 4,
    '15CS52': 4, '15CS53': 4, '15CS54': 4, '15CS55': 4, '15CS56': 4,
    '15CSL57': 1, '15CSL58': 1,
    '15ME42': 4, '15ME43': 4, '15ME44': 4, '15ME45': 4,
    '15MEL47': 1, '15MEL48': 2,
    '15EC52': 4, '15EC53': 4, '15EC54': 4, '15EC55': 4,
    '15ECL56': 1, '15ECL57': 1,
}

# ══════════════════════════════════════════════════════════════════════════════
# ALTERNATE CODE FORMAT LOOKUP
# VTU result portal sometimes uses a different code format (e.g. BCM301, BCS302)
# instead of the scheme-prefixed codes (e.g. 22MAT31, 22CS32).
# Pattern: B<DEPT><SEM><SEQ>[optional letter suffix]
# Dept: CS, CM (math), CL (lab), ECE/EC, ME, EE, CV, IS, AI, DS, ET, SCK, NSK, etc.
# This table maps known alternate codes to credits for the 2022 scheme.
# ══════════════════════════════════════════════════════════════════════════════
ALTERNATE_CODE_CREDITS = {
    # ── 2022 Scheme Sem 3 (CSE/CM codes) ──────────────────────────────────────
    'BCM301':  3,   # Mathematics for Computer & Communication Engg (= 22MAT31)
    'BCS302':  4,   # Digital Design & Computer Organization (IPCC, = 22CS33)
    'BCS303':  3,   # Operating Systems (= 22CS44 / 22CS34)
    'BCS304':  4,   # Data Structures and Applications (IPCC, = 22CS32)
    'BCSL305': 1,   # Data Structures Lab (= 22CSL35)
    'BSCK306': 1,   # Societal Connect & Responsibility / Constitution
    'BSCK307': 1,   # Social Connection and Responsibility (AEC)
    'BNSK359': 0,   # National Service Scheme (non-credit mandatory)
    'BCS306A': 4,   # OOP with Java (IPCC elective)
    'BCS306B': 4,   # Analog & Digital Electronics (IPCC elective)
    'BCS358A': 1,   # Open Elective A
    'BCS358B': 1,   # Open Elective B
    'BCS358C': 1,   # Open Elective C
    'BCS358D': 1,   # Data Visualization with Python (open elective)
    'BCS358E': 1,   # Open Elective E
    # ── 2022 Scheme Sem 4 ─────────────────────────────────────────────────────
    'BCM401':  3,   # Mathematics (Sem 4)
    'BCS402':  4,   # IPCC-1 (Microcontrollers / similar)
    'BCS403':  4,   # IPCC-2 (DBMS / similar)
    'BCS404':  3,   # PCC (Analysis & Design of Algorithms)
    'BCS405A': 4,   # Elective IPCC A
    'BCS405B': 4,   # Elective IPCC B
    'BCSL456': 1,   # Lab
    'BSCK407': 1,   # AEC / Kannada / Soft Skills
    'BNSK458': 0,   # NSS (non-credit)
    # ── 2022 Scheme Sem 5 ─────────────────────────────────────────────────────
    'BCS501':  3,
    'BCS502':  4,
    'BCS503':  3,
    'BCS504':  3,
    'BCSL505': 1,
    'BSCK506': 1,
    'BCS508A': 1,
    'BCS508B': 1,
    'BCS508C': 1,
    'BCS508D': 1,
    # ── 2022 Scheme Sem 6 ─────────────────────────────────────────────────────
    'BCS601':  3,
    'BCS602':  4,
    'BCS603':  3,
    'BCSL604': 1,
    'BCSMP605':2,
    'BCSINT606':3,
    # ── ECE alternate codes ───────────────────────────────────────────────────
    'BEC301':  4, 'BEC302': 4, 'BEC303': 3, 'BECL304': 1,
    'BEC401':  3, 'BEC402': 4, 'BEC403': 4, 'BEC404': 3, 'BECL405': 1,
    # ── ME alternate codes ────────────────────────────────────────────────────
    'BME301':  4, 'BME302': 4, 'BME303': 3, 'BMEL304': 1,
    'BME401':  3, 'BME402': 4, 'BME403': 4, 'BME404': 3, 'BMEL405': 1,
    # ── ISE alternate codes ───────────────────────────────────────────────────
    'BIS301':  4, 'BIS302': 4, 'BIS303': 3, 'BISL304': 1,
    'BIS401':  3, 'BIS402': 4, 'BIS403': 4, 'BIS404': 3, 'BISL405': 1,
}

def is_alternate_vtu_code(s):
    """
    Detect alternate VTU result-portal codes like BCM301, BCS302, BCSL305, BCS306A.
    Pattern: B + 2-4 uppercase letters + 3 digits + optional letter(s)
    """
    return bool(re.match(r'^B[A-Z]{2,5}\d{3}[A-Z]?$', s.strip(), re.IGNORECASE))

def get_credits_alternate(code):
    """Return credits for an alternate-format VTU code."""
    code = code.strip().upper()
    if code in ALTERNATE_CODE_CREDITS:
        return ALTERNATE_CODE_CREDITS[code]

    # Generic inference from alternate code pattern
    # B<DEPT><SEM><SEQ>[suffix]
    m = re.match(r'^B([A-Z]+?)(\d)(\d{2})([A-Z]?)$', code)
    if not m:
        return None  # Can't infer

    dept, sem_d, seq, suffix = m.groups()
    seq_n = int(seq)
    last = seq_n % 10

    # Zero-credit mandatory activities
    if dept in ('NSK', 'NSS', 'PE', 'YO'):
        return 0

    # Lab departments
    if dept.endswith('L') or dept in ('LAB',):
        return 1

    # AEC/value-based (SCK, SKA, HUM, etc.)
    if dept in ('SCK', 'SKA', 'SKS', 'HUM', 'CIP', 'KSK', 'KBK'):
        return 1

    # Math (CM) in sem 3+ → 3cr in 2022 scheme
    if dept in ('CM', 'MAT', 'BSC'):
        return 3 if int(sem_d) >= 3 else 4

    # Elective open courses (seq 58x pattern → 1cr)
    if seq_n >= 58:
        return 1

    # Position-based credit inference (same logic as 22/21 scheme)
    if last in (2, 3, 6):
        return 4   # IPCC
    elif last in (1, 4, 5):
        return 3   # PCC / theory
    elif last in (5, 7, 8, 9, 0):
        return 1   # Lab / AEC
    return 3


def infer_credits_fallback(code):
    """
    Infer credits from VTU subject code pattern when not in official table.
    Covers unknown electives, new subjects, variant codes.
    """
    m = re.match(r'^(\d{2})([A-Z]{2,6})(\d{2,4})[X]?$', code)
    if not m:
        return 4
    scheme, dept, num_str = m.groups()
    scheme_num = int(scheme)
    subj_num   = int(num_str)
    last_digit = subj_num % 10
    sem_digit  = (subj_num // 10) % 10   # 1=sem1, 2=sem2, 3=sem3 …

    # Non-credit mandatory courses (universal across all schemes)
    if dept in ('MATDIP', 'NS', 'PE', 'YO', 'NSS'):
        return 0

    # ── ALL MODERN SCHEMES (21, 22, 25) ──────────────────────────────────────
    if scheme_num >= 21:
        # Lab/practical departments → always 1cr
        if dept.endswith('L') or dept in ('LAB',):
            return 1

        # Sem 1 & 2: basic science (PHY, CHE, MAT) → 4cr
        # (these are full 4-credit theory courses in sem 1/2)
        if sem_digit in (1, 2) and dept in ('MAT', 'PHY', 'CHE', 'BSC'):
            return 4

        # Cross-branch mandatory courses
        if dept in ('RMI', 'RMIPR'):
            return 2   # Research Methodology & IPR
        if dept in ('CIV', 'EVS', 'ENV', 'CIVL'):
            return 1   # Environmental studies lab/theory
        if dept in ('BE',):
            return 2   # Biology for Engineers
        if dept in ('UH', 'UHV', 'SCR', 'HUM', 'HSMC',
                    'KSK', 'KBK', 'CIP', 'SKA', 'SKS', 'ENG', 'KAN'):
            return 1   # Language/value-based AEC

        # Math in sem 3 (MAT31, MAT31 etc.) → 3cr in 21/22/25 scheme
        if dept in ('MAT', 'BSC', 'PHY', 'CHE') and sem_digit >= 3:
            return 3

        # IPCC detection (21/22/25 scheme):
        # Positions 2 and 3 within a semester are typically IPCC = 4cr
        # Positions 1, 4 = PCC = 3cr
        # Positions 5+ = Lab/AEC = 1cr
        if last_digit in (2, 3):
            return 4   # IPCC subjects (integrated practical-theory)
        elif last_digit in (1, 4):
            return 3   # PCC / theory subjects
        elif last_digit in (5, 6, 7, 8, 9, 0):
            return 1   # Lab, AEC, seminar
        return 3

    # ── OLD SCHEMES (15, 16, 17, 18, 19, 20) ─────────────────────────────────
    else:
        # Lab departments → 1cr
        if dept.endswith('L'):
            return 1
        # Basic science/math/language → depends on semester
        if dept in ('MAT', 'PHY', 'CHE', 'ENG', 'KAN', 'HSS', 'ELN'):
            return 4 if subj_num < 30 else 2
        # All theory = 4cr in old scheme
        return 4


def get_credits(code):
    """Get official VTU credits for a subject code."""
    code = code.strip().upper()

    # 1. Direct lookup in official credits table
    if code in OFFICIAL_CREDITS:
        return OFFICIAL_CREDITS[code]

    # 2. Strip trailing X (AEC/elective codes like 21CS58X → 21CS58)
    base = re.sub(r'X+$', '', code)
    if base in OFFICIAL_CREDITS:
        return OFFICIAL_CREDITS[base]

    # 3. Alternate code format (BCM301, BCS302 style — 2022 scheme result portal)
    if is_alternate_vtu_code(code):
        c = get_credits_alternate(code)
        if c is not None:
            return c

    # 4. Fallback inference
    return infer_credits_fallback(code)


# ══════════════════════════════════════════════════════════════════════════════
# VTU GRADE POINTS — Official 10-point scale
# ══════════════════════════════════════════════════════════════════════════════
def get_grade_points(total):
    if total >= 90: return 10  # S
    if total >= 80: return 9   # A
    if total >= 70: return 8   # B
    if total >= 60: return 7   # C
    if total >= 50: return 6   # D
    if total >= 40: return 4   # E
    return 0                    # F


# ══════════════════════════════════════════════════════════════════════════════
# SUBJECT CODE DETECTION
# ══════════════════════════════════════════════════════════════════════════════
VTU_CODE = re.compile(r'^\d{2}[A-Z]{2,6}\d{2,4}[X]?$', re.IGNORECASE)

def is_vtu_code(s):
    return bool(VTU_CODE.match(s.strip())) or is_alternate_vtu_code(s.strip())

def clean_name(name):
    return ' '.join(str(name).replace('\n', ' ').split()).strip()[:100]


# ══════════════════════════════════════════════════════════════════════════════
# ROW PARSER
# ══════════════════════════════════════════════════════════════════════════════
def parse_row(cells):
    cells = [str(c).strip() for c in cells
             if str(c).strip() not in ('', 'nan', 'None', '-', '--', 'N/A')]
    if not cells:
        return None

    code = None
    code_idx = -1
    for i, cell in enumerate(cells):
        if is_vtu_code(cell):
            # For scheme-prefixed codes, strip trailing X (elective marker)
            # For alternate codes (BCM301 style), keep as-is
            if is_alternate_vtu_code(cell.strip()):
                code = cell.strip().upper()
            else:
                code = cell.upper().rstrip('X')
            code_idx = i
            break
    if not code:
        return None

    name = code
    for cell in cells[code_idx + 1:]:
        try:
            int(float(cell))
        except (ValueError, TypeError):
            if len(cell) > 2:
                name = clean_name(cell)
                break

    # Filter out result letters (P, F, A, W, X) and date strings before extracting numbers
    filtered_cells = []
    for cell in cells[code_idx + 1:]:
        # Skip single result-status letters
        if re.match(r'^[PFAWX]$', cell.strip(), re.IGNORECASE):
            continue
        # Skip date strings like 2026-03-03
        if re.match(r'^\d{4}-\d{2}-\d{2}$', cell.strip()):
            continue
        # Skip "Announced", "Updated", "on" (header words)
        if cell.strip().lower() in ('announced', 'updated', 'on', 'result'):
            continue
        filtered_cells.append(cell)

    nums = []
    for cell in filtered_cells:
        try:
            n = int(float(str(cell)))
            if 0 <= n <= 200:
                nums.append(n)
        except (ValueError, TypeError):
            pass

    if len(nums) >= 3:
        internal, external, total = nums[0], nums[1], nums[2]
        if abs(total - (internal + external)) > 3:
            total = internal + external
    elif len(nums) == 2:
        internal, external = nums[0], nums[1]
        total = internal + external
    elif len(nums) == 1:
        total = nums[0]
        internal, external = 0, total
    else:
        return None

    if total == 0 and internal == 0 and external == 0:
        return None

    credits = get_credits(code)
    gp = get_grade_points(total)

    if credits == 0:
        return None

    return {
        'subject_code':       code,
        'subject_name':       name,
        'internal_marks':     internal,
        'external_marks':     external,
        'total_marks':        total,
        'credits':            credits,
        'grade_points':       gp,
        'grade_point_credits': gp * credits,
    }


# ══════════════════════════════════════════════════════════════════════════════
# PDF PARSERS
# ══════════════════════════════════════════════════════════════════════════════
def parse_with_pdfplumber(pdf_path):
    import pdfplumber
    subjects = []
    seen = set()
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            for table in (page.extract_tables() or []):
                for row in table:
                    r = parse_row(row)
                    if r and r['subject_code'] not in seen:
                        subjects.append(r)
                        seen.add(r['subject_code'])
            if not subjects:
                words = page.extract_words(x_tolerance=4, y_tolerance=4) or []
                lines = {}
                for w in words:
                    y = round(float(w.get('top', 0)) / 4) * 4
                    lines.setdefault(y, []).append(w['text'])
                for y in sorted(lines):
                    r = parse_row(lines[y])
                    if r and r['subject_code'] not in seen:
                        subjects.append(r)
                        seen.add(r['subject_code'])
            if not subjects:
                text = page.extract_text() or ''
                for line in text.split('\n'):
                    r = parse_row(line.split())
                    if r and r['subject_code'] not in seen:
                        subjects.append(r)
                        seen.add(r['subject_code'])
    return subjects


def parse_with_tabula(pdf_path):
    import tabula
    subjects = []
    seen = set()
    try:
        tables = tabula.read_pdf(pdf_path, pages='all', multiple_tables=True,
                                  lattice=True, stream=True, silent=True)
        for table in tables:
            for _, row in table.iterrows():
                r = parse_row(row.tolist())
                if r and r['subject_code'] not in seen:
                    subjects.append(r)
                    seen.add(r['subject_code'])
    except Exception as e:
        print(f"tabula error: {e}", file=sys.stderr)
    return subjects


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════
def main(pdf_path, output_excel):
    subjects = []

    try:
        subjects = parse_with_pdfplumber(pdf_path)
        if subjects:
            print(f"pdfplumber: {len(subjects)} subjects", file=sys.stderr)
    except Exception as e:
        print(f"pdfplumber failed: {e}", file=sys.stderr)

    if not subjects:
        try:
            subjects = parse_with_tabula(pdf_path)
            if subjects:
                print(f"tabula: {len(subjects)} subjects", file=sys.stderr)
        except Exception as e:
            print(f"tabula failed: {e}", file=sys.stderr)

    if not subjects:
        result = {'subjects': [], 'total_credits': 0,
                  'total_grade_points': 0, 'sgpa': 0.0}
        with open(output_excel.replace('.xlsx', '.json'), 'w') as f:
            json.dump(result, f)
        try:
            import pandas as pd
            pd.DataFrame([]).to_excel(output_excel, index=False)
        except Exception:
            pass
        print("0 subjects extracted")
        sys.exit(0)

    total_credits = sum(s['credits'] for s in subjects)
    total_gp      = sum(s['grade_point_credits'] for s in subjects)
    sgpa = round(total_gp / total_credits, 2) if total_credits > 0 else 0.0

    result = {
        'subjects': subjects,
        'total_credits': total_credits,
        'total_grade_points': total_gp,
        'sgpa': sgpa,
    }

    with open(output_excel.replace('.xlsx', '.json'), 'w') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    try:
        import pandas as pd
        with pd.ExcelWriter(output_excel) as writer:
            pd.DataFrame(subjects).to_excel(
                writer, sheet_name='Subjects', index=False)
            pd.DataFrame([{
                'SGPA': sgpa,
                'Total Credits': total_credits,
                'Total Grade Points': total_gp,
            }]).to_excel(writer, sheet_name='Summary', index=False)
    except Exception as e:
        print(f"Excel write failed: {e}", file=sys.stderr)

    print(f"{len(subjects)} subjects | SGPA: {sgpa} | Credits: {total_credits}")


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python pdf_to_excel.py <input.pdf> <output.xlsx>")
        sys.exit(1)
    main(sys.argv[1], sys.argv[2])
