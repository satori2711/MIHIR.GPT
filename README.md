# MihirGPT - Chat with Any Historical Figure

MihirGPT is an advanced conversational AI platform that enables immersive interactions with historical and famous personalities through intelligent dialogue generation and contextual persona simulation.

## Features

- Chat with any historical figure or famous personality
- Type any name to dynamically create a new personality 
- Seamless personality switching mid-conversation
- Authentic responses that match the personality's tone, knowledge, and speech patterns
- Simple, intuitive user interface

## Technologies

- TypeScript React frontend
- Node.js Express backend
- OpenAI GPT integration
- TanStack Query for data fetching
- Tailwind CSS and shadcn UI components

## Deployment on Render

1. Sign up for a free account on [Render.com](https://render.com)
2. Click "New +" and select "Blueprint" from the dropdown
3. Connect your GitHub repository
4. Render will detect the `render.yaml` file and set up the service
5. Add your OpenAI API key in the environment variables section
6. Deploy the service

## Local Development

1. Clone the repository
2. Create a `.env` file in the root directory with:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`

## Notes

- The app uses OpenAI's GPT models, so you'll need an OpenAI API key with sufficient credits
- Be mindful of API usage costs when sharing with friends
- Custom personas are stored in memory and will be lost if the server restarts

## License

MIT