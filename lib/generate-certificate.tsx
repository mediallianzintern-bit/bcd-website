/**
 * Certificate PDF generator
 *
 * Uses the Canva certificate PNG as the background (3575×2589px original).
 * Overlays 3 text fields at positions derived from the original template:
 *
 *   Candidate Name  — Alex Brush, centered on green underline (x=1895, baseline y=1316)
 *   Course Name     — Poppins Bold, left-aligned after "for completing" (x=1192, y=1545)
 *   Date            — Poppins Bold, left-aligned after "on" (x=1192, y=1830)
 *
 * Template must be saved at:  public/images/certificate-template.png
 */

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  renderToBuffer,
  Font,
} from "@react-pdf/renderer"
import path from "path"

// ── Fonts ────────────────────────────────────────────────────────────────────
Font.register({
  family: "AlexBrush",
  src: path.join(process.cwd(), "public/fonts/AlexBrush-Regular.ttf"),
})
Font.register({
  family: "Poppins",
  fonts: [
    { src: path.join(process.cwd(), "public/fonts/Poppins-Bold.ttf"), fontWeight: "bold" },
  ],
})

// ── Template dimensions & PDF page size ──────────────────────────────────────
// Template: 3575 × 2589 px  →  A4 landscape: 842 × 595 pt
const TPL_W = 3575
const TPL_H = 2589
const PDF_W = 842
const PDF_H = 595

// Convert template pixel coords → PDF pt
const tx = (px: number) => (px / TPL_W) * PDF_W
const ty = (py: number) => (py / TPL_H) * PDF_H
const ts = (px: number) => (px / TPL_H) * PDF_H   // font-size scale (relative to height)

// ── Original template positions ───────────────────────────────────────────────
// Name:   center x=1895, baseline y=1316, max line width=1400px, font=232pt
// Course: left x=1192, top y=1545, font=61pt
// Date:   left x=1192, top y=1830, font=57pt

const NAME_CX   = tx(1895)   // center x in PDF pt
const NAME_Y    = ty(1316)   // baseline y in PDF pt
const NAME_FSIZE = ts(232)   // font size in PDF pt
const NAME_MAX_W = tx(2400)  // available width for name (wider than underline to allow centering)

const COURSE_X  = tx(1192)
const COURSE_Y  = ty(1545)
const COURSE_FSIZE = ts(61)

const DATE_X    = tx(1192)
const DATE_Y    = ty(1830)
const DATE_FSIZE = ts(57)

// ── Paths ────────────────────────────────────────────────────────────────────
const TEMPLATE = path.join(process.cwd(), "public/images/certificate-template.png")

// ── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    width: PDF_W,
    height: PDF_H,
    backgroundColor: "#ffffff",
    position: "relative",
  },
  bg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: PDF_W,
    height: PDF_H,
  },
  // Name: absolutely positioned, centered on the underline
  nameWrap: {
    position: "absolute",
    left: NAME_CX - NAME_MAX_W / 2,
    top: NAME_Y - NAME_FSIZE * 1.1,   // shift up so baseline aligns with line
    width: NAME_MAX_W,
    alignItems: "center",
  },
  nameText: {
    fontFamily: "AlexBrush",
    fontSize: NAME_FSIZE,
    color: "#1a5c2a",
    textAlign: "center",
  },
  // Course: left-aligned
  courseWrap: {
    position: "absolute",
    left: COURSE_X,
    top: COURSE_Y - COURSE_FSIZE,
    width: PDF_W - COURSE_X - tx(80),
  },
  courseText: {
    fontFamily: "Poppins",
    fontWeight: "bold",
    fontSize: COURSE_FSIZE,
    color: "#111111",
  },
  // Date: left-aligned
  dateWrap: {
    position: "absolute",
    left: DATE_X,
    top: DATE_Y - DATE_FSIZE,
    width: PDF_W - DATE_X - tx(80),
  },
  dateText: {
    fontFamily: "Poppins",
    fontWeight: "bold",
    fontSize: DATE_FSIZE,
    color: "#111111",
  },
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

// Shrink name font: AlexBrush title-case avg ~0.42 × fontSize per char
function nameFontSize(name: string): number {
  const estimated = name.length * 0.42 * NAME_FSIZE
  if (estimated <= NAME_MAX_W) return NAME_FSIZE
  return Math.floor(NAME_MAX_W / (name.length * 0.42))
}

// Shrink course font: Poppins Bold avg ~0.55 × fontSize per char
const COURSE_MAX_W = PDF_W - COURSE_X - tx(80)
function courseFontSize(title: string): number {
  const estimated = title.length * 0.55 * COURSE_FSIZE
  if (estimated <= COURSE_MAX_W) return COURSE_FSIZE
  return Math.max(Math.floor(COURSE_MAX_W / (title.length * 0.55)), ts(30))
}

// ── Certificate Document ──────────────────────────────────────────────────────
interface CertProps {
  name: string
  courseTitle: string
  date: string
}

function CertificateDocument({ name, courseTitle, date }: CertProps) {
  const displayName = toTitleCase(name)
  const nameFSize = nameFontSize(displayName)
  const courseFSize = courseFontSize(courseTitle)

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={s.page}>

        {/* Background template */}
        <Image src={TEMPLATE} style={s.bg} />

        {/* Candidate Name — title-cased, non-breaking spaces, no hyphenation */}
        <View style={s.nameWrap}>
          <Text
            style={{ ...s.nameText, fontSize: nameFSize }}
            hyphenationCallback={(w) => [w]}
          >
            {displayName.replace(/ /g, "\u00A0")}
          </Text>
        </View>

        {/* Course Name */}
        <View style={s.courseWrap}>
          <Text style={{ ...s.courseText, fontSize: courseFSize }}>{courseTitle}</Text>
        </View>

        {/* Date */}
        <View style={s.dateWrap}>
          <Text style={s.dateText}>{date}</Text>
        </View>

      </Page>
    </Document>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────
export async function generateCertificatePDF(
  name: string,
  courseTitle: string,
  completedAt: string
): Promise<Buffer> {
  const date = new Date(completedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buf = await renderToBuffer(<CertificateDocument name={name} courseTitle={courseTitle} date={date} /> as any)
  return Buffer.from(buf)
}
