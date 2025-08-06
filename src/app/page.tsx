/* -------------------------------------------
   src/app/page.tsx
   Next.js (App Router) + TypeScript + Tailwind
-------------------------------------------- */
"use client";

import { useRef } from "react";

export default function Home() {
  /* Canvas への参照を保持 */
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  /** 旧 script.js の drawHaiku() を移植した関数 */
  function drawHaiku() {
    /* 入力値を取得 */
    const line1 = (document.getElementById("line1") as HTMLInputElement).value;
    const line2 = (document.getElementById("line2") as HTMLInputElement).value;
    const line3 = (document.getElementById("line3") as HTMLInputElement).value;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    /* 背景となるマグカップ画像を読み込み */
    const mugImage = new Image();
    mugImage.src = "/mug.png"; // public/mug.png にコピー済み

    mugImage.onload = () => {
      /* 背景リセット & 画像描画 */
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(mugImage, 0, 0, canvas.width, canvas.height);

      /* 入力 3 行を縦書き風に 3 列で描画 */
      const lines = [line1, line2, line3];
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
    };
  }

  /* ---------- JSX ---------- */
  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-6">
      <h3 className="text-2xl font-bold">俳句マグカップ生成</h3>

      <div className="flex flex-col gap-2">
        <input
          id="line1"
          placeholder="5文字"
          className="w-32 rounded border px-2 py-1"
        />
        <input
          id="line2"
          placeholder="7文字"
          className="w-32 rounded border px-2 py-1"
        />
        <input
          id="line3"
          placeholder="5文字"
          className="w-32 rounded border px-2 py-1"
        />
        <button
          onClick={drawHaiku}
          className="mt-2 rounded bg-blue-600 px-4 py-2 text-white"
        >
          生成
        </button>
      </div>

      <canvas
        ref={canvasRef}
        id="canvas"
        width={500}
        height={500}
        className="border"
      />
    </main>
  );
}
