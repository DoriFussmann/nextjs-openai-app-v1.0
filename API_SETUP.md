# OpenAI API Setup Guide

## Step 1: Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the generated API key (it starts with `sk-`)

## Step 2: Set Up Environment Variables

Create a `.env.local` file in your project root with:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Important:** 
- Replace `sk-your-actual-api-key-here` with your real API key
- Never commit this file to version control
- The `.env.local` file should already be in your `.gitignore`

## Step 3: Restart Your Development Server

After adding the environment variable:

```bash
npm run dev
```

## Step 4: Test the API

1. Go to your application
2. Click the "API test" button
3. You should see "Success" if everything is configured correctly

## Troubleshooting

### If you see "Authentication" error:
- Check that your API key is correct
- Make sure the `.env.local` file is in the project root
- Restart your development server

### If you see "Rate limit" error:
- You may have exceeded your OpenAI usage limits
- Check your OpenAI account dashboard

### If you see "Network" error:
- Check your internet connection
- Make sure you can access api.openai.com

## API Key Security

- Never share your API key publicly
- Use environment variables (not hardcoded values)
- Consider using API key rotation for production
- Monitor your usage in the OpenAI dashboard
