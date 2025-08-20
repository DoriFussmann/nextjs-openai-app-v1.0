export const buildDataHandlingPrompt = (rawData: string, schemaJson: string) => `
You are a STRICT data mapper and editor. Output ONLY valid JSON (no markdown, no commentary). The JSON MUST parse.

INPUTS
- RAW_DATA: free-form company text between <RAW_DATA>…</RAW_DATA>.
- SCHEMA: JSON with topics[] → subtopics[] → keyQuestions[] between <SCHEMA>…</SCHEMA>.

GOAL
Map RAW_DATA into the SCHEMA's topics/subtopics, evaluate each subtopic against its keyQuestions, and produce refined (edited-for-clarity) versions of ONLY the claims found in RAW_DATA. Never invent facts. If insufficient info exists, mark the subtopic as NA with a short reason.

DEFINITIONS
- "Answered" subtopic = RAW_DATA provides concrete information that satisfactorily answers at least ONE keyQuestion for that subtopic (specific claims, metrics, named entities, clear statements of intent/process—NOT vague vibes).
- "Refined" = grammar/tone tightened, concise, professional, preserving the exact meaning of the "original" sentence (no added numbers, names, claims, or dates).

PROCESS
1) Parse RAW_DATA into discrete, atomic data points (sentences/claims). Keep each as \`original\`.
2) For each subtopic in SCHEMA:
   • Determine if at least one keyQuestion is satisfactorily answered by RAW_DATA.
   • If YES → status = "answered".
       - Collect all relevant sentences as dataPoints[]. For each, create a faithful \`refined\` version.
   • If NO → status = "na", include a brief \`reason\` (e.g., "no pricing details", "no customer metrics", "no competitors named"), and set \`dataPoints\` to an empty array [].
3) Write a 2–3 sentence \`summary\` that synthesizes ONLY what appears in RAW_DATA (no speculation).
4) Compute topic-level completion:
   - answered = count of subtopics with status "answered"
   - total = total subtopics in that topic
   - percent = round(100 * answered / total)

OUTPUT FORMAT (STRICT JSON)
{
  "version": "1.0",
  "summary": "<string>",
  "topics": [
    {
      "topicId": "<from SCHEMA>",
      "title": "<from SCHEMA>",
      "completion": { "answered": <int>, "total": <int>, "percent": <int> },
      "subtopics": [
        {
          "subtopicId": "<from SCHEMA>",
          "title": "<from SCHEMA>",
          "status": "answered" | "na",
          "reason": "<present ONLY if status==='na'>",
          "dataPoints": [
            { "original": "<verbatim sentence from RAW_DATA>", "refined": "<edited version, same meaning>" }
          ]
        }
        // NOTE: For status="na", use empty array: "dataPoints": []
      ]
    }
  ]
}

RULES
- NO invented content. Use only what is explicitly present in RAW_DATA.
- If uncertain, prefer "na" with a concise reason.
- Keep JSON minimal and valid: no trailing commas; include empty arrays when needed; preserve keys and casing exactly as above.
- If a sentence is relevant to multiple subtopics, it may appear in multiple \`dataPoints\` lists.
- Do NOT include the RAW_DATA text wholesale in \`summary\`—summarize concisely.

<RAW_DATA>
${rawData}
</RAW_DATA>

<SCHEMA>
${schemaJson}
</SCHEMA>
`;

