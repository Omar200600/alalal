export default async function handler(req, res) {
  // استقبال طلبات POST فقط
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userMessage, studentName, gradeLabel } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "مفتاح الذكاء الاصطناعي غير معرف في إعدادات Vercel." });
  }

  const systemPrompt = `أنت المعلم الافتراضي للأستاذ عمر حسان لمادة الفيزياء (المنهج اليمني).
تتحدث مع الطالب (${studentName || 'الطالب'}) في صف (${gradeLabel || 'الفيزياء'}).
القواعد:
1. اشرح المفهوم الفيزيائي بدقة ووضوح وبأسلوب تربوي مبسط وفق المنهج اليمني.
2. نسّق القوانين بفرمتة KaTeX مثل $F = m \\cdot a$ أو $\\tau = F \\cdot d$.
3. كن مشجعاً وصبوراً بأسلوب الأستاذ عمر حسان وبإيجاز مناسب للشات.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userMessage }] }]
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message || "خطأ في استجابة جوجل AI" });
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "لم يتم استلام رد مناسب.";
    return res.status(200).json({ text: replyText });

  } catch (error) {
    return res.status(500).json({ error: "حدث خطأ في الاتصال بالسيرفر الوسيط." });
  }
}