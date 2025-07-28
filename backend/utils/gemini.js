import dotenv from 'dotenv';
dotenv.config();

export async function generateComponent({ prompt, chat = [], code = {} }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('Missing OpenRouter API key');

  // Model options (you can change this for better results)
  const MODEL_OPTIONS = {
    'gpt-4o-mini': 'openai/gpt-4o-mini',        // Recommended: Fast and good quality
    'gpt-4': 'openai/gpt-4',                    // Best quality but slower/expensive
    'claude-3-haiku': 'anthropic/claude-3-haiku', // Good alternative
    'gpt-3.5': 'openai/gpt-3.5-turbo'          // Fastest but lower quality
  };
  
  const selectedModel = MODEL_OPTIONS['gpt-4o-mini']; // Change this to switch models

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
      /* IMPORTANT: All styles must be scoped under .component-container */
      .component-container {
        /* Base container styles */
        padding: 20px;
        box-sizing: border-box;
      }

      .component-container .title {
        /* Example: Scope all classes under .component-container */
      }

      .component-container button {
        /* Example: Scope all elements under .component-container */
      }
      \`\`\`

      CRITICAL RULES:
      1. ALWAYS wrap your entire component in a div with className="component-container"
      2. ALL CSS selectors MUST start with .component-container
      3. Use proper CSS syntax - no syntax errors allowed
      4. Use semantic class names for your elements
      5. Make components responsive and accessible
      6. Use modern CSS features like flexbox, grid when appropriate`
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
    fullPrompt += '\n\nCurrent JSX:\n```jsx\n' + (code.jsx || '') + '\n```\n\nCurrent CSS:\n```css\n' + (code.css || '') + '\n```';
  }
  
  fullPrompt += '\n\nPlease respond with the updated JSX and CSS code in the format specified.';
  
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
      model: selectedModel,
      messages,
      temperature: 0.3, // Lower temperature for more consistent code generation
      max_tokens: 2000   // Sufficient for component generation
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

