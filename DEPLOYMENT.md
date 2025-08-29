# Deployment Guide for Upsell Agent

## Prerequisites

1. **GitHub Repository**: Ensure your code is pushed to GitHub
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **PostgreSQL Database**: Set up a production database (recommend [Neon](https://neon.tech) or [Vercel Postgres](https://vercel.com/storage/postgres))
4. **OpenAI API Key**: Valid OpenAI API key for production use

## Production Database Setup

### Option 1: Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Create a new Postgres database
3. Copy the connection string

### Option 2: Neon (Free tier available)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new database
3. Copy the connection string

## Vercel Deployment Steps

### 1. Connect Repository
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Select the project

### 2. Configure Environment Variables
In your Vercel project settings, add these environment variables:

```bash
# Database
DATABASE_URL="your-postgresql-connection-string"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-super-secure-random-jwt-secret-key"
JWT_EXPIRES_IN="7d"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"
OPENAI_MODEL="gpt-4-turbo-preview"
OPENAI_MAX_TOKENS="2000"

# App URLs (will be your vercel domain)
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-app-name.vercel.app"
NEXT_PUBLIC_API_URL="https://your-app-name.vercel.app"

# File Upload
MAX_FILE_SIZE="10485760"
UPLOAD_PATH="/tmp"

# CORS
CORS_ORIGINS="https://your-app-name.vercel.app"

# Rate Limiting
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW="900000"
RATE_LIMIT_AUTH_MAX="10"
RATE_LIMIT_AUTH_WINDOW="900000"
RATE_LIMIT_UPLOAD_MAX="20"
RATE_LIMIT_UPLOAD_WINDOW="3600000"

# Logging
LOG_LEVEL="warn"

# Security
BCRYPT_ROUNDS="12"
SESSION_TIMEOUT="86400000"
```

### 3. Deploy
1. Click "Deploy" in Vercel
2. Wait for the build to complete

### 4. Database Migration
After the first deployment, run database migrations:

1. In your Vercel dashboard, go to your project
2. Go to Settings > Functions
3. In your local terminal, install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
4. Login and link your project:
   ```bash
   vercel login
   vercel link
   ```
5. Run the migration:
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

## Post-Deployment Checklist

- [ ] App loads successfully at your Vercel URL
- [ ] User registration works
- [ ] Login/logout functionality works
- [ ] File upload works
- [ ] OpenAI integration works
- [ ] Database operations work
- [ ] All pages render correctly

## Custom Domain (Optional)

1. In Vercel dashboard, go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Update environment variables with your custom domain:
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_API_URL`
   - `CORS_ORIGINS`

## Monitoring and Maintenance

- Monitor your app at Vercel dashboard
- Check function logs for errors
- Monitor database usage
- Keep dependencies updated
- Monitor OpenAI API usage and costs

## Troubleshooting

### Build Errors
- Check Vercel build logs
- Ensure all environment variables are set
- Verify PostgreSQL connection string

### Runtime Errors
- Check Vercel function logs
- Verify database migrations ran successfully
- Check OpenAI API key validity

### Database Issues
- Ensure DATABASE_URL is correct
- Run `prisma migrate deploy` if schema changes
- Check database connection limits

## Security Notes

- Never commit real environment variables
- Use strong, unique JWT secrets
- Regularly rotate API keys
- Monitor for unusual activity
- Keep dependencies updated