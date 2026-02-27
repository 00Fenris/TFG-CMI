require('dotenv').config();
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: 'test' }],
            model: 'llama3-8b-8192',
        });
        console.log('Success:', chatCompletion.choices[0].message.content);
    } catch (error) {
        console.error('GROQ ERROR DETAILS:');
        console.error(error);
    }
}
test();
