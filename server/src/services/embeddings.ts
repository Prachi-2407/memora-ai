import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

const apiKey =
  process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY is missing"
  );
}

const ai = new GoogleGenAI({
  apiKey,
});

const EMBEDDING_MODEL =
  "gemini-embedding-2";

export async function createEmbedding(
  text: string
): Promise<number[]> {
  const response =
    await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: text,
      config: {
        outputDimensionality: 768,
      },
    });

  const embedding =
    response.embeddings?.[0]?.values;

  if (!embedding) {
    throw new Error(
      "Failed to generate embedding"
    );
  }

  return embedding;
}

export function cosineSimilarity(
  a: number[],
  b: number[]
): number {
  if (
    a.length !== b.length ||
    a.length === 0
  ) {
    return 0;
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (
    let i = 0;
    i < a.length;
    i++
  ) {
    dotProduct +=
      a[i] * b[i];

    magnitudeA +=
      a[i] * a[i];

    magnitudeB +=
      b[i] * b[i];
  }

  const denominator =
    Math.sqrt(magnitudeA) *
    Math.sqrt(magnitudeB);

  if (denominator === 0) {
    return 0;
  }

  return (
    dotProduct /
    denominator
  );
}