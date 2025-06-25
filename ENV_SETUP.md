# Environment Setup Guide

To properly connect your application to Supabase, you need to create a `.env.local` file in the root directory of your project with the following content:

```
NEXT_PUBLIC_SUPABASE_URL=https://zpfygkahujfbitwcsdqz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwZnlna2FodWpmYml0d2NzZHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY3MDcsImV4cCI6MjA2NjE2MjcwN30.1o2CxcJAIHiYliUHINqgLHCoH4ZapFuhfBLBacRCIkQ
```

## Why a separate file?

The `.env.local` file is listed in `.gitignore` to prevent sensitive information from being committed to your repository. This is why we couldn't create the file directly through the AI assistant - it's a security feature.

## Steps to create the file:

1. In the root directory of your project (`adpc-medical`), create a new file named `.env.local`
2. Copy and paste the environment variables above into the file
3. Save the file

Once you've set up this file, the application will be able to connect to your Supabase project.
