/* -------------------------------------------
   src/app/page.tsx
   Next.js (App Router) + TypeScript + Tailwind
-------------------------------------------- */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function Home() {
  /* Canvas への参照を保持 */
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [text, setText] = useState("");
  const [haiku, setHaiku] = useState<{ ja: string[]; en: string[] } | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // マグカップ画像を一度だけ読み込み
  const mugImage = useMemo(() => {
    const img = new Image();
    img.src = "/mug.png"; // public/mug.png にコピー済み
    return img;
  }, []);
  const [imageLoaded, setImageLoaded] = useState(false);
  useEffect(() => {
    mugImage.onload = () => setImageLoaded(true);
  }, [mugImage]);

  /** 俳句を Canvas に描画 */
  const drawHaiku = useCallback(
    (img: HTMLImageElement, lines: string[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

      /* 背景リセット & 画像描画 */
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      /* 入力 3 行を縦書き風に 3 列で描画 */
      const columnX = [
        canvas.width / 2 - 5,
        canvas.width / 2 + 35,
        canvas.width / 2 + 75,
      ];

      lines.forEach((text, colIdx) => {
        /* 一時 Canvas で縦書きレイアウトを作成 */
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = 50;
        tempCanvas.height = 200;
        const tempCtx = tempCanvas.getContext(
          "2d",
        ) as CanvasRenderingContext2D;

        tempCtx.font = "24px serif";
        tempCtx.fillStyle = "white";
        tempCtx.textAlign = "center";

        text.split("").forEach((char, idx) => {
          tempCtx.fillText(char, tempCanvas.width / 2, 30 + idx * 26);
        });

        /* 中央列は少し太めにする例 */
        const horizontalScale = colIdx === 1 ? 1.0 : 0.95;
        const drawWidth = tempCanvas.width * horizontalScale;

        ctx.drawImage(
          tempCanvas,
          0,
          0,
          tempCanvas.width,
          tempCanvas.height,
          columnX[colIdx] - drawWidth / 2,
          canvas.height / 3,
          drawWidth,
          tempCanvas.height,
        );
      });
    },
    [],
  );

  useEffect(() => {
    if (haiku && imageLoaded) {
      drawHaiku(mugImage, haiku.ja);
    }
  }, [haiku, imageLoaded, drawHaiku, mugImage]);

  async function handleGenerate() {
    setError(null);
    if (!text.trim()) {
      setError("Text is required");
      return;
    }
    if (text.length > 200) {
      setError("Text must be 200 characters or fewer");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/haiku", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const { error: errMsg } = await res.json();
        throw new Error(errMsg || "Failed to generate");
      }
      const data = await res.json();
      setHaiku(data.haiku);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  /* ---------- JSX ---------- */
  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-6">
      <h3 className="text-2xl font-bold">俳句マグカップ生成</h3>

      <div className="flex flex-col gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter English text"
          className="w-64 rounded border px-2 py-1"
        />
        <button
          onClick={handleGenerate}
          className="mt-2 rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "生成中..." : "生成"}
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </div>

      <canvas
        ref={canvasRef}
        id="canvas"
        width={500}
        height={500}
        className="border"
      />

      {haiku && (
        <div className="mt-4 text-center text-sm text-gray-700">
          {haiku.en.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}
    </main>
  );
}
