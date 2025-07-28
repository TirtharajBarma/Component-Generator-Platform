import dotenv from 'dotenv';
dotenv.config();

export async function generateComponent({ prompt, chat = [], code = {} }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('Missing OpenRouter API key');

  // Add system message to instruct AI on format
  const messages = [
    {
      role: 'system',
      content: `You are a React component generator. Always respond with JSX and CSS code in the following format:

      \`\`\`jsx
      function Component() {
        return (
          <div className="component-container">
            {/* Your JSX component code here */}
          </div>
        );
      }

      render(<Component />);
      \`\`\`

      \`\`\`css
      /* Scope all styles under .component-container to avoid affecting the playground UI */
      .component-container {
        /* Container styles if needed */
      }

      .component-container button {
        /* Button styles scoped to component only */
      }

      .component-container .your-class-name {
        /* All your component styles should be scoped under .component-container */
      }
      \`\`\`

      IMPORTANT: Always wrap your JSX in a div with className="component-container" and scope ALL CSS rules under .component-container to prevent affecting the playground UI. Use specific class names for your elements and always prefix CSS selectors with .component-container`
    }
  ];

  // Build the chat history for OpenRouter (skip system messages from chat)
  const chatMessages = chat
    .filter(msg => msg.content && typeof msg.content === 'string' && msg.role !== 'system')
    .map(msg => ({
      role: msg.role === 'ai' ? 'assistant' : 'user',
      content: msg.content
    }));

  messages.push(...chatMessages);

  // Add the new prompt as the last user message
  let fullPrompt = prompt;
  if (code.jsx || code.css) {
    fullPrompt += `\n\nCurrent JSX:\n\`\`\`jsx\n${code.jsx || ''}\n\`\`\`\n\nCurrent CSS:\n\`\`\`css\n${code.css || ''}\n\`\`\``;
  }
  
  fullPrompt += `\n\nPlease respond with the updated JSX and CSS code in the format specified.`;
  
  if (fullPrompt && typeof fullPrompt === 'string') {
    messages.push({ role: 'user', content: fullPrompt });
  }

  // Debug log (commented out to reduce console noise)
  // console.log('Sending to OpenRouter:', JSON.stringify({
  //   model: 'openai/gpt-3.5-turbo',
  //   messages
  // }, null, 2));

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Component Playground'
    },
    body: JSON.stringify({
      model: 'openai/gpt-3.5-turbo',
      messages
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenRouter API error:', errorText);
    throw new Error('OpenRouter API error: ' + response.statusText + ' - ' + errorText);
  }
  const data = await response.json();

  // Parse the response to extract JSX and CSS (assume AI returns them in code blocks)
  const text = data.choices?.[0]?.message?.content || '';
  
  // console.log('OpenRouter API response:', text);
  
  const jsxMatch = text.match(/```jsx?([\s\S]*?)```/i);
  const cssMatch = text.match(/```css([\s\S]*?)```/i);
  
  const jsx = jsxMatch ? jsxMatch[1].trim() : '';
  const css = cssMatch ? cssMatch[1].trim() : '';
  
  // console.log('Parsed JSX:', jsx);
  // console.log('Parsed CSS:', css);
  
  return {
    jsx,
    css,
    raw: text,
  };
}

