function drawHaiku() {
    const line1 = document.getElementById('line1').value;
    const line2 = document.getElementById('line2').value;
    const line3 = document.getElementById('line3').value;
  
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
  
    const mugImage = new Image();
    mugImage.src = 'mug.png';
  
    mugImage.onload = function() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(mugImage, 0, 0, canvas.width, canvas.height);
  
      const lines = [line1, line2, line3];
  
      const columnX = [canvas.width / 2 - 5, canvas.width / 2 + 35, canvas.width / 2 + 75];
  
      lines.forEach((text, colIdx) => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 50;
        tempCanvas.height = 200;
        const tempCtx = tempCanvas.getContext('2d');
  
        tempCtx.font = '24px serif';
        tempCtx.fillStyle = 'white';
        tempCtx.textAlign = 'center';
  
        const chars = text.split('');
        chars.forEach((char, idx) => {
          tempCtx.fillText(char, tempCanvas.width / 2, 30 + idx * 26);
        });
  
        const horizontalScale = (colIdx === 1) ? 1.0 : 0.95;
  
        const drawWidth = tempCanvas.width * horizontalScale;
        const drawHeight = tempCanvas.height;
  
        // 全ての列で別Canvasをまとめて圧縮描画（品質統一）
        ctx.drawImage(
          tempCanvas,
          0, 0, tempCanvas.width, tempCanvas.height,
          columnX[colIdx] - drawWidth / 2, canvas.height / 3,
          drawWidth, drawHeight
        );
      });
    };
  }
  