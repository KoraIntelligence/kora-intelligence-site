let toneCache = "neutral";

export async function getTone() {
  return toneCache;
}

export async function setTone(tone: string) {
  toneCache = tone;
}