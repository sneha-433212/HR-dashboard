import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Extracted = {
  role?: string;
  skills?: string;
  experience?: string;
  qualifications?: string;
  blood_group?: string;
  emergency_contact?: string;
};


function normalizeText(input: string) {

  let t = input
    .replace(/\r/g, "")
    .replace(/\u00A0/g, " ")
    .replace(/\u200B/g, "")
    .replace(/\uFF0B/g, "+")
    .replace(/[\u2212\u2012\u2013\u2014]/g, "-");
  return {
    text: t,
    flat: t.replace(/[ \t]+/g, " "),
    nospace: t.replace(/\s+/g, " "),
  };
}


function fallbackRegexExtract(raw: string): Extracted {
  const out: Extracted = {};
  const { text, flat, nospace } = normalizeText(raw);



  const bgCtx =
    text.match(
      /Blood\s*Group[^\S\r\n]*[:\-]?[^\S\r\n]*(?:\n|\r|\n\r)?[^\S\r\n]*((?:AB|A|B|O)[^\S\r\n]*[+\-])/i
    ) ||
    text.match(
      /Blood\s*Group[^\n]*\n+[^\S\r\n]*((?:AB|A|B|O)[^\S\r\n]*[+\-])/i
    );
  if (bgCtx?.[1]) {
    out.blood_group = bgCtx[1].replace(/\s+/g, "").toUpperCase();
  } else {

    const bgAny =
      nospace.match(/\b(AB|A|B|O)\s*[+\-]\b/i) ||
      flat.match(/\b(AB|A|B|O)\s*[+\-]\b/i);
    if (bgAny) out.blood_group = bgAny[0].replace(/\s+/g, "").toUpperCase();
  }


  const skillsLine =
    text.match(/Skills?\s*[:\-]\s*(.+)/i) ||
    text.match(/Skills?[^\n]*\n\s*(.+)/i);
  if (skillsLine?.[1]) out.skills = skillsLine[1].trim();


  const roleLine = text.match(
    /(Software|Frontend|Back\s*end|Backend|Full[-\s]?stack|Developer|Engineer|Designer|Manager)[^\n]{0,60}/i
  );
  if (roleLine) out.role = roleLine[0].trim();


  const qual =
    text.match(/(Qualification|Education|Degree)s?\s*[:\-]\s*([\s\S]{0,200})/i) ||
    text.match(/(Qualification|Education|Degree)s?[^\n]*\n\s*([\s\S]{0,200})/i);
  if (qual?.[2]) out.qualifications = qual[2].split("\n")[0].trim();


  const ec =
    text.match(/Emergency\s*Contact\s*[:\-]\s*([\s\S]{0,120})/i) ||
    text.match(/Emergency\s*Contact[^\n]*\n\s*([\s\S]{0,120})/i);
  if (ec?.[1]) out.emergency_contact = ec[1].split("\n")[0].trim();


  const exp =
    text.match(/(Summary|Experience|Profile)\s*[:\-]?\s*([\s\S]{0,600})/i) ||
    text.match(/(Summary|Experience|Profile)[^\n]*\n\s*([\s\S]{0,600})/i);
  if (exp?.[2]) out.experience = exp[2].split("\n").slice(0, 5).join(" ").trim();

  return out;
}


async function fileToPlainText(file: File): Promise<string> {
  const ab = Buffer.from(await file.arrayBuffer());
  const name = (file.name || "").toLowerCase();

  if (name.endsWith(".pdf")) {
    const res = await pdfParse(ab);
    return res.text || "";
  }
  if (name.endsWith(".docx")) {
    const res = await mammoth.extractRawText({ buffer: ab });
    return res.value || "";
  }

  return ab.toString("utf8");
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "file missing" }, { status: 400 });
    }

    const text = await fileToPlainText(file);
    console.log("📄 text length:", text.length);

    if (!text || text.trim().length < 10) {
      return NextResponse.json({ error: "Could not read text from file" }, { status: 422 });
    }

    let extracted: Extracted = fallbackRegexExtract(text);


    const apiKey = process.env.OPENAI_API_KEY;
    console.log("OPENAI_API_KEY present?", !!apiKey);

    if (apiKey) {
      try {
        const openai = new OpenAI({ apiKey });
        const prompt = `
Extract the following as JSON only:
{ "role": "", "skills": "", "experience": "", "qualifications": "", "blood_group": "", "emergency_contact": "" }
From this resume:
"""${text.slice(0, 12000)}"""
        `.trim();

        const resp = await openai.responses.create({
          model: "gpt-4o-mini",
          input: prompt,
          temperature: 0,
        });

        const raw = (resp as any).output_text as string | undefined;
        console.log("OpenAI raw:", raw);

        if (raw) {
          try {
            const j = JSON.parse(raw);
            extracted = { ...extracted, ...(j as Extracted) };
          } catch {
            console.warn(" Could not parse JSON from OpenAI:", raw);
          }
        }
      } catch (err: any) {
        console.error("OpenAI call failed:", err.message);
      }
    }

    return NextResponse.json(extracted, { status: 200 });
  } catch (e: any) {
    console.error(" extract-cv crash:", e);
    return NextResponse.json({ error: e?.message || "server error" }, { status: 500 });
  }
}
