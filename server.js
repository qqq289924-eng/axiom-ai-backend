
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();

    if (!message) {
      return res.status(400).json({ error: "กรุณาพิมพ์คำถาม" });
    }

    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return res.status(500).json({
        error: "เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า API Key"
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          instructions: "คุณคือ AXIOM AI ตอบภาษาเดียวกับผู้ใช้ อธิบายชัดเจนและยอมรับเมื่อไม่แน่ใจ",
          input: message
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({
        error: "AI ตอบกลับผิดพลาด กรุณาตรวจสอบการตั้งค่า API"
      });
    }

    const reply = (data.output || [])
      .flatMap(item => item.content || [])
      .filter(part => part.type === "output_text")
      .map(part => part.text)
      .join("\n");

    res.json({ reply: reply || "ยังไม่มีคำตอบ" });
  } catch {
    res.status(500).json({ error: "เซิร์ฟเวอร์ขัดข้อง" });
  }
});

app.listen(process.env.PORT || 3000);
